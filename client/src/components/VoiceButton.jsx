import { useEffect, useRef, useState } from 'react'

export default function VoiceButton({ onTranscript, recognitionLang = 'en-US', onListeningChange }) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const keepListeningRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)
  const onListeningChangeRef = useRef(onListeningChange)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    onListeningChangeRef.current = onListeningChange
  }, [onListeningChange])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const instance = new SpeechRecognition()
    instance.lang = recognitionLang
    instance.interimResults = true
    instance.continuous = true
    instance.maxAlternatives = 1

    instance.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      const transcript = result?.[0]?.transcript
      if (transcript && onTranscriptRef.current) onTranscriptRef.current(transcript)
    }

    instance.onend = () => {
      if (keepListeningRef.current) {
        try {
          instance.start()
          return
        } catch {
          // start can throw during rapid restarts; allow next end cycle to retry
        }
      }

      setListening(false)
      if (onListeningChangeRef.current) onListeningChangeRef.current(false)
    }

    recognitionRef.current = instance
    setSupported(true)

    return () => {
      keepListeningRef.current = false
      try {
        instance.stop()
      } catch {
        // Ignore stop errors during teardown
      }
    }
  }, [])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = recognitionLang
    }
  }, [recognitionLang])

  const toggleListening = () => {
    const recognition = recognitionRef.current
    if (!recognition) {
      window.alert(
        'Voice recognition is not supported in this browser. Please use Chrome or Edge on desktop/mobile, or try again in a supported browser.'
      )
      return
    }

    if (listening) {
      keepListeningRef.current = false
      recognition.stop()
      setListening(false)
      if (onListeningChangeRef.current) onListeningChangeRef.current(false)
    } else {
      keepListeningRef.current = true
      recognition.lang = recognitionLang
      recognition.start()
      setListening(true)
      if (onListeningChangeRef.current) onListeningChangeRef.current(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
        supported ? 'bg-fuchsia-600 hover:bg-fuchsia-500' : 'bg-slate-400 hover:bg-slate-400'
      }`}
      title={supported ? 'Use voice input' : 'Voice recognition not supported'}
    >
      {listening ? 'Listening...' : supported ? 'Use voice' : 'Voice unavailable'}
    </button>
  )
}
