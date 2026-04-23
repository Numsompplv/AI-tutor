import { useState, useEffect, useRef } from "react";
import { Send, Plus, BookOpen, FileText, MessageSquare, ArrowLeft, Sparkles, HelpCircle, CheckCircle2, Upload, PanelLeft, Paperclip, X, Check, Trash2 } from "lucide-react";
import { Bd, DocBadge } from "./Shared";
import QuizPage from "./QuizPage.jsx";
import { sConvos } from "../data/sampleData.js";
import { getToken } from "../api";

const BASE_URL = "http://localhost:8000";

const docsAPI = {
  getAll: async (nbId) => {
    const res = await fetch(`${BASE_URL}/api/notebooks/${nbId}/documents`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to load documents");
    return res.json();
  },
  upload: async (nbId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/api/notebooks/${nbId}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Upload failed"); }
    return res.json();
  },
  delete: async (nbId, docId) => {
    const res = await fetch(`${BASE_URL}/api/notebooks/${nbId}/documents/${docId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Delete failed");
  },
};

function CiteCard({ c, i }) {
  const [o, setO] = useState(false);
  return (
    <button
      onClick={() => setO(!o)}
      className="flex items-start gap-2 text-left w-full px-3 py-2 rounded-lg text-xs transition-all border"
      style={{ background: "rgba(253,230,138,0.3)", borderColor: "#FDE68A" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#F59E0B"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#FDE68A"}
    >
      <span className="w-4 h-4 rounded font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-white"
            style={{ background: "#F59E0B", fontSize: 10 }}>{i}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-medium" style={{ color: "#78350F" }}>
          <FileText size={12} />
          <span className="truncate">{c.doc}</span>
          <span style={{ color: "#D97706" }}>p.{c.pg}</span>
        </div>
        {o && <p className="mt-1 italic" style={{ color: "#D97706" }}>"{c.txt}"</p>}
      </div>
    </button>
  );
}

function DocsPanel({ nbId, docs, onClose, onUploaded, onDeleted }) {
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState([]);
  const [error, setError] = useState("");
  const fR = useRef(null);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    setError("");
    for (const file of fileArray) {
      const tempId = `tmp-${Date.now()}-${Math.random()}`;
      setUploading(p => [...p, { id: tempId, name: file.name, status: "uploading" }]);
      try {
        setUploading(p => p.map(f => f.id === tempId ? { ...f, status: "processing" } : f));
        const doc = await docsAPI.upload(nbId, file);
        setUploading(p => p.filter(f => f.id !== tempId));
        onUploaded(doc);
      } catch (err) {
        setUploading(p => p.filter(f => f.id !== tempId));
        setError(err.message);
      }
    }
  };

  return (
    <div className="w-72 flex flex-col h-full flex-shrink-0 border-l" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
      <div className="px-4 h-14 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: "#FDE68A" }}>
        <h3 className="text-sm font-semibold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#78350F" }}>Documents</h3>
        <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: "#D97706" }}
                onMouseEnter={e => e.currentTarget.style.background = "#FEF3C7"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <X size={14} />
        </button>
      </div>
      <div className="px-4 py-3">
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fR.current?.click()}
          className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all"
          style={{ borderColor: drag ? "#F59E0B" : "#FDE68A", background: drag ? "rgba(245,158,11,0.05)" : "transparent" }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <Upload size={16} />
          </div>
          <p className="text-xs font-medium" style={{ color: "#78350F" }}>Drop files or click</p>
          <p className="text-xs" style={{ color: "#D97706" }}>PDF, DOCX, PPTX, TXT · max 20MB</p>
        </div>
        <input ref={fR} type="file" multiple accept=".pdf,.docx,.pptx,.txt" className="hidden" onChange={e => handleFiles(e.target.files)} />
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
      {uploading.length > 0 && (
        <div className="px-4 pb-2 space-y-1.5">
          {uploading.map(f => (
            <div key={f.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border" style={{ background: "#FEF3C7", borderColor: "#FDE68A" }}>
              <DocBadge t={f.name.split(".").pop()} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "#78350F" }}>{f.name}</p>
                <p className="text-xs" style={{ color: "#F59E0B" }}>{f.status === "uploading" ? "Uploading..." : "Processing..."}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {docs.length === 0 ? (
          <p className="text-center text-xs py-8" style={{ color: "#D97706" }}>No documents yet</p>
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ letterSpacing: "0.2em", color: "#D97706" }}>
              {docs.length} indexed
            </p>
            {docs.map(d => (
              <div key={d.id} className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors"
                   onMouseEnter={e => e.currentTarget.style.background = "rgba(253,230,138,0.3)"}
                   onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <DocBadge t={d.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "#78350F" }}>{d.name}</p>
                  <p className="text-xs" style={{ color: "#D97706" }}>{d.size} · {d.chunks} chunks</p>
                </div>
                <button onClick={() => onDeleted(d.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 transition-all"
                        style={{ color: "#D97706" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#DC2626"}
                        onMouseLeave={e => e.currentTarget.style.color = "#D97706"}>
                  <Trash2 size={12} />
                </button>
                <Check size={12} style={{ color: "#10B981", flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>
      {docs.length > 0 && (
        <div className="px-4 py-3 border-t" style={{ borderColor: "#FDE68A" }}>
          <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#10B981" }}>
            <CheckCircle2 size={14} /> RAG active
          </p>
        </div>
      )}
    </div>
  );
}

export default function ChatPage({ notebook, nav }) {
  const [convos, setConvos] = useState(sConvos);
  const [aid, setAid] = useState("c1");
  const [msgs, setMsgs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sideO, setSideO] = useState(true);
  const [docsO, setDocsO] = useState(false);
  const [quizOn, setQuizOn] = useState(false);
  const [currentConvoId, setCurrentConvoId] = useState(null);
  const endRef = useRef(null);
  const inpRef = useRef(null);
  const hasDocs = docs.length > 0;

  useEffect(() => {
    if (notebook?.id) {
      docsAPI.getAll(notebook.id).then(setDocs).catch(console.error);
    }
  }, [notebook?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  if (quizOn) return <QuizPage notebook={notebook} onBack={() => setQuizOn(false)} />;

  const handleUploaded = (doc) => {
    setDocs(prev => [doc, ...prev]);
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMsgs(prev => [...prev, {
      id: `sys-${Date.now()}`, role: "assistant", time: t, sys: "upload",
      content: `${doc.name} uploaded and indexed (${doc.chunks} chunks). RAG is now active.`,
    }]);
  };

  const handleDeleted = async (docId) => {
    try {
      await docsAPI.delete(notebook.id, docId);
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch (err) { console.error(err); }
  };

  const send = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMsgs(p => [...p, { id: `m${Date.now()}`, role: "user", content: question, time: t }]);
    setInput("");
    inpRef.current?.focus();
    setTyping(true);
    try {
      const res = await fetch(`${BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          question, notebook_id: notebook?.id || null,
          topic: notebook?.name || "general", conversation_id: currentConvoId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      if (data.conversation_id) setCurrentConvoId(data.conversation_id);
      setTyping(false);
      setMsgs(p => [...p, {
        id: `m${Date.now()}`, role: "assistant", time: data.time || t,
        content: data.answer,
        cites: data.citations?.map(c => ({ doc: c.doc, pg: c.page, txt: c.text })) || [],
      }]);
    } catch (err) {
      setTyping(false);
      setMsgs(p => [...p, { id: `m${Date.now()}`, role: "assistant", time: t, content: `❌ Error: ${err.message}`, cites: [] }]);
    }
  };

  const qa = a => {
    if (a === "quiz") { setQuizOn(true); return; }
    setInput({ explain: "Explain the key concepts", summary: "Summarize our discussion" }[a] || "");
    inpRef.current?.focus();
  };

  const kd = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const Chips = () => (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      {[
        { l: "Explain", a: "explain", icon: <Sparkles size={12} /> },
        { l: "Quiz me", a: "quiz", icon: <HelpCircle size={12} /> },
        { l: "Summarize", a: "summary", icon: <BookOpen size={12} /> },
      ].map(x => (
        <button key={x.a} onClick={() => qa(x.a)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all"
          style={{ borderColor: "#FDE68A", color: "#D97706" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.color = "#78350F"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#FDE68A"; e.currentTarget.style.color = "#D97706"; }}
        >
          {x.icon} {x.l}
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#FFFBEB" }}>
      {/* Sidebar */}
      <div className={`${sideO ? "w-72" : "w-0"} flex flex-col transition-all duration-200 overflow-hidden flex-shrink-0 border-r`}
           style={{ background: "rgba(253,230,138,0.15)", borderColor: "#FDE68A" }}>
        <div className="px-4 h-14 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: "#FDE68A" }}>
          <div className="flex items-center gap-2">
            <button onClick={() => nav("dashboard")} className="transition-colors" style={{ color: "#D97706" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#78350F"}
                    onMouseLeave={e => e.currentTarget.style.color = "#D97706"}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-sm font-semibold truncate"
                 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#78350F" }}>
                {notebook?.name || "Notebook"}
              </p>
              <p className="text-xs" style={{ color: "#D97706" }}>{hasDocs ? `${docs.length} docs` : "No docs"}</p>
            </div>
          </div>
          <button
            onClick={() => { const c = { id: `c${Date.now()}`, title: "New chat", last: "...", time: "Now" }; setConvos(p => [c, ...p]); setAid(c.id); setMsgs([]); setCurrentConvoId(null); }}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "#D97706" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#78350F"; e.currentTarget.style.background = "rgba(253,230,138,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#D97706"; e.currentTarget.style.background = "transparent"; }}
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {convos.map(c => (
            <button key={c.id} onClick={() => { setAid(c.id); setMsgs([]); setCurrentConvoId(null); }}
              className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: c.id === aid ? "rgba(245,158,11,0.12)" : "transparent",
                borderLeft: c.id === aid ? "2px solid #F59E0B" : "2px solid transparent",
              }}
              onMouseEnter={e => { if (c.id !== aid) e.currentTarget.style.background = "rgba(253,230,138,0.3)"; }}
              onMouseLeave={e => { if (c.id !== aid) e.currentTarget.style.background = "transparent"; }}
            >
              <p className="text-sm truncate"
                 style={{ fontWeight: c.id === aid ? 600 : 400, color: c.id === aid ? "#78350F" : "#D97706" }}>
                {c.title}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#B45309" }}>{c.last}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 px-5 flex items-center justify-between border-b flex-shrink-0"
             style={{ borderColor: "#FDE68A", background: "rgba(255,251,235,0.95)" }}>
          <div className="flex items-center gap-3">
            {!sideO && (
              <button onClick={() => setSideO(true)}
                className="p-1.5 rounded-lg mr-1 transition-all"
                style={{ color: "#D97706" }}
                onMouseEnter={e => e.currentTarget.style.background = "#FEF3C7"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <PanelLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-sm font-semibold"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#78350F" }}>
                {convos.find(c => c.id === aid)?.title || "New chat"}
              </h2>
              <p className="text-xs" style={{ color: "#D97706" }}>
                {hasDocs ? "Grounded in your docs" : "General knowledge"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {hasDocs && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
                    style={{ background: "rgba(16,185,129,0.08)", color: "#059669", borderColor: "rgba(16,185,129,0.2)" }}>
                <Check size={12} /> RAG
              </span>
            )}
            <button onClick={() => setDocsO(!docsO)}
              className="p-2 rounded-lg transition-all"
              style={{ background: docsO ? "#FEF3C7" : "transparent", color: docsO ? "#78350F" : "#D97706" }}>
              <FileText size={14} />
            </button>
            {sideO && (
              <button onClick={() => setSideO(false)}
                className="p-2 rounded-lg transition-all"
                style={{ color: "#D97706" }}
                onMouseEnter={e => e.currentTarget.style.background = "#FEF3C7"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <PanelLeft size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {msgs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                       style={{ background: "#FEF3C7" }}>
                    <MessageSquare size={20} style={{ color: "#D97706" }} />
                  </div>
                  <h3 className="font-semibold mb-1"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#78350F" }}>
                    Start a conversation
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#D97706" }}>
                    Upload documents to enable grounded answers with citations.
                  </p>
                  <Chips />
                </div>
              ) : (
                <div className="space-y-5 max-w-3xl mx-auto">
                  {msgs.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role !== "user" && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                             style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                          <span style={{ fontSize: 12 }}>🌸</span>
                        </div>
                      )}
                      <div className={`max-w-lg flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        {msg.sys === "upload" ? (
                          <div className="px-4 py-3 rounded-2xl rounded-tl-md text-sm border"
                               style={{ background: "rgba(245,158,11,0.08)", borderColor: "#FDE68A" }}>
                            <div className="flex items-center gap-2 font-medium mb-1" style={{ color: "#78350F" }}>
                              <Upload size={14} /> Document Ready
                            </div>
                            <p className="text-xs" style={{ color: "#D97706" }}>{msg.content}</p>
                          </div>
                        ) : msg.content && (
                          <div className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl"
                               style={msg.role === "user"
                                 ? { background: "#F59E0B", color: "#fff", borderRadius: "18px 18px 4px 18px" }
                                 : { background: "#FEF3C7", color: "#78350F", borderRadius: "18px 18px 18px 4px" }
                               }>
                            <Bd t={msg.content} />
                          </div>
                        )}
                        {msg.cites && msg.cites.length > 0 && hasDocs && (
                          <div className="mt-2 space-y-1 w-full">
                            <p className="text-xs font-medium px-1 mb-1 flex items-center gap-1" style={{ color: "#D97706" }}>
                              <BookOpen size={12} /> Sources
                            </p>
                            {msg.cites.map((c, i) => <CiteCard key={i} c={c} i={i + 1} />)}
                          </div>
                        )}
                        <span className="text-xs mt-1.5 px-1" style={{ color: "#B45309" }}>{msg.time}</span>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold"
                             style={{ background: "#FEF3C7", color: "#78350F" }}>U</div>
                      )}
                    </div>
                  ))}
                  {typing && (
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                           style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                        <span style={{ fontSize: 12 }}>🌸</span>
                      </div>
                      <div className="rounded-2xl rounded-tl-md px-4 py-3 flex gap-1" style={{ background: "#FEF3C7" }}>
                        {[0, 150, 300].map(d => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce"
                               style={{ background: "#F59E0B", animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t flex-shrink-0" style={{ borderColor: "#FDE68A" }}>
              {msgs.length > 0 && <Chips />}
              <div className="flex items-end gap-2">
                <button onClick={() => setDocsO(true)}
                  className="p-2.5 rounded-xl flex-shrink-0 transition-all"
                  style={{ color: "#D97706" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#78350F"; e.currentTarget.style.background = "#FEF3C7"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#D97706"; e.currentTarget.style.background = "transparent"; }}>
                  <Paperclip size={18} />
                </button>
                <textarea
                  ref={inpRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={kd}
                  placeholder="Ask anything..."
                  rows={1}
                  className="flex-1 resize-none px-4 py-3 rounded-xl text-sm outline-none transition-all max-h-32 border"
                  style={{
                    minHeight: "44px",
                    borderColor: "#FDE68A",
                    background: "#FFFBEB",
                    color: "#78350F",
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = "#F59E0B"}
                  onBlur={e => e.target.style.borderColor = "#FDE68A"}
                  onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"; }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="p-3 rounded-xl text-white flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md"
                  style={{ background: "#F59E0B" }}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-center mt-2" style={{ color: "#D97706", opacity: 0.6 }}>
                {hasDocs ? `${docs.length} docs · RAG on` : "No docs · general knowledge"}
              </p>
            </div>
          </div>

          {docsO && (
            <DocsPanel nbId={notebook?.id} docs={docs} onClose={() => setDocsO(false)} onUploaded={handleUploaded} onDeleted={handleDeleted} />
          )}
        </div>
      </div>
    </div>
  );
}
