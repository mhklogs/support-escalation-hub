/**
 * SupportOps — bespoke vector brand mark.
 * A support headset with a status node broadcasting concentric triage
 * signals. Stroke-based, rounded caps, single accent colour. No icons, no emoji.
 */

const S = {
  strokeWidth: 2.3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
} as const;

export default function SupportOpsLogo({
  size = 40,
  color = "#FF8A3D",
  ring = true,
  className,
}: {
  size?: number;
  color?: string;
  ring?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {ring && (
        <circle
          cx="24"
          cy="24"
          r="21.5"
          stroke={color}
          strokeOpacity="0.28"
          strokeWidth="1.4"
          strokeDasharray="2 5"
        />
      )}
      {/* broadcast ripples above the headband */}
      <path d="M19 9.7A6 6 0 0 1 29 9.7" {...S} stroke={color} strokeWidth="2" opacity="0.55" />
      <path d="M16 7A10 10 0 0 1 32 7" {...S} stroke={color} strokeWidth="2" opacity="0.3" />
      {/* headband */}
      <path d="M14 25v-9a10 10 0 0 1 20 0v9" {...S} stroke={color} />
      {/* status node */}
      <circle cx="24" cy="13" r="1.7" fill={color} />
      {/* ear cups */}
      <rect x="8" y="23" width="6.6" height="13" rx="3.2" {...S} stroke={color} />
      <rect x="33.4" y="23" width="6.6" height="13" rx="3.2" {...S} stroke={color} />
      {/* mic boom + tip */}
      <path d="M24 36v3" {...S} stroke={color} strokeWidth="2.2" />
      <circle cx="24" cy="41" r="1.8" fill={color} />
    </svg>
  );
}

export function SupportOpsBrand({
  size = 34,
  subtitle = "ESCALATION HUB",
  className,
}: {
  size?: number;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <span className="logo-tile flex h-10 w-10 shrink-0 items-center justify-center">
        <SupportOpsLogo size={size} />
      </span>
      <div className="min-w-0 leading-none">
        <p className="font-display text-sm font-bold tracking-[0.08em] text-ink">
          SUPPORTOPS
        </p>
        <p className="mt-1 font-mono text-[10px]  tracking-[0.26em] text-muted">
          {subtitle}
        </p>
      </div>
    </div>
  );
}