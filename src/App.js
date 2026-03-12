import React, { useState, useMemo, useRef, useEffect } from "react";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Bar,
  ComposedChart,
} from "recharts";
import {
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Video,
  Package,
  Filter,
  ArrowUpRight,
  FileDown,
  Rocket,
  LayoutDashboard,
  Cpu,
  Target as TargetIcon,
  Camera,
  MessageSquare,
  ClipboardList,
} from "lucide-react";

// Función robusta para cargar scripts externos (jspdf y html2canvas)
const loadExternalScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Error cargando script: ${src}`));
    document.head.appendChild(script);
  });
};

// --- COMPONENTES UI ---
const Card = ({
  title,
  value,
  subtext,
  footerText,
  icon: Icon,
  trendValue,
}) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
        {title}
      </h3>
      <div className={`p-1.5 rounded-lg bg-blue-50 text-blue-600`}>
        <Icon size={18} />
      </div>
    </div>
    <div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtext && (
          <span className="text-xs text-gray-400 font-medium">{subtext}</span>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
        <p className="text-[10px] font-bold text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded uppercase">
          {footerText}
        </p>
        {trendValue !== undefined && (
          <div className="flex items-center text-emerald-600 text-[10px] font-bold">
            <ArrowUpRight size={12} className="mr-0.5" />
            {trendValue}%{" "}
            <span className="text-gray-400 font-normal ml-1 whitespace-nowrap">
              sem
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ActivityRateCard = ({ totalValidados, totalInactivos }) => {
  const total = totalValidados || 1;
  const activosConActividad = Math.max(0, totalValidados - totalInactivos);
  const activeRate = ((activosConActividad / total) * 100).toFixed(1);
  const inactiveRate = ((totalInactivos / total) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Tasa de Actividad
          </h3>
          <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {activeRate}%
            </div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
              Activos
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-red-600">
              {inactiveRate}%
            </div>
            <div className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
              Inactivos
            </div>
          </div>
        </div>

        <div className="relative pt-1 mb-3">
          <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100 shadow-inner border border-slate-200">
            <div
              style={{ width: `${activeRate}%` }}
              className="flex flex-col text-center bg-emerald-500 transition-all duration-500"
            />
            <div
              style={{ width: `${inactiveRate}%` }}
              className="flex flex-col text-center bg-red-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-50 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 font-medium">
              Activos:{" "}
              <span className="text-slate-900 font-bold">
                {activosConActividad.toLocaleString()}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-slate-500 font-medium">
              Inactivos:{" "}
              <span className="text-slate-900 font-bold">
                {totalInactivos.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrainingCard = ({
  totalProd,
  totalLO,
  totalCons,
  webConv,
  webReal,
  presConv,
  presReal,
}) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 h-full flex flex-col">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
        Formación
      </h3>
      <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
        <GraduationCap size={18} />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 flex-grow">
      <div className="space-y-1 border-r border-slate-100 pr-2">
        <div className="flex items-center text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-tighter">
          <Package size={10} className="mr-1" /> Materiales
        </div>
        <div className="text-[10px] flex justify-between uppercase">
          <span>Prod:</span> <span className="font-bold">{totalProd}</span>
        </div>
        <div className="text-[10px] flex justify-between uppercase">
          <span>LO:</span> <span className="font-bold">{totalLO}</span>
        </div>
        <div className="text-[10px] flex justify-between uppercase">
          <span>Cons:</span> <span className="font-bold">{totalCons}</span>
        </div>
      </div>

      <div className="space-y-1 border-r border-slate-100 pr-2 flex flex-col items-center">
        <div className="flex items-center text-[9px] font-bold text-gray-400 mb-1 uppercase">
          WEBINARS
        </div>
        <div className="w-full">
          <div className="text-[9px] flex justify-between uppercase text-slate-500">
            <span>Conv:</span> <span className="font-bold">{webConv}</span>
          </div>
          <div className="text-[9px] flex justify-between uppercase text-emerald-600">
            <span>Fin:</span> <span className="font-bold">{webReal}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 flex flex-col items-center">
        <div className="flex items-center text-[9px] font-bold text-gray-400 mb-1 uppercase">
          PRESENCIAL
        </div>
        <div className="w-full">
          <div className="text-[9px] flex justify-between uppercase text-slate-500">
            <span>Conv:</span> <span className="font-bold">{presConv}</span>
          </div>
          <div className="text-[9px] flex justify-between uppercase text-emerald-600">
            <span>Fin:</span> <span className="font-bold">{presReal}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminCard = ({ contracts, daci, invoices }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 h-full">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
        Gestión Adm.
      </h3>
      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
        <Briefcase size={18} />
      </div>
    </div>

    <div className="space-y-2">
      {[
        {
          label: "Contratos Firmados UP",
          val: contracts,
          color: "bg-blue-500",
        },
        { label: "DACI", val: daci, color: "bg-indigo-500" },
        { label: "Facturas", val: invoices, color: "bg-green-500" },
      ].map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-500 uppercase">{item.label}</span>
            <span className="font-bold text-gray-900">
              {item.val.num}/{item.val.den}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div
              className={`${item.color} h-1 rounded-full`}
              style={{
                width: `${
                  item.val.den > 0 ? (item.val.num / item.val.den) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ---------------- HELPERS EVIDENCIAS ----------------
const toSessionRows = (raw) => {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      sesion: item.sesion || item.session || "—",
      evidencias: Array.isArray(item.evidencias)
        ? item.evidencias.filter(Boolean)
        : String(item.evidencias ?? "")
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
    }))
    .filter((r) => r.evidencias.length > 0);
};

const EvidenciasPendientesCard = ({ rows, selectedCouncil }) => {
  const totalEvidencias = rows.reduce((sum, row) => sum + row.evidencias.length, 0);
  return (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-rose-600 p-2 rounded-lg">
        <ClipboardList size={20} className="text-white" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">
          Evidencias Pendientes
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1">
          {selectedCouncil === "all"
            ? "Listado consolidado por consejo"
            : `Detalle para ${selectedCouncil}`}
        </p>
      </div>
      {rows.length > 0 && (
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <span className="inline-flex items-center justify-center bg-rose-50 text-rose-700 font-black text-xs px-3 py-1 rounded-full border border-rose-200">
            {rows.length} sesión{rows.length !== 1 ? "es" : ""} con pendientes
          </span>
          <span className="inline-flex items-center justify-center bg-amber-50 text-amber-700 font-black text-xs px-3 py-1 rounded-full border border-amber-200">
            {totalEvidencias} evidencia{totalEvidencias !== 1 ? "s" : ""} pendiente{totalEvidencias !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>

    <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto">
      {rows.length > 0 ? (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {selectedCouncil === "all" && (
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                  Consejo
                </th>
              )}
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 w-1/3 whitespace-nowrap">
                Sesión
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Evidencias Pendientes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-white transition-colors align-top"
              >
                {selectedCouncil === "all" && (
                  <td className="px-4 py-3">
                    <span className="font-black text-[10px] uppercase text-slate-700 tracking-wide whitespace-nowrap">
                      {row._consejo || "—"}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {row.sesion}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ul className="space-y-1.5">
                    {row.evidencias.map((ev, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-slate-600 leading-relaxed"
                      >
                        <span className="mt-1.5 inline-block w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                        {ev}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-12 text-center flex flex-col items-center gap-2">
          <CheckCircle size={28} className="text-emerald-400" />
          <p className="text-xs text-slate-400 italic">
            No hay evidencias pendientes registradas
          </p>
        </div>
      )}
    </div>
  </div>
  );
};

// ---------------- HELPERS SOPORTE ----------------
// ✅ Sustituye mergeConsultasWithPhone: normaliza a líneas (soporta string/array/object) y permite multilínea
const toLines = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.flatMap((x) => String(x ?? "").split("\n"));
  if (typeof v === "object") return [JSON.stringify(v)];
  return String(v).split("\n");
};

export default function Dashboard() {
  // --- DASHBOARD PRINCIPAL (DATA FROM /public/data.json) ---
  const DEFAULT_DATA = {
    REPORT_DATE_LABEL: "",
    REPORT_DATE_FOOTER: "",
    INITIAL_DATA: [],
    DATES: [],
    COUNCIL_HISTORICAL_DATA: {},
    GLOBAL_HISTORICAL: [],
    EVOLUTIVOS_DATA: { plataforma: [], sug: [] },
  };

  // ✅ Hooks SIEMPRE arriba (nunca pongas returns antes)
  const [data, setData] = useState(DEFAULT_DATA);
  const [dataError, setDataError] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedCouncilFilter, setSelectedCouncilFilter] = useState("all");
  const [exportState, setExportState] = useState("idle");
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef(null);

  // ✅ Cargar JSON
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data.json?ts=" + Date.now())
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} al cargar /data.json`);
        return r.json();
      })
      .then((json) => setData({ ...DEFAULT_DATA, ...json }))
      .catch((e) => setDataError(e))
      .finally(() => setIsLoadingData(false));
  }, []);

  // ✅ Derivados seguros (sin redeclarar cosas luego, y SIN otro return)
  const REPORT_DATE_LABEL = data.REPORT_DATE_LABEL || "";
  const REPORT_DATE_FOOTER = data.REPORT_DATE_FOOTER || "";

  const currentStatusData = Array.isArray(data.INITIAL_DATA)
    ? data.INITIAL_DATA
    : [];

  const COUNCIL_HISTORICAL_DATA = data.COUNCIL_HISTORICAL_DATA || {};
  const GLOBAL_HISTORICAL = Array.isArray(data.GLOBAL_HISTORICAL)
    ? data.GLOBAL_HISTORICAL
    : [];

  const evolutivos = data.EVOLUTIVOS_DATA || { plataforma: [], sug: [] };

  // ---------- MEMOS ----------
  const councilList = useMemo(() => {
    return Array.from(new Set(currentStatusData.map((c) => c.consejo))).sort();
  }, [currentStatusData]);

  const currentCouncilObj = useMemo(() => {
    if (selectedCouncilFilter === "all") return null;
    return (
      currentStatusData.find((c) => c.consejo === selectedCouncilFilter) || null
    );
  }, [selectedCouncilFilter, currentStatusData]);

  const globalStats = useMemo(() => {
    const totalV = currentStatusData.reduce(
      (acc, c) => acc + (Number(c.validados) || 0),
      0
    );
    const totalI = currentStatusData.reduce(
      (acc, c) => acc + (Number(c.inactivos) || 0),
      0
    );

    const globalMediaActividad =
      totalV > 0 ? ((totalV - totalI) / totalV) * 100 : 0;

    const totalCrecimientoGeneral =
      currentStatusData.reduce(
        (acc, c) =>
          acc + (Number(c.validados) || 0) * (Number(c.crecimiento) || 0),
        0
      ) / (totalV || 1);

    const totalMatProdGlobal = currentStatusData.reduce(
      (acc, c) => acc + (Number(c.mat_prod) || 0),
      0
    );
    const totalCursosGlobal = currentStatusData.reduce(
      (acc, c) => acc + (Number(c.cursos) || 0),
      0
    );

    const globalMediaMatProd =
      (totalMatProdGlobal / (totalCursosGlobal || 1)) * 100;

    return {
      globalMediaActividad,
      globalMediaMatProd,
      totalV,
      totalI,
      totalCrecimientoGeneral,
    };
  }, [currentStatusData]);

  const stats = useMemo(() => {
    const arr =
      selectedCouncilFilter === "all"
        ? currentStatusData
        : currentStatusData.filter((c) => c.consejo === selectedCouncilFilter);

    const tv = arr.reduce(
      (acc, curr) => acc + (Number(curr.validados) || 0),
      0
    );
    const to = arr.reduce((acc, curr) => acc + (Number(curr.objetivo) || 0), 0);
    const ti = arr.reduce(
      (acc, curr) => acc + (Number(curr.inactivos) || 0),
      0
    );
    const tp = arr.reduce((acc, curr) => acc + (Number(curr.mat_prod) || 0), 0);
    const tl = arr.reduce((acc, curr) => acc + (Number(curr.mat_lo) || 0), 0);
    const tc = arr.reduce(
      (acc, curr) => acc + (Number(curr.mat_consejo) || 0),
      0
    );

    const wConv = arr.reduce(
      (acc, curr) => acc + (Number(curr.web_conv) || 0),
      0
    );
    const wReal = arr.reduce(
      (acc, curr) => acc + (Number(curr.web_real) || 0),
      0
    );
    const pConv = arr.reduce(
      (acc, curr) => acc + (Number(curr.pres_conv) || 0),
      0
    );
    const pReal = arr.reduce(
      (acc, curr) => acc + (Number(curr.pres_real) || 0),
      0
    );

    const cs =
      selectedCouncilFilter === "all"
        ? globalStats.totalCrecimientoGeneral
        : Number(currentCouncilObj?.crecimiento) || 0;

    const parse = (s) => {
      if (!s || typeof s !== "string") return { n: 0, d: 0 };
      const [n, d] = s.split("/").map((x) => Number(x));
      return { n: n || 0, d: d || 0 };
    };

    const admin = arr.reduce(
      (acc, curr) => {
        const c = parse(curr.contratos);
        const d = parse(curr.daci);
        const f = parse(curr.facturas);
        return {
          cn: acc.cn + c.n,
          cd: acc.cd + c.d,
          dn: acc.dn + d.n,
          dd: acc.dd + d.d,
          fn: acc.fn + f.n,
          fd: acc.fd + f.d,
        };
      },
      { cn: 0, cd: 0, dn: 0, dd: 0, fn: 0, fd: 0 }
    );

    return { tv, to, ti, tp, tl, tc, admin, cs, wConv, wReal, pConv, pReal };
  }, [
    selectedCouncilFilter,
    currentStatusData,
    globalStats,
    currentCouncilObj,
  ]);

  const benchmarkPoints = useMemo(() => {
    if (!currentCouncilObj) return null;

    const activityRate =
      (Number(currentCouncilObj.validados) || 0) > 0
        ? (((Number(currentCouncilObj.validados) || 0) -
            (Number(currentCouncilObj.inactivos) || 0)) /
            (Number(currentCouncilObj.validados) || 1)) *
          100
        : 0;

    const prodRate =
      (Number(currentCouncilObj.cursos) || 0) > 0
        ? ((Number(currentCouncilObj.mat_prod) || 0) /
            (Number(currentCouncilObj.cursos) || 1)) *
          100
        : 0;

    const actDiff = activityRate - globalStats.globalMediaActividad;
    const prodDiff = prodRate - globalStats.globalMediaMatProd;

    return [
      {
        label: "Actividad de Usuarios",
        text: `Tasa de actividad del ${activityRate.toFixed(1)}% (${Math.abs(
          actDiff
        ).toFixed(1)}% ${actDiff >= 0 ? "sobre" : "bajo"} la media).`,
        status: actDiff >= 0 ? "positive" : "negative",
      },
      {
        label: "Producción de Contenidos",
        text: `Con un ${prodRate.toFixed(
          1
        )}% de materiales finalizados, está ${Math.abs(prodDiff).toFixed(1)}% ${
          prodDiff >= 0 ? "superior" : "inferior"
        } al promedio.`,
        status: prodDiff >= 0 ? "positive" : "warning",
      },
    ];
  }, [currentCouncilObj, globalStats]);

  const historicalToUse = useMemo(() => {
    if (
      selectedCouncilFilter !== "all" &&
      COUNCIL_HISTORICAL_DATA[selectedCouncilFilter]
    ) {
      const arr = COUNCIL_HISTORICAL_DATA[selectedCouncilFilter] || [];
      return arr.map((point, idx) => {
        const currentTotal = Number(point.Total) || 0;
        const prevTotal =
          idx > 0 ? Number(arr[idx - 1].Total) || 0 : currentTotal;
        return {
          date: point.date,
          Total: currentTotal,
          Crecimiento: Math.max(0, currentTotal - prevTotal),
        };
      });
    }

    if (selectedCouncilFilter === "all") {
      return (GLOBAL_HISTORICAL || []).map((point, idx, arr) => {
        const currentTotal = Number(point.Total) || 0;
        const prevTotal =
          idx > 0 ? Number(arr[idx - 1].Total) || 0 : currentTotal;
        return {
          date: point.date,
          Total: currentTotal,
          Crecimiento: Math.max(0, currentTotal - prevTotal),
        };
      });
    }

    return (GLOBAL_HISTORICAL || []).map((p) => ({
      ...p,
      Crecimiento: 0,
    }));
  }, [selectedCouncilFilter, COUNCIL_HISTORICAL_DATA, GLOBAL_HISTORICAL]);

  // ✅ CONSULTAS + BLOQUEOS (sin mergeConsultasWithPhone)
  const filteredSoporte = useMemo(() => {
    const arr =
      selectedCouncilFilter === "all"
        ? currentStatusData
        : currentStatusData.filter((c) => c.consejo === selectedCouncilFilter);

    const consultas = arr
      .map((item) => {
        const lines = toLines(item.consultas)
          .map((l) => l.trim())
          .filter(Boolean);
        return {
          tipo: "consulta",
          consejo: item.consejo,
          texto: lines.join("\n"),
        };
      })
      .filter((x) => x.texto.trim() !== "");

    const bloqueos = arr
      .map((item) => {
        const lines = toLines(item.bloqueos)
          .map((l) => l.trim())
          .filter(Boolean);
        return {
          tipo: "bloqueo",
          consejo: item.consejo,
          texto: lines.join("\n"),
        };
      })
      .filter((x) => x.texto.trim() !== "");

    return [...bloqueos, ...consultas];
  }, [selectedCouncilFilter, currentStatusData]);
  // Evidencias pendientes filtradas por consejo
  const filteredEvidencias = useMemo(() => {
    const arr =
      selectedCouncilFilter === "all"
        ? currentStatusData
        : currentStatusData.filter((c) => c.consejo === selectedCouncilFilter);

    return arr.flatMap((item) => {
      const rows = toSessionRows(item.evidencias_faltantes);
      return rows.map((row) => ({ ...row, _consejo: item.consejo }));
    });
  }, [selectedCouncilFilter, currentStatusData]);

  const waitNextFrame = () =>
    new Promise((r) => requestAnimationFrame(() => r()));

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

    setExportState("processing");
    setIsExporting(true);
    await waitNextFrame();

    try {
      await loadExternalScript(
        "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"
      );
      await loadExternalScript(
        "https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js"
      );

      // @ts-ignore
      const { jsPDF } = window.jspdf;
      // @ts-ignore
      const html2canvas = window.html2canvas;

      const el = dashboardRef.current;

      const canvas = await html2canvas(el, {
        scale: 1.2,
        useCORS: true,
        backgroundColor: "#f8fafc",
        logging: false,
        scrollY: -window.scrollY,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.75);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position -= pageHeight;
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Reporte_${selectedCouncilFilter.replace(
        /\s/g,
        "_"
      )}_${new Date().toLocaleDateString("es-ES").replace(/\//g, "-")}.pdf`;

      pdf.save(fileName);
      setExportState("success");
    } catch (e) {
      console.error("Error al generar PDF:", e);
      setExportState("error");
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportState("idle"), 3000);
    }
  };

  const handleCapture = async () => {
    if (!dashboardRef.current) return;
    setExportState("processing");
    setIsExporting(true);
    await waitNextFrame();

    try {
      await loadExternalScript(
        "https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js"
      );
      // @ts-ignore
      const htmlToImage = window.htmlToImage;

      const dataUrl = await htmlToImage.toPng(dashboardRef.current, {
        backgroundColor: "#f8fafc",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Reporte_${selectedCouncilFilter.replace(
        /\s/g,
        "_"
      )}.png`;
      link.click();

      setExportState("success");
    } catch (e) {
      console.error(e);
      setExportState("error");
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportState("idle"), 2000);
    }
  };

  // ✅ UN SOLO RETURN (y nada de código debajo)
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900 overflow-x-hidden">
      <div
        ref={dashboardRef}
        className="max-w-[1400px] mx-auto bg-slate-50 p-4 rounded-xl"
      >
        {/* Mensajes de carga/error SIN romper hooks */}
        {dataError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            Error cargando data.json: {String(dataError.message || dataError)}
          </div>
        )}
        {!dataError && isLoadingData && (
          <div className="mb-4 p-4 bg-white border border-slate-200 rounded">
            Cargando dashboard...
          </div>
        )}
        {!dataError && !isLoadingData && currentStatusData.length === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            data.json cargó, pero <b>INITIAL_DATA</b> está vacío (o no es un
            array).
          </div>
        )}

        {!isExporting && (
          <header className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
                Seguimiento Formación Consejos
              </h1>
              <div className="flex items-center mt-1">
                <p className="text-slate-500 text-sm">
                  Validaciones y Producción • Corte {REPORT_DATE_LABEL}
                </p>
                <span className="mx-3 text-slate-300">|</span>
                <div className="flex items-center bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <TrendingUp size={12} className="text-emerald-600 mr-1.5" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">
                    Progreso Global: +
                    {globalStats.totalCrecimientoGeneral.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exportState === "processing"}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md text-sm font-bold transition-all disabled:opacity-50 text-white ${
                  exportState === "error"
                    ? "bg-red-600"
                    : exportState === "success"
                    ? "bg-emerald-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                <FileDown size={16} />
                {exportState === "processing"
                  ? "Procesando..."
                  : exportState === "error"
                  ? "Error / Reintentar"
                  : exportState === "success"
                  ? "¡PDF Creado!"
                  : "Exportar PDF (Alta Res)"}
              </button>

              <button
                onClick={handleCapture}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm text-sm font-bold transition-all"
              >
                <Camera size={16} /> Capturar Imagen
              </button>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <Filter size={16} className="text-blue-500 mr-3" />
                <select
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none uppercase cursor-pointer"
                  value={selectedCouncilFilter}
                  onChange={(e) => setSelectedCouncilFilter(e.target.value)}
                >
                  <option value="all">TODOS LOS CONSEJOS</option>
                  {councilList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>
        )}

        {currentCouncilObj && (
          <div className="mb-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden text-white">
            <div className="flex flex-col lg:flex-row">
              <div className="p-6 lg:w-1/4 bg-slate-900/40 border-r border-slate-700">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                  Contexto
                </span>
                <h2 className="text-xl font-bold uppercase leading-tight">
                  {currentCouncilObj.consejo}
                </h2>
                <div className="mt-3 inline-block bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] font-bold border border-blue-500/20">
                  Variación Semanal: +
                  {Number(currentCouncilObj.crecimiento) || 0}%
                </div>
              </div>

              <div className="p-6 lg:w-1/2">
                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center">
                  <TargetIcon size={14} className="mr-2" /> Análisis Cualitativo
                </h4>

                <div className="space-y-3">
                  {benchmarkPoints?.map((bullet, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                          bullet.status === "positive"
                            ? "bg-emerald-400"
                            : bullet.status === "warning"
                            ? "bg-orange-400"
                            : "bg-red-400"
                        }`}
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-300 block mb-0.5 tracking-tight">
                          {bullet.label}
                        </span>
                        <p className="text-[11px] text-slate-400 italic">
                          "{bullet.text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 lg:w-1/4 bg-slate-700/20">
                <h4 className="text-orange-400 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center">
                  <Video size={14} className="mr-2" /> Próximos Hitos
                </h4>

                <div className="space-y-3">
                  {currentCouncilObj.pendientes_webinar && (
                    <div>
                      <span className="text-[8px] font-black text-blue-300 uppercase block">
                        Webinar:
                      </span>
                      <p className="text-slate-300 text-[10px]">
                        {currentCouncilObj.pendientes_webinar}
                      </p>
                    </div>
                  )}
                  {currentCouncilObj.pendientes_presencial && (
                    <div>
                      <span className="text-[8px] font-black text-emerald-300 uppercase block">
                        Presencial:
                      </span>
                      <p className="text-slate-300 text-[10px]">
                        {currentCouncilObj.pendientes_presencial}
                      </p>
                    </div>
                  )}
                  {!currentCouncilObj.pendientes_webinar &&
                    !currentCouncilObj.pendientes_presencial && (
                      <p className="text-slate-500 text-[10px] italic">
                        No hay hitos pendientes registrados.
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card
            title="Total Validados"
            value={stats.tv.toLocaleString()}
            subtext={`/ ${stats.to.toLocaleString()}`}
            footerText={`Meta: ${
              stats.to > 0 ? ((stats.tv / stats.to) * 100).toFixed(1) : 0
            }%`}
            icon={Users}
            trendValue={Number(stats.cs || 0).toFixed(1)}
          />
          <ActivityRateCard
            totalValidados={stats.tv}
            totalInactivos={stats.ti}
          />
          <TrainingCard
            totalProd={stats.tp}
            totalLO={stats.tl}
            totalCons={stats.tc}
            webConv={stats.wConv}
            webReal={stats.wReal}
            presConv={stats.pConv}
            presReal={stats.pReal}
          />
          <AdminCard
            contracts={{ num: stats.admin.cn, den: stats.admin.cd }}
            daci={{ num: stats.admin.dn, den: stats.admin.dd }}
            invoices={{ num: stats.admin.fn, den: stats.admin.fd }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* GRÁFICO */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-700 flex items-center">
                <TrendingUp className="mr-2 text-blue-500" size={16} />{" "}
                Evolución Histórica de Validaciones
              </h3>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={historicalToUse}
                  margin={{ top: 28, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    interval="preserveStartEnd"
                    padding={{ left: 10, right: 14 }}
                    minTickGap={12}
                  />

                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    domain={["dataMin", "dataMax + 200"]}
                    allowDataOverflow
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    stroke="#cbd5e1"
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value, name) => [
                      Number(value).toLocaleString(),
                      name === "Total" ? "Acumulado" : "Nuevos",
                    ]}
                  />

                  <Bar
                    yAxisId="right"
                    dataKey="Crecimiento"
                    fill="#e2e8f0"
                    radius={[4, 4, 0, 0]}
                    name="Semanal"
                  />

                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6", stroke: "#fff" }}
                    label={{
                      position: "top",
                      fontSize: 9,
                      fill: "#3b82f6",
                      fontWeight: "bold",
                      dy: -6,
                    }}
                    name="Total"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TARJETA SOPORTE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">
                  consultas e incidencias y puntos de atención
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {selectedCouncilFilter === "all"
                    ? "Listado consolidado por consejo"
                    : `Detalle para ${selectedCouncilFilter}`}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl overflow-visible border border-slate-100">
              {filteredSoporte.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {filteredSoporte.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex gap-4 hover:bg-white transition-colors"
                    >
                      <div className="mt-1">
                        {item.tipo === "bloqueo" ? (
                          <MessageSquare size={16} className="text-amber-600" />
                        ) : (
                          <AlertCircle size={16} className="text-indigo-500" />
                        )}
                      </div>

                      <div>
                        {selectedCouncilFilter === "all" && (
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-1 text-slate-600">
                            {item.consejo}
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
                            item.tipo === "bloqueo"
                              ? "text-amber-700"
                              : "text-indigo-700"
                          }`}
                        >
                          {item.tipo === "bloqueo"
                            ? "Puntos de atención"
                            : "Consultas e incidencias"}
                        </span>

                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap break-words overflow-visible">
                          {item.texto}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-xs text-slate-400 italic">
                    No hay consultas, incidencias ni puntos de atención
                    registrados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TARJETA EVIDENCIAS PENDIENTES */}
        <EvidenciasPendientesCard
          rows={filteredEvidencias}
          selectedCouncil={selectedCouncilFilter}
        />

        {/* TARJETA EVOLUTIVOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6 mt-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Rocket size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">
                Evolutivos
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Hoja de ruta y mejoras funcionales programadas (común a todos
                los consejos)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* “Soporte” (internamente: plataforma) */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                <LayoutDashboard className="text-blue-500" size={18} />
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  PLATAFORMA
                </h4>
              </div>
              <ul className="space-y-4">
                {(evolutivos.plataforma || []).map((item, i) => (
                  <li key={`plat-${i}`} className="flex items-start gap-3">
                    <div className="bg-white min-w-[24px] h-6 rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">
                      {i + 1}
                    </div>
                    <span className="text-xs text-slate-600 leading-relaxed py-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SUG */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                <Cpu className="text-emerald-500" size={18} />
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  SUG
                </h4>
              </div>
              <ul className="space-y-4">
                {(evolutivos.sug || []).map((item, i) => (
                  <li key={`sug-${i}`} className="flex items-start gap-3">
                    <div className="bg-white min-w-[24px] h-6 rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm">
                      {i + 1}
                    </div>
                    <span className="text-xs text-slate-600 leading-relaxed py-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
          Informe Oficial de Seguimiento • {REPORT_DATE_FOOTER}
        </div>
      </div>

      {exportState === "success" && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">¡PDF generado con éxito!</span>
        </div>
      )}
    </div>
  );
}
