import { useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Database,
  FileCode2,
  FlaskConical,
  Gauge,
  Loader2,
  XCircle
} from "lucide-react";

import { api } from "../../../api/client";

import {
  FailureField,
  ForgeEmptyState,
  ForgeLoading,
  PageHeader
} from "../components/ForgeShared";

import { formatDate } from "../forge.config";

function formatScore(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "—";
  }

  return `${Math.round(numeric * 100)}%`;
}

function formatLatency(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "—";
  }

  return `${Math.round(numeric)} ms`;
}

function normalizeReasons(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

export default function Failures({ project }) {
  const [runs, setRuns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [runData, setRunData] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRun, setLoadingRun] = useState(false);
  const [error, setError] = useState("");

  async function loadRuns() {
    if (!project?.id) return;

    setLoading(true);
    setError("");

    try {
      const data = await api.evaluations.runs(
        project.id
      );

      const list = Array.isArray(data)
        ? data
        : data?.runs || [];

      setRuns(list);

      if (list.length > 0) {
        await selectRun(list[0], false);
      } else {
        setSelected(null);
        setRunData(null);
        setResults([]);
      }
    } catch (err) {
      setRuns([]);
      setSelected(null);
      setRunData(null);
      setResults([]);
      setError(
        err?.message ||
          "Unable to load evaluation runs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      if (!project?.id) return;

      setLoading(true);
      setError("");

      try {
        const data = await api.evaluations.runs(
          project.id
        );

        if (cancelled) return;

        const list = Array.isArray(data)
          ? data
          : data?.runs || [];

        setRuns(list);

        if (list.length > 0) {
          setSelected(list[0]);
          setLoadingRun(true);

          const detail =
            await api.evaluations.results(
              list[0].id
            );

          if (cancelled) return;

          setRunData(detail);
          setResults(
            Array.isArray(detail)
              ? detail
              : detail?.results || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setRuns([]);
          setSelected(null);
          setRunData(null);
          setResults([]);
          setError(
            err?.message ||
              "Unable to load evaluation failures."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingRun(false);
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [project?.id]);

  async function selectRun(run, updateSelection = true) {
    if (!run?.id) return;

    if (updateSelection) {
      setSelected(run);
    }

    setLoadingRun(true);
    setError("");

    try {
      const data =
        await api.evaluations.results(
          run.id
        );

      setRunData(data);

      setResults(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err) {
      setRunData(null);
      setResults([]);
      setError(
        err?.message ||
          "Unable to load this evaluation run."
      );
    } finally {
      setLoadingRun(false);
    }
  }

  const failures = results.filter(
    (result) =>
      result?.passed === false
  );

  const passedCount = results.filter(
    (result) =>
      result?.passed === true
  ).length;

  const selectedRun =
    runData?.run || selected;

  const suite = runData?.suite || null;
  const dataset = runData?.dataset || null;

  const targetFiles =
    runData?.target_files ||
    runData?.codebase?.targets ||
    [];

  return (
    <div>
      <PageHeader
        eyebrow="05 / Failure Explorer"
        title="Find the cracks."
        description="Trace failed evaluation cases back to the suite, dataset and exact code snapshot that produced the result."
      />

      {error && (
        <div className="mb-7 border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
          {error}
        </div>
      )}

      {loading ? (
        <ForgeLoading label="LOADING FAILURE REGISTRY..." />
      ) : runs.length === 0 ? (
        <div className="mt-10">
          <ForgeEmptyState
            eyebrow="NO EVALUATION RUNS"
            title="Nothing has been evaluated yet."
            description="Run an evaluation suite first. Failed cases, datasets and code snapshots will appear here automatically."
          />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="border border-[#2C3240] bg-[#151922] p-4">
            <div className="mb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
              Evaluation Runs
            </div>

            <div className="space-y-1">
              {runs.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() =>
                    selectRun(run)
                  }
                  className={`w-full border px-3 py-3 text-left transition ${
                    selected?.id === run.id
                      ? "border-[#41496A] bg-[#252B43]"
                      : "border-transparent hover:border-[#303746] hover:bg-[#181D27]"
                  }`}
                >
                  <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[#697183]">
                    {run.status ||
                      "UNKNOWN"}
                  </span>

                  <strong className="mt-1 block font-mono text-[10px] font-normal text-[#AEB5C5]">
                    {run.failed_tests ??
                      "—"}{" "}
                    failures
                  </strong>

                  <span className="mt-1 block font-mono text-[9px] text-[#596174]">
                    {run.score != null
                      ? `${run.score}%`
                      : "NO SCORE"}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            {selectedRun && (
              <>
                <div className="mb-7 border-b border-[#2C3240] pb-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
                        Selected evaluation run
                      </div>

                      <div className="mt-3 break-all font-mono text-xs text-[#596174]">
                        Run #{selectedRun.id}
                      </div>

                      <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
                        {selectedRun.suite_name ||
                          suite?.name ||
                          "Evaluation"}
                      </div>
                    </div>

                    <div className="font-mono text-[9px] text-[#596174]">
                      {formatDate(
                        selectedRun.created_at
                      )}
                    </div>
                  </div>
                </div>

                {loadingRun ? (
                  <ForgeLoading label="READING EVALUATION EVIDENCE..." />
                ) : (
                  <>
                    <div className="mb-7 grid gap-px border border-[#2C3240] bg-[#2C3240] sm:grid-cols-2 xl:grid-cols-4">
                      <div className="bg-[#151922] p-5">
                        <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-[#697183]">
                          <Gauge size={12} />
                          Score
                        </div>

                        <div className="mt-3 font-display text-2xl font-semibold text-[#E1E4EA]">
                          {selectedRun.score != null
                            ? `${selectedRun.score}%`
                            : "—"}
                        </div>
                      </div>

                      <div className="bg-[#151922] p-5">
                        <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-[#697183]">
                          <CheckCircle2 size={12} />
                          Passed
                        </div>

                        <div className="mt-3 font-display text-2xl font-semibold text-[#E1E4EA]">
                          {selectedRun.passed_tests ??
                            passedCount}
                        </div>
                      </div>

                      <div className="bg-[#151922] p-5">
                        <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-[#697183]">
                          <XCircle size={12} />
                          Failed
                        </div>

                        <div className="mt-3 font-display text-2xl font-semibold text-[#C06C76]">
                          {selectedRun.failed_tests ??
                            failures.length}
                        </div>
                      </div>

                      <div className="bg-[#151922] p-5">
                        <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-[#697183]">
                          <FlaskConical size={12} />
                          Cases
                        </div>

                        <div className="mt-3 font-display text-2xl font-semibold text-[#E1E4EA]">
                          {selectedRun.total_tests ??
                            results.length}
                        </div>
                      </div>
                    </div>

                    <div className="mb-7 grid gap-5 xl:grid-cols-3">
                      <div className="border border-[#2C3240] bg-[#151922] p-5">
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#697183]">
                          <FlaskConical size={13} />
                          Evaluation
                        </div>

                        <div className="mt-4 text-sm text-[#C2C6D0]">
                          {suite?.name ||
                            selectedRun.suite_name ||
                            "—"}
                        </div>

                        {suite?.category && (
                          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#596174]">
                            {suite.category}
                          </div>
                        )}
                      </div>

                      <div className="border border-[#2C3240] bg-[#151922] p-5">
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#697183]">
                          <Database size={13} />
                          Dataset
                        </div>

                        <div className="mt-4 text-sm text-[#C2C6D0]">
                          {dataset?.name ||
                            "No dataset attached"}
                        </div>

                        {selectedRun.dataset_version && (
                          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#596174]">
                            Version{" "}
                            {selectedRun.dataset_version}
                          </div>
                        )}
                      </div>

                      <div className="border border-[#2C3240] bg-[#151922] p-5">
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#697183]">
                          <Code2 size={13} />
                          Codebase
                        </div>

                        <div className="mt-4 text-sm text-[#C2C6D0]">
                          {targetFiles.length}{" "}
                          target{" "}
                          {targetFiles.length === 1
                            ? "file"
                            : "files"}
                        </div>

                        <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#596174]">
                          Snapshot captured at run time
                        </div>
                      </div>
                    </div>

                    {targetFiles.length > 0 && (
                      <div className="mb-8 border border-[#2C3240] bg-[#151922]">
                        <div className="border-b border-[#2C3240] px-5 py-4">
                          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
                            <FileCode2 size={13} />
                            Codebase Snapshot
                          </div>
                        </div>

                        <div className="divide-y divide-[#2C3240]">
                          {targetFiles.map(
                            (file) => (
                              <div
                                key={`${file.project_file_id}-${file.path}`}
                                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <FileCode2
                                      size={14}
                                      className="shrink-0 text-[#7181FF]"
                                    />

                                    <span className="truncate font-mono text-xs text-[#C2C6D0]">
                                      {file.path}
                                    </span>
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                                    <span>
                                      {file.language ||
                                        "UNKNOWN"}
                                    </span>

                                    <span>
                                      {file.size ??
                                        0}{" "}
                                      bytes
                                    </span>
                                  </div>
                                </div>

                                <div className="max-w-full truncate font-mono text-[8px] text-[#596174] sm:max-w-[280px]">
                                  {file.content_hash ||
                                    "NO HASH"}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {failures.length === 0 ? (
                      <div className="border border-[#2C3240] bg-[#151922] p-7">
                        <div className="flex items-center gap-3 text-sm text-[#AEB5C5]">
                          <CheckCircle2
                            size={18}
                            className="text-[#7181FF]"
                          />
                          No failed cases returned for this run.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
                          Failed Cases
                        </div>

                        {failures.map(
                          (failure, index) => {
                            const reasons =
                              normalizeReasons(
                                failure.failure_reasons
                              );

                            return (
                              <div
                                className="border border-[#2C3240] bg-[#151922] p-5"
                                key={
                                  failure.case_id ||
                                  index
                                }
                              >
                                <div className="flex flex-col justify-between gap-3 border-b border-[#2C3240] pb-4 sm:flex-row sm:items-center">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle
                                        size={14}
                                        className="text-[#C06C76]"
                                      />

                                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#C06C76]">
                                        Failure{" "}
                                        {String(
                                          index + 1
                                        ).padStart(
                                          2,
                                          "0"
                                        )}
                                      </span>
                                    </div>

                                    <div className="mt-2 font-display text-lg font-semibold text-[#E1E4EA]">
                                      {failure.case_name ||
                                        `Case ${
                                          failure.case_id ||
                                          index + 1
                                        }`}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-4 font-mono text-[9px] uppercase tracking-[0.1em] text-[#596174]">
                                    <span>
                                      Quality{" "}
                                      {formatScore(
                                        failure.quality_score
                                      )}
                                    </span>

                                    <span>
                                      Similarity{" "}
                                      {formatScore(
                                        failure.similarity_score
                                      )}
                                    </span>

                                    <span>
                                      Latency{" "}
                                      {formatLatency(
                                        failure.latency_ms
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <FailureField
                                  label="Input"
                                  value={
                                    failure.input
                                  }
                                />

                                <FailureField
                                  label="Expected"
                                  value={
                                    failure.expected
                                  }
                                />

                                <FailureField
                                  label="Actual Output"
                                  value={
                                    failure.actual ||
                                    "No output returned."
                                  }
                                />

                                {reasons.length > 0 && (
                                  <div className="mt-6 border-t border-[#2C3240] pt-5">
                                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#C06C76]">
                                      Failure Reason
                                    </div>

                                    <div className="mt-3 space-y-2">
                                      {reasons.map(
                                        (
                                          reason,
                                          reasonIndex
                                        ) => (
                                          <div
                                            key={
                                              reasonIndex
                                            }
                                            className="border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm leading-6 text-[#C88B91]"
                                          >
                                            {
                                              reason
                                            }
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}