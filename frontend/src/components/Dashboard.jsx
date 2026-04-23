import { useState, useEffect } from "react";
import { Plus, BookOpen, FileText, MessageSquare, Search, MoreHorizontal, Trash2, Pencil, LayoutGrid, List } from "lucide-react";
import { Logo, Modal, Dropdown, hexBg, presetColors } from "./Shared";
import { getToken } from "../api";

const BASE_URL = "http://localhost:8000";

const nbAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/api/notebooks`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to load notebooks");
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${BASE_URL}/api/notebooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create notebook");
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${BASE_URL}/api/notebooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update notebook");
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/api/notebooks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to delete notebook");
  },
};

/* ── Notebook Card ── */
function NBCard({ n, vw, onOpen, onEdit, onDel }) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (vw === "list") {
    return (
      <div
        className="group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-colors"
        style={{ color: "#78350F" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(253,230,138,0.3)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        onClick={onOpen}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: hexBg(n.color), color: n.color }}>
          <BookOpen size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" style={{ color: "#78350F" }}>{n.name}</h3>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs" style={{ color: "#D97706" }}>
          {n.docs > 0 && <span>{n.docs} docs</span>}
          <span>{n.convos} chats</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative rounded-xl p-5 cursor-pointer transition-all border hover:shadow-md"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#F59E0B"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#FDE68A"; }}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: hexBg(n.color), color: n.color }}>
          <BookOpen size={16} />
        </div>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            style={{ color: "#D97706" }}
            onMouseEnter={e => e.currentTarget.style.background = "#FEF3C7"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <Dropdown
              onClose={() => setMenuOpen(false)}
              items={[
                { icon: <Pencil size={14} />, label: "Edit", action: onEdit },
                { icon: <Trash2 size={14} />, label: "Delete", action: onDel, danger: true },
              ]}
            />
          )}
        </div>
      </div>
      <h3 className="font-semibold text-sm mb-1"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#78350F" }}>
        {n.name}
      </h3>
      {n.desc && <p className="text-xs mb-3" style={{ color: "#D97706" }}>{n.desc}</p>}
      <div className="flex items-center gap-4 text-xs" style={{ color: "#D97706" }}>
        {n.docs > 0 && <span className="flex items-center gap-1"><FileText size={12} /> {n.docs}</span>}
        <span className="flex items-center gap-1"><MessageSquare size={12} /> {n.convos}</span>
      </div>
    </div>
  );
}

/* ── Notebook Create/Edit Modal ── */
function NBModal({ nb, onSave, onClose }) {
  const [name, setName] = useState(nb?.name || "");
  const [desc, setDesc] = useState(nb?.desc || "");
  const [color, setColor] = useState(nb?.color || "#F59E0B");
  const [hex, setHex] = useState("");
  const [e, setE] = useState("");
  const applyHex = () => { if (/^#[0-9a-fA-F]{6}$/.test(hex)) { setColor(hex); setHex(""); } };

  const inputStyle = {
    border: "1.5px solid #FDE68A",
    background: "#FFFBEB",
    color: "#78350F",
    fontFamily: "'Instrument Sans', sans-serif",
  };

  return (
    <Modal title={nb ? "Edit notebook" : "New notebook"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#78350F" }}>Name</label>
          <input
            autoFocus
            placeholder="e.g. Database Systems"
            value={name}
            onChange={ev => { setName(ev.target.value); setE(""); }}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={{ ...inputStyle, borderColor: e ? "#EF4444" : "#FDE68A" }}
            onFocus={ev => { if (!e) ev.target.style.borderColor = "#F59E0B"; }}
            onBlur={ev => { if (!e) ev.target.style.borderColor = "#FDE68A"; }}
          />
          {e && <p className="text-xs text-red-500 mt-1">{e}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#78350F" }}>Description</label>
          <input
            placeholder="Optional"
            value={desc}
            onChange={ev => setDesc(ev.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={ev => ev.target.style.borderColor = "#F59E0B"}
            onBlur={ev => ev.target.style.borderColor = "#FDE68A"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#78350F" }}>Color</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {presetColors.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"}`}
                style={{ background: c, ringColor: "#F59E0B" }} />
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <div className="w-7 h-7 rounded-full border-2 border-dashed" style={{ background: color, borderColor: "#FDE68A" }} />
            <input
              placeholder="#F59E0B"
              value={hex}
              onChange={ev => setHex(ev.target.value)}
              onKeyDown={ev => { if (ev.key === "Enter") applyHex(); }}
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none font-mono"
              style={inputStyle}
            />
            <button onClick={applyHex}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
              style={{ borderColor: "#FDE68A", color: "#D97706" }}>
              Apply
            </button>
          </div>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border rounded-lg transition-all"
            style={{ borderColor: "#FDE68A", color: "#D97706" }}>
            Cancel
          </button>
          <button
            onClick={() => { if (!name.trim()) return setE("Required"); onSave({ name: name.trim(), desc: desc.trim(), color }); }}
            className="flex-1 py-2.5 text-sm font-medium text-white rounded-full transition-all hover:shadow-md"
            style={{ background: "#F59E0B" }}
          >
            {nb ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Dashboard Page ── */
export default function Dashboard({ nav, user, logout }) {
  const [nbs, setNbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [vw, setVw] = useState("grid");
  const [modal, setModal] = useState(null);
  const [del, setDel] = useState(null);

  useEffect(() => {
    nbAPI.getAll()
      .then(setNbs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data) => {
    try {
      const nb = await nbAPI.create(data);
      setNbs(prev => [nb, ...prev]);
      setModal(null);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (data) => {
    try {
      const updated = await nbAPI.update(modal.id, data);
      setNbs(prev => prev.map(n => n.id === modal.id ? updated : n));
      setModal(null);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await nbAPI.delete(del.id);
      setNbs(prev => prev.filter(n => n.id !== del.id));
      setDel(null);
    } catch (err) { console.error(err); }
  };

  const fl = nbs.filter(n => !q || n.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen" style={{ background: "#FFFBEB" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b" style={{ background: "rgba(255,251,235,0.95)", borderColor: "#FDE68A", backdropFilter: "blur(8px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav("profile")}
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold transition-all hover:ring-2"
              style={{ background: "#FEF3C7", color: "#78350F", ringColor: "#F59E0B" }}
              aria-label="Open profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || "U"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-0.5"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: "-0.025em", color: "#78350F" }}>
              Notebooks
            </h1>
            <p className="text-sm" style={{ color: "#D97706" }}>All your study notebooks</p>
          </div>
          <button
            onClick={() => setModal({})}
            className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium flex-shrink-0 transition-all hover:shadow-md"
            style={{ background: "#F59E0B", borderRadius: 20 }}
          >
            <Plus size={16} /> New notebook
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#D97706" }}><Search size={16} /></span>
            <input
              placeholder="Search..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all border"
              style={{ borderColor: "#FDE68A", background: "#FFFBEB", color: "#78350F", fontFamily: "'Instrument Sans', sans-serif" }}
              onFocus={e => e.target.style.borderColor = "#F59E0B"}
              onBlur={e => e.target.style.borderColor = "#FDE68A"}
            />
          </div>
          <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: "#FDE68A" }}>
            <button onClick={() => setVw("grid")}
              className="p-2 transition-colors"
              style={{ background: vw === "grid" ? "#FEF3C7" : "transparent", color: vw === "grid" ? "#78350F" : "#D97706" }}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setVw("list")}
              className="p-2 transition-colors"
              style={{ background: vw === "list" ? "#FEF3C7" : "transparent", color: vw === "list" ? "#78350F" : "#D97706" }}>
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#FDE68A", borderTopColor: "#F59E0B" }} />
          </div>
        ) : fl.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="font-semibold mb-4"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#78350F" }}>
              {q ? "No results" : "No notebooks yet"}
            </h3>
            {!q && (
              <button onClick={() => setModal({})}
                className="px-4 py-2 text-white text-sm rounded-full"
                style={{ background: "#F59E0B" }}>
                New notebook
              </button>
            )}
          </div>
        ) : (
          <div className={vw === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-0.5"}>
            {fl.map(n => (
              <NBCard
                key={n.id}
                n={n}
                vw={vw}
                onOpen={() => nav("chat", n)}
                onEdit={() => setModal(n)}
                onDel={() => setDel(n)}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <NBModal
          nb={modal.id ? modal : null}
          onSave={modal.id ? handleUpdate : handleCreate}
          onClose={() => setModal(null)}
        />
      )}

      {del && (
        <Modal title="Delete notebook" onClose={() => setDel(null)}>
          <p className="text-sm mb-6" style={{ color: "#D97706" }}>
            Delete <strong style={{ color: "#78350F" }}>{del.name}</strong> and all its data?
          </p>
          <div className="flex gap-2.5">
            <button onClick={() => setDel(null)}
              className="flex-1 py-2.5 text-sm font-medium border rounded-lg transition-all"
              style={{ borderColor: "#FDE68A", color: "#D97706" }}>
              Cancel
            </button>
            <button onClick={handleDelete}
              className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-all"
              style={{ background: "#DC2626" }}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
