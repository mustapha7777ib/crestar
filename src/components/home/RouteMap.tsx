// A quiet, stylised route from Kano to Doha. West stays on the left in both
// languages because this is a map, not reading order.

export function RouteMap({
  from,
  to,
  distance,
}: {
  from: { label: string; coords: string };
  to: { label: string; coords: string };
  distance: string;
}) {
  return (
    <svg viewBox="0 0 600 300" className="h-auto w-full" style={{ direction: "ltr" }} role="img" aria-label={`${from.label} → ${to.label}, ${distance}`}>
      {/* Parallels */}
      {[70, 130, 190, 250].map((y) => (
        <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.07" />
      ))}
      {[120, 240, 360, 480].map((x) => (
        <line key={x} x1={x} x2={x} y1="20" y2="290" stroke="currentColor" strokeOpacity="0.05" />
      ))}

      {/* The road */}
      <path
        d="M95 215 Q 300 -5 505 95"
        fill="none"
        stroke="var(--color-teal-deep)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 9"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-50" dur="3s" repeatCount="indefinite" />
      </path>

      {/* Distance tag at the curve's midpoint */}
      <g transform="translate(300 70)">
        <rect x="-62" y="-17" width="124" height="34" fill="var(--color-ivory)" stroke="var(--color-teal)" strokeWidth="1" />
        <text textAnchor="middle" y="6" className="font-sans" fontSize="14" fontWeight="600" letterSpacing="2" fill="var(--color-ink)">
          {distance}
        </text>
      </g>

      {/* Kano: an adire circle */}
      <g transform="translate(95 215)">
        <circle r="18" fill="none" stroke="var(--color-teal)" strokeOpacity="0.6" />
        <circle r="11" fill="none" stroke="var(--color-plum)" strokeOpacity="0.5" />
        <circle r="5" fill="var(--color-plum)" />
        <text y="52" textAnchor="middle" className="font-display" fontSize="30" fill="var(--color-ink)">
          {from.label}
        </text>
        <text y="74" textAnchor="middle" fontSize="11" letterSpacing="2" fill="var(--color-muted)">
          {from.coords}
        </text>
      </g>

      {/* Doha: an eight-point star */}
      <g transform="translate(505 95)">
        <rect x="-10" y="-10" width="20" height="20" fill="var(--color-teal-deep)" />
        <rect x="-10" y="-10" width="20" height="20" fill="var(--color-teal-deep)" transform="rotate(45)" />
        <circle r="22" fill="none" stroke="var(--color-teal)" strokeOpacity="0.6" />
        <text y="58" textAnchor="middle" className="font-display" fontSize="30" fill="var(--color-ink)">
          {to.label}
        </text>
        <text y="80" textAnchor="middle" fontSize="11" letterSpacing="2" fill="var(--color-muted)">
          {to.coords}
        </text>
      </g>
    </svg>
  );
}
