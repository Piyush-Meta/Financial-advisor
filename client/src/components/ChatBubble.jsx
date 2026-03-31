export default function ChatBubble({ role, content }) {
  const isAssistant = role === 'assistant'
  return (
    <div
      className={`rounded-[1.75rem] p-5 shadow-sm ${
        isAssistant
          ? 'bg-slate-950 text-white border border-white/10'
          : 'bg-fuchsia-50 text-slate-900 border border-fuchsia-200'
      }`}
    >
      <p className={`text-xs uppercase tracking-[0.2em] ${isAssistant ? 'text-fuchsia-300' : 'text-fuchsia-600'}`}>
        {isAssistant ? 'Advisor' : 'You'}
      </p>
      <p className="mt-3 whitespace-pre-line text-sm leading-7">{content}</p>
    </div>
  )
}
