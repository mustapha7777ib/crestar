// Crestar mark: a gold disc with a five-point star cut into it, from crestartrading.com.
const MARK =
  "M228.63 0C328.158 7.15028e-05 412.83 63.5967 444.23 152.369L267.731 190.377L265.839 190.116L245.929 78.9307L196.684 180.585L84.7871 165.163L166.248 243.41L117.003 345.064L216.594 291.771L298.056 370.019L278.617 261.477L457.19 223.022C457.235 224.886 457.26 226.755 457.26 228.63C457.26 354.898 354.898 457.26 228.63 457.26C102.361 457.26 9.07362e-05 354.898 0 228.63C0 102.361 102.361 0 228.63 0Z";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 458 458" className={className} aria-hidden="true" fill="currentColor">
      <path d={MARK} />
    </svg>
  );
}

export function Wordmark({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-7 w-7 shrink-0 text-gold sm:h-8 sm:w-8" />
      <span className="whitespace-nowrap font-display text-[1.1rem] leading-none tracking-[-0.01em] sm:text-[1.35rem]">{name}</span>
    </span>
  );
}
