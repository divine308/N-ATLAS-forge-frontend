import {
  Check,
  Loader2,
  Play
} from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-7 border-b border-[#2C3240] pb-8 lg:flex-row lg:items-end">
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
          {eyebrow}
        </div>

        <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.065em] text-[#E6E8EF] sm:text-6xl">
          {title}
        </h1>

        {description && (
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#697183]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

export function ForgeMetric({
  label,
  value,
  detail,
  danger = false
}) {
  return (
    <div className="min-h-[112px] border-r border-[#2C3240] px-5 py-6 last:border-r-0">
      <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#697183]">
        {label}
      </div>

      <div
        className={`mt-4 font-display text-2xl font-semibold tracking-[-0.04em] ${
          danger
            ? "text-[#C06C76]"
            : "text-[#E1E4EA]"
        }`}
      >
        {value}
      </div>

      {detail && (
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#596174]">
          {detail}
        </div>
      )}
    </div>
  );
}

export function ForgeButton({
  children,
  onClick,
  disabled = false,
  danger = false,
  type = "button"
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? "border-[#59343B] bg-[#2A1C21] text-[#C88B91] hover:border-[#6A3C45] hover:bg-[#312026]"
          : "border-[#41496A] bg-[#7181FF] text-white hover:bg-[#8492FF]"
      }`}
    >
      {children}
    </button>
  );
}

export function ForgeEmptyState({
  eyebrow,
  title,
  description,
  action,
  onAction
}) {
  return (
    <div className="border border-[#2C3240] bg-[#151922] p-8 sm:p-10">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#596174]">
        {eyebrow}
      </div>

      <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
        {title}
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-7 text-[#697183]">
        {description}
      </p>

      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-7 inline-flex items-center gap-2 border border-[#303746] bg-[#11151E] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#AEB5C5] transition hover:border-[#41496A] hover:text-[#8C9AFF]"
        >
          <Play size={13} />
          {action}
        </button>
      )}
    </div>
  );
}

export function ForgeLoading({ label }) {
  return (
    <div className="mt-10 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
      <Loader2
        size={13}
        className="animate-spin text-[#7181FF]"
      />
      {label}
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#2C3240] pb-3">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
        {label}
      </span>

      <span className="text-right font-mono text-[9px] text-[#858D9D]">
        {value}
      </span>
    </div>
  );
}

export function FailureField({
  label,
  value
}) {
  return (
    <div className="mt-5">
      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#596174]">
        {label}
      </div>

      <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#C2C6D0]">
        {value || "—"}
      </div>
    </div>
  );
}

export function ForgeSelect({
  label,
  value,
  onChange,
  placeholder,
  runs
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
        {label}
      </span>

      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-xs text-[#C2C6D0] outline-none focus:border-[#41496A]"
      >
        <option value="">
          {placeholder}
        </option>

        {runs.map((run) => (
          <option
            key={run.id}
            value={run.id}
          >
            {String(run.id).slice(0, 12)}
          </option>
        ))}
      </select>
    </label>
  );
}