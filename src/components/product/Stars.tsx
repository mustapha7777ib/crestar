import { StarIcon } from "../ui/icons";

/** Five stars, filled to the nearest whole for `value` (1–5). */
export function Stars({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex text-gold-deep ${className}`} role="img" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} size={size} filled={n <= rounded} className={n <= rounded ? "" : "text-stone"} />
      ))}
    </span>
  );
}
