import { useState } from "react";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";

export default function ProfilePage({ user, setUser, nav }) {
  const [profile, setProfile] = useState(user);
  const [error, setError] = useState("");

  const handleFileChange = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfile(prev => ({ ...prev, avatar: reader.result }));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!profile.name.trim()) {
      setError("Full name is required.");
      return;
    }
    setUser(profile);
    nav("dashboard");
  };

  const handleLogout = () => {
    setUser({ name: "Student User", email: "", phone: "", avatar: "", provider: "email" });
    nav("landing");
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <button onClick={() => nav("dashboard")} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6">
          <ArrowLeft size={14} /> Back to dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-3xl font-semibold text-neutral-700">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                (profile.name || "User")[0].toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Your profile</h1>
              <p className="text-sm text-neutral-500 mt-1">Update your name, email, phone, and profile photo.</p>
              <p className="text-xs text-neutral-400 mt-1">Signed in with {profile.provider === "google" ? "Google" : profile.provider === "phone" ? "phone" : "email/password"}.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Profile photo</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-700 cursor-pointer hover:bg-neutral-100">
                  <Camera size={16} /> Upload photo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {profile.avatar && (
                  <button type="button" onClick={() => setProfile(prev => ({ ...prev, avatar: "" }))} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full name</label>
              <input
                value={profile.name}
                onChange={ev => { setProfile(prev => ({ ...prev, name: ev.target.value })); setError(""); }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none focus:border-neutral-400 placeholder:text-neutral-400"
                placeholder="Jane Doe"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={ev => setProfile(prev => ({ ...prev, email: ev.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none focus:border-neutral-400 placeholder:text-neutral-400"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={ev => setProfile(prev => ({ ...prev, phone: ev.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none focus:border-neutral-400 placeholder:text-neutral-400"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button onClick={handleSave} className="flex-1 py-3 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all">Save changes</button>
              <button onClick={() => nav("dashboard")} className="flex-1 py-3 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all">Cancel</button>
            </div>
            <div className="pt-4">
              <button onClick={handleLogout} className="w-full py-3 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
