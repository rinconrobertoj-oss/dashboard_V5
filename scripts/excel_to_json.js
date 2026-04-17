/**
 * Convierte el Excel de informe semanal a public/data.json
 * Uso: node scripts/excel_to_json.js data/Informe.xlsx public/data.json
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function strVal(v) {
  if (v === null || v === undefined) return " ";
  const s = String(v).trim();
  return s || " ";
}

function intVal(v) {
  const n = parseInt(parseFloat(v));
  return isNaN(n) ? 0 : n;
}

function floatVal(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0.0 : n;
}

function parseCrecimiento(v) {
  if (v === null || v === undefined) return 0.0;
  if (typeof v === "string") {
    const cleaned = v.trim().replace("%", "").replace(",", ".").trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0.0 : Math.round(n * 10000) / 10000;
  }
  const f = parseFloat(v);
  if (isNaN(f)) return 0.0;
  if (f > -1.0 && f < 1.0) return Math.round(f * 100 * 10000) / 10000;
  return Math.round(f * 10000) / 10000;
}

function formatDate(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    const d = String(v.getDate()).padStart(2, "0");
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const y = v.getFullYear();
    return `${d}/${m}/${y}`;
  }
  // XLSX puede devolver números de serie de fecha
  if (typeof v === "number") {
    const date = XLSX.SSF.parse_date_code(v);
    if (date) {
      const d = String(date.d).padStart(2, "0");
      const m = String(date.m).padStart(2, "0");
      return `${d}/${m}/${date.y}`;
    }
  }
  return String(v).trim();
}

function findSheet(wb, candidates) {
  for (const name of wb.SheetNames) {
    for (const c of candidates) {
      if (name.toUpperCase().includes(c.toUpperCase())) {
        return wb.Sheets[name];
      }
    }
  }
  return null;
}

function sheetToRows(ws) {
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
}

// ---------------------------------------------------------------------------
// Hoja 1 — CONFIG
// ---------------------------------------------------------------------------

function parseConfig(ws) {
  const result = { REPORT_DATE_LABEL: "", REPORT_DATE_FOOTER: "" };
  const rows = sheetToRows(ws);
  for (const row of rows) {
    if (!row[0]) continue;
    const campo = String(row[0]).toLowerCase();
    const valor = row[1] !== null && row[1] !== undefined ? String(row[1]).trim() : "";
    if (campo.includes("etiqueta")) result.REPORT_DATE_LABEL = valor;
    else if (campo.includes("pie")) result.REPORT_DATE_FOOTER = valor;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hoja 2 — CONSEJOS
// ---------------------------------------------------------------------------

const CONSEJO_COL_MAP = {
  "CONSEJO":                    ["consejo",               "str"],
  "VALIDADOS":                  ["validados",             "int"],
  "OBJETIVO":                   ["objetivo",              "int"],
  "CUPO":                       ["cupo",                  "float"],
  "CRECIMIENTO %":              ["crecimiento",           "pct"],
  "CRECIMIENTO":                ["crecimiento",           "pct"],
  "INACTIVOS":                  ["inactivos",             "int"],
  "CURSOS":                     ["cursos",                "int"],
  "MAT CONSEJ":                 ["mat_consejo",           "int"],
  "MAT CONSEJO":                ["mat_consejo",           "int"],
  "MAT LO":                     ["mat_lo",                "int"],
  "MAT PROD":                   ["mat_prod",              "int"],
  "CONTRATOS (S/TOTAL)":        ["contratos",             "str"],
  "CONTRATOS (N/TOTAL)":        ["contratos",             "str"],
  "CONTRATOS":                  ["contratos",             "str"],
  "DACI (S/TOTAL)":             ["daci",                  "str"],
  "DACI (N/TOTAL)":             ["daci",                  "str"],
  "DACI":                       ["daci",                  "str"],
  "FACTURAS (S/TOTAL)":         ["facturas",              "str"],
  "FACTURAS (N/TOTAL)":         ["facturas",              "str"],
  "FACTURAS":                   ["facturas",              "str"],
  "WEB CONV":                   ["web_conv",              "int"],
  "WEB REAL":                   ["web_real",              "int"],
  "PRES CONV":                  ["pres_conv",             "int"],
  "PRES REAL":                  ["pres_real",             "int"],
  "PRES PROM":                  ["pres_prom",             "float"],
  "PRES MIN":                   ["pres_min",              "int"],
  "PRES NECES":                 ["pres_neces",            "int"],
  "BLOQUEOS":                   ["bloqueos",              "str"],
  "PEND. WEBINAR":              ["pendientes_webinar",    "str"],
  "PENDIENTES WEBINAR":         ["pendientes_webinar",    "str"],
  "PEND. PRESENCIAL":           ["pendientes_presencial", "str"],
  "PENDIENTES PRESENCIAL":      ["pendientes_presencial", "str"],
  "CONSULTAS / INCIDENCIAS":    ["consultas",             "str"],
  "CONSULTAS/INCIDENCIAS":      ["consultas",             "str"],
  "CONSULTAS":                  ["consultas",             "str"],
};

function parseConsejos(ws) {
  const rows = sheetToRows(ws);
  let headers = null;
  const items = [];

  for (const row of rows) {
    if (!headers) {
      if (row[0] && String(row[0]).trim().toUpperCase() === "CONSEJO") {
        headers = row.map(h => (h ? String(h).trim().toUpperCase() : ""));
      }
      continue;
    }
    if (!row[0]) continue;
    const item = {};
    headers.forEach((header, i) => {
      const mapping = CONSEJO_COL_MAP[header];
      if (!mapping) return;
      const [key, dtype] = mapping;
      const val = i < row.length ? row[i] : null;
      if (dtype === "int") item[key] = intVal(val);
      else if (dtype === "float") item[key] = floatVal(val);
      else if (dtype === "pct") item[key] = parseCrecimiento(val);
      else item[key] = strVal(val);
    });
    if (item.consejo) items.push(item);
  }
  return items;
}

// ---------------------------------------------------------------------------
// Hoja 3 — EVIDENCIAS
// ---------------------------------------------------------------------------

// Mapeo nombre completo (hoja EVIDENCIAS) → nombre corto (hoja CONSEJOS)
const NOMBRE_MAP = {
  "CONSEJO GENERAL DE LA ABOGACÍA ESPAÑOLA":                                                                                              "ABOGACÍA",
  "INSTITUTO DE ACTUARIOS ESPAÑOLES":                                                                                                     "ACTUARIOS",
  "CONSEJO GENERAL DE LA ARQUITECTURA TÉCNICA DE ESPAÑA":                                                                                 "ARQUITECTURA TÉCNICA",
  "CONSEJO GENERAL DE COLEGIOS DE OFICIALES DE SECRETARIOS, INTERVENTORES Y TESOREROS DE LA ADMINISTRACIÓN LOCAL":                       "COSITAL",
  "CONSEJO GENERAL DE COLEGIOS OFICIALES DE LICENCIADOS EN EDUCACIÓN FÍSICA Y EN CIENCIAS DE LA ACTIVIDAD FÍSICA Y DEL DEPORTE":         "EDUCACIÓN FÍSICA",
  "CONSEJO GENERAL DE COLEGIOS OFICIALES DE ENFERMERÍA":                                                                                  "ENFERMERÍA",
  "CONSEJO GENERAL DE COLEGIOS OFICIALES DE FARMACÉUTICOS":                                                                               "FARMACÉUTICOS",
  "COLEGIO DE INGENIERÍA EN GEOMÁTICA Y TOPOGRÁFIA":                                                                                      "GEOMÁTICA Y TOPOGRÁFICA",
  "CONSEJO GENERAL DE COLEGIOS OFICIALES DE INGENIERÍA EN INFORMÁTICA":                                                                   "INFORMÁTICA",
  "COLEGIO OFICIAL DE INGENIEROS DE TELECOMUNICACIÓN":                                                                                    "INGENIEROS DE TELECOMUNICACIÓN",
  "CONSEJO GENERAL DE LOS COLEGIOS DE MEDIADORES DE SEGUROS":                                                                             "MEDIADORES DE SEGUROS",
  "CONSEJO GENERAL DE COLEGIOS DE MÉDICOS DE ESPAÑA":                                                                                     "MÉDICOS",
  "COLEGIO DE SOCIÓLOGOS Y POLITÓLOGOS":                                                                                                  "SOCIÓLOGOS Y POLITÓLOGOS",
  "CONSEJO GENERAL DE TERAPEUTAS OCUPACIONALES":                                                                                          "TERAPEUTAS OCUPACIONALES",
  "CONSEJO GENERAL DEL TRABAJO SOCIAL":                                                                                                   "TRABAJO SOCIAL",
  "COLEGIO DE INGENIEROS TÉCNICOS AERONÁUTICOS":                                                                                          "TÉCNICOS AERONÁUTICOS",
  "COLEGIO OFICIAL DE INGENIEROS TÉCNICOS DE TELECOMUNICACIÓN":                                                                           "TÉCNICOS DE TELECOMUNICACIÓN",
  "CONSEJO GENERAL INGENIEROS TÉCNICOS INDUSTRIALES DE ESPAÑA":                                                                           "TÉCNICOS INDUSTRIALES",
};

function normalizarNombreConsejo(nombre) {
  const key = nombre.trim().toUpperCase();
  // Buscar coincidencia exacta (normalizada a mayúsculas)
  for (const [full, short] of Object.entries(NOMBRE_MAP)) {
    if (full.toUpperCase() === key) return short;
  }
  // Si no hay mapeo devolver el nombre original (por si ya viene en formato corto)
  return nombre.trim();
}

function parseEvidencias(ws) {
  const byConsejo = {};
  const rows = sheetToRows(ws);
  let headerFound = false;

  for (const row of rows) {
    if (!headerFound) {
      if (row[0] && String(row[0]).trim().toUpperCase() === "CONSEJO") {
        headerFound = true;
      }
      continue;
    }
    if (!row[0]) continue;
    const consejo   = normalizarNombreConsejo(String(row[0]).trim());
    const sesion    = row[1] ? String(row[1]).trim() : "";
    const evidencia = row[2] ? String(row[2]).trim() : "";
    if (!sesion || !evidencia) continue;
    if (!byConsejo[consejo]) byConsejo[consejo] = {};
    if (!byConsejo[consejo][sesion]) byConsejo[consejo][sesion] = [];
    byConsejo[consejo][sesion].push(evidencia);
  }
  return byConsejo;
}

function attachEvidencias(initialData, evidenciasByConsejo) {
  for (const item of initialData) {
    const nombre = item.consejo || "";
    if (evidenciasByConsejo[nombre]) {
      item.evidencias_faltantes = Object.entries(evidenciasByConsejo[nombre]).map(
        ([sesion, evidencias]) => ({ sesion, evidencias })
      );
    }
  }
  return initialData;
}

// ---------------------------------------------------------------------------
// Hoja 4 — EVOLUTIVOS
// ---------------------------------------------------------------------------

function parseEvolutivos(ws) {
  const plataforma = [], sug = [];
  const rows = sheetToRows(ws);
  let headerFound = false;

  for (const row of rows) {
    if (!headerFound) {
      if (row[0] && ["SECCIÓN","SECCION","SECTION"].includes(String(row[0]).trim().toUpperCase())) {
        headerFound = true;
      }
      continue;
    }
    if (!row[0] || !row[2]) continue;
    const seccion = String(row[0]).trim().toUpperCase();
    const desc    = String(row[2]).trim();
    if (seccion.includes("SOPORTE") || seccion.includes("PLATAFORMA")) plataforma.push(desc);
    else if (seccion.includes("SUG")) sug.push(desc);
  }
  return { plataforma, sug };
}

// ---------------------------------------------------------------------------
// Hoja 5 — HISTÓRICO GLOBAL
// ---------------------------------------------------------------------------

function parseGlobalHistorical(ws) {
  const records = [];
  const rows = sheetToRows(ws);
  let headerFound = false;

  for (const row of rows) {
    if (!headerFound) {
      if (row[0] && String(row[0]).toLowerCase().includes("fecha")) {
        headerFound = true;
      }
      continue;
    }
    if (row[0] === null || row[0] === undefined) continue;
    const dateStr = formatDate(row[0]);
    if (!dateStr) continue;
    const total = intVal(row[1]);
    records.push({ date: dateStr, Total: total });
  }
  return records;
}

// ---------------------------------------------------------------------------
// Hoja 6 — HISTÓRICO CONSEJOS
// ---------------------------------------------------------------------------

function parseCouncilHistorical(ws) {
  const result = {};
  const rows = sheetToRows(ws);
  let headers = null;

  for (const row of rows) {
    if (!headers) {
      if (row[0] && String(row[0]).toLowerCase().includes("fecha")) {
        headers = row.map(h => (h ? String(h).trim() : ""));
        for (const h of headers.slice(1)) {
          if (h) result[h] = [];
        }
      }
      continue;
    }
    if (!row[0]) continue;
    const dateStr = formatDate(row[0]);
    if (!dateStr) continue;
    headers.slice(1).forEach((header, idx) => {
      if (!header) return;
      const i = idx + 1;
      const total = i < row.length && row[i] !== null ? intVal(row[i]) : 0;
      if (!result[header]) result[header] = [];
      result[header].push({ date: dateStr, Total: total });
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function excelToJson(excelPath, outputPath) {
  console.log(`Leyendo ${excelPath} ...`);
  const wb = XLSX.readFile(excelPath, { cellDates: true });
  console.log(`Hojas encontradas: ${wb.SheetNames.join(", ")}`);

  const wsConfig = findSheet(wb, ["CONFIG"]) || wb.Sheets[wb.SheetNames[0]];
  const config = parseConfig(wsConfig);

  const wsConsejos = findSheet(wb, ["CONSEJO"]) || wb.Sheets[wb.SheetNames[1]];
  let initialData = parseConsejos(wsConsejos);
  console.log(`  Consejos encontrados: ${initialData.length}`);

  const wsEvidencias = findSheet(wb, ["EVIDENCIA"]) || wb.Sheets[wb.SheetNames[2]];
  const evidencias = parseEvidencias(wsEvidencias);
  initialData = attachEvidencias(initialData, evidencias);

  const wsEvolutivos = findSheet(wb, ["EVOLUTIVO"]) || wb.Sheets[wb.SheetNames[3]];
  const evolutivos = parseEvolutivos(wsEvolutivos);

  const wsGlobal = findSheet(wb, ["GLOBAL"]) || wb.Sheets[wb.SheetNames[4]];
  const globalHist = parseGlobalHistorical(wsGlobal);
  console.log(`  Registros histórico global: ${globalHist.length}`);

  const wsHistConsejos = findSheet(wb, ["HISTÓRICO CONSEJO", "HISTORICO CONSEJO"]) || wb.Sheets[wb.SheetNames[5]];
  const councilHist = parseCouncilHistorical(wsHistConsejos);
  console.log(`  Consejos en histórico: ${Object.keys(councilHist).length}`);

  const result = {
    ...config,
    INITIAL_DATA: initialData,
    COUNCIL_HISTORICAL_DATA: councilHist,
    GLOBAL_HISTORICAL: globalHist,
    EVOLUTIVOS_DATA: evolutivos,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✅ ${outputPath} generado correctamente.`);
}

const excelIn  = process.argv[2] || "data/Informe.xlsx";
const jsonOut  = process.argv[3] || "public/data.json";
excelToJson(excelIn, jsonOut);
