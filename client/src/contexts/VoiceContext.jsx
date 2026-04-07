import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from './LanguageContext.jsx'
import { buildVoiceResponse, parseVoiceCommand, speechTagByLanguage } from '../voice/commandParser.js'

const VoiceContext = createContext(null)
const storageEnabledKey = 'sakhi-voice-enabled'
const storageModeKey = 'sakhi-voice-mode'

const recognitionLangFromApp = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  ur: 'ur-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  od: 'or-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  as: 'as-IN',
  mai: 'hi-IN',
  sat: 'hi-IN',
  ks: 'ur-IN',
  ne: 'ne-NP',
  kok: 'hi-IN',
  sd: 'sd-IN',
  doi: 'hi-IN',
  mni: 'bn-IN',
  brx: 'hi-IN',
}

const baseLangFromTag = (tag) => (tag || 'en-IN').split('-')[0].toLowerCase()

const chooseBestVoice = (voices, langTag) => {
  if (!voices?.length) return null

  const normalizedTag = (langTag || 'en-IN').toLowerCase()
  const targetBase = baseLangFromTag(normalizedTag)

  const exact = voices.find((voice) => voice.lang?.toLowerCase() === normalizedTag)
  if (exact) return exact

  const sameBase = voices.find((voice) => voice.lang?.toLowerCase().startsWith(`${targetBase}-`))
  if (sameBase) return sameBase

  return voices.find((voice) => voice.default) || voices[0]
}

const dispatchVoiceAction = (action) => {
  window.dispatchEvent(new CustomEvent('sakhi-voice-action', { detail: { action } }))
}

export function VoiceProvider({ children }) {
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()

  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState('continuous')
  const [listening, setListening] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const [lastIntent, setLastIntent] = useState('')
  const [voices, setVoices] = useState([])

  const recognitionRef = useRef(null)
  const keepListeningRef = useRef(false)
  const pushSessionRef = useRef(false)

  const recognitionLang = useMemo(() => recognitionLangFromApp[language] || 'hi-IN', [language])

  const speakFeedback = useCallback(
    (message, spokenLanguage) => {
      if (!window.speechSynthesis || !message) return

      const langTag = speechTagByLanguage[spokenLanguage] || speechTagByLanguage.en
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = langTag
      const voice = chooseBestVoice(voices, langTag)
      if (voice) utterance.voice = voice
      utterance.rate = baseLangFromTag(langTag) === 'en' ? 0.98 : 0.92
      utterance.pitch = 1

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    },
    [voices]
  )

  const stopListening = useCallback(() => {
    keepListeningRef.current = false
    pushSessionRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore stop errors.
      }
    }
    setListening(false)
  }, [])

  const executeParsedCommand = useCallback(
    (parsed) => {
      const { intent, key, route, action, language: nextLanguage, spokenLanguage } = parsed

      setLastIntent(intent)

      if (intent === 'navigate' && route) {
        navigate(route)
        return buildVoiceResponse(key, spokenLanguage)
      }

      if (intent === 'language' && nextLanguage) {
        setLanguage(nextLanguage)
        return buildVoiceResponse('languageChanged', spokenLanguage)
      }

      if (intent === 'action') {
        if (action === 'stop_listening') {
          setEnabled(false)
          stopListening()
          return buildVoiceResponse('stopListening', spokenLanguage)
        }

        if (action === 'logout') {
          localStorage.removeItem('sakhi-token')
          localStorage.removeItem('sakhi-user')
          navigate('/login')
          return buildVoiceResponse('logout', spokenLanguage)
        }

        if (action === 'scroll_down') {
          window.scrollBy({ top: 520, behavior: 'smooth' })
          return buildVoiceResponse('scrollDown', spokenLanguage)
        }

        if (action === 'scroll_up') {
          window.scrollBy({ top: -520, behavior: 'smooth' })
          return buildVoiceResponse('scrollUp', spokenLanguage)
        }

        if (action === 'send_message') {
          dispatchVoiceAction('send_message')
          return buildVoiceResponse('sendMessage', spokenLanguage)
        }

        if (action === 'start_voice_chat') {
          dispatchVoiceAction('start_voice_chat')
          return buildVoiceResponse('startVoice', spokenLanguage)
        }
      }

      if (intent === 'help') {
        return buildVoiceResponse('help', spokenLanguage)
      }

      return buildVoiceResponse('unknown', spokenLanguage)
    },
    [navigate, setLanguage, stopListening]
  )

  const processTranscript = useCallback(
    (transcript) => {
      const parsed = parseVoiceCommand(transcript, { appLanguage: language })
      const commandText = transcript.trim()
      if (commandText) setLastCommand(commandText)

      const feedback = executeParsedCommand(parsed)
      speakFeedback(feedback, parsed.spokenLanguage)
    },
    [executeParsedCommand, language, speakFeedback]
  )

  const startRecognition = useCallback(
    (pushToTalk = false) => {
      if (!supported || !recognitionRef.current) return

      pushSessionRef.current = pushToTalk
      keepListeningRef.current = !pushToTalk && enabled && mode === 'continuous'

      try {
        recognitionRef.current.lang = recognitionLang
        recognitionRef.current.start()
        setListening(true)
      } catch {
        // Ignore start race conditions.
      }
    },
    [enabled, mode, recognitionLang, supported]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedMode = localStorage.getItem(storageModeKey)
    if (storedMode === 'continuous' || storedMode === 'push') {
      setMode(storedMode)
    }

    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || [])
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(storageEnabledKey, String(enabled))
  }, [enabled])

  useEffect(() => {
    localStorage.setItem(storageModeKey, mode)
  }, [mode])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return undefined
    }

    const recognition = new SpeechRecognition()
    recognition.lang = recognitionLang
    recognition.interimResults = false
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result?.isFinal && result[0]?.transcript) {
          finalTranscript += `${result[0].transcript} `
        }
      }

      const cleanedTranscript = finalTranscript.trim()
      if (cleanedTranscript) {
        processTranscript(cleanedTranscript)
      }
    }

    recognition.onerror = () => {
      // Ignore recoverable browser recognition errors.
    }

    recognition.onend = () => {
      if (pushSessionRef.current) {
        pushSessionRef.current = false
        setListening(false)
        return
      }

      if (keepListeningRef.current) {
        try {
          setTimeout(() => recognition.start(), 140)
          return
        } catch {
          // Retry on next cycle.
        }
      }

      setListening(false)
    }

    recognitionRef.current = recognition
    setSupported(true)

    return () => {
      keepListeningRef.current = false
      pushSessionRef.current = false
      try {
        recognition.stop()
      } catch {
        // Ignore stop errors during teardown.
      }
    }
  }, [processTranscript, recognitionLang])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = recognitionLang
    }
  }, [recognitionLang])

  useEffect(() => {
    if (!enabled || mode !== 'continuous' || listening || !supported) return
    startRecognition(false)
  }, [enabled, listening, mode, startRecognition, supported])

  const toggleEnabled = useCallback(() => {
    setEnabled((current) => {
      const next = !current
      if (!next) stopListening()
      return next
    })
  }, [stopListening])

  const startPushToTalk = useCallback(() => {
    if (!supported) {
      window.alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    setEnabled(true)
    setMode('push')
    startRecognition(true)
  }, [startRecognition, supported])

  const stopPushToTalk = useCallback(() => {
    stopListening()
  }, [stopListening])

  const value = useMemo(
    () => ({
      supported,
      enabled,
      mode,
      listening,
      lastCommand,
      lastIntent,
      toggleEnabled,
      setMode,
      startPushToTalk,
      stopPushToTalk,
      processTranscript,
    }),
    [enabled, lastCommand, lastIntent, listening, mode, processTranscript, startPushToTalk, stopPushToTalk, supported, toggleEnabled]
  )

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}

export function useVoice() {
  const context = useContext(VoiceContext)
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider')
  }
  return context
}
