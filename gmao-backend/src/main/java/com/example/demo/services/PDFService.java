package com.example.demo.services;

import com.example.demo.models.*;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PDFService {

    // ===== COULEURS =====
    private static final DeviceRgb COLOR_PRIMARY    = new DeviceRgb(255, 167, 112); // orange
    private static final DeviceRgb COLOR_DARK       = new DeviceRgb(30, 33, 48);
    private static final DeviceRgb COLOR_GRAY       = new DeviceRgb(149, 150, 158);
    private static final DeviceRgb COLOR_LIGHT_BG   = new DeviceRgb(249, 250, 251);
    private static final DeviceRgb COLOR_BORDER     = new DeviceRgb(236, 236, 238);
    private static final DeviceRgb COLOR_SUCCESS    = new DeviceRgb(21, 128, 61);
    private static final DeviceRgb COLOR_SUCCESS_BG = new DeviceRgb(220, 252, 231);
    private static final DeviceRgb COLOR_DANGER     = new DeviceRgb(220, 38, 38);
    private static final DeviceRgb COLOR_DANGER_BG  = new DeviceRgb(254, 226, 226);
    private static final DeviceRgb COLOR_WARNING    = new DeviceRgb(161, 98, 7);
    private static final DeviceRgb COLOR_WARNING_BG = new DeviceRgb(254, 249, 195);
    private static final DeviceRgb COLOR_INFO_BG    = new DeviceRgb(239, 246, 255);
    private static final DeviceRgb COLOR_INFO       = new DeviceRgb(29, 78, 216);
    private static final DeviceRgb COLOR_WHITE      = new DeviceRgb(255, 255, 255);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] genererCompteRenduPDF(OT ot) {
        if (ot.getStatut() != StatutOT.termine) return null;

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer   = new PdfWriter(out);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document  = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 50, 40, 50);

            PdfFont fontBold    = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // ══════════════════════════════════════════
            // HEADER BANDEAU
            // ══════════════════════════════════════════
            Table header = new Table(UnitValue.createPercentArray(new float[]{2, 1}))
                    .useAllAvailableWidth()
                    .setBackgroundColor(COLOR_DARK)
                    .setBorderRadius(new com.itextpdf.layout.borders.Border[]{}.getClass() != null ? null : null);

            // Titre côté gauche
            Cell titleCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setPadding(20);
            titleCell.add(new Paragraph("COMPTE RENDU")
                    .setFont(fontBold).setFontSize(20).setFontColor(COLOR_WHITE)
                    .setMarginBottom(2));
            titleCell.add(new Paragraph("D'INTERVENTION")
                    .setFont(fontBold).setFontSize(20).setFontColor(COLOR_PRIMARY)
                    .setMarginBottom(8));
            titleCell.add(new Paragraph("Ordre de Travail" + ot.getCodeOT())
                    .setFont(fontRegular).setFontSize(10).setFontColor(COLOR_GRAY));
            header.addCell(titleCell);

            // Statut côté droit
            Cell statusCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setPadding(20)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .setTextAlignment(TextAlignment.RIGHT);
            statusCell.add(new Paragraph("TERMINÉ")
                    .setFont(fontBold).setFontSize(11)
                    .setFontColor(COLOR_SUCCESS)
                    .setBackgroundColor(COLOR_SUCCESS_BG)
                    .setPadding(6).setPaddingLeft(14).setPaddingRight(14));
            statusCell.add(new Paragraph(formatDateTime(ot.getDateExecution()))
                    .setFont(fontRegular).setFontSize(9).setFontColor(COLOR_GRAY)
                    .setMarginTop(8).setTextAlignment(TextAlignment.RIGHT));
            header.addCell(statusCell);

            document.add(header);
            document.add(new Paragraph(" ").setFontSize(6));

            // ══════════════════════════════════════════
            // SECTION 1 — RÉSUMÉ (4 métriques en cartes)
            // ══════════════════════════════════════════
            document.add(sectionTitle("Informations générales", fontBold));

            Table metrics = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(16);

            metrics.addCell(metricCard("Type OT",       safe(ot.getTypeOT()),      fontBold, fontRegular, COLOR_INFO_BG,    COLOR_INFO));
            metrics.addCell(metricCard("Priorité",      safe(ot.getPriorite()),    fontBold, fontRegular, prioriteBg(ot.getPriorite()), prioriteColor(ot.getPriorite())));
            metrics.addCell(metricCard("Équipement",    equipLabel(ot),            fontBold, fontRegular, COLOR_LIGHT_BG,   COLOR_DARK));
            metrics.addCell(metricCard("Temps",         formatTemps(ot.getTempsIntervention()), fontBold, fontRegular, COLOR_LIGHT_BG, COLOR_DARK));

            document.add(metrics);

            // ══════════════════════════════════════════
            // SECTION 2 — INTERVENANTS
            // ══════════════════════════════════════════
            document.add(sectionTitle("Intervenants", fontBold));

            Table intervenants = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(16);

            intervenants.addCell(personCard(
                    "Technicien",
                    ot.getTechnicien() != null ? ot.getTechnicien().getNomComplet() : "Non assigné",
                    ot.getTechnicien() != null ? ot.getTechnicien().getMail() : "",
                    fontBold, fontRegular));

            intervenants.addCell(personCard(
                    "Superviseur",
                    ot.getSuperviseur() != null ? ot.getSuperviseur().getNomComplet() : "Non assigné",
                    ot.getSuperviseur() != null ? ot.getSuperviseur().getMail() : "",
                    fontBold, fontRegular));

            document.add(intervenants);

            // ══════════════════════════════════════════
            // SECTION 3 — DEMANDE D'INTERVENTION
            // ══════════════════════════════════════════
            if (ot.getDi() != null) {
                DI di = ot.getDi();
                document.add(sectionTitle("Demande d'intervention liée", fontBold));

                Table diTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
                        .useAllAvailableWidth()
                        .setMarginBottom(10);

                diTable.addCell(infoCard(di.getCodeDI(),          "Référence",         fontBold, fontRegular));
                diTable.addCell(infoCard(safe(di.getPriorite()),        "Priorité DI",       fontBold, fontRegular));
                diTable.addCell(infoCard(safe(di.getStatut()),          "Statut DI",         fontBold, fontRegular));
                diTable.addCell(infoCard(safe(di.getSource()),          "Source",            fontBold, fontRegular));
                diTable.addCell(infoCard(formatDateTime(di.getDateDemande()),   "Date demande",      fontBold, fontRegular));
                diTable.addCell(infoCard(formatDateTime(di.getDateValidation()), "Date validation",  fontBold, fontRegular));
                document.add(diTable);

                // Demandeur
                if (di.getDemandeur() != null) {
                    document.add(labelValueRow("Demandeur",
                            di.getDemandeur().getNomComplet(), fontBold, fontRegular));
                }

                // Description
                if (di.getDescription() != null && !di.getDescription().isBlank()) {
                    document.add(textBlock("Description", di.getDescription(), fontBold, fontRegular, COLOR_INFO_BG));
                }

                // Cause identifiée
                if (di.getCauseIdentifiee() != null && !di.getCauseIdentifiee().isBlank()) {
                    document.add(textBlock("Cause identifiée", di.getCauseIdentifiee(), fontBold, fontRegular, COLOR_WARNING_BG));
                }
            }

            // ══════════════════════════════════════════
            // SECTION 4 — COMPTE RENDU
            // ══════════════════════════════════════════
            document.add(sectionTitle("Compte rendu d'intervention", fontBold));

            String cr = ot.getCompteRendu();
            if (cr != null && !cr.isBlank()) {
                document.add(textBlock(null, cr, fontBold, fontRegular, COLOR_LIGHT_BG));
            } else {
                document.add(new Paragraph("Aucun compte rendu saisi.")
                        .setFont(fontRegular).setFontSize(10).setFontColor(COLOR_GRAY)
                        .setItalic().setMarginBottom(16));
            }

            // ══════════════════════════════════════════
            // FOOTER
            // ══════════════════════════════════════════
            document.add(new LineSeparator(new SolidLine(0.5f))
                    .setMarginTop(20).setMarginBottom(10)
                    .setStrokeColor(COLOR_BORDER));

            Table footer = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth();

            footer.addCell(new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph("GMAO — Système de Gestion de Maintenance")
                            .setFont(fontRegular).setFontSize(8).setFontColor(COLOR_GRAY)));

            footer.addCell(new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT)
                    .add(new Paragraph("Généré le " + LocalDateTime.now().format(DATE_FMT))
                            .setFont(fontRegular).setFontSize(8).setFontColor(COLOR_GRAY)));

            document.add(footer);

            document.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    // ══════════════════════════════════════════
    // HELPERS — COMPOSANTS VISUELS
    // ══════════════════════════════════════════

    private Paragraph sectionTitle(String text, PdfFont fontBold) {
        return new Paragraph(text.toUpperCase())
                .setFont(fontBold)
                .setFontSize(9)
                .setFontColor(COLOR_GRAY)
                .setCharacterSpacing(1.2f)
                .setBorderBottom(new SolidBorder(COLOR_PRIMARY, 2))
                .setPaddingBottom(6)
                .setMarginBottom(12)
                .setMarginTop(4);
    }

    private Cell metricCard(String label, String value,
                             PdfFont fontBold, PdfFont fontRegular,
                             DeviceRgb bg, DeviceRgb valueColor) {
        Cell cell = new Cell()
                .setBackgroundColor(bg)
                .setBorder(new SolidBorder(COLOR_BORDER, 1))
                .setPadding(12)
                .setMargin(3);
        cell.add(new Paragraph(label)
                .setFont(fontRegular).setFontSize(8).setFontColor(COLOR_GRAY)
                .setMarginBottom(4));
        cell.add(new Paragraph(value)
                .setFont(fontBold).setFontSize(12).setFontColor(valueColor));
        return cell;
    }

    private Cell personCard(String role, String nom, String mail,
                             PdfFont fontBold, PdfFont fontRegular) {
        Cell cell = new Cell()
                .setBackgroundColor(COLOR_LIGHT_BG)
                .setBorder(new SolidBorder(COLOR_BORDER, 1))
                .setPadding(14)
                .setMargin(3);
        cell.add(new Paragraph(role.toUpperCase())
                .setFont(fontBold).setFontSize(8).setFontColor(COLOR_GRAY)
                .setCharacterSpacing(0.8f).setMarginBottom(4));
        cell.add(new Paragraph(nom)
                .setFont(fontBold).setFontSize(11).setFontColor(COLOR_DARK)
                .setMarginBottom(2));
        if (mail != null && !mail.isBlank()) {
            cell.add(new Paragraph(mail)
                    .setFont(fontRegular).setFontSize(9).setFontColor(COLOR_GRAY));
        }
        return cell;
    }

    private Cell infoCard(String value, String label,
                           PdfFont fontBold, PdfFont fontRegular) {
        Cell cell = new Cell()
                .setBackgroundColor(COLOR_LIGHT_BG)
                .setBorder(new SolidBorder(COLOR_BORDER, 1))
                .setPadding(10)
                .setMargin(3);
        cell.add(new Paragraph(label)
                .setFont(fontRegular).setFontSize(8).setFontColor(COLOR_GRAY)
                .setMarginBottom(3));
        cell.add(new Paragraph(safe(value))
                .setFont(fontBold).setFontSize(10).setFontColor(COLOR_DARK));
        return cell;
    }

    private Div textBlock(String label, String content,
                           PdfFont fontBold, PdfFont fontRegular,
                           DeviceRgb bg) {
        Div div = new Div()
                .setBackgroundColor(bg)
                .setBorder(new SolidBorder(COLOR_BORDER, 1))
                .setPadding(14)
                .setMarginBottom(12);
        if (label != null) {
            div.add(new Paragraph(label)
                    .setFont(fontBold).setFontSize(9).setFontColor(COLOR_GRAY)
                    .setMarginBottom(6));
        }
        div.add(new Paragraph(content)
                .setFont(fontRegular).setFontSize(10).setFontColor(COLOR_DARK)
                .setMultipliedLeading(1.5f)); 
        return div;
    }

    private Paragraph labelValueRow(String label, String value,
                                     PdfFont fontBold, PdfFont fontRegular) {
        return new Paragraph()
                .add(new Text(label + " : ").setFont(fontBold).setFontSize(10).setFontColor(COLOR_GRAY))
                .add(new Text(value).setFont(fontRegular).setFontSize(10).setFontColor(COLOR_DARK))
                .setMarginBottom(6);
    }

    // ══════════════════════════════════════════
    // HELPERS — DONNÉES
    // ══════════════════════════════════════════

    private String safe(Object val) {
        return val != null ? val.toString() : "—";
    }

    private String formatDateTime(LocalDateTime dt) {
        return dt != null ? dt.format(DATE_FMT) : "—";
    }

    private String formatTemps(LocalDateTime dt) {
        return dt != null ? dt.format(DateTimeFormatter.ofPattern("HH'h'mm")) : "—";
    }

    private String equipLabel(OT ot) {
        if (ot.getEquipement() == null) return "—";
        return ot.getEquipement().getLibelle() != null
                ? ot.getEquipement().getLibelle()
                : ot.getEquipement().getCodeEquipement();
    }

    private DeviceRgb prioriteBg(Priorite p) {
        if (p == null) return COLOR_LIGHT_BG;
        return switch (p.name().toLowerCase()) {
            case "haute", "elevee", "critique" -> COLOR_DANGER_BG;
            case "moyenne"                     -> COLOR_WARNING_BG;
            default                            -> COLOR_SUCCESS_BG;
        };
    }

    private DeviceRgb prioriteColor(Priorite p) {
        if (p == null) return COLOR_DARK;
        return switch (p.name().toLowerCase()) {
            case "haute", "elevee", "critique" -> COLOR_DANGER;
            case "moyenne"                     -> COLOR_WARNING;
            default                            -> COLOR_SUCCESS;
        };
    }
}