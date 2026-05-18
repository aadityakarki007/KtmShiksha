// src/lib/excel.js
import * as XLSX from "xlsx";

export function parseWorkbookBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName =
    workbook.SheetNames.find(
      (n) => n.trim().toLowerCase() === "student detail"
    ) ?? workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  // Find first non-empty row to use as header (handles blank leading rows)
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  let headerRow = range.s.r;
  for (let r = range.s.r; r <= Math.min(range.s.r + 20, range.e.r); r++) {
    const cell = sheet[XLSX.utils.encode_cell({ r, c: range.s.c })];
    if (cell && String(cell.v ?? "").trim() !== "") {
      headerRow = r;
      break;
    }
  }

  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true, range: headerRow });
}

export function buildWorkbookBuffer(rows, sheetName = "Export") {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

export function rowsToCsv(rows) {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const s = val === null || val === undefined ? "" : String(val);
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n");
}