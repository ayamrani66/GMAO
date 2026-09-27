package com.example.demo.services;

import java.util.HashMap;
import java.util.Map;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.models.Equipement;
import com.example.demo.repositories.EquipementRepository;

@Service
public class EquipementImportService {

    private final EquipementRepository repository;

    public EquipementImportService(EquipementRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void importExcel(MultipartFile file) throws Exception {

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            DataFormatter formatter = new DataFormatter();

            Map<String, Equipement> savedEquipements = new HashMap<>();

            for (Row row : sheet) {

                if (row.getRowNum() == 0) continue; // ignorer header

                String niveauStr = getCellValue(row, 0, evaluator, formatter);
                String code = getCellValue(row, 1, evaluator, formatter);
                String libelle = getCellValue(row, 2, evaluator, formatter);
                String parentCode = getCellValue(row, 3, evaluator, formatter);

                int niveau = 0;
                if (niveauStr != null && !niveauStr.isBlank()) {
                    niveau = Integer.parseInt(niveauStr);
                }

                Equipement equip = new Equipement();
                equip.setCodeEquipement(code.trim());
                equip.setLibelle(libelle != null ? libelle.trim() : null);
                equip.setNiveau(niveau);
                equip.setArchive(false);

                // gestion parent
                if (parentCode != null && !parentCode.isBlank()) {
                    Equipement parent = savedEquipements.get(parentCode.trim());
                    if (parent != null) {
                        equip.setParent(parent);
                        equip.setCodeParent(parentCode.trim());
                    }
                }

                Equipement saved = repository.save(equip);
                savedEquipements.put(code.trim(), saved);
            }
        }
    }

    private String getCellValue(Row row, int index, FormulaEvaluator evaluator, DataFormatter formatter) {

        Cell cell = row.getCell(index);
        if (cell == null) return null;

        if (cell.getCellType() == CellType.FORMULA) {
            CellValue cellValue = evaluator.evaluate(cell);

            switch (cellValue.getCellType()) {
                case NUMERIC:
                    return String.valueOf((int) cellValue.getNumberValue());
                case STRING:
                    return cellValue.getStringValue();
                default:
                    return null;
            }
        }

        return formatter.formatCellValue(cell);
    }
}