/**
 * Haken, der sich beim Erscheinen einmal zeichnet (@starting-style, kein Konfetti).
 * Bei reduzierter Bewegung steht er sofort da (globales CSS erlaubt dann nur Überblendungen).
 */
export function CheckMark() {
  return (
    <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-success-subtle text-success">
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M5 12.5 9.5 17 19 7.5"
          pathLength={1}
          strokeDasharray={1}
          className="transition-[stroke-dashoffset] delay-150 duration-500 ease-standard [stroke-dashoffset:0] starting:[stroke-dashoffset:1]"
        />
      </svg>
    </span>
  );
}
