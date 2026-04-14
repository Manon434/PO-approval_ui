import { useState } from "react";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import SystemAlerts from "./SystemAlerts";

export default function LoginScreen({ loading, error, onLogin, backendDisconnected, systemStatus }) {
  const [email, setEmail] = useState("director@pop.local");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onLogin({
      email,
      password
    });
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_48%,#ffffff_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,430px)]">
          <section className="rounded-[36px] border border-sky-100 bg-white/80 p-6 shadow-panel backdrop-blur sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-[#0070b1]">
              <ShieldCheck className="h-4 w-4" />
              POP Secure Approval Workspace
            </div>
            <div className="mt-6">
              <SystemAlerts backendDisconnected={backendDisconnected} systemStatus={systemStatus} />
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Director-secured purchase order approvals with full audit visibility.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Every approval session is authenticated, every request is audited, and suspicious activity can be tracked
              across IP, device, and session history.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Authentication", value: "JWT + refresh session" },
                { label: "Audit Trail", value: "IP and device logging" },
                { label: "Protection", value: "Rate limits + role checks" }
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0070b1] text-white">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Secure Login</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Director Sign In</h2>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-[#0070b1] focus-within:ring-2 focus-within:ring-sky-100">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="director@pop.local"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-[#0070b1] focus-within:ring-2 focus-within:ring-sky-100">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl px-4 py-3 text-base font-semibold text-white transition ${
                  loading ? "cursor-wait bg-slate-400" : "bg-[#0070b1] hover:bg-[#005d91]"
                }`}
              >
                {loading ? "Signing In..." : "Sign In Securely"}
              </button>
            </form>

            <p className="mt-5 text-xs leading-6 text-slate-500">
              Use the director credentials configured in the backend `.env` file. Successful logins create a secure
              server session and audit trail.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
