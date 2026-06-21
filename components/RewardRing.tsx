// Reward progress ring + dots. Pure presentational.

export function RewardRing({
  visits,
  threshold,
  rewardStatus,
}: {
  visits: number;
  threshold: number;
  rewardStatus: string;
}) {
  const ready = rewardStatus === "ready" || visits >= threshold;
  const shown = Math.min(visits, threshold);
  const C = 2 * Math.PI * 72;
  const frac = Math.min(shown / threshold, 1);
  const offset = C * (1 - frac);
  const remaining = Math.max(threshold - shown, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[168px] w-[168px]">
        <svg width="168" height="168" className="-rotate-90">
          <circle cx="84" cy="84" r="72" stroke="#F0E2E4" strokeWidth="13" fill="none" />
          <circle
            cx="84" cy="84" r="72" fill="none" strokeWidth="13" strokeLinecap="round"
            stroke="url(#ringGrad)" strokeDasharray={C} strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E8A0A8" />
              <stop offset="1" stopColor="#C9A24B" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {ready ? (
            <b className="text-2xl text-rose-deep">Reward</b>
          ) : (
            <b className="text-[38px] leading-none text-rose-deep">
              {shown}
              <span className="text-[18px] text-[#cdbcbf]">/{threshold}</span>
            </b>
          )}
          <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            {ready ? "ready 🎁" : "visits"}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2">
        {Array.from({ length: threshold }).map((_, i) => (
          <div
            key={i}
            className={
              "flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-bold " +
              (i < shown
                ? "text-white"
                : "bg-[#F2E8E9] text-[#cdbcbf]")
            }
            style={i < shown ? { background: "linear-gradient(135deg,#E8D29A,#C9A24B)" } : undefined}
          >
            {i < shown ? "✓" : i + 1}
          </div>
        ))}
      </div>

      <p className="mt-3.5 text-center text-sm font-bold text-rose-deep">
        {ready
          ? "🎁 Reward ready — enjoy a free service!"
          : `${remaining} more visit${remaining > 1 ? "s" : ""} until your reward 💈`}
      </p>
    </div>
  );
}
