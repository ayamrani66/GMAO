# 🏭 GMAO — Smart Industrial Maintenance Management System

> **Plateforme intelligente de gestion de la maintenance industrielle développée dans le cadre d'un Projet de Fin d'Études chez SOMASTEEL.**

## 📌 Présentation

Cette application est une **GMAO (Gestion de la Maintenance Assistée par Ordinateur)** conçue pour digitaliser et centraliser les processus de maintenance industrielle de **SOMASTEEL**, entreprise sidérurgique basée à Casablanca.

Le projet répond aux limites d'une gestion reposant principalement sur des fichiers Excel et des supports papier, notamment pour le suivi des équipements critiques, des interventions, des ordres de travail et des pièces de rechange.

L'objectif est de fournir une plateforme centralisée permettant de gérer le cycle complet de maintenance :

**Demande d'intervention → Validation → Ordre de travail → Affectation → Intervention → Clôture → Historique**

La solution va au-delà d'une GMAO classique grâce à l'intégration de :

- 📊 **Business Intelligence avec Power BI**
- 🤖 **Assistant conversationnel IA**
- 🔮 **Maintenance prédictive**
- 📈 **Indicateurs de performance maintenance**
- 🔔 **Notifications en temps réel**
- 🔐 **Gestion des rôles et des permissions**

---

## 🎯 Objectifs du projet

- Centraliser les données de maintenance.
- Digitaliser les demandes d'intervention et les ordres de travail.
- Structurer l'arborescence des équipements industriels.
- Assurer la traçabilité des interventions.
- Automatiser la maintenance préventive.
- Gérer les pièces de rechange et les stocks.
- Fournir des indicateurs de performance à travers Power BI.
- Exploiter le Machine Learning pour anticiper les défaillances.
- Intégrer un assistant IA pour faciliter l'accès aux informations de maintenance.
- Sécuriser l'accès à l'application selon les rôles utilisateurs.

---

## ⚙️ Fonctionnalités principales

### 🔐 Authentification & gestion des utilisateurs

- Inscription et authentification sécurisée.
- Authentification basée sur **JWT**.
- Gestion des rôles et permissions.
- Contrôle d'accès basé sur les rôles (**RBAC**).
- Activation / désactivation des utilisateurs.
- Gestion du profil utilisateur.
- Protection des routes et des fonctionnalités sensibles.

---

### 🏗️ Gestion des équipements

L'application permet de représenter le parc industriel sous forme d'une **arborescence hiérarchique** :

```text
Site
 └── Atelier
      └── Machine
           └── Sous-ensemble
                └── Composant
```

Exemple :

```text
SOMASTEEL
└── Aciérie
    └── EAF
        └── EAF-TR
            └── EAF-TR-REG
```

Fonctionnalités :

- Création d'équipements.
- Modification.
- Archivage.
- Gestion de la criticité.
- Upload de documents et images.
- Consultation de l'historique.
- Recherche et filtrage.
- Traçabilité des interventions.

L'arborescence est particulièrement importante dans le contexte industriel étudié, le parc comprenant plus de 2 000 équipements.

---

### 📝 Demandes d'Intervention — DI

Les utilisateurs peuvent signaler une anomalie sur un équipement à travers une **Demande d'Intervention**.

Une DI peut contenir :

- Équipement concerné.
- Type d'anomalie.
- Priorité.
- Description.
- Photos.
- Documents justificatifs.

Le Responsable BDM peut ensuite :

- Consulter la demande.
- La valider.
- La rejeter avec un motif.
- Suivre son statut.

---

### 🔧 Ordres de Travail — OT

La plateforme prend en charge :

#### Maintenance corrective

Une DI validée peut être transformée en **Ordre de Travail correctif**.

```text
DI créée
   ↓
Validation
   ↓
OT correctif
   ↓
Affectation technicien
   ↓
Intervention
   ↓
Compte rendu
   ↓
Clôture
```

#### Maintenance préventive

Les OT préventifs peuvent être générés automatiquement selon une fréquence définie.

Fonctionnalités :

- Création d'OT.
- Affectation des techniciens.
- Gestion de l'urgence.
- Suivi du statut.
- Checklist d'intervention.
- Compte rendu.
- Export PDF / Excel.
- Historisation.

---

### 🧰 Gestion des pièces de rechange

Le module PDR permet de :

- Créer et gérer les pièces de rechange.
- Associer des pièces aux équipements.
- Suivre les quantités en stock.
- Enregistrer les consommations.
- Déduire automatiquement les quantités utilisées.
- Détecter les stocks critiques.
- Calculer les coûts de consommation.

Une alerte est déclenchée lorsqu'une quantité passe sous le seuil minimum défini.

---

## 📊 Business Intelligence — Power BI

Un module **Power BI** permet d'analyser les données de maintenance et de fournir des indicateurs décisionnels.

### KPI principaux

- **MTBF** — Mean Time Between Failures
- **MTTR** — Mean Time To Repair
- **Disponibilité des équipements**
- Temps d'arrêt
- Nombre d'interventions
- Répartition des coûts de maintenance
- Analyse des pannes

Les données opérationnelles sont préparées à travers un processus **Power Query / ETL**, puis exploitées dans les tableaux de bord décisionnels.

---

## 🤖 Intelligence Artificielle

### 💬 Assistant conversationnel

Un chatbot intelligent est intégré directement dans l'application.

Architecture :

```text
Angular
   │
   ▼
Spring Boot
   │
   ▼
Groq API
   │
   ▼
LLaMA 3.3 70B
   │
   ▼
Réponse → Angular
```

Le backend Spring Boot joue le rôle d'intermédiaire sécurisé entre l'application et l'API Groq.

L'assistant permet notamment d'interroger le système en langage naturel et d'obtenir des informations ou recommandations liées à la maintenance.

---

## 🔮 Maintenance prédictive

Le projet intègre un module de **maintenance prédictive basé sur le Machine Learning**.

Le pipeline Python utilise plusieurs modèles :

- **XGBoost**
- **Random Forest**
- **Weibull Survival Analysis**

### Prédictions réalisées

#### Probabilité de panne

Un modèle calcule un **score de risque de défaillance**.

#### Durée probable d'arrêt

Un modèle **XGBRegressor** estime la durée probable d'un arrêt en minutes.

#### Cause probable

Un modèle **RandomForestClassifier** identifie les causes potentielles parmi les causes historiques et fournit un Top 3 avec leurs probabilités.

#### Analyse de survie

L'analyse de survie **Weibull**, basée sur la bibliothèque Lifelines, permet d'estimer la durée de vie résiduelle des équipements et de déclencher des alertes préventives.

---

## 🔔 Notifications

Un système de notifications centralisé permet notamment de notifier les utilisateurs lors de :

- Création d'une DI.
- Création d'un OT.
- Affectation d'un OT.
- Inscription d'un nouvel utilisateur.
- Finalisation d'une intervention.
- Détection d'un stock critique.
- Alertes liées à la maintenance prédictive.

Les notifications sont ciblées selon le rôle de l'utilisateur.

---

# 🏗️ Architecture

La solution repose sur une **architecture trois-tiers** :

```text
                    ┌──────────────────────┐
                    │      Angular         │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                          REST / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Spring Boot      │
                    │       Backend        │
                    │                      │
                    │ Spring Security/JWT  │
                    │ REST APIs            │
                    │ Business Logic       │
                    └──────────┬───────────┘
                               │
                         JPA / Hibernate
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MySQL          │
                    │      Database        │
                    └──────────────────────┘

        ┌──────────────────────┐
        │      Python AI/ML    │
        │ XGBoost / RF / Weibull│
        └──────────┬───────────┘
                   │
                   ▼
             Spring Boot API

        ┌──────────────────────┐
        │      Groq / LLaMA    │
        │   AI Chatbot         │
        └──────────────────────┘

        ┌──────────────────────┐
        │      Power BI        │
        │ KPI / Analytics      │
        └──────────────────────┘
```

Le frontend Angular communique avec le backend exclusivement via des API REST. Spring Boot centralise la logique métier, la sécurité, les workflows et les échanges avec les modules IA.

---

# 🛠️ Stack technique

| Domaine | Technologies |
|---|---|
| Frontend | Angular, TypeScript, HTML, CSS |
| Backend | Java, Spring Boot |
| Security | Spring Security, JWT, BCrypt |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| API | REST / JSON |
| AI / ML | Python, XGBoost, Random Forest |
| Survival Analysis | Weibull, Lifelines |
| AI Assistant | Groq API, LLaMA |
| Business Intelligence | Power BI, Power Query, DAX |
| Documentation / Modélisation | UML |
| Version Control | Git, GitHub |
| Methodology | Agile Scrum |

---

# 🔒 Sécurité

La sécurité de l'application repose notamment sur :

- Authentification **JWT**.
- Hachage des mots de passe avec **BCrypt**.
- Contrôle d'accès basé sur les rôles.
- Protection des endpoints sensibles avec `@PreAuthorize`.
- Guards Angular pour le contrôle côté frontend.
- Validation des données.
- Contraintes d'intégrité en base de données.

L'architecture découplée Angular / Spring Boot / MySQL facilite également l'évolution et l'ajout de nouveaux modules.

---

# 👥 Rôles utilisateurs

La plateforme adapte les fonctionnalités accessibles selon le profil :

- **Responsable BDM**
- **Manager**
- **Superviseur**
- **Utilisateur**

Chaque rôle dispose de permissions spécifiques permettant de contrôler les actions accessibles dans l'application.

---

# 🔄 Méthodologie

Le projet a été réalisé selon la méthodologie **Agile Scrum**.

Le développement a été organisé en **4 Sprints**, avec des itérations de trois semaines.

Le projet a été réalisé avec une double responsabilité :

- 👩‍💻 **Full-Stack Developer**
- 🔄 **Scrum Master**

Le Product Owner était représenté par le Responsable du Bureau des Méthodes de SOMASTEEL.

---

# 📂 Structure du projet

```text
GMAO/
│
├── frontend/
│   └── Angular application
│
├── backend/
│   └── Spring Boot application
│
├── ai-ml/
│   └── Python predictive maintenance module
│
├── power-bi/
│   └── Power BI dashboards and data preparation
│
├── database/
│   └── SQL scripts
│
├── docs/
│   └── UML / technical documentation
│
└── README.md
```

> La structure ci-dessus peut être adaptée aux dossiers réellement présents dans le repository.

---

# 🚀 Installation

## Prérequis

Avant de lancer le projet, installer :

- Java
- Maven
- Node.js
- Angular CLI
- MySQL
- Python
- Git

---

## 1. Cloner le repository

```bash
git clone https://github.com/USERNAME/REPOSITORY.git

cd REPOSITORY
```

---

## 2. Configurer la base de données

Créer une base MySQL :

```sql
CREATE DATABASE gmao_db;
```

Puis configurer les paramètres de connexion dans :

```text
backend/src/main/resources/application.properties
```

Exemple :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gmao_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

---

## 3. Lancer le Backend

```bash
cd backend

./mvnw spring-boot:run
```

Le backend sera accessible sur :

```text
http://localhost:8080
```

---

## 4. Lancer le Frontend

```bash
cd frontend

npm install

ng serve
```

Puis ouvrir :

```text
http://localhost:4200
```

---

## 5. Lancer le module IA

```bash
cd ai-ml

python -m venv venv
```

Windows :

```bash
venv\Scripts\activate
```

Installer les dépendances :

```bash
pip install -r requirements.txt
```

Puis lancer le serveur Python selon la configuration du projet.

---

# 🔐 Variables d'environnement

Les informations sensibles ne doivent pas être directement publiées dans GitHub.

Exemple :

```env
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
GROQ_API_KEY=
AI_API_SECRET=
```

Ajouter les fichiers contenant les secrets à `.gitignore`.

---

# 📸 Screenshots

Tu peux ajouter ici les captures principales de l'application :

### 🔐 Authentification

```markdown
![Login](docs/screenshots/login.png)
```

### 📊 Dashboard

```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

### 🏭 Arborescence des équipements

```markdown
![Equipment Tree](docs/screenshots/equipment-tree.png)
```

### 🔧 Ordres de travail

```markdown
![Work Orders](docs/screenshots/work-orders.png)
```

### 🤖 Assistant IA

```markdown
![AI Assistant](docs/screenshots/chatbot.png)
```

### 🔮 Maintenance prédictive

```markdown
![Predictive Maintenance](docs/screenshots/predictive-maintenance.png)
```

---

# 📈 Principaux indicateurs

Le système permet notamment d'exploiter :

```text
MTBF
Mean Time Between Failures
        ↓
Fiabilité des équipements


MTTR
Mean Time To Repair
        ↓
Efficacité des interventions


Availability
        ↓
Disponibilité des équipements
```

Ces indicateurs alimentent le module décisionnel Power BI.

---

# 🎓 Contexte académique

**Projet de Fin d'Études — Cycle Ingénieur en Génie Informatique**

**Entreprise d'accueil :** SOMASTEEL — Casablanca, Maroc

**Méthodologie :** Agile Scrum

**Rôle :** Full-Stack Developer & Scrum Master

**Durée :** Février 2026 – Juin 2026

Le projet a été développé dans le contexte d'une entreprise sidérurgique disposant d'équipements industriels critiques tels que le **Four à Arc Électrique (EAF)**, le **Ladle Furnace (LF)** et la **Continuous Casting Machine (CCM)**.

---

# 👩‍💻 Auteur

### Aya M'rani Alaoui

**Computer Engineering | AI & Full-Stack Development**

Projet réalisé dans le cadre du Projet de Fin d'Études chez **SOMASTEEL**.


---

# ⭐ Points clés du projet

```text
✓ Full-Stack Web Application
✓ Industrial CMMS / GMAO
✓ Angular + Spring Boot + MySQL
✓ REST API
✓ JWT / RBAC Security
✓ Corrective & Preventive Maintenance
✓ Equipment Hierarchy
✓ Spare Parts Management
✓ Real-Time Notifications
✓ Power BI & DAX
✓ Predictive Maintenance
✓ XGBoost
✓ Random Forest
✓ Weibull Survival Analysis
✓ AI Chatbot
✓ Groq / LLaMA
✓ Agile Scrum
```

---

## 📜 License

Ce projet a été développé dans le cadre d'un Projet de Fin d'Études et contient des éléments liés au contexte industriel de SOMASTEEL.

L'utilisation, la reproduction ou la redistribution du code et des données doit respecter les droits et autorisations applicables.
