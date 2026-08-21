export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

export function speakFrench(text: string) {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}
