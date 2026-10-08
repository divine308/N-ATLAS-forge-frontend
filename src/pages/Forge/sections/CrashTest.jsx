import { useState } from "react";

import {
  Loader2,
  TestTube2,
  Zap
} from "lucide-react";

import { api } from "../../../api/client";

import {
  ForgeButton,
  ForgeEmptyState,
  ForgeMetric,
  PageHeader
} from "../components/ForgeShared";

export default function CrashTest({ project }) {
  const [running, setRunning] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  async function run() {
    if (!project?.id || running) {
      return;
    }

    setRunning(true);
    setError("");
    setResult(null);

    try {
      const started =
        await api.crashTest.run(
          project.id,
          {
            languages: [
              "english",
              "pidgin",
              "yoruba",
              "hausa",
              "igbo"
            ]
          }
        );

      const runId =
        started?.run_id;

      if (!runId) {
        throw new Error(
          "Crash Test did not return a run ID."
        );
      }

      let completed = false;

      while (!completed) {
        await new Promise(
          (resolve) =>
            window.setTimeout(
              resolve,
              1500
            )
        );

        const status =
          await api.crashTest.status(
            project.id,
            runId
          );

        if (
          status?.status ===
          "completed"
        ) {
          setResult(
            status.result
          );

          completed = true;
          break;
        }

        if (
          status?.status ===
          "failed"
        ) {
          throw new Error(
            status?.error ||
              "Crash Test failed."
          );
        }
      }
    } catch (err) {
      setError(
        err?.message ||
          "Crash test failed."
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="02 / Crash Test"
        title="Try to break it."
        description="A deliberately hostile test battery for Nigerian language, code-switching, context, instruction following and noisy input."
        action={
          <ForgeButton
            danger
            onClick={run}
            disabled={running}
          >
            {running ? (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                Running
              </>
            ) : (
              <>
                <Zap size={15} />
                Run crash test
              </>
            )}
          </ForgeButton>
        }
      />

      <div className="grid gap-6 border border-[#2C3240] bg-[#151922] p-6 md:grid-cols-[80px_minmax(0,1fr)] md:p-8">
        <div className="flex h-16 w-16 items-center justify-center border border-[#3F3035] bg-[#21191E] text-[#C06C76]">
          <TestTube2
            size={30}
            strokeWidth={1}
          />
        </div>

        <div>
          <div className="font-display text-2xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
            No vanity score.
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#697183]">
            Forge records individual failures so a
            developer can see exactly where a model
            struggles instead of hiding behind a single
            benchmark number.
          </p>
        </div>
      </div>

      <div className="mt-5 grid border-l border-t border-[#2C3240] sm:grid-cols-2 lg:grid-cols-3">
        {[
          [
            "LANGUAGE",
            "English · Nigerian Pidgin · Yoruba · Hausa · Igbo"
          ],
          [
            "CODE-SWITCH",
            "Mixed language prompts"
          ],
          [
            "CONTEXT",
            "Nigeria-specific terminology"
          ],
          [
            "ROBUSTNESS",
            "Typos · slang · ambiguity"
          ],
          [
            "INSTRUCTION",
            "Conflicting constraints"
          ],
          [
            "CONSISTENCY",
            "Equivalent questions across languages"
          ]
        ].map(([title, description]) => (
          <div
            key={title}
            className="min-h-[120px] border-b border-r border-[#2C3240] p-5"
          >
            <div className="font-mono text-[9px] tracking-[0.16em] text-[#C06C76]">
              {title}
            </div>

            <div className="mt-3 text-sm text-[#858D9D]">
              {description}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-8 border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
          {error}
        </div>
      )}

      {result ? (
        <CrashResult result={result} />
      ) : (
        <div className="mt-10">
          <ForgeEmptyState
            eyebrow="NO RUN RECORDED"
            title="The model hasn't been put under pressure."
            description="Run the Crash Test to generate an evidence trail across Nigerian-language and real-world stress cases."
            action="Run Crash Test"
            onAction={run}
          />
        </div>
      )}
    </div>
  );
}

function CrashResult({ result }) {
  const summary =
    result?.summary || result || {};

  const failures =
    result?.failures ||
    result?.results ||
    [];

  return (
    <div className="mt-10">
      <div className="grid border-y border-[#2C3240] md:grid-cols-4">
        <ForgeMetric
          label="Cases"
          value={
            summary.total_cases ??
            result?.total_cases ??
            "—"
          }
        />

        <ForgeMetric
          label="Passed"
          value={
            summary.passed_cases ??
            result?.passed_cases ??
            "—"
          }
        />

        <ForgeMetric
          label="Failed"
          value={
            summary.failed_cases ??
            result?.failed_cases ??
            "—"
          }
          danger
        />

        <ForgeMetric
          label="Score"
          value={
            summary.overall_score != null
              ? `${Math.round(
                  summary.overall_score * 100
                )}%`
              : "—"
          }
        />
      </div>

      <div className="mt-10">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
          Failure surface
        </div>

        {failures.length === 0 ? (
          <div className="mt-5 border border-[#2C3240] p-7 text-sm text-[#697183]">
            No individual failures were returned by
            the backend.
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {failures
              .slice(0, 30)
              .map((failure, index) => (
                <div
                  key={failure.id || index}
                  className="flex gap-5 border border-[#2C3240] bg-[#151922] p-5"
                >
                  <div className="font-mono text-[10px] text-[#596174]">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#C06C76]">
                      {failure.category ||
                        "FAILURE"}
                    </div>

                    <div className="mt-2 truncate text-sm text-[#C2C6D0]">
                      {failure.input ||
                        "No input available"}
                    </div>
                  </div>

                  <div className="hidden font-mono text-[9px] text-[#596174] md:block">
                    {failure.failure_reason ||
                      "INSPECT"}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}