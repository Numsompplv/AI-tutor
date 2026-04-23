import { useState, useEffect, useRef } from "react";
import { ArrowLeft, HelpCircle, Pencil, Plus, Trash2, CheckCircle2, X, RotateCcw, Timer, Sparkles } from "lucide-react";
import { getToken } from "../api";

const BASE_URL = "http://localhost:8000";

function genWrongAnswers(correct) {
  const c = correct.trim();
  const w = new Set();
  const words = c.split(" ");
  if (words.length > 1) { w.add(words.slice().reverse().join(" ")); w.add(words[0] + " analysis"); w.add("Inverse " + words[words.length - 1]); }
  w.add("Advanced " + c.toLowerCase()); w.add(c.toLowerCase() + " theory"); w.add("Pre-" + c.toLowerCase()); w.add(c.toLowerCase() + " method");
  w.delete(c);
  const arr = [...w].filter(x => x.length > 1 && x.length < 60 && x !== c.toLowerCase());
  const out = arr.sort(() => Math.random() - 0.5).slice(0, 3);
  while (out.length < 3) out.push(out.length === 0 ? "None of the above" : out.length === 1 ? "All of the above" : "Not applicable");
  return out;
}

function fmtTime(s) { const m = Math.floor(s / 60); return `${m}:${(s % 60).toString().padStart(2, "0")}`; }

function parseAIQuestions(text) {
  const questions = [];
  const lines = text.split("\n");
  let current = null;
  let options = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (/^Q\d+:/i.test(line) || /^\d+\./i.test(line)) {
      if (current && options.length >= 2) { current.o = options; if (current.a === undefined) current.a = 0; questions.push(current); }
      current = { q: line.replace(/^Q\d+:/i, "").replace(/^\d+\.\s*/i, "").trim(), o: [], a: 0, why: "" };
      options = [];
    } else if (/^[A-D][).]/i.test(line)) {
      options.push(line.replace(/^[A-D][).]\s*/i, "").trim());
    } else if (/^Answer:/i.test(line)) {
      const letter = line.replace(/^Answer:\s*/i, "").trim().toUpperCase();
      current.a = { A: 0, B: 1, C: 2, D: 3 }[letter[0]] ?? 0;
    } else if (/^Explanation:/i.test(line)) {
      current.why = line.replace(/^Explanation:\s*/i, "").trim();
    }
  }
  if (current && options.length >= 2) { current.o = options; if (current.a === undefined) current.a = 0; questions.push(current); }
  return questions;
}

export default function QuizPage({ notebook, onBack }) {
  const [mode, setMode] = useState("menu");

  // Setup state
  const [timer, setTimer] = useState(0);
  const [questionCount, setQuestionCount] = useState(5);
  const [customMin, setCustomMin] = useState("");
  const [customCount, setCustomCount] = useState("");

  // AI quiz state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Custom quiz state
  const [customQs, setCustomQs] = useState([]);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  // Playing state
  const [qs, setQs] = useState([]);
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [ans, setAns] = useState([]);
  const [picked, setPicked] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  const timerPresets = [{ v: 0, l: "No timer" }, { v: 60, l: "1 min" }, { v: 120, l: "2 min" }, { v: 300, l: "5 min" }, { v: 600, l: "10 min" }, { v: 900, l: "15 min" }];
  const countPresets = [3, 5, 10, 15, 20];

  const applyCustomMin = () => { const v = parseFloat(customMin); if (v > 0 && v <= 120) { setTimer(Math.round(v * 60)); setCustomMin(""); } };

  const addCustom = () => {
    if (!newQ.trim() || !newA.trim()) return;
    const wrongs = genWrongAnswers(newA.trim());
    const opts = [newA.trim(), ...wrongs].sort(() => Math.random() - 0.5);
    setCustomQs(p => [...p, { q: newQ.trim(), o: opts, a: opts.indexOf(newA.trim()), why: "Correct: " + newA.trim() }]);
    setNewQ(""); setNewA("");
  };

  const startAIQuiz = async () => {
    setAiLoading(true);
    setAiError("");
    const topic = notebook?.name || "general knowledge";
    try {
      const res = await fetch(`${BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          question: `Generate ${questionCount} multiple choice quiz questions about: ${topic}`,
          notebook_id: notebook?.id || null,
          topic,
          mode: "quiz",
        }),
      });
      const data = await res.json();
      const parsed = parseAIQuestions(data.answer);
      if (parsed.length === 0) {
        setAiError("Couldn't generate questions. Try again.");
        setAiLoading(false);
      } else {
        startQuiz(parsed.slice(0, questionCount));
        setAiLoading(false);
      }
    } catch (err) {
      setAiError("Failed: " + err.message);
      setAiLoading(false);
    }
  };

  const startQuiz = (questions) => {
    setQs(questions); setCur(0); setScore(0); setAns([]); setPicked(null); setTimedOut(false);
    setMode("playing");
    if (timer > 0) setTimeLeft(timer);
  };

  useEffect(() => {
    if (mode !== "playing" || timer === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current); setTimedOut(true);
          setAns(prevAns => { const remaining = []; for (let i = prevAns.length; i < qs.length; i++) remaining.push({ qi: i, sel: -1, ok: false, timeout: true }); return [...prevAns, ...remaining]; });
          setMode("done"); return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, timer, qs.length]);

  const pick = (idx) => {
    if (picked !== null || timedOut) return;
    setPicked(idx);
    const ok = idx === qs[cur].a;
    if (ok) setScore(s => s + 1);
    setAns(p => [...p, { qi: cur, sel: idx, ok }]);
    setTimeout(() => {
      setPicked(null);
      if (cur + 1 >= qs.length) { if (timerRef.current) clearInterval(timerRef.current); setMode("done"); }
      else setCur(c => c + 1);
    }, 400);
  };

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  // ── Menu ──
  if (mode === "menu") return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-700 mb-6 inline-flex items-center gap-1"><ArrowLeft size={14} /> Back to chat</button>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><HelpCircle size={24} /></div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Quiz Mode</h1>
          <p className="text-sm text-neutral-500">{notebook?.name || "General"}</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => { setMode("setup-quiz"); setAiError(""); }} className="w-full text-left p-5 rounded-xl border-2 border-neutral-100 hover:border-neutral-900 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100"><Sparkles size={18} /></div>
              <div>
                <h3 className="font-semibold text-neutral-900">Quiz</h3>
                <p className="text-xs text-neutral-500">{notebook?.id ? "Generated from your documents" : "AI-generated questions"}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400">{notebook?.id ? "AI reads your uploaded materials and creates questions from them." : "AI generates questions on general knowledge."}</p>
          </button>
          <button onClick={() => setMode("setup-custom")} className="w-full text-left p-5 rounded-xl border-2 border-neutral-100 hover:border-neutral-900 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100"><Pencil size={18} /></div>
              <div>
                <h3 className="font-semibold text-neutral-900">Custom Quiz</h3>
                <p className="text-xs text-neutral-500">{customQs.length > 0 ? `${customQs.length} questions created` : "Create your own"}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400">Type your own questions and answers. Wrong answers generated automatically.</p>
          </button>
        </div>
      </div>
    </div>
  );

  // ── Quiz Setup ──
  if (mode === "setup-quiz") return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button onClick={() => setMode("menu")} className="text-sm text-neutral-500 hover:text-neutral-700 mb-6 inline-flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Quiz Setup</h2>
        <p className="text-sm text-neutral-500 mb-6">{notebook?.name || "General Knowledge"}</p>

        {/* Timer */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Session timer</label>
          <p className="text-xs text-neutral-400 mb-2">Total time for the entire quiz</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {timerPresets.map(t => <button key={t.v} onClick={() => setTimer(t.v)} className={`px-3.5 py-2 rounded-lg text-sm font-medium border-2 transition-all ${timer === t.v ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>{t.l}</button>)}
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Custom (minutes)" value={customMin} onChange={e => setCustomMin(e.target.value)} onKeyDown={e => { if (e.key === "Enter") applyCustomMin(); }} className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:border-neutral-400 placeholder:text-neutral-400" min="0.5" max="120" step="0.5" />
            <button onClick={applyCustomMin} className="px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50">Set</button>
          </div>
        </div>

        {/* Question count */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Number of questions</label>
          <p className="text-xs text-neutral-400 mb-3">AI will generate this many questions</p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {countPresets.map(n => (
              <button key={n} onClick={() => setQuestionCount(n)} className={`py-3 rounded-xl border-2 transition-all ${questionCount === n ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-100 hover:border-neutral-900 hover:bg-neutral-50"}`}>
                <span className="text-lg font-bold">{n}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Custom (1-20)" value={customCount} onChange={e => setCustomCount(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none focus:border-neutral-400 placeholder:text-neutral-400" min="1" max="20" />
            <button onClick={() => { const v = parseInt(customCount); if (v > 0 && v <= 20) { setQuestionCount(v); setCustomCount(""); } }} className="px-3 py-2.5 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50">Set</button>
          </div>
          {questionCount && <p className="text-xs text-emerald-600 mt-2 font-medium">✓ {questionCount} questions selected</p>}
        </div>

        {aiError && <p className="text-xs text-red-500 mb-3">{aiError}</p>}

        {/* Start button */}
        <button
          onClick={startAIQuiz}
          disabled={aiLoading}
          className="w-full py-3 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {aiLoading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating {questionCount} questions...</>
          ) : (
            <><Sparkles size={16} /> Start Quiz ({questionCount} questions{timer > 0 ? `, ${fmtTime(timer)}` : ""})</>
          )}
        </button>
      </div>
    </div>
  );

  // ── Custom Quiz Builder ──
  if (mode === "setup-custom") return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button onClick={() => setMode("menu")} className="text-sm text-neutral-500 hover:text-neutral-700 mb-6 inline-flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Custom Quiz</h2>
        <p className="text-sm text-neutral-500 mb-6">Add your own questions</p>
        <div className="bg-neutral-50 rounded-xl p-4 mb-4 border border-neutral-100">
          <div className="space-y-2.5">
            <div><label className="block text-xs font-medium text-neutral-600 mb-1">Question</label><input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="e.g. What is data science?" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none focus:border-neutral-400 placeholder:text-neutral-400 bg-white" /></div>
            <div><label className="block text-xs font-medium text-neutral-600 mb-1">Correct answer</label><input value={newA} onChange={e => setNewA(e.target.value)} placeholder="e.g. The study of data" onKeyDown={e => { if (e.key === "Enter") addCustom(); }} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none focus:border-neutral-400 placeholder:text-neutral-400 bg-white" /></div>
            <button onClick={addCustom} disabled={!newQ.trim() || !newA.trim()} className="w-full py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"><Plus size={14} /> Add question</button>
          </div>
        </div>
        {customQs.length > 0 && (
          <>
            <div className="mb-4 max-h-40 overflow-y-auto space-y-1.5">
              {customQs.map((cq, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-300 mt-0.5 w-5 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium text-neutral-800 truncate">{cq.q}</p><p className="text-xs text-emerald-600 mt-0.5 truncate">✓ {cq.o[cq.a]}</p></div>
                  <button onClick={() => setCustomQs(p => p.filter((_, idx) => idx !== i))} className="text-neutral-300 hover:text-red-500 flex-shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            {/* Timer for custom */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Session timer</label>
              <div className="flex flex-wrap gap-2">
                {timerPresets.map(t => <button key={t.v} onClick={() => setTimer(t.v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${timer === t.v ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>{t.l}</button>)}
              </div>
            </div>
            <button onClick={() => startQuiz([...customQs].sort(() => Math.random() - 0.5))} className="w-full py-3 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800">
              Start Quiz ({customQs.length} questions{timer > 0 ? `, ${fmtTime(timer)}` : ""})
            </button>
          </>
        )}
        {customQs.length === 0 && <p className="text-center text-sm text-neutral-400 py-4">Add at least 1 question to start</p>}
      </div>
    </div>
  );

  // ── Results ──
  if (mode === "done") {
    const pct = qs.length > 0 ? Math.round(score / qs.length * 100) : 0;
    const timeoutCount = ans.filter(a => a.timeout).length;
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">{pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great job!" : pct >= 50 ? "Good effort!" : "Keep studying!"}</h1>
          <p className="text-sm text-neutral-500 mb-1">{score}/{qs.length} correct</p>
          {timer > 0 && <p className="text-xs text-neutral-400 mb-1">{timedOut && <span className="text-amber-600 font-medium">Time ran out! </span>}{timeoutCount > 0 && <span>{timeoutCount} unanswered</span>}</p>}
          <div className="h-4" />
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={pct >= 70 ? "#10b981" : "#f59e0b"} strokeWidth="8" strokeDasharray={`${pct * 2.64} 264`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-bold">{pct}%</span></div>
          </div>
          <div className="text-left mb-6 max-h-64 overflow-y-auto space-y-2">
            {ans.map((a, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${a.ok ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex-shrink-0">{a.ok ? <CheckCircle2 size={14} className="text-emerald-600" /> : <X size={14} className="text-red-500" />}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-neutral-800">{qs[a.qi]?.q}</p>
                    {a.timeout && <p className="text-xs text-amber-600 mt-1 font-medium">⏱ Not answered</p>}
                    {!a.ok && !a.timeout && (
                      <>
                        <p className="text-xs text-neutral-500 mt-1">Your answer: <span className="text-red-600 font-medium">{qs[a.qi]?.o[a.sel]}</span></p>
                        <p className="text-xs text-neutral-500">Correct: <span className="text-emerald-700 font-medium">{qs[a.qi]?.o[qs[a.qi]?.a]}</span></p>
                        {qs[a.qi]?.why && <p className="text-xs text-neutral-600 mt-1.5 bg-white/60 rounded-md px-2.5 py-2 border border-red-100">{qs[a.qi].why}</p>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setMode("menu")} className="flex-1 py-2.5 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-1.5"><RotateCcw size={14} /> Again</button>
            <button onClick={onBack} className="flex-1 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800">Done</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ──
  const qr = qs[cur];
  if (!qr) return null;
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
        <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onBack(); }} className="text-sm text-neutral-500 flex items-center gap-1"><ArrowLeft size={14} /> Exit</button>
        <span className="text-sm font-medium">{cur + 1}/{qs.length}</span>
        {timer > 0 ? <span className={`text-sm font-bold tabular-nums flex items-center gap-1 ${timeLeft <= 30 ? "text-red-500" : timeLeft <= 60 ? "text-amber-500" : "text-neutral-500"}`}><Timer size={14} /> {fmtTime(timeLeft)}</span> : <div className="w-16" />}
      </div>
      <div className="w-full h-1 bg-neutral-100"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${cur / qs.length * 100}%` }} /></div>
      {timer > 0 && <div className="w-full h-1"><div className={`h-full transition-all duration-1000 ${timeLeft <= 30 ? "bg-red-500" : timeLeft <= 60 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${(timeLeft / timer) * 100}%` }} /></div>}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <p className="text-xs font-medium text-purple-600 flex items-center gap-1 mb-3"><HelpCircle size={14} /> Question {cur + 1}</p>
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">{qr.q}</h2>
          <div className="space-y-2">
            {qr.o.map((opt, idx) => (
              <button key={idx} onClick={() => pick(idx)} disabled={picked !== null} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 ${picked === idx ? "border-neutral-900 bg-neutral-900 text-white scale-[0.98]" : picked !== null ? "border-neutral-100 bg-neutral-50 text-neutral-400" : "border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50"}`}>
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-200 ${picked === idx ? "border-white bg-white text-neutral-900" : picked !== null ? "border-neutral-200 text-neutral-300" : "border-neutral-300 text-neutral-400"}`}>{String.fromCharCode(65 + idx)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
