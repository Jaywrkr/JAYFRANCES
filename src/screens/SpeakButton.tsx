import { isSpeechSupported, speakFrench } from '../lib/speech'

interface Props {
  text: string
  className?: string
}

export default function SpeakButton({ text, className }: Props) {
  if (!isSpeechSupported()) return null
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        speakFrench(text)
      }}
      aria-label={`Escuchar "${text}" en francés`}
      className={`tap-scale inline-flex items-center justify-center rounded-full hover:bg-slate-800/60 ${className ?? 'w-8 h-8 text-lg'}`}
    >
      🔊
    </button>
  )
}
