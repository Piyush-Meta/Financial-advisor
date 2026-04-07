import { useEffect, useMemo, useRef, useState } from 'react'
import ChatBubble from '../components/ChatBubble.jsx'
import VoiceButton from '../components/VoiceButton.jsx'
import { sendAiChat } from '../api/ap.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'

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

const detectLanguageFromText = (text) => {
  if (!text) return 'en'
  if (/[\u0900-\u097F]/.test(text)) return 'hi'
  if (/[\u0B00-\u0B7F]/.test(text)) return 'od'
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'
  return 'en'
}

const getPreferredResponseLanguage = (text, fallbackLanguage) => {
  const detected = detectLanguageFromText(text)
  return detected === 'en' ? fallbackLanguage : detected
}

const cleanSpeechText = (text = '') =>
  text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*[-*•]+\s*/gm, '')
    .replace(/^\s*\d+[.)]\s*/gm, '')
    .replace(/[\*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

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
  const { strings, language: appLanguage, languageNames } = useLanguage()
  const chatStrings = strings.chat
  const topicQuickPrompts = chatStrings.topics || []
  const voiceLanguageOptions = useMemo(
    () => [
      { value: 'auto', label: 'Auto' },
      { value: 'en-US', label: languageNames.en },
      { value: 'hi-IN', label: languageNames.hi },
      { value: 'or-IN', label: languageNames.od },
      { value: 'bn-IN', label: languageNames.bn },
      { value: 'ta-IN', label: languageNames.ta },
      { value: 'te-IN', label: languageNames.te },
      { value: 'mr-IN', label: languageNames.mr },
      { value: 'gu-IN', label: languageNames.gu },
      { value: 'pa-IN', label: languageNames.pa },
      { value: 'ur-IN', label: languageNames.ur },
    ],
    [languageNames]
  )
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
    const raw = chatStrings.initialMessage
    return raw.replace(/Sakhi/g, userName)
  }, [chatStrings.initialMessage, userName])

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
  const voiceButtonRef = useRef(null)

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

  const speakText = (text, forcedLanguage) => {
    if (!window.speechSynthesis || !speakReplies || !text) return
    const speechLang = forcedLanguage || speechLangFromVoice[voiceLanguage] || 'en-US'
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
      const responseLanguage =
        voiceLanguage === 'auto'
          ? getPreferredResponseLanguage(prompt, appLanguage)
          : aiLanguageFromVoice[voiceLanguage] || appLanguage
      const response = await sendAiChat({ userId, prompt, language: responseLanguage })
      const answer = response.data?.answer || chatStrings.fallbackMessage
      addMessage({ role: 'assistant', content: answer })
      const speechLanguage =
        voiceLanguage === 'auto'
          ? getPreferredResponseLanguage(answer || prompt, responseLanguage)
          : responseLanguage
      const speechTag = speechLanguage === 'od' ? 'or-IN' : speechLanguage === 'hi' ? 'hi-IN' : speechLanguage === 'en' ? 'en-US' : speechLangFromVoice[voiceLanguage] || 'en-US'
      if (voiceLanguage === 'auto') {
        setVoiceLanguage(speechTag)
      }
      speakText(cleanSpeechText(answer), speechTag)
    } catch (error) {
      addMessage({ role: 'assistant', content: chatStrings.errorMessage })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const onVoiceAction = (event) => {
      const action = event.detail?.action
      if (!action) return

      if (action === 'start_voice_chat') {
        voiceButtonRef.current?.startListening?.()
      }

      if (action === 'send_message' && prompt.trim() && !loading) {
        handleSubmit({ preventDefault: () => {} })
      }
    }

    window.addEventListener('sakhi-voice-action', onVoiceAction)
    return () => window.removeEventListener('sakhi-voice-action', onVoiceAction)
  }, [loading, prompt])

  return (
    <div className="min-h-[calc(100vh-96px)] bg-linear-to-br from-slate-950 via-fuchsia-950 to-fuchsia-900 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-full space-y-8">
        <div className="rounded-4xl bg-slate-950/80 p-8 shadow-[0_40px_120px_rgba(168,85,247,0.25)] ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-300">{chatStrings.title}</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">{chatStrings.pageTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{chatStrings.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6 rounded-4xl bg-white/95 p-6 shadow-2xl ring-1 ring-slate-900/10">
            <div className="rounded-[1.75rem] bg-slate-950 px-6 py-5 text-white shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-300">{chatStrings.advisorLabel}</p>
                  <p className="mt-2 text-lg font-semibold">{chatStrings.advisorGreeting.replace('{name}', userName)}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                  {chatStrings.liveLabel}
                </span>
              </div>
            </div>

            <section className="space-y-4">
              {messages.map((message, index) => (
                <ChatBubble key={index} role={message.role} content={message.content} />
              ))}
              {loading && (
                <div className="rounded-[1.75rem] border border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm text-fuchsia-700 shadow-sm">
                  {chatStrings.thinking}
                </div>
              )}
            </section>

            <section className="rounded-[1.75rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-600">{chatStrings.quickTopics}</p>
                  <p className="mt-1 text-sm text-slate-600">{chatStrings.quickTopicsSub}</p>
                </div>
                <button
                  type="button"
                  onClick={clearChatHistory}
                  className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {chatStrings.clearHistory}
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
                placeholder={chatStrings.placeholder}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <VoiceButton
                    ref={voiceButtonRef}
                    onTranscript={(text) => setPrompt((current) => `${current} ${text}`.trim())}
                    recognitionLang={voiceLanguage === 'auto' ? (recognitionLangFromApp[appLanguage] || 'en-US') : voiceLanguage}
                    onListeningChange={setIsListening}
                  />
                  <span className="rounded-full bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                    {isListening ? chatStrings.listeningNow : chatStrings.voiceButton}
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
                    className="max-w-55 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <option value="auto">{chatStrings.autoVoice}</option>
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
                    {speakReplies ? chatStrings.voiceReplyOn : chatStrings.voiceReplyOff}
                  </button>
                  <button
                    type="button"
                    onClick={pauseOrResumeSpeech}
                    disabled={speechStatus === 'idle'}
                    className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 disabled:opacity-50"
                  >
                    {speechStatus === 'paused' ? chatStrings.resumeVoice : chatStrings.pauseVoice}
                  </button>
                  <button
                    type="button"
                    onClick={stopSpeech}
                    disabled={speechStatus === 'idle'}
                    className="rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"
                  >
                    {chatStrings.stopVoice}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? chatStrings.listening : chatStrings.sendButton}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-6 rounded-4xl bg-slate-950/90 p-6 text-slate-100 shadow-2xl ring-1 ring-white/10">
            <div className="rounded-[1.75rem] bg-fuchsia-900/85 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200">{chatStrings.voiceHelperTitle}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{chatStrings.voiceHelperHeading}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{chatStrings.voiceHelperSub}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600 text-xl text-white">🤖</div>
                <div>
                  <p className="font-semibold text-white">{chatStrings.assistantCardTitle}</p>
                  <p className="mt-1 text-sm text-slate-300">{chatStrings.assistantCardSub}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">{chatStrings.quickActionsTitle}</p>
              <ul className="mt-4 space-y-3">
                {chatStrings.quickActions.map((action) => (
                  <li key={action} className="rounded-2xl bg-slate-900/70 px-4 py-3">{action}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
