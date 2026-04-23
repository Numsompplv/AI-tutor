import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import ProfilePage from "./components/ProfilePage";
import ChatPage from "./components/ChatPage";
import { authAPI, getToken, clearToken } from "./api";

export default function App() {
  const [page, setPage] = useState("landing");
  const [chatNB, setChatNB] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — check if user is already logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      authAPI.getMe(token)
        .then(userData => {
          setUser({
            id: userData.id,
            name: userData.name || userData.username,
            email: userData.email || "",
            phone: userData.phone || "",
            avatar: userData.avatar || "",
            provider: userData.provider || "email",
          });
          setPage("dashboard");
        })
        .catch(() => {
          clearToken(); // Token expired or invalid
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const nav = (target, data) => {
    if (target === "chat" && data) setChatNB(data);
    setPage(target);
    if (target !== "chat") window.scrollTo(0, 0);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    nav("landing");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  switch (page) {
    case "login":
      return <AuthPage mode="login" nav={nav} setUser={setUser} />;
    case "register":
      return <AuthPage mode="register" nav={nav} setUser={setUser} />;
    case "dashboard":
      return <Dashboard nav={nav} user={user} logout={logout} />;
    case "profile":
      return <ProfilePage nav={nav} user={user} setUser={setUser} logout={logout} />;
    case "chat":
      return <ChatPage notebook={chatNB} nav={nav} />;
    default:
      return <LandingPage nav={nav} />;
  }
}
