import { useEffect, useState } from 'react'

export default function VoiceButton({ onTranscript }) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const instance = new SpeechRecognition()
    instance.lang = 'en-IN'
    instance.interimResults = false
    instance.maxAlternatives = 1

    instance.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) onTranscript(transcript)
    }

    instance.onend = () => {
      setListening(false)
    }

    setRecognition(instance)
    setSupported(true)
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognition) {
      window.alert(
        'Voice recognition is not supported in this browser. Please use Chrome or Edge on desktop/mobile, or try again in a supported browser.'
      )
      return
    }

    if (listening) {
      recognition.stop()
      setListening(false)
    } else {
      recognition.start()
      setListening(true)
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
