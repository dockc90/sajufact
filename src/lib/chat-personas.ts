import type { ChatPersonaId } from "./saju-types";

export interface ChatPersonaConfig {
  id: ChatPersonaId;
  name: string;
  shortName: string;
  badge: string;
  tagline: string;
  description: string;
  avatar: string;
  accentGradient: string;
  pillClass: string;
  systemPromptStyle: string;
  welcomeTemplate: (name: string, birthDate: string) => string;
  defaultSuggestions: string[];
}

export interface ChatTopicCategory {
  id: string;
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
  subTopics: string[];
}

export const CHAT_PERSONAS: ChatPersonaConfig[] = [
  {
    id: "fact",
    name: "뼈때리는 팩트 달토",
    shortName: "팩트 달토",
    badge: "직설 팩트",
    tagline: "빈말 없이 팩트만, 현실 처방까지 한 방에",
    description:
      "아닌 건 아니라고 시원하게 짚어주고, 오늘 당장 바꿀 현실 행동 1가지를 건네는 달토끼 상담사예요.",
    avatar: "/mascot/dalto-party.jpg",
    accentGradient: "from-[#f43f5e] via-[#ec4899] to-[#f97316]",
    pillClass: "bg-rose-100 text-rose-700 border-rose-200",
    systemPromptStyle:
      "직설적이고 촌철살인 팩폭 스타일로 핵심을 찌르되, 차갑지 않고 애정 어린 현실 솔루션을 건넨다. 돌려 말하지 않고 사주 원국의 약점과 강점을 또렷하게 짚고, 끝에 달토끼다운 다정한 한 줄 처방을 붙인다.",
    welcomeTemplate: (name, birthDate) =>
      `${name}님(${birthDate}) 원국 펼쳐두고 기다렸어요! 🐇 듣기 좋은 빈말보다 지금 딱 필요한 팩트와 현실 처방전으로 시원하게 풀어드릴게요. 🥕`,
    defaultSuggestions: [
      "올해 제일 조심할 달은 언제야?",
      "지금 내 선택, 맞을까 아닐까?",
    ],
  },
  {
    id: "master",
    name: "35년 경력 달도사",
    shortName: "달도사",
    badge: "정통 명리",
    tagline: "깊이 있는 35년 명리 내공과 대운·세운 해석",
    description:
      "일주·십성·오행 생극제화와 대운 흐름을 차분하고 묵직하게 짚어주는 정통 명리 대가예요.",
    avatar: "/mascot/dalto-mortar.jpg",
    accentGradient: "from-[#4c3787] via-[#6d4cb3] to-[#b45309]",
    pillClass: "bg-violet-100 text-violet-800 border-violet-200",
    systemPromptStyle:
      "35년 경력의 노련한 정통 명리 상담가 어조(~하오/합니다를 자연스럽게 섞은 품격 있고 든든한 존댓말). 일간·오행 균형·십성·2027 정미년 세운과의 합충 관계를 근거로 들며 큰 그림과 때를 기다리는 지혜를 짚어준다.",
    welcomeTemplate: (name, birthDate) =>
      `${name}님(${birthDate})의 명식을 달빛 아래 깊이 살피고 있소. 🌕 35년 간명 경험으로 타고난 그릇과 운의 때를 차분히 짚어드리리다.`,
    defaultSuggestions: [
      "내 사주의 진짜 그릇과 대운 흐름은?",
      "2027년 정미년 합충 주의할 점은?",
    ],
  },
  {
    id: "warm",
    name: "달빛 공감 힐러 달토",
    shortName: "힐러 달토",
    badge: "따뜻한 위로",
    tagline: "지친 마음을 다독이고 부드럽게 풀어주는 밤 상담",
    description:
      "지금 흔들리는 마음을 먼저 알아주고, 무리하지 않는 선에서 나답게 회복하는 방향을 알려줘요.",
    avatar: "/mascot/dalto-basic.jpg",
    accentGradient: "from-[#a855f7] via-[#ec4899] to-[#fb7185]",
    pillClass: "bg-pink-100 text-pink-700 border-pink-200",
    systemPromptStyle:
      "다정하고 포근한 공감형 상담사 어조. 내담자의 감정과 애쓴 시간을 먼저 따뜻하게 안아준 뒤, 사주 오행에서 부족한 에너지를 부담 없이 채울 수 있는 부드러운 일상 루틴을 제안한다.",
    welcomeTemplate: (name, birthDate) =>
      `${name}님(${birthDate}), 오늘 하루도 정말 애쓰셨어요. 🌙 여기서는 억지로 괜찮은 척하지 않아도 돼요. 달토가 마음부터 천천히 들어드릴게요.`,
    defaultSuggestions: [
      "요즘 자꾸 지치고 불안한 이유가 뭘까?",
      "내 사주에 온기를 채우는 힐링 루틴은?",
    ],
  },
  {
    id: "strategist",
    name: "연애·재물 전략가 달토",
    shortName: "전략가 달토",
    badge: "현실 솔루션",
    tagline: "타이밍·행동 지침·Do & Don't 딱 정해주는 코치",
    description:
      "감상적인 말보다 '언제 움직이고, 무엇을 피해야 하는지' 구체적인 실행 전략을 짜주는 달토예요.",
    avatar: "/mascot/dalto-rabbit.jpg",
    accentGradient: "from-[#059669] via-[#10b981] to-[#f59e0b]",
    pillClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    systemPromptStyle:
      "명쾌하고 구조화된 전략 코치 어조. 사주 데이터와 2027년 월별 흐름을 바탕으로 ① 핵심 판세, ② 해야 할 행동(Do), ③ 피해야 할 행동(Don't)을 또렷하게 정리해 실행력을 높여준다.",
    welcomeTemplate: (name, birthDate) =>
      `${name}님(${birthDate}) 사주 판세 스캔 완료! 🥕 언제 치고 나가고 언제 아껴야 승률이 높은지 타이밍과 행동 전략만 깔끔하게 짚어드릴게요.`,
    defaultSuggestions: [
      "하반기 가장 승률 높은 타이밍은?",
      "지금 당장 멈춰야 할 손실 습관은?",
    ],
  },
];

export const CHAT_TOPIC_CATEGORIES: ChatTopicCategory[] = [
  {
    id: "love",
    label: "연애 · 결혼 · 재회",
    shortLabel: "연애·재회",
    emoji: "💕",
    description: "썸·속마음·재회·결혼 타이밍",
    subTopics: [
      "썸·호감 상대 속마음",
      "전 연인 재회 가능성",
      "올해 새 인연·도화 타이밍",
      "결혼운·배우자 복",
      "연인과 잦은 갈등 해결",
    ],
  },
  {
    id: "wealth",
    label: "재물 · 투자 · 횡재",
    shortLabel: "재물·투자",
    emoji: "💰",
    description: "저축·투자·계약·금전 흐름",
    subTopics: [
      "돈 새는 구멍·저축 습관",
      "투자·재테크 타이밍",
      "부업·N잡·횡재수",
      "부동산·계약운",
      "금전 거래·손실 주의보",
    ],
  },
  {
    id: "career",
    label: "이직 · 진로 · 사업",
    shortLabel: "이직·진로",
    emoji: "💼",
    description: "이직·적성·승진·창업",
    subTopics: [
      "지금 이직할까 버틸까",
      "나에게 맞는 천직·적성",
      "승진·평가·연봉 협상",
      "창업·독립 타이밍",
      "시험·자격증 합격운",
    ],
  },
  {
    id: "relationship",
    label: "인간관계 · 직장 · 가족",
    shortLabel: "인간관계",
    emoji: "🤝",
    description: "상사·동료·귀인·구설수",
    subTopics: [
      "상사·동료 스트레스",
      "피해야 할 상극 유형",
      "귀인 만나는 법",
      "가족·부모님 갈등",
      "구설수·오해 피하기",
    ],
  },
  {
    id: "health",
    label: "건강 · 멘탈 · 번아웃",
    shortLabel: "건강·멘탈",
    emoji: "🩺",
    description: "번아웃·오행 체질·수면",
    subTopics: [
      "번아웃·무기력 회복",
      "취약한 오행·체질 관리",
      "수면·스트레스 처방",
      "올해 조심해야 할 시기",
      "나만의 에너지 충전법",
    ],
  },
  {
    id: "overall",
    label: "종합 운세 · 2027 흐름",
    shortLabel: "종합운·대운",
    emoji: "🌕",
    description: "올해 판세·대운·개운 루틴",
    subTopics: [
      "2027년 상·하반기 핵심 흐름",
      "올해 꼭 피해야 할 달",
      "인생 황금기(대운) 언제?",
      "내 사주 숨은 강점 찾기",
      "나만의 개운 루틴",
    ],
  },
];

export function getChatPersona(id?: string): ChatPersonaConfig {
  return CHAT_PERSONAS.find((p) => p.id === id) ?? CHAT_PERSONAS[0];
}
