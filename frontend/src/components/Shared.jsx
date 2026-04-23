import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

/* ── Logo ── */
export const Logo = () => (
  <div className="flex items-center gap-2.5">
    {/* Champa flower icon placeholder — swap with actual SVG/img if available */}
    <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
         style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
      <span style={{ fontSize: 14 }}>🌸</span>
    </div>
    <div className="flex flex-col leading-none">
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "-0.025em", color: "#78350F" }}>
        Champa
      </span>
      <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "0.2em", color: "#D97706", textTransform: "uppercase" }}>
        AI Tutor
      </span>
    </div>
  </div>
);

/* ── White Logo for dark backgrounds ── */
export const LogoLight = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
         style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
      <span style={{ fontSize: 14 }}>🌸</span>
    </div>
    <div className="flex flex-col leading-none">
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "-0.025em", color: "#FFFBEB" }}>
        Champa
      </span>
      <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "0.2em", color: "#FDE68A", textTransform: "uppercase" }}>
        AI Tutor
      </span>
    </div>
  </div>
);

/* ── Bold text parser (renders **bold**) ── */
export const Bd = ({ t }) => (
  <>{(t || "").split("**").map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>
);

/* ── Hex color to light rgba background ── */
export const hexBg = (h) => {
  try {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `rgba(${r},${g},${b},.12)`;
  } catch {
    return "rgba(245,158,11,.12)";
  }
};

/* ── Preset colors for notebooks — warm/earthy palette ── */
export const presetColors = [
  "#F59E0B", "#D97706", "#78350F", "#B45309", "#92400E",
  "#EF4444", "#EC4899", "#8B5CF6", "#10B981", "#06B6D4",
  "#F97316", "#6366F1", "#14B8A6", "#84CC16", "#3B82F6",
  "#64748B",
];

/* ── Document type badge ── */
export const DocBadge = ({ t }) => {
  const c =
    { pdf: "text-red-700 bg-red-100", docx: "text-amber-800 bg-amber-100", pptx: "text-orange-700 bg-orange-100" }[t] ||
    "text-stone-600 bg-stone-100";
  return (
    <div className={`w-8 h-8 rounded-lg ${c} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
      {(t || "").toUpperCase()}
    </div>
  );
};

/* ── Modal ── */
export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl shadow-2xl w-full max-w-md p-6 border"
           style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.025em", color: "#78350F" }}>
            {title}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-amber-100" style={{ color: "#D97706" }}>
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Dropdown menu ── */
export function Dropdown({ items, onClose }) {
  const r = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if (r.current && !r.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={r} className="absolute right-0 top-8 z-50 w-40 rounded-xl shadow-lg py-1.5 border"
         style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
      {items.map((x, i) => (
        <button
          key={i}
          onClick={() => { x.action(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${x.danger ? "text-red-600 hover:bg-red-50" : "hover:bg-amber-50"}`}
          style={!x.danger ? { color: "#78350F" } : {}}
        >
          {x.icon}
          {x.label}
        </button>
      ))}
    </div>
  );
}
