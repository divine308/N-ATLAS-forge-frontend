import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  FlaskConical,
  GitBranch,
  Menu,
  Play,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Platform", id: "platform" },
  { label: "Evaluation", id: "evaluation" },
  { label: "Failure Lab", id: "failure-lab" },
  { label: "Developers", id: "developers" },
];

const CAPABILITIES = [
  {
    number: "01",
    title: "Experiment",
    description:
      "Run prompts against N-ATLAS, keep versions, and understand exactly what changed between attempts.",
    icon: Play,
  },
  {
    number: "02",
    title: "Evaluate",
    description:
      "Turn real Nigerian-language scenarios into repeatable evaluation suites instead of relying on intuition.",
    icon: FlaskConical,
  },
  {
    number: "03",
    title: "Stress",
    description:
      "Push models through code-switching, ambiguous inputs, adversarial prompts and edge cases.",
    icon: Zap,
  },
  {
    number: "04",
    title: "Ship",
    description:
      "Generate integration code and carry evidence from experimentation into production workflows.",
    icon: Code2,
  },
];

const EVALUATION_ROWS = [
  {
    language: "Yorùbá",
    tasks: ["Translation", "Code-switch", "Instruction"],
    score: "94%",
  },
  {
    language: "Hausa",
    tasks: ["Translation", "Instruction", "Reasoning"],
    score: "91%",
  },
  {
    language: "Igbo",
    tasks: ["Translation", "Code-switch", "Instruction"],
    score: "89%",
  },
  {
    language: "Nigerian English",
    tasks: ["Intent", "Instruction", "Context"],
    score: "96%",
  },
];

const FAILURES = [
  {
    label: "CODE-SWITCH",
    title: "Mixed-language instruction",
    body: "User switches between English and a local language inside the same request.",
    status: "DETECTED",
  },
  {
    label: "CONTEXT",
    title: "Meaning depends on locality",
    body: "A phrase is technically valid but loses meaning when separated from its Nigerian context.",
    status: "FLAGGED",
  },
  {
    label: "ROBUSTNESS",
    title: "Instruction drift",
    body: "A longer conversational chain causes the model to gradually ignore an important constraint.",
    status: "REVIEW",
  },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function Logo() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group flex items-center gap-3"
      aria-label="N-ATLAS Forge home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px] border border-[#242A38] bg-[#11151F] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <span className="absolute h-5 w-5 rounded-full bg-[#6D7CFF]/20 blur-[4px]" />
        <span className="relative h-2.5 w-2.5 rounded-[3px] bg-[#7383FF] shadow-[0_0_14px_rgba(115,131,255,0.8)]" />
      </span>

      <span className="text-[15px] font-semibold tracking-[-0.025em] text-[#171A22]">
        N-ATLAS{" "}
        <span className="font-medium text-[#737985] transition group-hover:text-[#5362D8]">
          Forge
        </span>
      </span>
    </button>
  );
}

function StatusDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[#7181FF]/30" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-[#F7F5EF] bg-[#6879FF]" />
    </span>
  );
}

function SectionLabel({ children, dark = false }) {
  return (
    <div
      className={`mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] ${
        dark ? "text-[#9DA5B8]" : "text-[#737985]"
      }`}
    >
      <span
        className={`h-px w-8 ${
          dark ? "bg-[#4A5265]" : "bg-[#B8BBC2]"
        }`}
      />
      {children}
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCapability, setActiveCapability] = useState(0);

  const go = (path) => navigate(path);

  const handleNav = (id) => {
    setMobileOpen(false);
    scrollTo(id);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#ECECF1] font-sans text-[#171A22] selection:bg-[#7181FF] selection:text-white">

      {/* =========================================================
          NAVIGATION
      ========================================================= */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#E0DFDA]/90 bg-[#ECECF1]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="relative text-[12px] font-medium text-[#656A75] transition-colors hover:text-[#171A22]"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <button
              onClick={() => go("/login")}
              className="text-[12px] font-medium text-[#656A75] transition-colors hover:text-[#171A22]"
            >
              Sign in
            </button>

          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4D5D8] bg-white/60 text-[#252A34] lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#E0DFDA] bg-[#ECECF1] px-6 py-6 lg:hidden">
            <div className="flex flex-col gap-5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="text-left text-sm font-medium text-[#353943]"
                >
                  {item.label}
                </button>
              ))}

              <div className="my-1 h-px bg-[#DDDDE0]" />

              <button
                onClick={() => go("/login")}
                className="text-left text-sm text-[#656A75]"
              >
                Sign in
              </button>

              <button
                onClick={() => go("/register")}
                className="flex w-fit items-center gap-2 rounded-full bg-[#171A22] px-5 py-3 text-sm font-semibold text-white"
              >
                Start building
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-screen border-b border-[#DEDDD8] pt-[74px]">
        <div className="pointer-events-none absolute -left-40 top-32 h-[500px] w-[500px] rounded-full bg-[#7887FF]/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-160px] top-[20%] h-[550px] w-[550px] rounded-full bg-[#8C7CFF]/10 blur-[130px]" />

        <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-[1440px] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">

          <div className="relative flex flex-col justify-center px-6 py-20 lg:px-10 lg:py-24">
            <div className="mb-10 flex items-center gap-3">
              <StatusDot />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737985]">
                Developer infrastructure for N-ATLAS
              </span>

              <span className="rounded-full border border-[#D8D8DE] bg-white/60 px-2.5 py-1 text-[9px] font-medium text-[#626878]">
                BETA
              </span>
            </div>

            <h1 className="max-w-[850px] text-[clamp(4rem,8.5vw,8.8rem)] font-semibold leading-[0.82] tracking-[-0.085em] text-[#151820]">
              Build
              <br />
              with
              <br />
              <span className="text-[#6474F4]">evidence.</span>
            </h1>

            <div className="mt-12 max-w-[590px]">
              <p className="text-[18px] leading-8 text-[#5D626D] lg:text-[20px]">
                N-ATLAS Forge gives developers a place to experiment, evaluate,
                stress-test and ship applications powered by Nigeria&apos;s
                sovereign AI model.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  onClick={() => go("/register")}
                  className="group flex items-center gap-3 rounded-full bg-[#6474F4] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(100,116,244,0.2)] transition hover:-translate-y-0.5 hover:bg-[#5566E8]"
                >
                  Enter the Forge
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => scrollTo("platform")}
                  className="flex items-center gap-2 rounded-full border border-[#C9CBD1] bg-white/40 px-6 py-3.5 text-sm font-medium text-[#353943] transition hover:border-[#9DA4B7] hover:bg-white"
                >
                  Explore platform
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-6 text-[10px] font-mono uppercase tracking-[0.12em] text-[#8A8F99]">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6474F4]" />
                Open model infrastructure
              </span>

              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8E7BDA]" />
                Nigerian language ready
              </span>
            </div>
          </div>

          {/* =====================================================
              HERO CONSOLE
          ===================================================== */}
          <div className="relative flex items-end border-t border-[#DEDDD8] bg-[#EFF0F4] lg:border-l lg:border-t-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(111,126,255,0.14),transparent_38%),radial-gradient(circle_at_20%_85%,rgba(139,122,218,0.12),transparent_35%)]" />

            <div className="relative w-full p-5 lg:p-10">
              <div className="overflow-hidden rounded-[3px] border border-[#303644] bg-[#151922] shadow-[0_25px_70px_rgba(30,35,50,0.2)]">

                <div className="flex h-12 items-center justify-between border-b border-[#2C3240] px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#7181FF] shadow-[0_0_10px_rgba(113,129,255,0.8)]" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E6E8EF]">
                      Forge Console
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-[#7F8798]">
                    N-ATLAS / READY
                  </span>
                </div>

                <div className="grid min-h-[510px] grid-cols-1 md:grid-cols-[0.38fr_0.62fr]">

                  <div className="border-b border-[#2C3240] bg-[#11151E] p-5 md:border-b-0 md:border-r">
                    <div className="mb-8 font-mono text-[9px] uppercase tracking-[0.14em] text-[#6F7789]">
                      Account
                    </div>

                    <div className="space-y-2 font-mono text-[11px]">
                      {[
                        "playground",
                        "experiments",
                        "evaluations",
                        "datasets",
                        "crash-tests",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`flex items-center gap-3 rounded-[2px] px-3 py-2.5 ${
                            index === 2
                              ? "border border-[#41496A] bg-[#252B43] text-[#EEF0FF]"
                              : "text-[#9CA3B3]"
                          }`}
                        >
                          <span
                            className={
                              index === 2
                                ? "text-[#7888FF]"
                                : "text-[#596174]"
                            }
                          >
                            {index === 2 ? "◆" : "·"}
                          </span>

                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 border-t border-[#292F3C] pt-5">
                      <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                        Model
                      </div>

                      <div className="flex items-center justify-between rounded-[2px] border border-[#363D4D] bg-[#181D27] px-3 py-3">
                        <span className="font-mono text-[11px] text-[#D5D8E0]">
                          N-ATLAS 8B
                        </span>

                        <span className="h-2 w-2 rounded-full bg-[#7181FF] shadow-[0_0_9px_rgba(113,129,255,0.7)]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col bg-[#151922]">
                    <div className="border-b border-[#2C3240] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#778093]">
                          Evaluation / run_024
                        </span>

                        <span className="border border-[#3F4759] bg-[#1C2230] px-2 py-1 font-mono text-[9px] text-[#AEB5C5]">
                          COMPLETE
                        </span>
                      </div>

                      <p className="font-mono text-[12px] leading-6 text-[#E0E3EA]">
                        <span className="text-[#7181FF]">&gt;</span>{" "}
                        Evaluate N-ATLAS against Nigerian
                        <br />
                        <span className="text-[#7181FF]">&gt;</span>{" "}
                        code-switching scenarios
                      </p>
                    </div>

                    <div className="flex-1 p-5">
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        <div className="rounded-[2px] border border-[#303746] bg-[#191E29] p-3">
                          <div className="font-mono text-[9px] uppercase text-[#70788A]">
                            Cases
                          </div>

                          <div className="mt-2 text-xl font-semibold text-[#F0F1F5]">
                            240
                          </div>
                        </div>

                        <div className="rounded-[2px] border border-[#303746] bg-[#191E29] p-3">
                          <div className="font-mono text-[9px] uppercase text-[#70788A]">
                            Passed
                          </div>

                          <div className="mt-2 text-xl font-semibold text-[#F0F1F5]">
                            226
                          </div>
                        </div>

                        <div className="rounded-[2px] border border-[#454B69] bg-[#22283B] p-3">
                          <div className="font-mono text-[9px] uppercase text-[#7E8CF0]">
                            Score
                          </div>

                          <div className="mt-2 text-xl font-semibold text-[#AAB4FF]">
                            94.2
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2 font-mono text-[10px]">
                        {[
                          ["Yorùbá", "96.4%", "PASS"],
                          ["Hausa", "91.8%", "PASS"],
                          ["Igbo", "89.7%", "REVIEW"],
                          ["Nigerian English", "97.1%", "PASS"],
                        ].map(([name, score, state]) => (
                          <div
                            key={name}
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-[#282E3A] py-3"
                          >
                            <span className="text-[#BFC4D0]">{name}</span>

                            <span className="text-[#E0E3E9]">
                              {score}
                            </span>

                            <span
                              className={
                                state === "REVIEW"
                                  ? "text-[#C69BB0]"
                                  : "text-[#8F9CFF]"
                              }
                            >
                              {state}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-7 rounded-[2px] border border-[#353C4D] bg-[#10141C] p-4">
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#858D9D]">
                          <ShieldCheck size={13} className="text-[#7988FF]" />
                          Regression check
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-[#C9CDD5]">
                            No critical regressions detected
                          </span>

                          <Check size={16} className="text-[#8C99FF]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 divide-x divide-[#C9CBD1] border-y border-[#C9CBD1]">
                {[
                  ["01", "Prompt"],
                  ["02", "Evaluate"],
                  ["03", "Evidence"],
                ].map(([number, label]) => (
                  <div key={number} className="py-4">
                    <div className="px-4 font-mono text-[9px] text-[#777E8B]">
                      {number}
                    </div>

                    <div className="mt-1 px-4 text-xs font-medium text-[#414652]">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          POSITIONING STRIP
      ========================================================= */}
      <section className="border-b border-[#DEDDD8] bg-[#ECECF1]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
          {[
            ["MODEL", "N-ATLAS"],
            ["LANGUAGES", "Yorùbá · Hausa · Igbo"],
            ["WORKFLOW", "Experiment → Evidence"],
            ["PURPOSE", "Production readiness"],
          ].map(([label, value], index) => (
            <div
              key={label}
              className="border-r border-[#D6D6DC] px-6 py-7 last:border-r-0 lg:px-10"
            >
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#858B97]">
                {label}
              </div>

              <div
                className={`text-sm font-medium ${
                  index === 0
                    ? "text-[#5F70EA]"
                    : "text-[#3E434D]"
                }`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          PLATFORM
      ========================================================= */}
      <section
        id="platform"
        className="relative scroll-mt-20 border-b border-[#DEDDD8] bg-[#ECECF1]"
      >
        <div className="pointer-events-none absolute right-[-180px] top-[15%] h-[420px] w-[420px] rounded-full bg-[#8B7BEA]/8 blur-[100px]" />

        <div className="relative mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-36">
          <div className="grid gap-16 lg:grid-cols-[0.38fr_0.62fr]">
            <div>
              <SectionLabel>The platform</SectionLabel>

              <h2 className="max-w-[440px] text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-[#181B23] md:text-5xl">
                From a model to a development system.
              </h2>

              <p className="mt-7 max-w-[390px] text-[15px] leading-7 text-[#60656F]">
                Building with a model is easy. Knowing whether it behaves
                correctly across the situations your users actually face is
                harder.
              </p>

              <div className="mt-10 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#7D838E]">
                <GitBranch size={14} className="text-[#6576F0]" />
                One Account / entire lifecycle
              </div>
            </div>

            <div className="border-t border-[#AEB1B8]">
              {CAPABILITIES.map((item, index) => {
                const Icon = item.icon;
                const active = activeCapability === index;

                return (
                  <button
                    key={item.number}
                    onMouseEnter={() => setActiveCapability(index)}
                    onClick={() => setActiveCapability(index)}
                    className={`group grid w-full grid-cols-[48px_1fr_auto] items-start gap-5 border-b border-[#DDDDE0] py-7 text-left transition ${
                      active
                        ? "bg-[#EFF0F8]"
                        : "hover:bg-[#F1F1F3]"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] ${
                        active ? "text-[#6576F0]" : "text-[#858A94]"
                      }`}
                    >
                      {item.number}
                    </span>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#292D36]">
                          {item.title}
                        </h3>

                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6879F5] shadow-[0_0_10px_rgba(104,121,245,0.5)]" />
                        )}
                      </div>

                      <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#686D77]">
                        {item.description}
                      </p>
                    </div>

                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-[#6576F0]"
                          : "text-[#9A9EA7] transition group-hover:text-[#6879F5]"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EVALUATION MATRIX
      ========================================================= */}
      <section
        id="evaluation"
        className="relative scroll-mt-20 border-b border-[#303642] bg-[#11151E] text-[#F7F5EF]"
      >
        <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[500px] w-[500px] rounded-full bg-[#6576F0]/10 blur-[130px]" />

        <div className="relative mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-36">
          <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel dark>Evaluation matrix</SectionLabel>

              <h2 className="max-w-[650px] text-4xl font-semibold leading-[1] tracking-[-0.055em] text-[#F7F5EF] md:text-6xl">
                Don&apos;t guess if it works.
                <br />
                <span className="text-[#8390FF]">Measure it.</span>
              </h2>
            </div>

            <p className="max-w-[360px] text-sm leading-6 text-[#969DAE]">
              Build evaluation suites around the languages, tasks and failure
              modes that matter to your application.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2px] border border-[#353C4A]">
            <div className="grid grid-cols-[1fr_1.5fr_120px] border-b border-[#353C4A] bg-[#181D27] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[#858D9D] md:grid-cols-[1fr_1.8fr_120px]">
              <span>Language</span>
              <span>Test coverage</span>
              <span>Result</span>
            </div>

            {EVALUATION_ROWS.map((row, index) => (
              <div
                key={row.language}
                className="grid grid-cols-[1fr_1.5fr_120px] items-center border-b border-[#292F3B] px-5 py-6 last:border-b-0 md:grid-cols-[1fr_1.8fr_120px]"
              >
                <span className="text-sm font-medium text-[#E1E4EA]">
                  {row.language}
                </span>

                <div className="flex flex-wrap gap-2">
                  {row.tasks.map((task, taskIndex) => (
                    <span
                      key={task}
                      className={`border px-2.5 py-1 font-mono text-[9px] ${
                        taskIndex === 0
                          ? "border-[#454E70] bg-[#20263A] text-[#AAB4FF]"
                          : "border-[#343B48] bg-[#171C25] text-[#A5ABB7]"
                      }`}
                    >
                      {task}
                    </span>
                  ))}
                </div>

                <span
                  className={`font-mono text-sm ${
                    index === 2
                      ? "text-[#C89FAF]"
                      : "text-[#8C9AFF]"
                  }`}
                >
                  {row.score}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.13em] text-[#6F7788] sm:flex-row">
            <span>Evaluation suites are repeatable</span>
            <span>Results become project evidence</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAILURE LAB
      ========================================================= */}
      <section
        id="failure-lab"
        className="relative scroll-mt-20 border-b border-[#DEDDD8] bg-[#ECECF1]"
      >
        <div className="pointer-events-none absolute left-[-180px] top-[30%] h-[450px] w-[450px] rounded-full bg-[#C28CA5]/7 blur-[120px]" />

        <div className="relative mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-36">
          <div className="grid gap-14 lg:grid-cols-[0.45fr_0.55fr]">
            <div>
              <SectionLabel>Failure Lab</SectionLabel>

              <h2 className="max-w-[520px] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#191C24] md:text-6xl">
                Find the edge before your users do.
              </h2>

              <p className="mt-7 max-w-[450px] text-[15px] leading-7 text-[#60656F]">
                Crash Test deliberately probes the uncomfortable parts of a
                model: ambiguity, code-switching, instruction drift and
                unexpected context.
              </p>

              <button
                onClick={() => go("/register")}
                className="group mt-9 flex items-center gap-2 border-b border-[#6575EA] pb-2 text-sm font-medium text-[#343944]"
              >
                Run your first crash test
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>

            <div className="space-y-3">
              {FAILURES.map((failure, index) => (
                <div
                  key={failure.label}
                  className="group border border-[#D0D1D5] bg-white/50 p-6 transition hover:-translate-y-0.5 hover:border-[#9BA3C2] hover:bg-white"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#777D88]">
                      {failure.label}
                    </span>

                    <span
                      className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                        failure.status === "REVIEW"
                          ? "text-[#AD6F8A]"
                          : "text-[#6878EA]"
                      }`}
                    >
                      {failure.status}
                    </span>
                  </div>

                  <div className="flex gap-5">
                    <span className="font-mono text-[10px] text-[#9A9EA7]">
                      0{index + 1}
                    </span>

                    <div>
                      <h3 className="text-lg font-semibold text-[#292D36]">
                        {failure.title}
                      </h3>

                      <p className="mt-2 max-w-[540px] text-sm leading-6 text-[#696E78]">
                        {failure.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border border-dashed border-[#B9BBC3] bg-[#F0F0F3] p-5">
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#656B77]">
                  <Terminal size={14} className="text-[#6576F0]" />
                  Failure Explorer
                </div>

                <div className="mt-3 font-mono text-[11px] leading-6 text-[#858B96]">
                  3 failure classes found / 0 critical regressions / review
                  recommended
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WORKFLOW
      ========================================================= */}
      <section className="border-b border-[#DCDDE1] bg-[#ECECF1]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-36">
          <SectionLabel>The Forge loop</SectionLabel>

          <div className="grid gap-14 lg:grid-cols-[0.4fr_0.6fr]">
            <div>
              <h2 className="text-4xl font-semibold leading-[1] tracking-[-0.055em] text-[#191C24] md:text-5xl">
                A tighter loop between building and knowing.
              </h2>

              <p className="mt-6 max-w-[390px] text-sm leading-6 text-[#626873]">
                Every experiment creates something useful: a result, a
                comparison, a failure, a regression signal or evidence for the
                next release.
              </p>
            </div>

            <div className="border-t border-[#AEB1B8]">
              {[
                ["01", "Connect", "Bring your application and N-ATLAS together."],
                ["02", "Experiment", "Try prompts, contexts and behaviours."],
                ["03", "Measure", "Run repeatable tests against real scenarios."],
                ["04", "Diagnose", "Inspect failures and regression signals."],
                ["05", "Ship", "Export the integration and evidence."],
              ].map(([number, title, body]) => (
                <div
                  key={number}
                  className="group grid grid-cols-[42px_140px_1fr] items-center border-b border-[#D1D2D7] py-6 transition hover:bg-[#E5E5EB]"
                >
                  <span className="font-mono text-[10px] text-[#7D838E]">
                    {number}
                  </span>

                  <span className="text-base font-semibold text-[#333842]">
                    {title}
                  </span>

                  <span className="text-sm leading-6 text-[#696E78]">
                    {body}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DEVELOPER INTEGRATION
      ========================================================= */}
      <section
        id="developers"
        className="relative scroll-mt-20 border-b border-[#DEDDD8] bg-[#ECECF1]"
      >
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-36">
          <div className="grid overflow-hidden rounded-[2px] border border-[#C9CBD1] lg:grid-cols-[0.44fr_0.56fr]">

            <div className="bg-[#ECECF1] p-8 lg:p-12">
              <SectionLabel>For developers</SectionLabel>

              <h2 className="text-4xl font-semibold leading-[1] tracking-[-0.05em] text-[#191C24]">
                Keep the model. Own the workflow.
              </h2>

              <p className="mt-7 max-w-[420px] text-sm leading-7 text-[#60656F]">
                Forge is designed to sit beside the code you already write.
                Use generated SDKs, evaluation exports and structured results
                without rebuilding your development tooling from scratch.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  "Python & JavaScript integration",
                  "Reusable evaluation suites",
                  "Exportable test evidence",
                  "Regression-ready workflows",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9DA5C6] bg-[#E2E5F6]">
                      <Check size={11} className="text-[#6171E5]" />
                    </span>

                    <span className="text-sm text-[#464B55]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#11151E] p-5 lg:p-8">
              <div className="overflow-hidden rounded-[2px] border border-[#353C4A]">
                <div className="flex items-center justify-between border-b border-[#2C3240] bg-[#181D27] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-[#8492FF]" />

                    <span className="font-mono text-[10px] text-[#D0D4DD]">
                      quickstart.py
                    </span>
                  </div>

                  <span className="font-mono text-[9px] text-[#7D8493]">
                    PYTHON
                  </span>
                </div>

                <pre className="overflow-x-auto p-6 font-mono text-[11px] leading-7 text-[#D0D4DD]">
                  <code>{`from natlas import Forge

forge = Forge(project="my-app")

result = forge.evaluate(
    suite="ng-local-language",
    model="n-atlas",
    cases=240
)

if result.regressions:
    forge.review(result)

print(result.score)
# 94.2`}</code>
                </pre>

                <div className="border-t border-[#2C3240] bg-[#0D1118] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#7181FF] shadow-[0_0_10px_rgba(113,129,255,0.7)]" />

                    <span className="font-mono text-[10px] text-[#AEB4C1]">
                      Evaluation completed successfully
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[#697182]">
                <span>Generated integration</span>
                <span>Ready to adapt</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#11151E]">
        <div className="pointer-events-none absolute -left-40 top-[-200px] h-[600px] w-[600px] rounded-full bg-[#6576F0]/14 blur-[130px]" />

        <div className="pointer-events-none absolute right-[-100px] bottom-[-250px] h-[600px] w-[600px] rounded-full bg-[#947DDD]/12 blur-[140px]" />

        <div className="absolute inset-y-0 right-0 hidden w-[38%] border-l border-[#2D3441] lg:block" />

        <div className="relative mx-auto max-w-[1440px] px-6 py-28 lg:px-10 lg:py-40">
          <div className="max-w-[920px]">
            <div className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#858D9D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7181FF]" />
              N-ATLAS / Developer Infrastructure
            </div>

            <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-semibold leading-[0.82] tracking-[-0.08em] text-[#F7F5EF]">
              Make your
              <br />
              AI work
              <br />
              <span className="text-[#8491FF]">measurable.</span>
            </h2>

            <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
              <button
                onClick={() => go("/register")}
                className="group flex w-fit items-center gap-3 rounded-full bg-[#F7F5EF] px-7 py-4 text-sm font-semibold text-[#171A22] shadow-[0_15px_40px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Start building with N-ATLAS

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <span className="max-w-[300px] text-sm leading-6 text-[#939AAA]">
                Experiment freely. Test seriously. Ship with evidence.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-[#ECECF1]">
        <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
          <div className="flex flex-col justify-between gap-8 border-b border-[#DEDDD8] pb-10 md:flex-row md:items-end">
            <div>
              <Logo />

              <p className="mt-5 max-w-[360px] text-sm leading-6 text-[#747985]">
                Developer infrastructure for building reliable applications
                with Nigeria&apos;s sovereign AI model.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="text-left text-[#686E79] transition hover:text-[#5868E4]"
                >
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => go("/login")}
                className="text-left text-[#686E79] transition hover:text-[#5868E4]"
              >
                Sign in
              </button>

              <button
                onClick={() => go("/register")}
                className="text-left text-[#686E79] transition hover:text-[#5868E4]"
              >
                Get started
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 pt-7 font-mono text-[9px] uppercase tracking-[0.13em] text-[#898F99] sm:flex-row">
            <span>© {new Date().getFullYear()} N-ATLAS Forge</span>

            <span>Built for the Nigerian AI ecosystem</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Landing;

