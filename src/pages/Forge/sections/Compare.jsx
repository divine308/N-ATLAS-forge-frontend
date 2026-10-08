import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  GitCompareArrows,
  Info,
  Loader2,
  Minus,
  XCircle
} from "lucide-react";

import { api } from "../../../api/client";

import {
  ForgeButton,
  ForgeMetric,
  ForgeSelect,
  PageHeader
} from "../components/ForgeShared";

function percent(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function signedPercent(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }

  const number = Number(value) * 100;

  return `${number >= 0 ? "+" : ""}${number.toFixed(digits)}%`;
}

function formatLatency(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Math.round(Number(value))} ms`;
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function scoreClass(value) {
  if (value < 0) {
    return "text-[#C06C76]";
  }

  if (value > 0) {
    return "text-[#8C9AFF]";
  }

  return "text-[#697183]";
}

function StatusBadge({ type, children }) {
  const styles = {
    regression:
      "border-[#59343B] bg-[#2A1C21] text-[#C88B91]",
    improvement:
      "border-[#41496A] bg-[#1C2133] text-[#9AA5FF]",
    unchanged:
      "border-[#303746] bg-[#11151E] text-[#697183]"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${
        styles[type] || styles.unchanged
      }`}
    >
      {type === "regression" && (
        <XCircle size={11} />
      )}

      {type === "improvement" && (
        <CheckCircle2 size={11} />
      )}

      {type === "unchanged" && (
        <Minus size={11} />
      )}

      {children}
    </span>
  );
}

export default function Compare({ project }) {
  const [runs, setRuns] = useState([]);

  const [baseline, setBaseline] =
    useState("");

  const [candidate, setCandidate] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingRuns, setLoadingRuns] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!project?.id) {
        setLoadingRuns(false);
        return;
      }

      setLoadingRuns(true);
      setError("");

      try {
        const data =
          await api.evaluations.runs(
            project.id
          );

        if (cancelled) return;

        const list =
          Array.isArray(data)
            ? data
            : data?.runs || [];

        setRuns(list);

        if (list.length >= 2) {
          setBaseline(
            String(list[1].id)
          );

          setCandidate(
            String(list[0].id)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setRuns([]);
          setError(
            err?.message ||
              "Unable to load evaluation runs."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingRuns(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [project?.id]);

  const selectedBaseline = useMemo(
    () =>
      runs.find(
        (run) =>
          String(run.id) ===
          String(baseline)
      ),
    [runs, baseline]
  );

  const selectedCandidate = useMemo(
    () =>
      runs.find(
        (run) =>
          String(run.id) ===
          String(candidate)
      ),
    [runs, candidate]
  );

  async function compare() {
    if (
      !baseline ||
      !candidate ||
      !project?.id
    ) {
      return;
    }

    if (baseline === candidate) {
      setError(
        "Baseline and candidate runs must be different."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data =
        await api.evaluations.regression(
          project.id,
          {
            baseline_run_id:
              Number(baseline),
            candidate_run_id:
              Number(candidate)
          }
        );

      setResult(data);
    } catch (err) {
      setError(
        err?.message ||
          "Comparison failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="06 / Regression"
        title="Did it actually improve?"
        description="Compare two real evaluation runs and expose meaningful improvements, regressions and unchanged behavior."
      />

      <div className="grid gap-3 border border-[#2C3240] bg-[#151922] p-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
        <ForgeSelect
          label="Baseline"
          value={baseline}
          onChange={(e) => {
            setBaseline(e.target.value);
            setResult(null);
            setError("");
          }}
          placeholder={
            loadingRuns
              ? "Loading runs..."
              : "Select baseline"
          }
          runs={runs}
        />

        <GitCompareArrows
          className="hidden text-[#596174] lg:block"
          size={20}
        />

        <ForgeSelect
          label="Candidate"
          value={candidate}
          onChange={(e) => {
            setCandidate(e.target.value);
            setResult(null);
            setError("");
          }}
          placeholder={
            loadingRuns
              ? "Loading runs..."
              : "Select candidate"
          }
          runs={runs}
        />

        <ForgeButton
          onClick={compare}
          disabled={
            loading ||
            loadingRuns ||
            !baseline ||
            !candidate ||
            baseline === candidate
          }
        >
          {loading ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <GitCompareArrows size={15} />
          )}

          Compare
        </ForgeButton>
      </div>

      {selectedBaseline &&
        selectedCandidate && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
            <span>
              Baseline #{selectedBaseline.id}
            </span>

            <span>
              Candidate #{selectedCandidate.id}
            </span>

            <span>
              {formatDate(
                selectedCandidate.created_at
              )}
            </span>
          </div>
        )}

      {error && (
        <div className="mt-7 flex gap-3 border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-10">
          <RegressionResult
            result={result}
          />
        </div>
      )}
    </div>
  );
}

function RegressionResult({ result }) {
  const categoryComparison =
    result?.category_comparison || {};

  const caseComparison =
    result?.case_comparison || {};

  const categoryRegressions =
    categoryComparison.regressions || [];

  const categoryImprovements =
    categoryComparison.improvements || [];

  const categoryUnchanged =
    categoryComparison.unchanged || [];

  const regressions =
    caseComparison.regressions ||
    result?.regressions ||
    [];

  const improvements =
    caseComparison.improvements ||
    result?.improvements ||
    [];

  const unchanged =
    caseComparison.unchanged ||
    result?.unchanged ||
    [];

  const comparison =
    result?.comparison || {};

  const scoreChange =
    Number(result?.score_change || 0);

  return (
    <div>
      <div className="grid border-y border-[#2C3240] md:grid-cols-3">
        <ForgeMetric
          label="Baseline"
          value={percent(
            result?.baseline_score
          )}
        />

        <ForgeMetric
          label="Candidate"
          value={percent(
            result?.candidate_score
          )}
        />

        <ForgeMetric
          label="Change"
          value={signedPercent(
            result?.score_change
          )}
          danger={scoreChange < 0}
        />
      </div>

      <div className="mt-8 grid gap-px border border-[#2C3240] bg-[#2C3240] sm:grid-cols-3">
        <SummaryCell
          label="Regressions"
          value={regressions.length}
          danger
        />

        <SummaryCell
          label="Improvements"
          value={improvements.length}
        />

        <SummaryCell
          label="Unchanged"
          value={unchanged.length}
        />
      </div>

      <Compatibility
        result={result}
        comparison={comparison}
      />

      <CategoryMovement
        regressions={categoryRegressions}
        improvements={categoryImprovements}
        unchanged={categoryUnchanged}
      />

      <CaseMovement
        title="Regressions"
        eyebrow="CASE REGRESSIONS"
        items={regressions}
        type="regression"
        emptyMessage="No meaningful case regressions detected."
      />

      <CaseMovement
        title="Improvements"
        eyebrow="CASE IMPROVEMENTS"
        items={improvements}
        type="improvement"
        emptyMessage="No meaningful case improvements detected."
      />

      <CaseMovement
        title="Unchanged"
        eyebrow="UNCHANGED CASES"
        items={unchanged}
        type="unchanged"
        emptyMessage="No unchanged cases."
      />
    </div>
  );
}

function SummaryCell({
  label,
  value,
  danger = false
}) {
  return (
    <div className="bg-[#151922] px-5 py-5">
      <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
        {label}
      </div>

      <div
        className={`mt-3 font-display text-2xl font-semibold ${
          danger
            ? "text-[#C06C76]"
            : "text-[#E1E4EA]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Compatibility({
  result,
  comparison
}) {
  const checks = [
    {
      label: "Suite",
      value: comparison.same_suite
    },
    {
      label: "Dataset",
      value: comparison.same_dataset
    },
    {
      label: "Dataset version",
      value: comparison.same_dataset_version
    }
  ];

  return (
    <div className="mt-10 border border-[#2C3240] bg-[#151922] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
            Comparison integrity
          </div>

          <div className="mt-2 font-display text-lg font-semibold text-[#E1E4EA]">
            {result?.comparable
              ? "Directly comparable"
              : "Comparison requires context"}
          </div>
        </div>

        {result?.comparable ? (
          <CheckCircle2
            size={19}
            className="text-[#8C9AFF]"
          />
        ) : (
          <AlertTriangle
            size={19}
            className="text-[#C88B91]"
          />
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-2 border border-[#303746] bg-[#11151E] px-3 py-3"
          >
            {check.value ? (
              <CheckCircle2
                size={13}
                className="text-[#8C9AFF]"
              />
            ) : (
              <XCircle
                size={13}
                className="text-[#C06C76]"
              />
            )}

            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#697183]">
              {check.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#596174]">
        <span>
          {comparison.shared_case_count || 0} shared cases
        </span>

        <span>
          {comparison.baseline_case_count || 0} baseline cases
        </span>

        <span>
          {comparison.candidate_case_count || 0} candidate cases
        </span>
      </div>

      {!result?.comparable && (
        <div className="mt-5 flex gap-3 border border-[#49323A] bg-[#21191E] px-4 py-3 text-xs leading-6 text-[#C88B91]">
          <Info
            size={15}
            className="mt-0.5 shrink-0"
          />

          <span>
            These runs do not share the same
            suite, dataset, dataset version,
            or enough common cases for a clean
            regression comparison. The results
            are still shown, but interpret the
            overall change carefully.
          </span>
        </div>
      )}
    </div>
  );
}

function CategoryMovement({
  regressions,
  improvements,
  unchanged
}) {
  const categories = [
    ...regressions.map((item) => ({
      ...item,
      type: "regression"
    })),
    ...improvements.map((item) => ({
      ...item,
      type: "improvement"
    })),
    ...unchanged.map((item) => ({
      ...item,
      type: "unchanged"
    }))
  ].sort(
    (a, b) =>
      Math.abs(b.change || 0) -
      Math.abs(a.change || 0)
  );

  return (
    <div className="mt-10">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
        Category movement
      </div>

      {categories.length === 0 ? (
        <div className="mt-5 border border-[#2C3240] bg-[#151922] px-5 py-6 text-sm text-[#697183]">
          No category comparison data is available.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto border border-[#2C3240]">
          <div className="min-w-[650px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-[#2C3240] bg-[#11151E] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#697183]">
              <span>Category</span>
              <span>Baseline</span>
              <span>Candidate</span>
              <span>Change</span>
              <span>Status</span>
            </div>

            {categories.map(
              (category, index) => (
                <div
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center border-b border-[#2C3240] px-5 py-4 text-xs last:border-b-0"
                  key={
                    category.category ||
                    index
                  }
                >
                  <span className="text-[#C2C6D0]">
                    {category.category ||
                      "Unknown"}
                  </span>

                  <span className="text-[#697183]">
                    {percent(
                      category.baseline_score
                    )}
                  </span>

                  <span className="text-[#697183]">
                    {percent(
                      category.candidate_score
                    )}
                  </span>

                  <strong
                    className={`font-normal ${scoreClass(
                      category.change
                    )}`}
                  >
                    {signedPercent(
                      category.change / 100
                    )}
                  </strong>

                  <StatusBadge
                    type={
                      category.type
                    }
                  >
                    {category.type}
                  </StatusBadge>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CaseMovement({
  title,
  eyebrow,
  items,
  type,
  emptyMessage
}) {
  return (
    <div className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
            {eyebrow}
          </div>

          <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
            {title}
          </h2>
        </div>

        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#596174]">
          {items.length} cases
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 border border-[#2C3240] bg-[#151922] px-5 py-6 text-sm text-[#697183]">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <CaseCard
              key={`${type}-${item.case_id}`}
              item={item}
              type={type}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CaseCard({
  item,
  type
}) {
  const scoreChange =
    Number(item.score_change || 0);

  return (
    <details className="group border border-[#2C3240] bg-[#151922]">
      <summary className="cursor-pointer list-none px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#596174]">
                CASE #{item.case_id}
              </span>

              <StatusBadge type={type}>
                {type}
              </StatusBadge>

              {item.category && (
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#596174]">
                  {item.category}
                </span>
              )}
            </div>

            <div className="mt-3 font-display text-lg font-semibold text-[#E1E4EA]">
              {item.case_name}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-6">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                Baseline
              </div>

              <div className="mt-1 text-sm text-[#858D9D]">
                {percent(
                  item.baseline_score
                )}
              </div>
            </div>

            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                Candidate
              </div>

              <div className="mt-1 text-sm text-[#858D9D]">
                {percent(
                  item.candidate_score
                )}
              </div>
            </div>

            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                Change
              </div>

              <div
                className={`mt-1 text-sm ${scoreClass(
                  scoreChange
                )}`}
              >
                {signedPercent(
                  scoreChange
                )}
              </div>
            </div>
          </div>
        </div>
      </summary>

      <div className="border-t border-[#2C3240] px-5 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <OutputPanel
            label="Baseline output"
            value={item.baseline_actual}
          />

          <OutputPanel
            label="Candidate output"
            value={item.candidate_actual}
          />
        </div>

        <OutputPanel
          label="Expected"
          value={item.expected}
          className="mt-6"
        />

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <ReasonPanel
            label="Baseline failure reasons"
            reasons={
              item.baseline_failure_reasons
            }
          />

          <ReasonPanel
            label="Candidate failure reasons"
            reasons={
              item.candidate_failure_reasons
            }
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#2C3240] pt-5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
          <span>
            Baseline:{" "}
            {item.baseline_passed
              ? "PASS"
              : "FAIL"}
          </span>

          <span>
            Candidate:{" "}
            {item.candidate_passed
              ? "PASS"
              : "FAIL"}
          </span>

          <span>
            Baseline latency:{" "}
            {formatLatency(
              item.baseline_latency_ms
            )}
          </span>

          <span>
            Candidate latency:{" "}
            {formatLatency(
              item.candidate_latency_ms
            )}
          </span>
        </div>
      </div>
    </details>
  );
}

function OutputPanel({
  label,
  value,
  className = ""
}) {
  return (
    <div className={className}>
      <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#596174]">
        {label}
      </div>

      <pre className="mt-2 max-h-[280px] overflow-auto whitespace-pre-wrap border border-[#303746] bg-[#11151E] p-4 font-mono text-[11px] leading-6 text-[#C2C6D0]">
        {value || "—"}
      </pre>
    </div>
  );
}

function ReasonPanel({
  label,
  reasons
}) {
  const list = Array.isArray(reasons)
    ? reasons
    : reasons
      ? [reasons]
      : [];

  return (
    <div>
      <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#596174]">
        {label}
      </div>

      {list.length === 0 ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-[#596174]">
          <CheckCircle2 size={13} />
          No recorded failure.
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {list.map(
            (reason, index) => (
              <div
                key={index}
                className="border border-[#49323A] bg-[#21191E] px-3 py-2 text-xs leading-6 text-[#C88B91]"
              >
                {reason}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}