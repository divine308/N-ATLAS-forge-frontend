import {
  ArrowRight
} from "lucide-react";

import {
  ForgeMetric
} from "../components/ForgeShared";

export default function Overview({
  project,
  health,
  setActive
}) {
  const localReady =
    health?.natlas_local_enabled === true;

  const hostedConnected =
    health?.natlas_configured === true;

  const providerReady =
    localReady || hostedConnected;

  const providerLabel = localReady
    ? "N-ATLAS"
    : hostedConnected
      ? "N-ATLAS"
      : "OFFLINE";

  const providerDetail = localReady
    ? "LOCAL / READY"
    : hostedConnected
      ? "HOSTED / CONNECTED"
      : "NOT CONFIGURED";

  return (
    <div>
      <div className="grid gap-10 border-b border-[#2C3240] pb-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
            Command center
          </div>

          <h1 className="mt-5 max-w-5xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.07em] text-[#E6E8EF] sm:text-7xl lg:text-[6.5rem]">
            Your model.
            <br />
            Under pressure.
          </h1>

          <p className="mt-8 max-w-2xl text-sm leading-7 text-[#697183]">
            Forge turns N-ATLAS from a model endpoint
            into an engineering workflow. Build prompts,
            create test suites, expose failure and ship
            with evidence.
          </p>
        </div>

        <div className="border-l border-[#2C3240] pl-6 lg:pt-2">
          <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#697183]">
            Project
          </div>

          <div className="mt-3 break-words font-mono text-sm text-[#AEB5C5]">
            {project?.name || "Untitled"}
          </div>

          <div className="mt-7 font-mono text-[8px] uppercase tracking-[0.2em] text-[#697183]">
            ID
          </div>

          <div className="mt-3 break-all font-mono text-[10px] text-[#596174]">
            {project?.id || "—"}
          </div>
        </div>
      </div>

      <div className="grid border-b border-[#2C3240] md:grid-cols-3">
        <ForgeMetric
          label="Model"
          value={providerLabel}
          detail={providerDetail}
        />

        <ForgeMetric
          label="Environment"
          value={
            health?.environment
              ?.toUpperCase() || "DEV"
          }
        />

        <ForgeMetric
          label="API"
          value={
            health?.status
              ?.toUpperCase() || "UNKNOWN"
          }
        />
      </div>

      {!providerReady && (
        <div className="mt-8 flex flex-col justify-between gap-6 border border-[#49323A] bg-[#21191E] p-6 lg:flex-row lg:items-center">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#C06C76]">
              N-ATLAS provider unavailable
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#697183]">
              The Forge backend is running, but no
              N-ATLAS execution provider is currently
              available. Project management and
              development tools remain accessible.
            </p>
          </div>

          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#C06C76]">
            PROVIDER OFFLINE
          </div>
        </div>
      )}

      {localReady && (
        <div className="mt-8 flex flex-col justify-between gap-6 border border-[#303746] bg-[#11151E] p-6 lg:flex-row lg:items-center">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8C9AFF]">
              Local N-ATLaS runtime
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#697183]">
              Forge is currently running against the
              local N-ATLAS model runtime. Requests are
              executed through the Forge backend.
            </p>
          </div>

          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#8C9AFF]">
            LOCAL / READY
          </div>
        </div>
      )}

      <div className="mt-12">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
          Workflow
        </div>

        <div className="mt-4 grid border-l border-t border-[#2C3240] sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "01",
              "PLAY",
              "Experiment with prompts and inspect actual model responses.",
              "playground"
            ],
            [
              "02",
              "BREAK",
              "Run the Nigerian-language Crash Test against difficult cases.",
              "crash"
            ],
            [
              "03",
              "MEASURE",
              "Create repeatable evaluation suites and collect evidence.",
              "evaluations"
            ],
            [
              "04",
              "SHIP",
              "Generate production integration code from the project.",
              "sdk"
            ]
          ].map(
            ([number, title, description, target]) => (
              <button
                key={number}
                type="button"
                onClick={() => setActive(target)}
                className="group min-h-[270px] border-b border-r border-[#2C3240] bg-[#151922] p-6 text-left transition hover:bg-[#181D27]"
              >
                <span className="font-mono text-[9px] text-[#596174]">
                  {number}
                </span>

                <h3 className="mt-12 font-display text-2xl font-semibold tracking-[-0.05em] text-[#E1E4EA]">
                  {title}
                </h3>

                <p className="mt-4 text-sm leading-6 text-[#697183]">
                  {description}
                </p>

                <ArrowRight
                  size={16}
                  className="mt-8 text-[#596174] transition group-hover:translate-x-1 group-hover:text-[#8C9AFF]"
                />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}