import { useState } from "react";
import { Check, Eye, EyeOff, Globe } from "lucide-react";
import { authAPI, saveToken } from "../api";
import { LogoLight, Logo } from "./Shared";

export default function AuthPage({ mode, nav, setUser }) {
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState("email");
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!isLogin && !form.username.trim()) e.username = "Username is required";
    if (authMethod === "email") {
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    } else {
      if (!form.phone.trim()) e.phone = "Phone number is required";
      else if (!/^\+?[0-9\s\-()]{7,20}$/.test(form.phone)) e.phone = "Enter a valid phone";
    }
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (!isLogin && form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const applyUser = (userData, token) => {
    saveToken(token);
    setUser({
      id: userData.id,
      name: userData.name || userData.username,
      email: userData.email || "",
      phone: userData.phone || "",
      avatar: userData.avatar || "",
      provider: userData.provider || "email",
    });
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setErrors({});
    try {
      if (isLogin) {
        const identifier = authMethod === "email" ? form.email : form.phone;
        const res = await authAPI.login(identifier, form.password);
        applyUser(res.user, res.access_token);
        nav("dashboard");
      } else {
        const email = authMethod === "email" ? form.email : null;
        const phone = authMethod === "phone" ? form.phone : null;
        const provider = authMethod === "phone" ? "phone" : "email";
        const res = await authAPI.register(form.username, email, phone, form.password, provider);
        applyUser(res.user, res.access_token);
        nav("dashboard");
      }
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, field, type = "text", placeholder }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#78350F" }}>{label}</label>
      <div className="relative">
        <input
          type={field === "password" || field === "confirm" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={form[field]}
          onChange={e => handleChange(field, e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={{
            border: errors[field] ? "1.5px solid #EF4444" : "1.5px solid #FDE68A",
            background: "#FFFBEB",
            color: "#78350F",
            fontFamily: "'Instrument Sans', sans-serif",
          }}
          onFocus={e => { if (!errors[field]) e.target.style.borderColor = "#F59E0B"; }}
          onBlur={e => { if (!errors[field]) e.target.style.borderColor = "#FDE68A"; }}
        />
        {field === "password" && (
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "#D97706" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#FFFBEB" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10"
           style={{ background: "#1C0A00" }}>
        <button onClick={() => nav("landing")}>
          <LogoLight />
        </button>
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold mb-3 leading-snug"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: "-0.025em", color: "#FFFBEB" }}>
            Learn from your own materials with AI-powered tutoring
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#D97706" }}>
            Upload your course content and get personalized explanations, quizzes, and feedback — all grounded in your actual study materials.
          </p>
          <div className="space-y-4">
            {[
              "Multi-agent AI for explanation, quizzing & feedback",
              "Source citations for every answer",
              "Track your progress across sessions",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5" style={{ color: "#F59E0B" }}><Check size={16} /></span>
                <span className="text-sm" style={{ color: "#FDE68A" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <button
              onClick={() => nav("landing")}
              className="text-sm transition-colors"
              style={{ color: "#D97706" }}
            >
              ← Back to home
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-1.5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: "-0.025em", color: "#78350F" }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm mb-8" style={{ color: "#D97706" }}>
            {isLogin ? "Log in to continue learning" : "Start your personalized learning journey"}
          </p>

          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-700 border border-red-200 bg-red-50">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <InputField label="Username" field="username" placeholder="johndoe" />
            )}
            <div className="flex gap-2.5 mb-2">
              {[{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAuthMethod(option.value)}
                  className="flex-1 py-2 text-sm font-medium border transition-all"
                  style={{
                    borderRadius: 20,
                    background: authMethod === option.value ? "#F59E0B" : "transparent",
                    color: authMethod === option.value ? "#fff" : "#D97706",
                    borderColor: authMethod === option.value ? "#F59E0B" : "#FDE68A",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {authMethod === "email" ? (
              <InputField label="Email" field="email" type="email" placeholder="you@university.edu" />
            ) : (
              <InputField label="Phone" field="phone" type="tel" placeholder="+1 555 123 4567" />
            )}
            <InputField label="Password" field="password" placeholder="At least 6 characters" />
            {!isLogin && (
              <InputField label="Confirm password" field="confirm" placeholder="Repeat your password" />
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-md"
              style={{ background: "#F59E0B", borderRadius: 20 }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? "Log in" : "Create account"
              )}
            </button>

            <div className="relative flex items-center text-sm my-3" style={{ color: "#D97706" }}>
              <span className="flex-1 h-px" style={{ background: "#FDE68A" }} />
              <span className="px-3 text-xs" style={{ color: "#D97706" }}>or continue with</span>
              <span className="flex-1 h-px" style={{ background: "#FDE68A" }} />
            </div>

            <button
              type="button"
              disabled
              className="w-full py-2.5 border rounded-full text-sm font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{ borderColor: "#FDE68A", color: "#D97706", background: "transparent" }}
            >
              <Globe size={16} /> Continue with Google (coming soon)
            </button>
          </div>

          <p className="text-sm text-center mt-6" style={{ color: "#D97706" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => nav(isLogin ? "register" : "login")}
              className="font-semibold hover:underline"
              style={{ color: "#78350F" }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
