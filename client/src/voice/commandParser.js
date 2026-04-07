export const normalizeVoiceText = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const includesAny = (text, phrases) => phrases.some((phrase) => text.includes(phrase))

const languageHints = {
  en: ['english', 'angrezi', 'inglish'],
  hi: ['hindi', 'hindee', 'हिंदी', 'हिन्दी'],
  bn: ['bengali', 'bangla', 'বাংলা'],
  te: ['telugu', 'తెలుగు'],
  mr: ['marathi', 'मराठी'],
  ta: ['tamil', 'தமிழ்'],
  ur: ['urdu', 'اردو'],
  gu: ['gujarati', 'ગુજરાતી'],
  kn: ['kannada', 'ಕನ್ನಡ'],
  od: ['odia', 'oriya', 'ଓଡ଼ିଆ'],
  ml: ['malayalam', 'മലയാളം'],
  pa: ['punjabi', 'ਪੰਜਾਬੀ'],
  as: ['assamese', 'অসমীয়া'],
  mai: ['maithili', 'मैथिली'],
  sat: ['santali', 'ᱥᱟᱱᱛᱟᱲᱤ'],
  ks: ['kashmiri', 'कॉशुर'],
  ne: ['nepali', 'नेपाली'],
  kok: ['konkani', 'कोंकणी'],
  sd: ['sindhi', 'سنڌي'],
  doi: ['dogri', 'डोगरी'],
  mni: ['manipuri', 'মণিপুরী'],
  brx: ['bodo', 'बड़ो'],
}

const stopPhrases = ['stop listening', 'voice off', 'mic off', 'turn off voice', 'बंद', 'બંધ', 'বন্ধ', 'বন্ধ করো']
const helpPhrases = ['help', 'voice help', 'what can i say', 'commands', 'मदद', 'ସହାୟତା', 'உதவி', 'সহায়তা']

const routeMatchers = [
  {
    route: '/',
    key: 'home',
    phrases: [
      'go home', 'open home', 'home page', 'mujhe home page par le chalo', 'home page par le chalo', 'ghar chalo', 'होम', 'होम पेज',
      'होम पर ले चलो', 'গৃহ', 'গৃহ পাতা', 'বাড়ি যাও', 'హోమ్', 'హోమ్ పేజీ', 'ఇంటికి వెళ్లు', 'मुख्य पृष्ठ', 'मुख्य पृष्ठ खोलें',
      'घर जाओ', 'வீடு', 'வீட்டு பக்கம்', 'வீட்டிற்குத் திரும்பவும்', 'ہوم', 'ہوم صفحہ', 'گھر جاؤ', 'ગૃહ', 'ગૃહ પૃષ્ઠ', 'ઘરે જાવ',
      'ಮುಖ್ಯ ಪುಟ', 'ಹೋಮ್ ಪುಟವನ್ನು ತೆರೆಯಿರಿ', 'ಮನೆಗೆ ಹೋಗಿ', 'ହୋମ', 'ହୋମ ପୃଷ୍ଠା', 'ଘରକୁ ଚାଲି ଯାଅ', 'ഹോം',
      'ഹോം പേജ്', 'വീട്ടിലേക്ക് പോകുക', 'ਘਰ ਜਾਓ', 'ਮੁੱਖ ਪੰਨਾ', 'ਾ ਵਾਲਾ ਪੰਨਾ', 'ঘর যাও', 'মূল পৃষ্ঠা', 'বাড়িতে ফিরুন',
      'घर जाओ', 'मुख्य पृष्ठ', 'গৃহ', 'होम', 'पृष्ठ'
    ],
  },
  {
    route: '/chat',
    key: 'chat',
    phrases: [
      'open chat', 'go to chat', 'chat page', 'chat kholo', 'mujhe chat page par le chalo', 'चैट खोलो', 'chat page khol', 'talk to advisor',
      'কথোপকথন', 'চ্যাট পাতা', 'বার্তা', 'কথা বলুন', 'सलाहकार से बात करें', 'सलाह लें', 'チャット', 'చాట్',
      'చాట్ పేజీ', 'సలహాదారు నుండి మాట్లాడండి', 'वार्तालाप', 'चैट', 'चैट को खोलें', 'உரையாடல்', 'சேவையாளரிடம் பேசுங்கள்',
      'ਚੈਟ', 'ਸਲਾਹ ਲਓ', 'ਵਿਚ ਕੂੜ', 'מדריך', 'محادثہ', 'بات کریں', 'گفتگو', 'ચેટ', 'સલાહ લો',
      'ಚಾಟ್', 'ಸೂಚಕರೊಂದಿಗೆ ಮಾತನಾಡಿ', 'ಚರ್ಚೆ', 'ଚାଟ୍', 'ଆଡଭାଇଜର', 'സംസാരിക്കുക', 'advisory', 'messenger'
    ],
  },
  {
    route: '/dashboard',
    key: 'dashboard',
    phrases: [
      'open dashboard', 'go to dashboard', 'dashboard kholo', 'डैशबोर्ड खोलो', 'dashboard khol', 'ড্যাশবোর্ড', 'ড্যাশ বোর্ড খোলেন',
      'ଡ୍ଯାଶବୋର୍ଡ', 'ডেস্কবোর্ড', 'डेशबोर्ड', 'તમાટ્બોર્ડ', 'డాష్‌బోర్డ్', '대시보드', 'ഡാഷ്‌ബോർഡ്', 'ਡੈਸ਼ਬੋਰਡ', 'ڈیش بورڈ',
      'ᱰᱮᱨ ᱠᱩᱢᱟᱨ', 'पॅनल', 'मेरा डेशबोर्ड', 'summary panel', 'main panel', 'home screen'
    ],
  },
  {
    route: '/login',
    key: 'login',
    phrases: [
      'open login', 'go to login', 'login karo', 'mujhe login karna hai', 'लॉगिन खोलो', 'লগইন', 'আমাকে লগইন করতে হবে', 'लॉगिन',
      'லॉகిన්', 'లాగిన్', 'ಲಾಗಿನ್', 'ଲଗଇନ', 'ലോഗിൻ', 'ਲਾਗਿਨ', 'لاگ ان', 'ڈ اندر', 'داخل ہوں', 'पथ', 'प्रবेश', 'sign in',
      'authenticate', 'login page', 'access account'
    ],
  },
  {
    route: '/register',
    key: 'register',
    phrases: [
      'open register', 'go to register', 'sign up', 'create account', 'खाता बनाना है', 'रजिस्टर खोलो', 'নিবন্ধন', 'অ্যাকাউন্ট তৈরি করুন',
      'नयाũ खाता', 'নতুন ব্যবহারকারী', 'নিবন্ধন পৃষ্ঠা', 'నమోదు', 'ఖాతా సృష్టించండి', 'নতুন ব্যবহারকারীর জন্য', 'న్యూ యూజर్',
      'नयौ सदस्य', 'नया खाता', 'తెలుగు', 'নতুন ইউজার', 'नया अकाउंट', 'new account', 'join now', 'create new user', 'become member'
    ],
  },
  {
    route: '/budget',
    key: 'budget',
    phrases: [
      'open budget', 'go to budget', 'budget kholo', 'budget banana hai', 'khata page kholo', 'mujhe khata ke jagah le chalo', 'बजट खोलो',
      'खाता पेज खोलो', 'बजट', 'বাজেট', 'হিসাব পাতা', 'হিসাব খুলুন', 'বাজেট খোলেন', 'బడ్జెట్', 'ఖాతా పేజీ', 'బడ్జెట్ విస్తరించండి',
      'బడ్జెట్ చేయండి', 'ಬಜೆಟ್', 'ಖಾತೆ ಪುಟ', 'ଖାତା', 'ଖାତା ପୃଷ୍ଠା', 'ବଡେଟ', 'ബജറ്റ്', 'ഖാതാ പൃഷ്ഠം', 'ਬਜਟ', 'ਖਰਚ ਪ੍ਰਬੰਧ',
      'بجٹ', 'حساب', 'حسابات', 'money plan', 'spending plan', 'expense tracker', 'financial plan'
    ],
  },
  {
    route: '/business',
    key: 'business',
    phrases: [
      'open business', 'go to business', 'business planner', 'business shuru karna hai', 'business kholo', 'व्यवसाय खोलो', 'invest page kholo',
      'ব্যবসা', 'ব্যবসা খুলুন', 'বিনিয়োগ', 'ব्यापार', 'कारोबार', 'વ્યવસાય', 'ব্যবসায়', 'ఆర్థిక ఉद్యమ', 'వ్యాపారం', 'ವಿನಿಯೋಗ',
      'ಉದ್ಯೋಗಿ', 'ଲେଖାଏ', 'ଉଦ୍ୟୋଗ', 'ഗതിരോധിനി', 'ਵਪਾਰ', 'ਐਨ', 'إدارة الأعمال', 'سرمایہ کاری', 'کاروباری منصوبہ',
      'small business', 'investment ideas', 'entrepreneurship', 'micro finance'
    ],
  },
]

const actionMatchers = [
  {
    action: 'send_message',
    key: 'sendMessage',
    phrases: ['send message', 'message bhejo', 'sandes bhejo', 'संदेश भेजो', 'বার্তা পাঠাও', 'message send karo'],
  },
  {
    action: 'start_voice_chat',
    key: 'startVoice',
    phrases: ['start voice chat', 'voice chat start', 'start listening', 'voice shuru karo', 'वॉयस चैट शुरू करो'],
  },
  {
    action: 'logout',
    key: 'logout',
    phrases: ['logout', 'sign out', 'log out', 'साइन आउट', 'लॉगआउट', 'ખાતાથી બહાર નીકળો'],
  },
  {
    action: 'scroll_down',
    key: 'scrollDown',
    phrases: ['scroll down', 'नीचे जाओ', 'नीचे स्क्रोल', 'neeche jao', 'scroll neeche'],
  },
  {
    action: 'scroll_up',
    key: 'scrollUp',
    phrases: ['scroll up', 'ऊपर जाओ', 'upar jao', 'ऊपर स्क्रोल', 'scroll upar'],
  },
]

const languageChangePhrases = [
  'change language to',
  'switch to',
  'set language to',
  'switch language to',
  'भाषा बदलो',
  'भाषा बदल दो',
  'भाषा को',
  'ଭାଷା ବଦଳାନ୍ତୁ',
  'மொழியை மாற்று',
  'ભાષા બદલો',
]

const detectScriptLanguage = (text) => {
  if (/[\u0B80-\u0BFF]/u.test(text)) return 'ta'
  if (/[\u0C00-\u0C7F]/u.test(text)) return 'te'
  if (/[\u0C80-\u0CFF]/u.test(text)) return 'kn'
  if (/[\u0D00-\u0D7F]/u.test(text)) return 'ml'
  if (/[\u0A80-\u0AFF]/u.test(text)) return 'gu'
  if (/[\u0B00-\u0B7F]/u.test(text)) return 'od'
  if (/[\u0A00-\u0A7F]/u.test(text)) return 'pa'
  if (/[\u0980-\u09FF]/u.test(text)) return 'bn'
  if (/[\u0600-\u06FF]/u.test(text)) return 'ur'
  if (/[\u0900-\u097F]/u.test(text)) return 'hi'
  if (/[\u1C50-\u1C7F]/u.test(text)) return 'sat'
  return null
}

const detectLanguageFromHints = (text) => {
  for (const [code, hints] of Object.entries(languageHints)) {
    if (includesAny(text, hints)) return code
  }
  return null
}

export const detectSpokenLanguage = (text, fallbackLanguage = 'hi') => {
  const normalized = normalizeVoiceText(text)
  return detectLanguageFromHints(normalized) || detectScriptLanguage(normalized) || fallbackLanguage
}

const extractTargetLanguage = (text) => {
  const normalized = normalizeVoiceText(text)
  return detectLanguageFromHints(normalized)
}

export function parseVoiceCommand(transcript, options = {}) {
  const { appLanguage = 'hi' } = options
  const normalized = normalizeVoiceText(transcript)
  const spokenLanguage = detectSpokenLanguage(normalized, appLanguage)

  if (!normalized) {
    return { intent: 'unknown', spokenLanguage }
  }

  if (includesAny(normalized, stopPhrases)) {
    return { intent: 'action', action: 'stop_listening', key: 'stopListening', spokenLanguage }
  }

  if (includesAny(normalized, helpPhrases)) {
    return { intent: 'help', key: 'help', spokenLanguage }
  }

  const languageTarget = extractTargetLanguage(normalized)
  if (languageTarget && includesAny(normalized, languageChangePhrases)) {
    return {
      intent: 'language',
      language: languageTarget,
      key: 'languageChanged',
      spokenLanguage: languageTarget,
    }
  }

  for (const matcher of routeMatchers) {
    if (includesAny(normalized, matcher.phrases)) {
      return {
        intent: 'navigate',
        route: matcher.route,
        key: matcher.key,
        spokenLanguage,
      }
    }
  }

  for (const matcher of actionMatchers) {
    if (includesAny(normalized, matcher.phrases)) {
      return {
        intent: 'action',
        action: matcher.action,
        key: matcher.key,
        spokenLanguage,
      }
    }
  }

  return { intent: 'unknown', spokenLanguage }
}

const responses = {
  en: {
    home: 'Opening home page.',
    chat: 'Opening chat page.',
    dashboard: 'Opening dashboard page.',
    login: 'Opening login page.',
    register: 'Opening register page.',
    budget: 'Opening budget page.',
    business: 'Opening business planner page.',
    sendMessage: 'Sending message now.',
    startVoice: 'Starting voice chat.',
    logout: 'Signing out now.',
    scrollDown: 'Scrolling down.',
    scrollUp: 'Scrolling up.',
    stopListening: 'Voice control turned off.',
    languageChanged: 'Language changed successfully.',
    help: 'You can say go home, open chat, open budget, open business, open dashboard, open login, open register, send message, start voice chat, scroll down, scroll up, or logout.',
    unknown: 'I did not catch that command. Please try again.',
  },
  hi: {
    home: 'मैं आपको होम पेज पर ले जा रहा हूँ।',
    chat: 'मैं आपको चैट पेज पर ले जा रहा हूँ।',
    dashboard: 'मैं आपको डैशबोर्ड पर ले जा रहा हूँ।',
    login: 'मैं लॉगिन पेज खोल रहा हूँ।',
    register: 'मैं रजिस्टर पेज खोल रहा हूँ।',
    budget: 'मैं आपको बजट पेज पर ले जा रहा हूँ।',
    business: 'मैं बिजनेस प्लानर पेज खोल रहा हूँ।',
    sendMessage: 'मैं संदेश भेज रहा हूँ।',
    startVoice: 'मैं वॉयस चैट शुरू कर रहा हूँ।',
    logout: 'मैं आपको साइन आउट कर रहा हूँ।',
    scrollDown: 'मैं नीचे स्क्रोल कर रहा हूँ।',
    scrollUp: 'मैं ऊपर स्क्रोल कर रहा हूँ।',
    stopListening: 'वॉयस कंट्रोल बंद कर दिया गया है।',
    languageChanged: 'भाषा बदल दी गई है।',
    help: 'आप बोल सकते हैं होम खोलो, चैट खोलो, बजट खोलो, बिजनेस खोलो, डैशबोर्ड खोलो, लॉगिन खोलो, रजिस्टर खोलो, संदेश भेजो, वॉयस चैट शुरू करो, ऊपर या नीचे स्क्रोल करो, या साइन आउट करो।',
    unknown: 'मैं कमांड समझ नहीं पाया, कृपया दोबारा बोलें।',
  },
  bn: {
    home: 'আমি আপনাকে হোম পেজে নিয়ে যাচ্ছি।',
    chat: 'আমি আপনাকে চ্যাট পেজে নিয়ে যাচ্ছি।',
    dashboard: 'আমি ড্যাশবোর্ড খুলছি।',
    login: 'আমি লগইন পেজ খুলছি।',
    register: 'আমি রেজিস্টার পেজ খুলছি।',
    budget: 'আমি আপনাকে বাজেট পেজে নিয়ে যাচ্ছি।',
    business: 'আমি ব্যবসা পরিকল্পক পেজ খুলছি।',
    sendMessage: 'আমি বার্তা পাঠাচ্ছি।',
    startVoice: 'আমি ভয়েস চ্যাট শুরু করছি।',
    logout: 'আমি আপনাকে লগ আউট করছি।',
    scrollDown: 'আমি নীচে স্ক্রোল করছি।',
    scrollUp: 'আমি উপরে স্ক্রোল করছি।',
    stopListening: 'ভয়েস নিয়ন্ত্রণ বন্ধ করা হয়েছে।',
    languageChanged: 'ভাষা সফলভাবে পরিবর্তন করা হয়েছে।',
    help: 'আপনি বলতে পারেন হোম যান, চ্যাট খুলুন, বাজেট খুলুন, ব্যবসা খুলুন, ড্যাশবোর্ড খুলুন, লগইন খুলুন, রেজিস্টার খুলুন, বার্তা পাঠান, ভয়েস চ্যাট শুরু করুন বা লগ আউট করুন।',
    unknown: 'আমি কমান্ড বুঝতে পারিনি, দয়া করে আবার চেষ্টা করুন।',
  },
  te: {
    home: 'నేను మిమ్మల్ని హోమ్ పేజీకి తీసుకెళ్తున్నాను.',
    chat: 'నేను మిమ్మల్ని చాట్ పేజీకి తీసుకెళ్తున్నాను.',
    dashboard: 'నేను డ్యాష్‌బోర్డ్ తెరుస్తున్నాను.',
    login: 'నేను లాగిన్ పేజీ తెరుస్తున్నాను.',
    register: 'నేను రిజిస్టర్ పేజీ తెరుస్తున్నాను।',
    budget: 'నేను మిమ్మల్ని బడ్జెట్ పేజీకి తీసుకెళ్తున్నాను.',
    business: 'నేను ব్యవসాయ ప్లానర్ పేజీ తెరుస్తున్నాను.',
    sendMessage: 'నేను సందేశం పంపుతున్నాను.',
    startVoice: 'నేను వాయిస్ చాట్ ప్రారంభిస్తున్నాను.',
    logout: 'నేను మిమ్మల్ని లాగ్ అవుట్ చేస్తున్నాను.',
    scrollDown: 'నేను క్రిందికి స్క్రోల్ చేస్తున్నాను।',
    scrollUp: 'నేను పైకి స్క్రోల్ చేస్తున్నాను।',
    stopListening: 'వాయిస్ నియంత్రణ ఆపివేయబడింది।',
    languageChanged: 'భాష విజయవంతంగా మార్చబడింది।',
    help: 'మీరు హోమ్ వెళ్లండి, చాట్ తెరండి, బడ్జెట్ తెరండి, ব్యవసాయ తెరండి, డ్యాష్‌బోర్డ్ తెరండి, లాగిన్ తెరండి, రిజిస్టర్ తెరండి, సందేశం పంపండి, వాయిస్ చాట్ ప్రారంభించండి లేదా లాగ్ అవుట్ చేయండి.',
    unknown: 'నేను ఆదేశాన్ని అర్థం చేసుకోలేకపోయాను, దయచేసి మళ్లీ ప్రయత్నించండి។',
  },
  mr: {
    home: 'मी तुम्हाला होम पेजवर नेत आहे।',
    chat: 'मी तुम्हाला चॅट पेजवर नेत आहे।',
    dashboard: 'मी डॅशबोर्ड उघडत आहे।',
    login: 'मी लॉगिन पेज उघडत आहे।',
    register: 'मी रजिस्टर पेज उघडत आहे।',
    budget: 'मी तुम्हाला बजेट पेजवर नेत आहे।',
    business: 'मी व्यवसाय नियोजक पेज उघडत आहे।',
    sendMessage: 'मी संदेश पाठवत आहे।',
    startVoice: 'मी व्हॉयस चॅट सुरू करत आहे।',
    logout: 'मी तुम्हाला लॉग आउट करत आहे।',
    scrollDown: 'मी खाली स्क्रोल करत आहे।',
    scrollUp: 'मी वर स्क्रोल करत आहे।',
    stopListening: 'व्हॉयस नियंत्रण बंद केले गेले।',
    languageChanged: 'भाषा यशस्वीरित्या बदलली गेली।',
    help: 'तुम्ही होम जा, चॅट उघडा, बजेट उघडा, व्यवसाय उघडा, डॅशबोर्ड उघडा, लॉगिन उघडा, रजिस्टर उघडा, संदेश पाठवा, व्हॉयस चॅट सुरू करा किंवा लॉग आउट करा असे म्हणू शकता।',
    unknown: 'मी आदेश समजू शकलो नाही, कृपया पुन्हा प्रयत्न करा।',
  },
  ta: {
    home: 'நான் உங்களை வீட்டு பக்கத்திற்கு கொண்டு செல்கிறேன்.',
    chat: 'நான் உங்களை சேட் பக்கத்திற்கு கொண்டு செல்கிறேன்.',
    dashboard: 'நான் டாஷ்போர்டு திறக்கிறேன்.',
    login: 'நான் உள்நுழைவு பக்கம் திறக்கிறேன்.',
    register: 'நான் பதிவு பக்கம் திறக்கிறேன்.',
    budget: 'நான் உங்களை பட்ஜெட் பக்கத்திற்கு கொண்டு செல்கிறேன்.',
    business: 'நான் ব्যவसाय திட்ட பக்கம் திறக்கிறேன்.',
    sendMessage: 'நான் செய்தி அனுப்புகிறேன்.',
    startVoice: 'நான் ஆவாज் சேட்டை தொடங்குகிறேன்.',
    logout: 'நான் உங்களை உள்நுழைவு செய்ய விடுகிறேன்.',
    scrollDown: 'நான் கீழே ஸ்क्रோல் செய்கிறேன்.',
    scrollUp: 'நான் மேலே ஸ்क्रोल் செய்கிறேன்.',
    stopListening: 'ஆவாज் கட்டுப்பாடு நிறுத்தப்பட்டுவிட்டது.',
    languageChanged: 'மொழி வெற்றிகரமாக மாற்றப்பட்டுவிட்டது.',
    help: 'நீங்கள் வீடு நோக்கி செல்லுங்கள், சேட் திறக்கவும், பட்ஜெட் திறக்கவும், ব्यवसाय திறக்கவும், டாஷ்போர்டு திறக்கவும், உள்நுழைவு திறக்கவும், பதிவு திறக்கவும், செய்தி அனுப்புக, ஆவாज் சேட்டை தொடங்கவும் அல்லது உள்நுழைவு செய்க.',
    unknown: 'நான் கமாண்டை புரியவில்லை, தயவு செய்து மீண்டும் முயற்சி செய்யவும்।',
  },
  ur: {
    home: 'میں آپ کو ہوم پیج پر لے جا رہا ہوں۔',
    chat: 'میں آپ کو چیٹ پیج پر لے جا رہا ہوں۔',
    dashboard: 'میں ڈیش بورڈ کھول رہا ہوں۔',
    login: 'میں لاگ ان پیج کھول رہا ہوں۔',
    register: 'میں رجسٹر پیج کھول رہا ہوں۔',
    budget: 'میں آپ کو بجٹ پیج پر لے جا رہا ہوں۔',
    business: 'میں کاروباری منصوبہ کار پیج کھول رہا ہوں۔',
    sendMessage: 'میں پیغام بھیج رہا ہوں۔',
    startVoice: 'میں آواز چیٹ شروع کر رہا ہوں۔',
    logout: 'میں آپ کو لاگ آؤٹ کر رہا ہوں۔',
    scrollDown: 'میں نیچے اسکرال کر رہا ہوں۔',
    scrollUp: 'میں اوپر اسکرال کر رہا ہوں۔',
    stopListening: 'آواز کنٹرول بند کر دیا گیا ہے۔',
    languageChanged: 'زبان کامیابی سے تبدیل کر دی گئی ہے۔',
    help: 'آپ کہہ سکتے ہیں گھر جائیں، چیٹ کھولیں، بجٹ کھولیں، کاروبار کھولیں، ڈیش بورڈ کھولیں، لاگ ان کھولیں، رجسٹر کھولیں، پیغام بھیجیں، آواز چیٹ شروع کریں یا لاگ آؤٹ کریں۔',
    unknown: 'میں نے حکم نہیں سمجھا، براہ کرم دوبارہ کوشش کریں۔',
  },
  gu: {
    home: 'હું તમને હોમ પૃષ્ઠ પર લઈ જઈ રહ્યો છું.',
    chat: 'હું તમને ચ્যાટ પૃષ્ઠ પર લઈ જઈ રહ્યો છું.',
    dashboard: 'હું ડેશબોર્ડ ખોલી રહ્યો છું.',
    login: 'હું લૉગિન પૃષ્ઠ ખોલી રહ્યો છું.',
    register: 'હું રજિસ્ટર પૃષ્ઠ ખોલી રહ્યો છું.',
    budget: 'હું તમને બજેટ પૃષ્ઠ પર લઈ જઈ રહ્યો છું.',
    business: 'હું બિઝનેસ પ્લાનર પૃષ્ઠ ખોલી રહ્યો છું.',
    sendMessage: 'હું સંદેશ મોકલી રહ્યો છું.',
    startVoice: 'હું વોઇસ ચેટ શરૂ કરી રહ્યો છું.',
    logout: 'હું તમને લૉગ આઉટ કરી રહ્યો છું.',
    scrollDown: 'હું નીચે સ્ક્રોલ કરી રહ્યો છું.',
    scrollUp: 'હું ઉપર સ્ક્રોલ કરી રહ્યો છું.',
    stopListening: 'વોઇસ નિયંત્રણ બંધ કરી દેવામાં આવ્યું છે.',
    languageChanged: 'ભાષા સફળતાપૂર્વક બદલી દીધી છે.',
    help: 'તમે કહી શકો છો હોમ જાઓ, ચ્યાટ ખોલો, બજેટ ખોલો, બિઝનેસ ખોલો, ડેશબોર્ડ ખોલો, લૉગિન ખોલો, રજીસ્ટર ખોલો, સંદેશ મોકલો, વોઇસ ચેટ શરૂ કરો અથવા લૉગ આઉટ કરો.',
    unknown: 'મે આદેશ સમજી શક્યો નહીં, કૃપયા ફરી પ્રયાસ કરો.',
  },
  kn: {
    home: 'ನಾನು ನಿಮ್ಮನ್ನು ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಕೊಂಡೊಯ್ದುಿದ್ದೇನೆ.',
    chat: 'ನಾನು ನಿಮ್ಮನ್ನು ಚ್ಯಾಟ್ ಪುಟಕ್ಕೆ ಕೊಂಡೊಯ್ದುಿದ್ದೇನೆ.',
    dashboard: 'ನಾನು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆದುಿದ್ದೇನೆ.',
    login: 'ನಾನು ಲಾಗಿನ್ ಪುಟ ತೆರೆದುಿದ್ದೇನೆ.',
    register: 'ನಾನು ನೋಂದಾಯಿಸಲು ಪುಟ ತೆರೆದುಿದ್ದೇನೆ.',
    budget: 'ನಾನು ನಿಮ್ಮನ್ನು ಬಜೆಟ್ ಪುಟಕ್ಕೆ ಕೊಂಡೊಯ್ದುಿದ್ದೇನೆ.',
    business: 'ನಾನು ವ್ಯವಹಾರ ಯೋಜಕ ಪುಟ ತೆರೆದುಿದ್ದೇನೆ.',
    sendMessage: 'ನಾನು ಸಂದೇಶ ಕಳುಹಿಸುತುಿದ್ದೇನೆ.',
    startVoice: 'ನಾನು ಧ್ವನಿ ಚ್ಯಾಟ್ ಪ್ರಾರಂಭಿಸುತುಿದ್ದೇನೆ.',
    logout: 'ನಾನು ನಿಮ್ಮನ್ನು ಲಾಗ್ ಔಟ್ ಮಾಡುತುಿದ್ದೇನೆ.',
    scrollDown: 'ನಾನು ಕೆಳಗೆ ಸ್ಕ್ರೋಲ್ ಮಾಡುತುಿದ್ದೇನೆ.',
    scrollUp: 'ನಾನು ಮೇಲಕ್ಕೆ ಸ್ಕ್ರೋಲ್ ಮಾಡುತುಿದ್ದೇನೆ.',
    stopListening: 'ವಾಯ್ಸ್ ನಿಯಂತ್ರಣ ಆಪ್ ಮಾಡಲಾಗಿದೆ.',
    languageChanged: 'ಭಾಷೆ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
    help: 'ನೀವು ಮುಖ್ಯಕ್ಕೆ ಹೋಗಿ, ಚ್ಯಾಟ್ ತೆರೆಯಿರಿ, ಬಜೆಟ್ ತೆರೆಯಿರಿ, ವ್ಯವಹಾರ ತೆರೆಯಿರಿ, ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ, ಲಾಗಿನ್ ತೆರೆಯಿರಿ, ನೋಂದಾಯಿಸುವಿಕೆ ತೆರೆಯಿರಿ, ಸಂದೇಶ ಕಳುಹಿಸಿ, ಧ್ವನಿ ಚ್ಯಾಟ್ ಪ್ರಾರಂಭಿಸಿ ಅಥವಾ ಲಾಗ್ ಔಟ್ ಮಾಡಿ.',
    unknown: 'ನಾನು ಆ ಆದೇಶವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಿಲ್ಲ, ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.',
  },
  od: {
    home: 'ମୁଁ ଆପଣକୁ ହୋମ ପୃଷ୍ଠାକୁ ନେଇ ଯାଉଛି।',
    chat: 'ମୁଁ ଆପଣକୁ ଚ୍ୟାଟ ପୃଷ୍ଠାକୁ ନେଇ ଯାଉଛି।',
    dashboard: 'ମୁଁ ଡାଶବୋର୍ଡ ଖୋଲୁଛି।',
    login: 'ମୁଁ ଲଗଇନ ପୃଷ୍ଠା ଖୋଲୁଛି।',
    register: 'ମୁଁ ରେଜିଷ୍ଟର ପୃଷ୍ଠା ଖୋଲୁଛି।',
    budget: 'ମୁଁ ଆପଣକୁ ବଜେଟ ପୃଷ୍ଠାକୁ ନେଇ ଯାଉଛି।',
    business: 'ମୁଁ ବ୍ୟବସାୟ ପରିକଳ୍ପନାକାରୀ ପୃଷ୍ଠା ଖୋଲୁଛି।',
    sendMessage: 'ମୁଁ ବାର୍ତ୍ତା ପଠାଉଛି।',
    startVoice: 'ମୁଁ ଭଏସ ଚ୍ୟାଟ ଶୁରୁ କରୁଛି।',
    logout: 'ମୁଁ ଆପଣକୁ ଲଗ ଆଉଟ କରୁଛି।',
    scrollDown: 'ମୁଁ ନିମ୍ନରେ ସ୍କ୍ରୋଲ କରୁଛି।',
    scrollUp: 'ମୁଁ ଉପରକୁ ସ୍କ୍ରୋଲ କରୁଛି।',
    stopListening: 'ଭଏସ ନିୟନ୍ତ୍ରଣ ବନ୍ଦ କରାଯାଇଛି।',
    languageChanged: 'ଭାଷା ସଫଳତାର ସହ ପରିବର୍ତ୍ତିତ ହୋଇଛି।',
    help: 'ଆପଣ ହୋମକୁ ଯାଇ, ଚ୍ୟାଟ ଖୋଲି, ବଜେଟ ଖୋଲି, ବ୍ୟବସାୟ ଖୋଲି, ଡାଶବୋର୍ଡ ଖୋଲି, ଲଗଇନ ଖୋଲି, ରେଜିଷ୍ଟର ଖୋଲି, ବାର୍ତ୍ତା ପଠାଇ, ଭଏସ ଚ୍ୟାଟ ଶୁରୁ କରି କିମ୍ବା ଲଗ ଆଉଟ କରି ପାରିବେ।',
    unknown: 'ମୁଁ ଆଦେଶ ବୁଝିପାରିଲି ନାହିଁ, ଦୟା କରି ପୁନରାବୃତ୍ତି କରନ୍ତୁ।',
  },
  ml: {
    home: 'ഞാൻ നിങ്ങളെ ഹോം പേജിലേക്ക് കൊണ്ടുപോകുകയാണ്.',
    chat: 'ഞാൻ നിങ്ങളെ ചാറ്റ് പേജിലേക്ക് കൊണ്ടുപോകുകയാണ്.',
    dashboard: 'ഞാൻ ഡാഷ്‌ബോർ‌ഡ് തുറക്കുകയാണ്.',
    login: 'ഞാൻ ലോഗിൻ പേജ് തുറക്കുകയാണ്.',
    register: 'ഞാൻ രജിസ്റ്റർ പേജ് തുറക്കുകയാണ്.',
    budget: 'ഞാൻ നിങ്ങളെ ബജറ്റ് പേജിലേക്ക് കൊണ്ടുപോകുകയാണ്.',
    business: 'ഞാൻ ബിസിനെസ് പ്ലാനർ പേജ് തുറക്കുകയാണ്.',
    sendMessage: 'ഞാൻ സന്ദേശം അയയ്‌ക്കുകയാണ്.',
    startVoice: 'ഞാൻ വോയ്‌സ് ചാറ്റ് ആരംഭിക്കുകയാണ്.',
    logout: 'ഞാൻ നിങ്ങളെ ലോഗ് ഔട്ട് ചെയ്യുകയാണ്.',
    scrollDown: 'ഞാൻ താഴേക്ക് സ്‌ക്രോൾ ചെയ്യുകയാണ്.',
    scrollUp: 'ഞാൻ മുകളിലേക്ക് സ്‌ക്രോൾ ചെയ്യുകയാണ്.',
    stopListening: 'വോയ്‌സ് നിയന്ത്രണം ഓഫ് ചെയ്യപ്പെട്ടു.',
    languageChanged: 'ഭാഷ വിജയകരമായി മാറ്റപ്പെട്ടു.',
    help: 'നിങ്ങൾ ഹോമിലേക്ക് പോകുക, ചാറ്റ് തുറക്കുക, ബജറ്റ് തുറക്കുക, ബിസിനെസ് തുറക്കുക, ഡാഷ്‌ബോർ‌ഡ് തുറക്കുക, ലോഗിൻ തുറക്കുക, രജിസ്റ്റർ തുറക്കുക, സന്ദേശം അയയ്‌ക്കുക, വോയ്‌സ് ചാറ്റ് ആരംഭിക്കുക അല്ലെങ്കിൽ ലോഗ് ഔട്ട് ചെയ്യുക.',
    unknown: 'ഞാൻ കമാൻഡ് മനസ്സിലാക്കിയില്ല, ദയവായി വീണ്ടും ശ്രമിക്കുക.',
  },
  pa: {
    home: 'ਮੈਂ ਤੁਹਾਨੂੰ ਹੋਮ ਪੰਨੇ ਉੱਤੇ ਲਿਆ ਰਿਹਾ ਹਾਂ।',
    chat: 'ਮੈਂ ਤੁਹਾਨੂੰ ਚੈਟ ਪੰਨੇ ਉੱਤੇ ਲਿਆ ਰਿਹਾ ਹਾਂ।',
    dashboard: 'ਮੈਂ ਡੈਸ਼ਬੋਰਡ ਖੋਲ ਰਿਹਾ ਹਾਂ।',
    login: 'ਮੈਂ ਲਾਗਇਨ ਪੰਨਾ ਖੋਲ ਰਿਹਾ ਹਾਂ।',
    register: 'ਮੈਂ ਰਜਿਸਟਰ ਪੰਨਾ ਖੋਲ ਰਿਹਾ ਹਾਂ।',
    budget: 'ਮੈਂ ਤੁਹਾਨੂੰ ਬਜਟ ਪੰਨੇ ਉੱਤੇ ਲਿਆ ਰਿਹਾ ਹਾਂ।',
    business: 'ਮੈਂ ਬਿਜ਼ਨਸ ਪਲੈਨਰ ਪੰਨਾ ਖੋਲ ਰਿਹਾ ਹਾਂ।',
    sendMessage: 'ਮੈਂ ਸੁਨੇਹਾ ਭੇਜ ਰਿਹਾ ਹਾਂ।',
    startVoice: 'ਮੈਂ ਵੌਇਸ ਚੈਟ ਸ਼ੁਰੂ ਕਰ ਰਿਹਾ ਹਾਂ।',
    logout: 'ਮੈਂ ਤੁਹਾਨੂੰ ਲਾਗ ਆਊਟ ਕਰ ਰਿਹਾ ਹਾਂ।',
    scrollDown: 'ਮੈਂ ਥੇ ਹੇਠਾਂ ਸਕ੍ਰੋਲ ਕਰ ਰਿਹਾ ਹਾਂ।',
    scrollUp: 'ਮੈਂ ਉੱਪਰ ਸਕ੍ਰੋਲ ਕਰ ਰਿਹਾ ਹਾਂ।',
    stopListening: 'ਵੌਇਸ ਕੰਟਰੋਲ ਬੰਦ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।',
    languageChanged: 'ਭਾਸ਼ਾ ਸਫਲਤਾਪੂਰਕ ਬਦਲੀ ਗਈ ਹੈ।',
    help: 'ਤੁਸੀਂ ਹੋਮ ਜਾਓ, ਚੈਟ ਖੋਲੋ, ਬਜਟ ਖੋਲੋ, ਬਿਜ਼ਨਸ ਖੋਲੋ, ਡੈਸ਼ਬੋਰਡ ਖੋਲੋ, ਲਾਗਇਨ ਖੋਲੋ, ਰਜਿਸਟਰ ਖੋਲੋ, ਸੁਨੇਹਾ ਭੇਜੋ, ਵੌਇਸ ਚੈਟ ਸ਼ੁਰੂ ਕਰੋ ਜਾਂ ਲਾਗ ਆਊਟ ਕਰੋ ਕਹਿ ਸਕਦੇ ਹੋ।',
    unknown: 'ਮੈਂ ਕਮਾਂਡ ਨੂੰ ਸਮਝਿਆ ਨਹੀਂ, ਦਯਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
  as: {
    home: 'মই আপোনাক হোম পৃষ্ঠালৈ লৈ যাব লাগিছো।',
    chat: 'মই আপোনাক চেট পৃষ্ঠালৈ লৈ যাব লাগিছো।',
    dashboard: 'মই ডাশবোর্ড খোলি আছো।',
    login: 'মই লগইন পৃষ্ঠা খোলি আছো।',
    register: 'মই ৰেজিস্টাৰ পৃষ্ঠা খোলি আছো।',
    budget: 'মই আপোনাক বাজেট পৃষ্ঠালৈ লৈ যাব লাগিছো।',
    business: 'মই ব্যবসা পরিকল্পক পৃষ্ঠা খোলি আছো।',
    sendMessage: 'মই বাৰ্তা পঠাই আছো।',
    startVoice: 'মই ভয়েস চেট আৰম্ভ কৰি আছো।',
    logout: 'মই আপোনাক লগ আউট কৰি আছো।',
    scrollDown: 'মই তলৈ স্ক্রল কৰি আছো।',
    scrollUp: 'মই ওপৰলৈ স্ক্রল কৰি আছো।',
    stopListening: 'ভয়েস নিয়ন্ত্রণ বন্ধ কৰি দিয়া হৈছে।',
    languageChanged: 'ভাষা সফলভাৱে সলনি কৰি দিয়া হৈছে।',
    help: 'আপুনি হোমলৈ যাওক, চেট খোলক, বাজেট খোলক, ব্যবসা খোলক, ডাশবোর্ড খোলক, লগইন খোলক, ৰেজিস্টাৰ খোলক, বাৰ্তা পঠাওক, ভয়েস চেট আৰম্ভ কৰক বা লগ আউট কৰক বুলি কব পাৰে।',
    unknown: 'মই কমান্ড বুজি নোপালো, অনুগ্রহ কৰি পুনৰ চেষ্টা কৰক।',
  },
  mai: {
    home: 'हम आपको होम पेज पर ल्यो रहल छी।',
    chat: 'हम आपको चैट पेज पर ल्यो रहल छी।',
    dashboard: 'हम डैशबोर्ड खोलि रहल छी।',
    login: 'हम लॉगिन पेज खोलि रहल छी।',
    register: 'हम रजिस्टर पेज खोलि रहल छी।',
    budget: 'हम आपको बजट पेज पर ल्यो रहल छी।',
    business: 'हम बिजनेस प्लानर पेज खोलि रहल छी।',
    sendMessage: 'हम संदेश पठा रहल छी।',
    startVoice: 'हम वॉयस चैट शुरु कर रहल छी।',
    logout: 'हम आपको साइन आउट कर रहल छी।',
    scrollDown: 'हम नीचे स्क्रोल कर रहल छी।',
    scrollUp: 'हम ऊपर स्क्रोल कर रहल छी।',
    stopListening: 'वॉयस कंट्रोल बंद कर देल गेल।',
    languageChanged: 'भाषा सफलतापूर्वक बदल देल गेल।',
    help: 'आप होम पर जाइ, चैट खोलि, बजट खोलि, बिजनेस खोलि, डैशबोर्ड खोलि, लॉगिन खोलि, रजिस्टर खोलि, संदेश भेज, वॉयस चैट शुरु कर, ऊपर या नीचे स्क्रोल कर, या साइन आउट कर सकैत छी।',
    unknown: 'हम आदेश समझि नहि सकलहु, कृपया फिर से प्रयास करू।',
  },
  kok: {
    home: 'हां आपकां घरांचे पानाक लगत आनतां।',
    chat: 'हां आपकां चैट पानाक लगत आनतां।',
    dashboard: 'हां डैशबोर्ड उकलवतां।',
    login: 'हां लॉगिन पाना उकलवतां।',
    register: 'हां रजिस्टर पाना उकलवतां।',
    budget: 'हां आपकां बजट पानाक लगत आनतां।',
    business: 'हां बिजनेस प्लानर पाना उकलवतां।',
    sendMessage: 'हां संदेश पटवतां।',
    startVoice: 'हां वॉयस चैट सुरु करतां।',
    logout: 'हां आपकां साइन आउट करतां।',
    scrollDown: 'हां तल्यान स्क्रोल करतां।',
    scrollUp: 'हां उपरान स्क्रोल करतां।',
    stopListening: 'वॉयस नियंत्रण बंद केलां।',
    languageChanged: 'भास सफलतायेन बदलां।',
    help: 'आप घराक लगत जा, चैट उक, बजट उक, बिजनेस उक, डैशबोर्ड उक, लॉगिन उक, रजिस्टर उक, संदेश भेज, वॉयस चैट सुरु कर, वर तल्लान स्क्रोल कर, वा साइन आउट कर हांव बोलपी।',
    unknown: 'हां आदेश समजिल नाहीं, कृपया फिरून कोसिश कर।',
  },
  ne: {
    home: 'मैले तपाईंलाई गृह पृष्ठमा ल्याउँदैछु।',
    chat: 'मैले तपाईंलाई च्याट पृष्ठमा ल्याउँदैछु।',
    dashboard: 'मैले ड्यासबोर्ड खोलिरहेको छु।',
    login: 'मैले लगइन पृष्ठ खोलिरहेको छु।',
    register: 'मैले दर्ता पृष्ठ खोलिरहेको छु।',
    budget: 'मैले तपाईंलाई बजेट पृष्ठमा ल्याउँदैछु।',
    business: 'मैले व्यापार योजनाकार पृष्ठ खोलिरहेको छु।',
    sendMessage: 'मैले सन्देश पठाउँदैछु।',
    startVoice: 'मैले आवाज च्याट सुरु गरिरहेको छु।',
    logout: 'मैले तपाईंलाई लग आउट गरिरहेको छु।',
    scrollDown: 'मैले तल स्क्रल गरिरहेको छु।',
    scrollUp: 'मैले माथि स्क्रल गरिरहेको छु।',
    stopListening: 'आवाज नियन्त्रण बन्द गरिएको छ।',
    languageChanged: 'भाषा सफलतापूर्वक परिवर्तन गरिएको छ।',
    help: 'तपाईं गृहमा जान, च्याट खोल, बजेट खोल, व्यापार खोल, ड्यासबोर्ड खोल, लगइन खोल, दर्ता खोल, सन्देश पठा, आवाज च्याट सुरु गर वा लग आउट गर भन्न सक्नु हुन्छ।',
    unknown: 'मैले आदेश बुझिन, कृपया फेरि प्रयास गर्नुहोस्।',
  },
  sd: {
    home: 'مان تہانيء گھر جي صفحي ڏان آھيان.',
    chat: 'مان تہانيء چيٽ صفحي ڏان آھيان.',
    dashboard: 'مان ڊيش بورڊ کولي رھيو آھيان.',
    login: 'مان لاگ ان صفحو کولي رھيو آھيان.',
    register: 'مان رجسٽر صفحو کولي رھيو آھيان.',
    budget: 'مان تہانيء بجيٽ صفحي ڏان آھيان.',
    business: 'مان ڪاروباري منصوبہ ساز صفحو کولي رھيو آھيان.',
    sendMessage: 'مان پيغام موڪلي رھيو آھيان.',
    startVoice: 'مان آواز چيٽ شروع ڪري رھيو آھيان.',
    logout: 'مان تہانيء لاگ آئوٽ ڪري رھيو آھيان.',
    scrollDown: 'مان هيٺ اسڪرول ڪري رھيو آھيان.',
    scrollUp: 'مان مٿي اسڪرول ڪري رھيو آھيان.',
    stopListening: 'آواز ڪنٽرول بند ڪيو ويو آھي.',
    languageChanged: 'ٻولي ڪاميابيء سان تبديل ڪيو ويو آھي.',
    help: 'توھان گھر وڃ, چيٽ کول, بجيٽ کول, ڪاروبار کول, ڊيش بورڊ کول, لاگ ان کول, رجسٽر کول, پيغام موڪل, آواز چيٽ شروع ڪر, يا لاگ آئوٽ ڪر کہي سگھو ٿو.',
    unknown: 'مان حڪم سمجھي نہ سڪيو, مھربانيء ڪري ٻيهر ڪوشش ڪريو.',
  },
  doi: {
    home: 'हूँ तुहाड़ को होम पेज पर लग्‍या रा हूँ।',
    chat: 'हूँ तुहाड़ को चैट पेज पर लग्‍या रा हूँ।',
    dashboard: 'हूँ डैशबोर्ड खोली रा हूँ।',
    login: 'हूँ लॉगिन पेज खोली रा हूँ।',
    register: 'हूँ रजिस्टर पेज खोली रा हूँ।',
    budget: 'हूँ तुहाड़ को बजट पेज पर लग्‍या रा हूँ।',
    business: 'हूँ बिजनेस प्लानर पेज खोली रा हूँ।',
    sendMessage: 'हूँ संदेश पठा रा हूँ।',
    startVoice: 'हूँ वॉयस चैट शुरु कर रा हूँ।',
    logout: 'हूँ तुहाड़ को साइन आउट कर रा हूँ।',
    scrollDown: 'हूँ नीचे स्क्रोल कर रा हूँ।',
    scrollUp: 'हूँ ऊपर स्क्रोल कर रा हूँ।',
    stopListening: 'वॉयस कंट्रोल बंद कर दिता गिता।',
    languageChanged: 'भाषा सफलतापूर्वक बदल दिती गिती।',
    help: 'तुस होम जा, चैट खोल, बजट खोल, बिजनेस खोल, डैशबोर्ड खोल, लॉगिन खोल, रजिस्टर खोल, संदेश भेज, वॉयस चैट शुरु कर, या साइन आउट कर सकदा ओ।',
    unknown: 'हूँ आदेश समझि नी सकिता, मेहरबानी कर के फिर से कोशिश कर।',
  },
  mni: {
    home: 'ইঙ্গল তোপোক হোম পেজে লমিং।',
    chat: 'ইঙ্গল তোপোক চেট পেজে লমিং।',
    dashboard: 'ইঙ্গল ড্যাশবোর্ড খোলসিং।',
    login: 'ইঙ্গল লগইন পেজ খোলসিং।',
    register: 'ইঙ্গল রেজিস্টার পেজ খোলসিং।',
    budget: 'ইঙ্গল তোপোক বাজেট পেজে লমিং।',
    business: 'ইঙ্গল বিজনেস প্ল্যানার পেজ খোলসিং।',
    sendMessage: 'ইঙ্গল মেসেজ পাঠাসিং।',
    startVoice: 'ইঙ্গল ভয়েস চেট শুরু করসিং।',
    logout: 'ইঙ্গল তোপোক লগ আউট করসিং।',
    scrollDown: 'ইঙ্গল নিচে স্ক্রোল করসিং।',
    scrollUp: 'ইঙ্গল উপরে স্ক্রোল করসিং।',
    stopListening: 'ভয়েस কন্ট্রোল বন্দ করোয়া।',
    languageChanged: 'লুয়েজ সফল থমজা।',
    help: 'তুই হোম জা, চেট খোল, বাজেট খোল, বিজনেস খোল, ড্যাশবোর্ড খোল, লগইন খোল, রেজিস্টার খোল, মেসেজ পাঠা, ভয়েস চেট শুরু কর, বা লগ আউট কর বলিপারে।',
    unknown: 'ইঙ্গল কমান্ড বুঝি না পারলে, মেহেরবানি কর्न् दुबारा कोशिश कर।',
  },
  brx: {
    home: 'हेबे आपखि होम पेजर पर लखै छे।',
    chat: 'हेबे आपखि चेट पेजर पर लखै छे।',
    dashboard: 'हेबे डैशबोर्ड खोल्खै छे।',
    login: 'हेबे लॉगिन पेज खोल्खै छे।',
    register: 'हेबे रजिस्टर पेज खोल्खै छे।',
    budget: 'हेबे आपखि बजट पेजर पर लखै छे।',
    business: 'हेबे बिजनेस प्लानर पेज खोल्खै छे।',
    sendMessage: 'हेबे संदेश पठा_खै छे।',
    startVoice: 'हेबे वॉयस चेट सुरु कर्खै छे।',
    logout: 'हेबे आपखि साइन आउट कर्खै छे।',
    scrollDown: 'हेबे न मर स्क्रोल कर्खै छे।',
    scrollUp: 'हेबे वरे स्क्रोल कर्खै छे।',
    stopListening: 'वॉयस नियंत्रण बन्द केेना।',
    languageChanged: 'भाषा सफलतापूर्वक बदल केना।',
    help: 'आप होमर जा, चेट खोल, बजट खोल, बिजनेस खोल, डैशबोर्ड खोल, लॉगिन खोल, रजिस्टर खोल, संदेश पठा, वॉयस चेট सुरू कर, या साइन आउट कर बोल पारे छु।',
    unknown: 'हेबे आदेश बुझि न पारलो, कृपया सांसे प्रयास कर।',
  },
}

export const speechTagByLanguage = {
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

export function buildVoiceResponse(key, spokenLanguage = 'hi') {
  const dictionary = responses[spokenLanguage] || responses.en
  return dictionary[key] || dictionary.unknown
}
