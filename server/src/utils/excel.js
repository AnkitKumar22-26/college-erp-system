// server/src/utils/excel.js
const ExcelJS = require("exceljs");

/**
 * Builds and streams an .xlsx workbook to the response.
 * @param {import('express').Response} res
 * @param {string} sheetName
 * @param {{header: string, key: string, width?: number}[]} columns
 * @param {object[]} rows
 * @param {string} filename
 */
async function exportToExcel(res, { sheetName, columns, rows, filename }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "College ERP System";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };

  rows.forEach((row) => sheet.addRow(row));

  sheet.columns.forEach((col) => {
    col.width = col.width || 18;
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportToExcel };
