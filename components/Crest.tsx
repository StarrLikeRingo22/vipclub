// VIP Club crest — jeweled gold crown on ink. Unisex, premium.

export function Crest({ size = 48 }: { size?: number }) {
  const id = "g" + size;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label="VIP Club">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4E2B0" />
          <stop offset=".5" stopColor="#C9A24B" />
          <stop offset="1" stopColor="#9C7A2C" />
        </linearGradient>
        <linearGradient id={id + "i"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A2C30" />
          <stop offset="1" stopColor="#221A1E" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="30" fill={`url(#${id}i)`} />
      <rect x="7.5" y="7.5" width="105" height="105" rx="24" fill="none" stroke={`url(#${id})`} strokeWidth="1.4" opacity=".85" />
      <path d="M34 64 L38.5 41 L49.5 53.5 L60 31 L70.5 53.5 L81.5 41 L86 64 Z" fill={`url(#${id})`} />
      <rect x="33" y="63" width="54" height="10.5" rx="3" fill={`url(#${id})`} />
      <circle cx="38.5" cy="41" r="3.6" fill={`url(#${id})`} />
      <circle cx="81.5" cy="41" r="3.6" fill={`url(#${id})`} />
      <circle cx="60" cy="30.5" r="4.4" fill="#E8A0A8" />
      <circle cx="46" cy="68.3" r="2.3" fill="#221A1E" />
      <circle cx="60" cy="68.3" r="2.3" fill="#221A1E" />
      <circle cx="74" cy="68.3" r="2.3" fill="#221A1E" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <div className="leading-none">
      <div
        className="font-serif font-bold tracking-[3px] text-[22px]"
        style={{ color: light ? "#FBEEF0" : "#3A2C30" }}
      >
        VIP
      </div>
      <div className="text-[9px] font-semibold tracking-[5px] text-gold">CLUB</div>
    </div>
  );
}
