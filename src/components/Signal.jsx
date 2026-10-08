export default function Signal({
  active = true,
  label = "LIVE"
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.18em] text-stone-400">
      <span
        className={`signal-dot ${
          active ? "signal-active" : "signal-idle"
        }`}
      />

      {label}
    </span>
  );
}