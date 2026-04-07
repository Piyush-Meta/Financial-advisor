import { VoiceProvider, useVoice } from './VoiceContext.jsx'

export const VoiceCommandProvider = VoiceProvider

export function useVoiceCommands() {
  const voice = useVoice()

  return {
    supported: voice.supported,
    enabled: voice.enabled,
    listening: voice.listening,
    lastCommand: voice.lastCommand,
    lastIntent: voice.lastIntent,
    toggle: voice.toggleEnabled,
    start: voice.startPushToTalk,
    stop: voice.stopPushToTalk,
    mode: voice.mode,
    setMode: voice.setMode,
    startPushToTalk: voice.startPushToTalk,
    stopPushToTalk: voice.stopPushToTalk,
  }
}
