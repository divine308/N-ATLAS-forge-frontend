
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Cpu,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#ECECF1] font-sans text-[#171A22] selection:bg-[#7181FF] selection:text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex h-[88px] items-center justify-between px-6 sm:px-10 lg:px-16 xl:px-24">

        <Link
          to="/"
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171A22]">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#7181FF]" />
          </span>

          <div>
            <div className="text-[15px] font-semibold tracking-[-0.025em]">
              N-ATLAS{" "}
              <span className="font-medium text-[#6878F0]">
                Forge
              </span>
            </div>

            <div className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.18em] text-[#7470A3]">
              Developer infrastructure
            </div>
          </div>
        </Link>

        <Link
          to="/register"
          className="group flex items-center gap-2 text-sm font-medium text-[#5969E7] transition hover:text-[#4658D8]"
        >
          Create Account
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>

      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mx-auto grid min-h-[calc(100vh-170px)] max-w-[1440px] items-center gap-16 px-6 py-14 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 xl:px-24">

        {/* ===================================================
            LEFT — PRODUCT INTRO
        =================================================== */}

        <section className="max-w-[680px]">

          <div className="mb-7 flex items-center gap-3">

            <span className="h-2.5 w-2.5 rounded-full bg-[#7181FF]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7470A3]">
              N-ATLAS system online
            </span>

          </div>

          <h1 className="text-[clamp(3.8rem,7vw,7.2rem)] font-semibold leading-[0.86] tracking-[-0.08em]">
            Build with
            <br />
            <span className="text-[#6878F0]">
              sovereign AI.
            </span>
          </h1>

          <p className="mt-9 max-w-[540px] text-[15px] leading-7 text-[#5F6170]">
            N-ATLAS Forge gives developers the infrastructure to
            build, evaluate, stress-test and ship applications
            powered by Nigeria&apos;s sovereign AI model.
          </p>

          {/* Product information */}

          <div className="mt-12 grid max-w-[590px] grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Cpu
                  size={14}
                  className="text-[#6878F0]"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7470A3]">
                  Model
                </span>
              </div>

              <p className="text-sm font-semibold">
                N-ATLAS
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Activity
                  size={14}
                  className="text-[#6878F0]"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7470A3]">
                  Status
                </span>
              </div>

              <p className="text-sm font-semibold">
                Operational
              </p>
            </div>

            <div>
              <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7470A3]">
                Runtime
              </div>

              <p className="text-sm font-semibold">
                Secure
              </p>
            </div>

            <div>
              <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7470A3]">
                Region
              </div>

              <p className="text-sm font-semibold">
                Nigeria
              </p>
            </div>

          </div>

        </section>

        {/* ===================================================
            RIGHT — LOGIN
        =================================================== */}

        <section className="w-full max-w-[470px] lg:ml-auto">

          <div className="mb-9">

            <div className="mb-5 flex items-center gap-3">

              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171A22]">
                <span className="h-2 w-2 rounded-[2px] bg-[#7181FF]" />
              </span>

              <span className="text-sm font-semibold tracking-[-0.02em]">
                N-ATLAS Forge
              </span>

            </div>

            <h2 className="text-[clamp(2.5rem,4vw,3.6rem)] font-semibold leading-[0.95] tracking-[-0.065em]">
              Welcome back.
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#5F6170]">
              Sign in to continue building with N-ATLAS.
            </p>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={submit}
            className="space-y-5"
          >

            {/* Email */}

            <label className="block">

              <span className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7470A3]">
                Email address
              </span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-[52px] w-full rounded-lg border border-[#C9C5E4] bg-[#ECECF1] px-4 text-sm text-[#171A22] outline-none transition placeholder:text-[#9692B1] focus:border-[#7181FF] focus:ring-4 focus:ring-[#7181FF]/10"
              />

            </label>

            {/* Password */}

            <label className="block">

              <span className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7470A3]">
                Password
              </span>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="h-[52px] w-full rounded-lg border border-[#C9C5E4] bg-[#ECECF1] px-4 pr-12 text-sm text-[#171A22] outline-none transition placeholder:text-[#9692B1] focus:border-[#7181FF] focus:ring-4 focus:ring-[#7181FF]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7470A3] transition hover:text-[#5969E7]"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </label>

            {/* Error */}

            {error && (
              <div className="rounded-lg border border-[#D4AFCB] px-4 py-3 text-sm text-[#955F78]">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="group flex h-[52px] w-full items-center justify-center gap-3 rounded-lg bg-[#171A22] text-sm font-semibold text-white transition hover:bg-[#252A36] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}

              {!loading && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>

          </form>

          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="mt-8 flex items-center justify-between text-sm">

            <span className="text-[#7470A3]">
              Don&apos;t have an account?
            </span>

          </div>

        </section>

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="flex items-center justify-between px-6 pb-7 sm:px-10 lg:px-16 xl:px-24">

        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#8580A8]">
          N-ATLAS Forge
        </span>

        <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.14em] text-[#7470A3]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7181FF]" />
          System operational
        </div>

      </footer>

    </main>
  );
}


