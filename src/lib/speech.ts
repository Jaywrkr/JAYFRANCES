export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Pronuncia una palabra o frase en francés usando la síntesis de voz del
// navegador (gratis, sin backend). En iOS/Safari requiere que se llame desde
// un gesto directo del usuario (click/tap), por eso siempre se dispara desde
// el propio onClick de un botón.
export function speakFrench(text: string) {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}
