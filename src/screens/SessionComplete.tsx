interface Props {
  correct: number
  total: number
  onContinue: () => void
}

const CONFETTI = ['🎉', '✨', '🎊', '⭐️', '💫']

export default function SessionComplete({ correct, total, onContinue }: Props) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
  const celebrate = pct >= 80

  const message =
    pct >= 90
      ? '¡Excelente! Dominaste esta sesión.'
      : pct >= 70
        ? '¡Muy bien! Vas por buen camino.'
        : pct >= 40
          ? 'Buen intento, sigue practicando.'
          : 'No te desanimes, la repetición es la clave.'

  return (
    <div className="max-w-xl mx-auto px-4 pt-16 text-center relative overflow-hidden">
      {celebrate && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${(i * 53) % 100}%`,
                animationDelay: `${(i % 6) * 0.15}s`,
              }}
            >
              {CONFETTI[i % CONFETTI.length]}
            </span>
          ))}
        </div>
      )}
      <div className="text-5xl mb-4">{celebrate ? '🎉' : '💪'}</div>
      <h1 className="text-2xl font-bold mb-2">¡Sesión completa!</h1>
      <p className="text-slate-300 mb-1">{message}</p>
      <p className="text-slate-400 text-sm mb-8">
        {correct} / {total} correctas ({pct}%)
      </p>
      <button
        onClick={onContinue}
        className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-6 py-2.5 font-medium"
      >
        Continuar
      </button>
    </div>
  )
}
