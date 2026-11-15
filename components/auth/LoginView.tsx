"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { DUMMY_USERS, DemoUser } from "@/lib/data/seededUsers";
import {
  ArrowRight,
  ArrowUpRight,
  Lock,
  Mail,
  User,
  Play,
  Check,
} from "lucide-react";

export function LoginView() {
  const { loginAs, loginWithEmail, signupWithEmail } = useAuth();

  // Mode: "login" or "signup"
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Form states
  const [email, setEmail] = useState("kabir@northstar.internal");
  const [password, setPassword] = useState("••••••••••••");
  const [fullName, setFullName] = useState("");
  const [signupRole, setSignupRole] = useState<"admin" | "editor" | "reviewer">("editor");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected persona state for instant feedback
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === "login") {
      const result = loginWithEmail(email, password);
      if (!result.success) {
        setError(result.error || "Failed to sign in.");
      }
    } else {
      const result = signupWithEmail(fullName, email, password, signupRole);
      if (!result.success) {
        setError(result.error || "Failed to create account.");
      }
    }
  };

  const handleSelectPersona = (demoUser: DemoUser) => {
    setSelectedPersonaId(demoUser.id);
    setTimeout(() => {
      loginAs(demoUser);
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8f9fb] text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* ========================================================= */}
      {/* LEFT HALF: DARK BRAND HERO & VALUE PROPOSITION */}
      {/* ========================================================= */}
      <section className="w-full lg:w-1/2 bg-[#091722] text-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle radial gradient and SVG contour concentric waves */}
        <div className="absolute inset-0 bg-radial-at-c from-[#0f2c3d]/60 via-[#091722] to-[#060e15] pointer-events-none" />

        {/* Concentric rings centered around the floating pulse widget */}
        <svg
          className="absolute right-[-8%] top-[40%] w-[750px] h-[750px] -translate-y-1/2 pointer-events-none opacity-[0.09]"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="400" cy="400" r="140" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="400" cy="400" r="220" stroke="#34d399" strokeWidth="1.5" />
          <circle cx="400" cy="400" r="300" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="400" cy="400" r="380" stroke="#34d399" strokeWidth="1" />
        </svg>

        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark with 3 vertical bars */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] p-[1.5px] shadow-lg shadow-emerald-950/40">
              <div className="w-full h-full bg-[#081721]/90 rounded-[10px] flex items-center justify-center gap-[2.5px]">
                <span className="block w-[3px] h-[9px] bg-emerald-400 rounded-full" />
                <span className="block w-[3px] h-[16px] bg-emerald-300 rounded-full" />
                <span className="block w-[3px] h-[12px] bg-emerald-400 rounded-full" />
              </div>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white leading-none">
                easyvideo
              </div>
              <div className="text-[8.5px] font-semibold tracking-[0.22em] text-slate-400 uppercase mt-0.5">
                AI TRAINING VIDEO MAINTENANCE
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-[10.5px] backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span>Interactive Prototype · Ready</span>
          </div>
        </div>

        {/* Middle Hero content */}
        <div className="relative z-10 my-4 lg:my-auto max-w-xl">
          {/* Category kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold tracking-wider uppercase mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>AI TRAINING VIDEO INTELLIGENCE</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold text-white tracking-tight leading-[1.08] mb-3 font-heading">
            Make every <br />
            training update <br />
            <span className="text-[#34d399] font-normal italic font-serif">count.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300/90 text-xs sm:text-[13px] leading-relaxed max-w-md mb-4 font-normal">
            One workspace to map source document changes, preserve approved scenes, and keep multilingual video curriculum always synchronized.
          </p>

          {/* Floating Frosted Telemetry Widget */}
          <div className="bg-[#0c2230]/75 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3.5 shadow-2xl max-w-[320px]">
            <div className="flex items-center justify-between text-[9px] font-bold tracking-wider mb-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CHANGE PULSE</span>
              </div>
              <span className="text-slate-400 font-medium tracking-widest text-[8.5px]">
                DEMO SNAPSHOT
              </span>
            </div>

            <div className="mb-2">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">
                Synchronized scenes
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  12/12
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  ↗ 98.4%
                </span>
              </div>
            </div>

            {/* Mini scene visual chart */}
            <div className="h-7 flex items-end gap-1.5 py-0.5 mb-2">
              {[45, 65, 55, 80, 95, 75, 100, 70, 90, 85, 60, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-xs transition-all duration-300 ${
                    i === 2 || i === 6 || i === 8
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                      : "bg-teal-700/50"
                  }`}
                  title={`Scene ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[8px] font-bold tracking-wider text-slate-400 border-t border-slate-700/60 pt-1.5 uppercase">
              <span>WEEKLY SYNC</span>
              <span>4 LANGUAGES</span>
            </div>
          </div>
        </div>

        {/* Bottom metrics & footer bar */}
        <div className="relative z-10 pt-2">
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">12</div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">Scenes in course</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">04</div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">Language versions</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">01</div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">Connected view</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase pt-3 mt-2 border-t border-slate-800/40">
            <span>BUILT FOR PEOPLE & CULTURE · L&D TEAMS</span>
            <span className="hidden sm:inline">INDEPENDENT PORTFOLIO PROJECT · 2026</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RIGHT HALF: CLEAN MINIMALIST WORKSPACE AUTH CARD */}
      {/* ========================================================= */}
      <section className="w-full lg:w-1/2 flex flex-col justify-between p-5 sm:p-7 lg:p-9 xl:p-10 bg-[#f8f9fb] min-h-screen">
        {/* Top right corner switcher */}
        <div className="flex items-center justify-end">
          {authMode === "login" ? (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Need a workspace?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                }}
                className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-0.5 transition-colors"
              >
                <span>Sign up</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Already have a workspace?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError(null);
                }}
                className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-0.5 transition-colors"
              >
                <span>Sign in</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Floating White Card */}
        <div className="max-w-[440px] w-full mx-auto my-auto py-2">
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/60 border border-slate-200/80">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-1.5 mb-1.5">
              <span className="text-emerald-500 text-sm font-black">✳</span>
              <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                YOUR TRAINING WORKSPACE
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 font-heading">
              {authMode === "login" ? "Welcome back." : "Create account."}
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {authMode === "login"
                ? "Sign in to continue keeping training content synchronized."
                : "Get started with AI-driven training video maintenance."}
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login / Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required={authMode === "signup"}
                      className="w-full pl-10 pr-3.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-10 pr-3.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9.5px] font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          "Demo credentials: Use kabir@northstar.internal or click any demo persona below."
                        )
                      }
                      className="text-[9px] font-semibold text-emerald-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-14 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  Use at least 8 characters.
                </p>
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Assign Role in Studio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "editor", label: "Editor", desc: "Scripts & Visuals" },
                        { id: "admin", label: "Admin", desc: "Full Access" },
                        { id: "reviewer", label: "Reviewer", desc: "QA & Compliance" },
                      ] as const
                    ).map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSignupRole(r.id)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          signupRole === r.id
                            ? "bg-emerald-50 border-emerald-500 text-slate-900 ring-1 ring-emerald-500/30"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-bold capitalize flex items-center justify-between">
                          <span>{r.label}</span>
                          {signupRole === r.id && (
                            <Check className="w-3 h-3 text-emerald-600" />
                          )}
                        </div>
                        <small className="block text-[9px] text-slate-500 truncate">
                          {r.desc}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                className="w-full mt-1 bg-[#0c2331] hover:bg-[#13374d] text-white font-semibold text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <span>
                  {authMode === "login"
                    ? "Sign In to EasyVideo"
                    : "Create Workspace Account"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3.5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                OR JUMP RIGHT IN
              </span>
            </div>

            {/* Prominent Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectPersona(DUMMY_USERS[0])}
              className="w-full p-2.5 sm:p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all text-left flex items-center justify-between group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-3 h-3 fill-emerald-600 translate-x-0.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    Explore the live demo
                  </span>
                  <span className="block text-[10px] text-slate-500 truncate">
                    Open the workspace instantly · No account needed
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0" />
            </button>

            {/* Option to Select Between 4 Personas Under the Demo Button */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  Select between 4 demo personas:
                </span>
                <span className="text-[9px] font-semibold text-emerald-700">
                  1-click access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {DUMMY_USERS.map((demoUser: DemoUser) => {
                  const isSelected = selectedPersonaId === demoUser.id;
                  const roleBadgeStyle =
                    demoUser.role === "admin"
                      ? "bg-slate-100 text-slate-800 border-slate-200"
                      : demoUser.role === "editor"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200";

                  const avatarBg =
                    demoUser.role === "admin"
                      ? "bg-[#0c2331]"
                      : demoUser.role === "editor"
                      ? "bg-indigo-600"
                      : "bg-emerald-600";

                  return (
                    <button
                      type="button"
                      key={demoUser.id}
                      onClick={() => handleSelectPersona(demoUser)}
                      className={`p-2 rounded-xl border text-left transition-all group flex flex-col justify-between ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 scale-[0.99]"
                          : "border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className={`w-4.5 h-4.5 rounded-md ${avatarBg} text-white font-bold text-[8px] flex items-center justify-center shrink-0 shadow-xs px-1`}
                            >
                              {demoUser.avatarUrl}
                            </div>
                            <strong className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                              {demoUser.fullName}
                            </strong>
                          </div>
                          <span
                            className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${roleBadgeStyle}`}
                          >
                            {demoUser.role}
                          </span>
                        </div>

                        <p className="text-[9px] text-slate-500 leading-snug line-clamp-1">
                          {demoUser.title}
                        </p>
                      </div>

                      <div className="text-[8.5px] font-semibold text-emerald-700 group-hover:text-emerald-800 flex items-center justify-between pt-1 mt-1 border-t border-slate-100">
                        <span>Enter as {demoUser.fullName.split(" ")[0]}</span>
                        <ArrowRight className="w-2.5 h-2.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Switch Mode Link */}
            <div className="mt-3 text-center">
              {authMode === "login" ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  New to EasyVideo?{" "}
                  <span className="font-semibold text-emerald-700 hover:underline">
                    Create an account
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Already have an account?{" "}
                  <span className="font-semibold text-emerald-700 hover:underline">
                    Sign in
                  </span>
                </button>
              )}
            </div>

            {/* Fine print disclaimer */}
            <p className="mt-2 text-[9px] text-slate-400 text-center leading-normal">
              By continuing, you agree to use this independent prototype with its fictional sample data. No external media systems or credentials required.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[9px] font-medium text-slate-400 pt-3 border-t border-slate-200/60 max-w-[440px] w-full mx-auto">
          <span>© 2026 EASYVIDEO</span>
          <span>INDEPENDENT PRODUCT CASE STUDY</span>
        </div>
      </section>
    </div>
  );
}
