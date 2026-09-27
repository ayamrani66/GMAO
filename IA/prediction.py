import requests
import warnings
import traceback
from datetime import datetime, timedelta
 
import numpy as np
import pandas as pd
from xgboost import XGBClassifier, XGBRegressor
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
 
warnings.filterwarnings("ignore")
import joblib
import os

# ================================================================
# ⚙️  CONFIGURATION — adapter à ton environnement
# ================================================================
EXCEL_PATH      = "gmao_data.xlsx"          # chemin vers le fichier Excel
SPRING_BOOT_URL = "http://192.168.159.1:8080" # URL de ton serveur Spring Boot
API_SECRET_KEY  = ""         # clé partagée pour sécuriser l'endpoint
HORIZON_H       = 1                           # 1 ou 4 heures
SEUIL_PROBA     = 0.50                        # seuil minimum pour créer une 
MODEL_PATH = "gmao_models.pkl"
# ================================================================
 
ENCODERS: dict = {}

# ----------------------------------------------------------------
# 1. CHARGEMENT EXCEL
# ----------------------------------------------------------------
def load_data(filepath: str) -> pd.DataFrame:
    df = pd.read_excel(filepath, header=1)
    df.columns = df.columns.str.strip().str.replace("\n", " ")
 
    rename_map = {
        "Date":                  "date",
        "N° Coulée":             "n_coulee",
        "Zone":                  "zone",
        "Operation":             "operation",
        "Type":                  "type_arret",
        "Heur début [hh:mi:ss]": "heure_debut_str",
        "Heure fin [hh:mi:ss]":  "heure_fin_str",
        "Durée":                 "duree_str",
        "Raison":                "raison",
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})
 
    for col in ["Poste", "Equipe", "Description", "Commentaire", "Commentaire2"]:
        if col in df.columns:
            df = df.drop(columns=[col])
 
    df["date"] = pd.to_datetime(df["date"], dayfirst=True, errors="coerce")
 
    for col_str, col_out in [("heure_debut_str", "heure_debut"), ("heure_fin_str", "heure_fin")]:
        if col_str in df.columns:
            df[col_out] = pd.to_datetime(
                df["date"].astype(str) + " " + df[col_str].astype(str), errors="coerce"
            )
 
    df["duree_min"] = (df["heure_fin"] - df["heure_debut"]).dt.total_seconds() / 60
    df.loc[df["duree_min"] <= 0, "duree_min"] = np.nan
    df = df.dropna(subset=["heure_debut", "zone", "operation", "raison"])
    df = df.sort_values("heure_debut").reset_index(drop=True)
 
    counts = df["raison"].value_counts()
    df = df[df["raison"].isin(counts[counts >= 5].index)]
 
    print(f"✅ {len(df):,} lignes chargées ({df['date'].min().date()} → {df['date'].max().date()})")
    return df.reset_index(drop=True)
 
 # ----------------------------------------------------------------
# 2. FEATURES
# ----------------------------------------------------------------
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().sort_values("heure_debut").reset_index(drop=True)
 
    df["heure_jour"]   = df["heure_debut"].dt.hour
    df["jour_semaine"] = df["heure_debut"].dt.dayofweek
    df["mois"]         = df["heure_debut"].dt.month
    df["quart"]        = pd.cut(df["heure_jour"], bins=[-1,5,11,17,23], labels=[0,1,2,3]).astype(int)
 
    for col in ["zone", "operation", "type_arret", "raison"]:
        le = LabelEncoder()
        df[f"{col}_enc"] = le.fit_transform(df[col].astype(str))
        ENCODERS[col] = le
 
    df = df.set_index("heure_debut").sort_index()
    for h in [1, 2, 4, 8, 24]:
        df[f"nb_arrets_{h}h_zone"] = (
            df.groupby("zone")["zone"]
            .transform(lambda x: x.rolling(f"{h}h", closed="left").count())
        )
    df["duree_tot_4h_zone"] = (
        df.groupby("zone")["duree_min"]
        .transform(lambda x: x.rolling("4h", closed="left").sum())
    )
    df = df.reset_index()
    df["delta_last_min"]     = df.groupby("zone")["heure_debut"].diff().dt.total_seconds() / 60
    df["duree_moy_zone_op"]  = df.groupby(["zone","operation"])["duree_min"].transform("mean")
    df["freq_raison_zone"]   = df.groupby(["zone","raison"])["raison"].transform("count")
    return df.fillna(0)
 
 
FEATURES = [
    "heure_jour","jour_semaine","mois","quart",
    "zone_enc","operation_enc","type_arret_enc",
    "nb_arrets_1h_zone","nb_arrets_2h_zone","nb_arrets_4h_zone",
    "nb_arrets_8h_zone","nb_arrets_24h_zone",
    "duree_tot_4h_zone","delta_last_min","duree_moy_zone_op","freq_raison_zone",
]

# ----------------------------------------------------------------
# 3. LABELS — version vectorisée (x50 plus rapide)
# ----------------------------------------------------------------
def build_labels(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().sort_values("heure_debut").reset_index(drop=True)
    
    for h in [1, 4, 24]:
        labels = []
        arr_zone  = df["zone"].values
        arr_temps = df["heure_debut"].values
        delta     = np.timedelta64(h, 'h')
        
        for i in range(len(df)):
            t = arr_temps[i]
            z = arr_zone[i]
            # Cherche uniquement dans la fenêtre [t, t+h]
            mask = (arr_zone == z) & (arr_temps > t) & (arr_temps <= t + delta)
            labels.append(1 if mask.any() else 0)
        
        df[f"y_arret_{h}h"] = labels
        print(f"   y_arret_{h}h : {df[f'y_arret_{h}h'].mean()*100:.1f}% positifs")
    
    return df

# ----------------------------------------------------------------
# 4. ENTRAÎNEMENT
# ----------------------------------------------------------------
def train_models(df: pd.DataFrame) -> dict:
    n = int(len(df) * 0.8)
    df_train, df_test = df.iloc[:n].copy(), df.iloc[n:].copy()
    models = {}
 
    print("🤖 Entraînement M1 (classificateurs)...")
    for h in [1, 4, 24]:
        feat  = [f for f in FEATURES if f in df_train.columns]
        label = f"y_arret_{h}h"
        X_tr, y_tr = df_train[feat], df_train[label]
        X_te, y_te = df_test[feat],  df_test[label]
        m = XGBClassifier(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            scale_pos_weight=(y_tr==0).sum() / max((y_tr==1).sum(), 1),
            random_state=42, eval_metric="logloss", early_stopping_rounds=15,
        )
        m.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)
        models[f"m1_{h}h"] = (m, feat)
 
    print("🤖 Entraînement M2 (durée)...")
    feat = [f for f in FEATURES if f in df_train.columns]
    mask_tr = df_train["duree_min"].notna() & (df_train["duree_min"] > 0)
    mask_te = df_test["duree_min"].notna()  & (df_test["duree_min"] > 0)
    m2 = XGBRegressor(n_estimators=300, max_depth=5, learning_rate=0.05,
                      subsample=0.8, colsample_bytree=0.8, random_state=42, early_stopping_rounds=15)
    m2.fit(df_train.loc[mask_tr, feat], df_train.loc[mask_tr, "duree_min"],
           eval_set=[(df_test.loc[mask_te, feat], df_test.loc[mask_te, "duree_min"])], verbose=False)
    models["m2"] = (m2, feat)
 
    print("🤖 Entraînement M3 (raison)...")
    feat_m3 = [f for f in feat if f != "raison_enc"]
    m3 = RandomForestClassifier(n_estimators=200, max_depth=12, class_weight="balanced",
                                 random_state=42, n_jobs=-1)
    m3.fit(df_train[feat_m3], df_train["raison_enc"])
    models["m3"] = (m3, feat_m3)
 
    return models

# ----------------------------------------------------------------
# 5. PRÉDICTION POUR UNE COMBINAISON ZONE+OPÉRATION
# ----------------------------------------------------------------
def predict_complet(models, df_history, zone, operation, type_arret, heure):
    recent = df_history[
        (df_history["zone"] == zone) &
        (df_history["heure_debut"] >= heure - timedelta(hours=24)) &
        (df_history["heure_debut"] < heure)
    ]
 
    def nb_recent(h):
        return len(recent[recent["heure_debut"] >= heure - timedelta(hours=h)])
 
    delta_last = (
        (heure - recent["heure_debut"].max()).total_seconds() / 60
        if len(recent) > 0 else 9999
    )
 
    def encode(col, val):
        le = ENCODERS.get(col)
        if le is None: return 0
        try: return int(le.transform([val])[0])
        except ValueError: return 0
 
    base_row = {
        "heure_jour":         heure.hour,
        "jour_semaine":       heure.dayofweek,
        "mois":               heure.month,
        "quart":              int(pd.cut([heure.hour], bins=[-1,5,11,17,23], labels=[0,1,2,3])[0]),
        "zone_enc":           encode("zone", zone),
        "operation_enc":      encode("operation", operation),
        "type_arret_enc":     encode("type_arret", type_arret),
        "nb_arrets_1h_zone":  nb_recent(1),
        "nb_arrets_2h_zone":  nb_recent(2),
        "nb_arrets_4h_zone":  nb_recent(4),
        "nb_arrets_8h_zone":  nb_recent(8),
        "nb_arrets_24h_zone": nb_recent(24),
        "duree_tot_4h_zone":  recent[recent["heure_debut"] >= heure - timedelta(hours=4)]["duree_min"].sum(),
        "delta_last_min":     delta_last,
        "duree_moy_zone_op":  df_history[
            (df_history["zone"]==zone) &
            (df_history["operation"]==operation)]["duree_min"].mean() or 0,
        "freq_raison_zone":   0,
    }
 
    probas = {}
    for h in [1, 4, 24]:
        key = f"m1_{h}h"
        if key in models:
            m, feat = models[key]
            X = pd.DataFrame([base_row])[feat].fillna(0)
            probas[f"{h}h"] = round(float(m.predict_proba(X)[0][1]), 3)
 
    duree_est = 0.0
    if "m2" in models:
        m, feat = models["m2"]
        X = pd.DataFrame([base_row])[feat].fillna(0)
        duree_est = round(float(m.predict(X)[0]), 1)
 
    raison_top3, raison_principale = [], "Inconnue"
    if "m3" in models:
        m, feat = models["m3"]
        X = pd.DataFrame([base_row])[feat].fillna(0)
        proba_classes = m.predict_proba(X)[0]
        top_idx = np.argsort(proba_classes)[::-1][:3]
        raison_top3 = [
            (ENCODERS["raison"].inverse_transform([i])[0], round(float(proba_classes[i]), 3))
            for i in top_idx
        ]
        raison_principale = raison_top3[0][0]
 
    p_max  = max(probas.values(), default=0)
    niveau = "CRITIQUE" if p_max >= 0.7 else "MODÉRÉ" if p_max >= 0.4 else "FAIBLE"
 
    return {
        "zone": zone, "operation": operation,
        "probabilites": probas,
        "duree_estimee_min": duree_est,
        "raison_probable": raison_principale,
        "raison_top3": raison_top3,
        "niveau_risque": niveau,
    }
    
    # ----------------------------------------------------------------
# 6. PRÉDICTION TOUTES ZONES → liste d'alertes
# ----------------------------------------------------------------
def predict_all_zones(models, df_history, horizon_h, seuil):
    # Utilise la dernière date du dataset (pas l'heure système)
    heure_now = df_history["heure_debut"].max().floor("h")
    cutoff    = heure_now - timedelta(days=30)
    print(f"   ℹ️  Référence : {heure_now}")
 
    combos = (
        df_history[df_history["heure_debut"] >= cutoff]
        [["zone","operation","type_arret"]]
        .drop_duplicates()
    )
 
    alertes = []
    for _, row in combos.iterrows():
        zone       = row["zone"]
        operation  = row["operation"]
        type_arret = row["type_arret"] if pd.notna(row["type_arret"]) else "Temps techniques"
 
        try:
            res   = predict_complet(models, df_history, zone, operation, type_arret, heure_now)
            proba = res["probabilites"].get(f"{horizon_h}h", 0)
            if proba < seuil:
                continue
 
            duree  = res.get("duree_estimee_min") or 0
            raison = res.get("raison_probable", "cause inconnue")
            niveau = res.get("niveau_risque", "MODÉRÉ")
 
            delai_msg = (
                "dans 1 heure" if horizon_h == 1
                else f"dans les {horizon_h} prochaines heures"
            )
 
            message = (
                f"Le {zone} doit s'arrêter {delai_msg} "
                f"à cause d'un problème {type_arret.strip().lower()} "
                f"avec l'opération {operation} "
                f"et il va s'arrêter d'une durée de {round(duree)} min."
            )
 
            alertes.append({
                "zone":             zone,
                "operation":        operation,
                "typeArret":        type_arret,
                "horizonH":         horizon_h,
                "probabilite":      round(proba, 3),
                "dureeEstimeeMin":  round(duree, 1),
                "raisonProbable":   raison,
                "niveauRisque":     niveau,
                "message":          message,
                "heurePrediction":  heure_now.isoformat(),
            })
 
        except Exception as e:
            print(f"  ⚠️  Erreur pour {zone}/{operation} : {e}")
 
    alertes.sort(key=lambda x: x["probabilite"], reverse=True)
    print(f"✅ {len(alertes)} alerte(s) générée(s) (seuil={seuil}, horizon={horizon_h}h)")
    return alertes

# ----------------------------------------------------------------
# 7. ENVOI VERS SPRING BOOT
# ----------------------------------------------------------------
def send_to_spring_boot(alertes: list):
    if not alertes:
        print("ℹ️  Aucune alerte à envoyer.")
        return
 
    url = f"{SPRING_BOOT_URL}/api/predictions/push"
    headers = {
        "Content-Type": "application/json",
        "X-Prediction-Key": API_SECRET_KEY,   # clé partagée
    }
 
    try:
        response = requests.post(url, json=alertes, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        print(f"📤 Envoi OK → {data.get('saved', 0)} notification(s) sauvegardée(s), "
              f"{data.get('skipped', 0)} doublon(s) ignoré(s).")
    except requests.exceptions.ConnectionError:
        print(f"❌ Impossible de joindre Spring Boot sur {url}")
    except requests.exceptions.HTTPError as e:
        print(f"❌ Erreur HTTP {e.response.status_code} : {e.response.text}")
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")
        
        # ----------------------------------------------------------------
# 8. MAIN
# ----------------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "="*55)
    print(f"  GMAO — Prédiction autonome  [{datetime.now().strftime('%d/%m/%Y %H:%M')}]")
    print("="*55)
 
    try:
        print("\n📂 Chargement Excel...")
        df_raw = load_data(EXCEL_PATH)
 
        print("\n⚙️  Feature engineering...")
        df_feat = build_features(df_raw)
 
        print("\n🏷️  Construction des labels...")
        df_labeled = build_labels(df_feat)

        if os.path.exists(MODEL_PATH):
            print("\n📦 Chargement des modèles sauvegardés...")
            models = joblib.load(MODEL_PATH)
        else:
            print("\n🤖 Premier entraînement (une seule fois)...")
            models = train_models(df_labeled)
            joblib.dump(models, MODEL_PATH)
            print(f"✅ Modèles sauvegardés dans {MODEL_PATH}")
 
        print(f"\n🔮 Prédiction horizon {HORIZON_H}h pour toutes les zones...")
        alertes = predict_all_zones(models, df_labeled, HORIZON_H, SEUIL_PROBA)
 
        print("\n📤 Envoi vers Spring Boot...")
        send_to_spring_boot(alertes)
 
    except FileNotFoundError:
        print(f"❌ Fichier Excel introuvable : {EXCEL_PATH}")
    except Exception as e:
        print(f"❌ Erreur fatale : {e}")
        traceback.print_exc()
 
    print("\n" + "="*55 + "\n")