import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isSpeechSupported, speakFrench } from './speech'

describe('speech', () => {
  const originalSpeechSynthesis = (window as unknown as { speechSynthesis?: unknown }).speechSynthesis
  const originalUtterance = (window as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance

  afterEach(() => {
    ;(window as unknown as { speechSynthesis?: unknown }).speechSynthesis = originalSpeechSynthesis
    ;(window as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance = originalUtterance
  })

  it('reports unsupported when speechSynthesis is missing', () => {
    ;(window as unknown as { speechSynthesis?: unknown }).speechSynthesis = undefined
    expect(isSpeechSupported()).toBe(false)
  })

  describe('with speechSynthesis available', () => {
    let cancel: ReturnType<typeof vi.fn>
    let speak: ReturnType<typeof vi.fn>

    beforeEach(() => {
      cancel = vi.fn()
      speak = vi.fn()
      ;(window as unknown as { speechSynthesis: unknown }).speechSynthesis = { cancel, speak }
      ;(window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = vi.fn(
        function (this: { text: string; lang: string; rate: number }, text: string) {
          this.text = text
        }
      )
    })

    it('reports supported', () => {
      expect(isSpeechSupported()).toBe(true)
    })

    it('cancels any pending speech and speaks the text in French', () => {
      speakFrench('bonjour')
      expect(cancel).toHaveBeenCalledOnce()
      expect(speak).toHaveBeenCalledOnce()
      const utterance = speak.mock.calls[0][0] as { text: string; lang: string }
      expect(utterance.text).toBe('bonjour')
      expect(utterance.lang).toBe('fr-FR')
    })
  })
})
