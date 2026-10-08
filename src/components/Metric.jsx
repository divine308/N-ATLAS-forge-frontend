export default function Metric({
  label,
  value,
  detail,
  danger = false
}) {
  return (
    <div className="metric-block">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-stone-500">
          {label}
        </span>

        {detail && (
          <span className="font-mono text-[9px] text-stone-600">
            {detail}
          </span>
        )}
      </div>

      <div
        className={`font-display text-3xl font-semibold tracking-[-0.06em] ${
          danger ? "text-red-400" : "text-stone-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}