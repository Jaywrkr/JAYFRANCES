import { isSpeechSupported, speakFrench } from '../lib/speech'

export default function SpeakButton({ text, className = '' }: { text: string; className?: string }) {
  if (!isSpeechSupported()) return null
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        speakFrench(text)
      }}
      aria-label={`Escuchar "${text}" en francés`}
      className={`tap-scale inline-flex items-center justify-center rounded-full w-8 h-8 text-lg hover:bg-slate-800/60 ${className}`}
    >
      🔊
    </button>
  )
}
