import { useEffect, useMemo, useRef, useState } from 'react'
import ChatBubble from '../components/ChatBubble.jsx'
import VoiceButton from '../components/VoiceButton.jsx'
import { sendAiChat } from '../api/ap.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'

const voiceLanguageOptions = [
  { value: 'auto', label: 'Auto detect' },
  { value: 'en-US', label: 'English' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'or-IN', label: 'Odia' },
  { value: 'bn-IN', label: 'Bengali' },
  { value: 'ta-IN', label: 'Tamil' },
  { value: 'te-IN', label: 'Telugu' },
  { value: 'mr-IN', label: 'Marathi' },
  { value: 'gu-IN', label: 'Gujarati' },
  { value: 'pa-IN', label: 'Punjabi' },
  { value: 'ur-IN', label: 'Urdu' },
]

const topicQuickPrompts = [
  'How can I save more from my business income?',
  'Help me make a budget for dairy income and expenses.',
  'What small business can I start with low money?',
  'Give me safe micro-investment ideas.',
  'How do I reduce daily expenses and save for emergencies?',
]

const recognitionLangFromApp = {
  en: 'en-US',
  hi: 'hi-IN',
  od: 'or-IN',
}

const aiLanguageFromVoice = {
  'en-US': 'en',
  'hi-IN': 'hi',
  'or-IN': 'od',
  'bn-IN': 'bn',
  'ta-IN': 'ta',
  'te-IN': 'te',
  'mr-IN': 'mr',
  'gu-IN': 'gu',
  'pa-IN': 'pa',
  'ur-IN': 'ur',
}

const speechLangFromVoice = {
  auto: 'en-US',
  'en-US': 'en-US',
  'hi-IN': 'hi-IN',
  'or-IN': 'or-IN',
  'bn-IN': 'bn-IN',
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'mr-IN': 'mr-IN',
  'gu-IN': 'gu-IN',
  'pa-IN': 'pa-IN',
  'ur-IN': 'ur-IN',
}

const chatHistoryStorageKey = (userId) => `sakhi-chat-history-${userId}`

const baseLangFromTag = (tag) => (tag || 'en-US').split('-')[0].toLowerCase()

const chooseBestVoice = (voices, langTag) => {
  if (!voices?.length) return null

  const normalizedTag = (langTag || 'en-US').toLowerCase()
  const targetBase = baseLangFromTag(normalizedTag)

  const exact = voices.find((voice) => voice.lang?.toLowerCase() === normalizedTag)
  if (exact) return exact

  const sameBase = voices.find((voice) => voice.lang?.toLowerCase().startsWith(`${targetBase}-`))
  if (sameBase) return sameBase

  const localSameBase = voices.find(
    (voice) => voice.localService && voice.lang?.toLowerCase().startsWith(`${targetBase}-`)
  )
  if (localSameBase) return localSameBase

  return voices.find((voice) => voice.default) || voices[0]
}

export default function Chat() {
  const { strings, language: appLanguage } = useLanguage()
  const userName = useMemo(() => {
    const storedUser = localStorage.getItem('sakhi-user')
    if (!storedUser) return 'Sakhi'
    try {
      const parsedUser = JSON.parse(storedUser)
      return parsedUser.name || parsedUser.email || 'Sakhi'
    } catch {
      return 'Sakhi'
    }
  }, [])

  const initialMessage = useMemo(() => {
    const raw = strings.chat.initialMessage
    return raw.replace(/Sakhi/g, userName)
  }, [strings.chat.initialMessage, userName])

  const userId = useMemo(() => 'demo-user', [])
  const storageKey = useMemo(() => chatHistoryStorageKey(userId), [userId])

  const [messages, setMessages] = useState(() => {
    if (typeof window === 'undefined') {
      return [{ role: 'assistant', content: initialMessage }]
    }

    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    } catch {
      // fall back to initial message
    }

    return [{ role: 'assistant', content: initialMessage }]
  })
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingTopic, setSendingTopic] = useState(false)
  const [voiceLanguage, setVoiceLanguage] = useState(recognitionLangFromApp[appLanguage] || 'en-US')
  const [speakReplies, setSpeakReplies] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [speechStatus, setSpeechStatus] = useState('idle')
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoiceName, setSelectedVoiceName] = useState('auto')

  const activeUtteranceRef = useRef(null)

  useEffect(() => {
    if (!window.speechSynthesis) return undefined

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const addMessage = (message) => setMessages((current) => [...current, message])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {
      // Ignore storage failures.
    }
  }, [messages, storageKey])

  const speakText = (text) => {
    if (!window.speechSynthesis || !speakReplies || !text) return
    const speechLang = speechLangFromVoice[voiceLanguage] || 'en-US'
    const selectedVoice =
      selectedVoiceName !== 'auto'
        ? availableVoices.find((voice) => voice.name === selectedVoiceName) || chooseBestVoice(availableVoices, speechLang)
        : chooseBestVoice(availableVoices, speechLang)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLang
    if (selectedVoice) utterance.voice = selectedVoice

    const nonEnglish = baseLangFromTag(speechLang) !== 'en'
    utterance.rate = nonEnglish ? 0.9 : 0.96
    utterance.pitch = 1

    utterance.onstart = () => setSpeechStatus('speaking')
    utterance.onend = () => {
      activeUtteranceRef.current = null
      setSpeechStatus('idle')
    }
    utterance.onerror = () => {
      activeUtteranceRef.current = null
      setSpeechStatus('idle')
    }

    activeUtteranceRef.current = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const pauseOrResumeSpeech = () => {
    if (!window.speechSynthesis) return

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause()
      setSpeechStatus('paused')
      return
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setSpeechStatus('speaking')
    }
  }

  const stopSpeech = () => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    activeUtteranceRef.current = null
    setSpeechStatus('idle')
  }

  const handleQuickPrompt = (topicPrompt) => {
    setPrompt(topicPrompt)
  }

  const clearChatHistory = () => {
    const resetMessages = [{ role: 'assistant', content: initialMessage }]
    setMessages(resetMessages)
    try {
      localStorage.setItem(storageKey, JSON.stringify(resetMessages))
    } catch {
      // Ignore storage failures.
    }
  }

  useEffect(() => {
    if (speakReplies) return
    stopSpeech()
  }, [speakReplies])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!prompt.trim()) return

    const userMessage = { role: 'user', content: prompt }
    addMessage(userMessage)
    setPrompt('')
    setLoading(true)

    try {
      const responseLanguage = voiceLanguage === 'auto' ? 'auto' : aiLanguageFromVoice[voiceLanguage] || appLanguage
      const response = await sendAiChat({ userId, prompt, language: responseLanguage })
      const answer = response.data?.answer || strings.chat.fallbackMessage
      addMessage({ role: 'assistant', content: answer })
      speakText(answer)
    } catch (error) {
      addMessage({ role: 'assistant', content: strings.chat.errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] bg-linear-to-br from-slate-950 via-fuchsia-950 to-fuchsia-900 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-full space-y-8">
        <div className="rounded-4xl bg-slate-950/80 p-8 shadow-[0_40px_120px_rgba(168,85,247,0.25)] ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-300">AI Mentor</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Talk to your financial guide</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{strings.chat.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6 rounded-4xl bg-white/95 p-6 shadow-2xl ring-1 ring-slate-900/10">
            <div className="rounded-[1.75rem] bg-slate-950 px-6 py-5 text-white shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-300">Advisor</p>
                  <p className="mt-2 text-lg font-semibold">Hi {userName}! Tell me what you want help with today.</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                  Live
                </span>
              </div>
            </div>

            <section className="space-y-4">
              {messages.map((message, index) => (
                <ChatBubble key={index} role={message.role} content={message.content} />
              ))}
              {loading && (
                <div className="rounded-[1.75rem] border border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm text-fuchsia-700 shadow-sm">
                  Thinking about business and finance advice...
                </div>
              )}
            </section>

            <section className="rounded-[1.75rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-600">Quick topics</p>
                  <p className="mt-1 text-sm text-slate-600">Tap one to start a focused finance/business conversation.</p>
                </div>
                <button
                  type="button"
                  onClick={clearChatHistory}
                  className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear chat history
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {topicQuickPrompts.map((topicPrompt) => (
                  <button
                    key={topicPrompt}
                    type="button"
                    onClick={() => handleQuickPrompt(topicPrompt)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-fuchsia-100 hover:text-fuchsia-700"
                  >
                    {topicPrompt}
                  </button>
                ))}
              </div>
            </section>

            <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.75rem] bg-slate-100 p-5 shadow-inner">
              <textarea
                rows="4"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-200"
                placeholder={strings.chat.placeholder}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <VoiceButton
                    onTranscript={(text) => setPrompt((current) => `${current} ${text}`.trim())}
                    recognitionLang={voiceLanguage === 'auto' ? (recognitionLangFromApp[appLanguage] || 'en-US') : voiceLanguage}
                    onListeningChange={setIsListening}
                  />
                  <span className="rounded-full bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                    {isListening ? 'Listening now' : strings.chat.voiceButton}
                  </span>
                  <select
                    value={voiceLanguage}
                    onChange={(event) => setVoiceLanguage(event.target.value)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {voiceLanguageOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={selectedVoiceName}
                    onChange={(event) => setSelectedVoiceName(event.target.value)}
                    className="max-w-[220px] rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <option value="auto">Auto voice</option>
                    {availableVoices
                      .filter((voice) => voice.lang?.toLowerCase().startsWith(baseLangFromTag(speechLangFromVoice[voiceLanguage] || 'en-US')))
                      .map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSpeakReplies((current) => !current)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${speakReplies ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}
                  >
                    {speakReplies ? 'Voice reply on' : 'Voice reply off'}
                  </button>
                  <button
                    type="button"
                    onClick={pauseOrResumeSpeech}
                    disabled={speechStatus === 'idle'}
                    className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 disabled:opacity-50"
                  >
                    {speechStatus === 'paused' ? 'Resume voice' : 'Pause voice'}
                  </button>
                  <button
                    type="button"
                    onClick={stopSpeech}
                    disabled={speechStatus === 'idle'}
                    className="rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"
                  >
                    Stop voice
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? strings.chat.listening : strings.chat.sendButton}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-6 rounded-4xl bg-slate-950/90 p-6 text-slate-100 shadow-2xl ring-1 ring-white/10">
            <div className="rounded-[1.75rem] bg-fuchsia-900/85 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200">Voice chat helper</p>
              <h2 className="mt-3 text-xl font-semibold text-white">How can I assist you?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Use voice or type your question to get fast personalized guidance.</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600 text-xl text-white">🤖</div>
                <div>
                  <p className="font-semibold text-white">AI voice assistant</p>
                  <p className="mt-1 text-sm text-slate-300">Say “show my budget” or “how can I save more?”</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Quick actions</p>
              <ul className="mt-4 space-y-3">
                <li className="rounded-2xl bg-slate-900/70 px-4 py-3">Start a savings plan</li>
                <li className="rounded-2xl bg-slate-900/70 px-4 py-3">Check expense trends</li>
                <li className="rounded-2xl bg-slate-900/70 px-4 py-3">Ask for business tips</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
