// Minimal line icons (Instagram-style). `filled` swaps to a solid weight for
// the active tab. Stroke uses currentColor so parents control the color.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean };

function base(filled?: boolean) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: filled ? 2.4 : 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function HomeIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function CalendarIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function ScanIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M4 12h16" />
    </svg>
  );
}

export function MembersIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M16 4.5a3.2 3.2 0 0 1 0 6.4M17.5 14.7c2.2.5 3.9 2.4 3.9 5.3" />
    </svg>
  );
}

export function MessageIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <path d="M21 4 3 11l6.5 2.2L12 20l3.2-6L21 4Z" />
      <path d="M9.5 13.2 21 4" />
    </svg>
  );
}

export function ListIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function GiftIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
      <path d="M3 8h18v4H3zM12 21V8" />
      <path d="M12 8S10.5 4 8 4 6 8 12 8ZM12 8s1.5-4 4-4 2 4-4 4Z" />
    </svg>
  );
}

export function ShareIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6" />
    </svg>
  );
}

export function ChartIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <path d="M4 4v16h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </svg>
  );
}

export function CogIcon({ filled, ...p }: IconProps) {
  return (
    <svg {...base(filled)} {...p}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3" />
    </svg>
  );
}

export function PlusIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}
