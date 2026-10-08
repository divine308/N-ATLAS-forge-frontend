import { ArrowUpRight } from "lucide-react";

export default function EmptyState({
  eyebrow = "NOTHING HERE",
  title,
  description,
  action,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-index">00</div>

      <div>
        <div className="section-kicker mb-3">
          {eyebrow}
        </div>

        <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-stone-100">
          {title}
        </h3>

        <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
          {description}
        </p>

        {action && (
          <button
            onClick={onAction}
            className="mt-6 inline-flex items-center gap-2 border border-stone-700 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-300 transition hover:border-stone-400 hover:text-white"
          >
            {action}

            <ArrowUpRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}