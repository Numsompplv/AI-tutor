import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Upload, MessageSquare, Shield } from "lucide-react";
import { Logo } from "./Shared";

export default function LandingPage({ nav }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  const features = [
    { icon: <Upload size={20} />, title: "Upload Your Materials", desc: "Upload PDFs, slides, and notes. Get tutoring grounded in your content with source citations." },
    { icon: <MessageSquare size={20} />, title: "Learn Any Topic", desc: "No uploads needed — just type a topic and start learning with AI." },
    { icon: <Sparkles size={20} />, title: "Smart AI Agents", desc: "Specialized AI agents collaborate to explain, quiz, and give personalized feedback." },
    { icon: <Shield size={20} />, title: "Verifiable Answers", desc: "Every explanation includes citations pointing to the exact source in your documents." },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FFFBEB", color: "#78350F" }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-lg"
           style={{ background: "rgba(255,251,235,0.85)", borderColor: "#FDE68A" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => nav("login")}
              className="px-4 py-1.5 text-sm font-medium transition-colors"
              style={{ color: "#D97706" }}
              onMouseEnter={e => e.target.style.color = "#78350F"}
              onMouseLeave={e => e.target.style.color = "#D97706"}
            >
              Log in
            </button>
            <button
              onClick={() => nav("register")}
              className="px-4 py-1.5 text-sm font-medium text-white rounded-full transition-all hover:shadow-md"
              style={{ background: "#F59E0B", borderRadius: 20 }}
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
               style={{ background: "#FEF3C7", borderColor: "#FDE68A", color: "#D97706", letterSpacing: "0.05em" }}>
            <Sparkles size={14} /> AI-Powered Learning
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: "-0.025em", color: "#78350F" }}>
            Your personal AI tutor
            <br />
            <span style={{ color: "#F59E0B" }}>for any subject</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: "#D97706" }}>
            Upload your course materials for grounded tutoring with citations — or learn any topic on demand with AI.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => nav("register")}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium transition-all hover:shadow-lg"
              style={{ background: "#F59E0B", borderRadius: 20 }}
            >
              Start learning free <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              className="px-6 py-2.5 text-sm font-medium border transition-all"
              style={{ color: "#78350F", borderColor: "#FDE68A", borderRadius: 20, background: "transparent" }}
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="px-6 pb-20">
        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="rounded-2xl p-1 shadow-2xl" style={{ background: "#1C0A00", boxShadow: "0 25px 60px rgba(120,53,15,0.25)" }}>
            <div className="rounded-xl overflow-hidden" style={{ background: "#2D1200" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "#3D1A00" }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B80" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center text-xs" style={{ color: "#D97706" }}>Champa AI Tutor</div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                    <span style={{ fontSize: 12 }}>🌸</span>
                  </div>
                  <div className="rounded-xl rounded-tl-sm px-4 py-3 max-w-md" style={{ background: "#3D1A00" }}>
                    <p className="text-sm" style={{ color: "#FDE68A" }}>
                      Based on your lecture slides, <span style={{ color: "#F59E0B" }}>normalization</span> is the process of organizing data to reduce redundancy...
                    </p>
                    <div className="mt-2 text-xs flex items-center gap-1" style={{ color: "#D97706" }}>
                      📄 DB_Lecture_03.pdf, p.14
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-xl rounded-tr-sm px-4 py-3" style={{ background: "#F59E0B" }}>
                    <p className="text-sm text-white">Quiz me on the normal forms!</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                    <span style={{ fontSize: 12 }}>🌸</span>
                  </div>
                  <div className="rounded-xl rounded-tl-sm px-4 py-3 max-w-md" style={{ background: "#3D1A00" }}>
                    <p className="text-sm" style={{ color: "#FDE68A" }}>Great idea! Here's a question from your materials:</p>
                    <div className="mt-3 p-3 rounded-lg border" style={{ background: "rgba(245,158,11,0.08)", borderColor: "#D9770630" }}>
                      <p className="text-sm font-medium" style={{ color: "#FDE68A" }}>Which normal form eliminates transitive dependencies?</p>
                      <div className="mt-2 space-y-1.5">
                        {["A) 1NF", "B) 2NF", "C) 3NF", "D) BCNF"].map(opt => (
                          <div key={opt} className="text-xs px-3 py-1.5 rounded-md" style={{ color: "#D97706", background: "#2D1200" }}>{opt}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20" style={{ background: "rgba(253,230,138,0.18)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase mb-3"
               style={{ letterSpacing: "0.2em", color: "#F59E0B" }}>Features</p>
            <h2 className="text-3xl font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: "-0.025em", color: "#78350F" }}>
              Everything you need to learn smarter
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="rounded-xl p-6 border transition-all group hover:shadow-md cursor-default"
                   style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
                   onMouseEnter={e => e.currentTarget.style.borderColor = "#F59E0B"}
                   onMouseLeave={e => e.currentTarget.style.borderColor = "#FDE68A"}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors"
                     style={{ background: "#FEF3C7", color: "#D97706" }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1.5"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#78350F" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#D97706" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase mb-3"
               style={{ letterSpacing: "0.2em", color: "#F59E0B" }}>How it works</p>
            <h2 className="text-3xl font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: "-0.025em", color: "#78350F" }}>
              Start learning in 3 steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Create a notebook", desc: "Organize your learning by course or topic" },
              { num: "02", title: "Upload or pick a topic", desc: "Bring your materials or explore freely" },
              { num: "03", title: "Start learning", desc: "Get explanations, quizzes, and personalized feedback" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold mb-4"
                     style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#FDE68A" }}>{s.num}</div>
                <h3 className="font-semibold mb-1.5"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#78350F" }}>
                  {s.title}
                </h3>
                <p className="text-sm" style={{ color: "#D97706" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: "-0.025em", color: "#78350F" }}>
            Ready to learn smarter?
          </h2>
          <p className="mb-8" style={{ color: "#D97706" }}>Create your free account and start your first session in minutes.</p>
          <button
            onClick={() => nav("register")}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium transition-all hover:shadow-lg"
            style={{ background: "#F59E0B", borderRadius: 20 }}
          >
            Get started — it's free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: "#FDE68A" }}>
        <div className="max-w-6xl mx-auto flex justify-center">
          <Logo />
        </div>
      </footer>
    </div>
  );
}
