"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircleHeart,
  Plus,
  Send,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import {
  CHAT_PERSONAS,
  CHAT_TOPIC_CATEGORIES,
  getChatPersona,
} from "@/lib/chat-personas";
import { getNext23KstCountdown } from "@/lib/saju-engine";
import type {
  ChatMessage,
  ChatPersonaId,
  WalletProfile,
} from "@/lib/saju-types";

interface SajuChatDrawerProps {
  open: boolean;
  walletId: string;
  profile: WalletProfile;
  coins: number;
  freeChatTickets: number;
  followUpCredits?: number;
  initialContext?: string;
  onClose: () => void;
  onConsumeForChat: () => boolean;
  onOpenChargeModal: () => void;
}

type ChatStep = "select-model" | "select-topic" | "chat";

let messageSeq = 0;

function createChatMessage(
  role: "user" | "assistant",
  content: string,
  suggestions?: string[]
): ChatMessage {
  messageSeq += 1;
  return {
    id: `${role === "user" ? "u" : "a"}-${Date.now()}-${messageSeq}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...(suggestions ? { suggestions } : {}),
  };
}

function renderFormattedContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-extrabold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function getStorageKey(walletId: string, personaId: ChatPersonaId): string {
  return `sajufact_chat_${walletId}_${personaId}`;
}

function loadPersonaMessages(
  walletId: string,
  personaId: ChatPersonaId
): ChatMessage[] {
  try {
    const raw = localStorage.getItem(getStorageKey(walletId, personaId));
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // 레거시 단일 키(fact 페르소나 호환)
    if (personaId === "fact") {
      const legacy = localStorage.getItem(`sajufact_chat_${walletId}`);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy) as ChatMessage[];
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          return parsedLegacy;
        }
      }
    }
  } catch {
    // ignore storage parse errors
  }
  return [];
}

export function SajuChatDrawer({
  open,
  walletId,
  profile,
  coins,
  freeChatTickets,
  followUpCredits = 0,
  initialContext,
  onClose,
  onConsumeForChat,
  onOpenChargeModal,
}: SajuChatDrawerProps) {
  const [step, setStep] = useState<ChatStep>("select-model");
  const [selectedPersonaId, setSelectedPersonaId] =
    useState<ChatPersonaId>("fact");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>("overall");
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [customDetail, setCustomDetail] = useState("");
  const [personaHistoryMap, setPersonaHistoryMap] = useState<
    Partial<Record<ChatPersonaId, boolean>>
  >({});

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingExchange, setPendingExchange] = useState<{
    text: string;
    clearInput: boolean;
    overrides?: {
      personaId?: ChatPersonaId;
      topicCategory?: string;
      topicDetail?: string;
      baseMessages?: ChatMessage[];
    };
  } | null>(null);
  const [countdownLabel, setCountdownLabel] = useState("매일 밤 11시 충전");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activePersona = getChatPersona(selectedPersonaId);
  const activeCategory =
    CHAT_TOPIC_CATEGORIES.find((c) => c.id === selectedCategoryId) ??
    CHAT_TOPIC_CATEGORIES[0];

  const refreshPersonaHistoryFlags = () => {
    const flags: Partial<Record<ChatPersonaId, boolean>> = {};
    for (const p of CHAT_PERSONAS) {
      const saved = loadPersonaMessages(walletId, p.id);
      flags[p.id] = saved.length > 1;
    }
    setPersonaHistoryMap(flags);
  };

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setCountdownLabel(getNext23KstCountdown());
      setStep("select-model");
      setSelectedSubTopics([]);
      setCustomDetail(initialContext ? initialContext : "");
      setInput("");
      setPendingExchange(null);
      refreshPersonaHistoryFlags();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, walletId, initialContext]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      const saved = loadPersonaMessages(walletId, selectedPersonaId);
      if (saved.length > 0) {
        setMessages(saved);
      } else {
        const persona = getChatPersona(selectedPersonaId);
        setMessages([
          {
            id: `welcome-${selectedPersonaId}`,
            role: "assistant",
            content: persona.welcomeTemplate(profile.name, profile.birthDate),
            createdAt: new Date().toISOString(),
            suggestions: persona.defaultSuggestions,
          },
        ]);
      }
    });
  }, [open, walletId, selectedPersonaId, profile.name, profile.birthDate]);

  useEffect(() => {
    if (step === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending, step]);

  if (!open) return null;

  const persistMessages = (
    personaId: ChatPersonaId,
    next: ChatMessage[]
  ) => {
    try {
      localStorage.setItem(
        getStorageKey(walletId, personaId),
        JSON.stringify(next.slice(-30))
      );
      setPersonaHistoryMap((prev) => ({
        ...prev,
        [personaId]: next.length > 1,
      }));
    } catch {
      // ignore quota
    }
  };

  const handleToggleSubTopic = (sub: string) => {
    setSelectedSubTopics((prev) => {
      if (prev.includes(sub)) {
        return prev.filter((item) => item !== sub);
      }
      if (prev.length >= 2) {
        return [...prev.slice(1), sub];
      }
      return [...prev, sub];
    });
  };

  const handleSend = async (
    textToSend?: string,
    overrides?: {
      personaId?: ChatPersonaId;
      topicCategory?: string;
      topicDetail?: string;
      baseMessages?: ChatMessage[];
    },
    skipExchangeConfirm = false
  ) => {
    const clean = (textToSend ?? input).trim();
    if (!clean || isSending) return;

    if (
      !skipExchangeConfirm &&
      followUpCredits <= 0 &&
      freeChatTickets <= 0 &&
      coins > 0
    ) {
      setPendingExchange({
        text: clean,
        clearInput: !textToSend,
        overrides,
      });
      return;
    }

    const ok = onConsumeForChat();
    if (!ok) {
      onOpenChargeModal();
      return;
    }

    const targetPersonaId = overrides?.personaId ?? selectedPersonaId;
    const targetPersona = getChatPersona(targetPersonaId);
    const currentMsgs = overrides?.baseMessages ?? messages;

    const userMsg = createChatMessage("user", clean);
    const nextHistory = [...currentMsgs, userMsg];
    setMessages(nextHistory);
    persistMessages(targetPersonaId, nextHistory);
    if (!textToSend) setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/saju/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: nextHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          profile,
          reportContext: initialContext,
          personaId: targetPersonaId,
          topicCategory: overrides?.topicCategory ?? activeCategory.label,
          topicDetail: overrides?.topicDetail ?? selectedSubTopics.join(", "),
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        suggestions?: string[];
        error?: string;
      };
      const assistantMsg = createChatMessage(
        "assistant",
        data.reply ||
          data.error ||
          "잠시 기운을 읽는 데 시간이 걸렸어요. 다시 한 번 질문해 주세요!",
        data.suggestions ?? targetPersona.defaultSuggestions
      );
      const updated = [...nextHistory, assistantMsg];
      setMessages(updated);
      persistMessages(targetPersonaId, updated);
    } catch {
      const errMsg = createChatMessage(
        "assistant",
        "네트워크 연결이 잠깐 흔들렸어요. 다시 질문 버튼을 눌러주세요!"
      );
      const updated = [...nextHistory, errMsg];
      setMessages(updated);
      persistMessages(targetPersonaId, updated);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartTopicConsultation = () => {
    const subPart =
      selectedSubTopics.length > 0
        ? `세부 고민은 [${selectedSubTopics.join(", ")}]이에요.`
        : "";
    const detailPart = customDetail.trim();
    const promptLines = [
      `[${activeCategory.emoji} ${activeCategory.label}]`,
      subPart,
      detailPart
        ? `내 상황: ${detailPart}`
        : `${activeCategory.label} 전반에 대해 내 사주 원국과 2027년 흐름 기준으로 자세히 풀어주세요.`,
    ]
      .filter(Boolean)
      .join(" ");

    const baseMsgs = loadPersonaMessages(walletId, selectedPersonaId);
    const startingHistory =
      baseMsgs.length > 0
        ? baseMsgs
        : [
            {
              id: `welcome-${selectedPersonaId}`,
              role: "assistant" as const,
              content: activePersona.welcomeTemplate(
                profile.name,
                profile.birthDate
              ),
              createdAt: new Date().toISOString(),
              suggestions: activePersona.defaultSuggestions,
            },
          ];

    setMessages(startingHistory);
    setStep("chat");
    void handleSend(promptLines, {
      personaId: selectedPersonaId,
      topicCategory: activeCategory.label,
      topicDetail: [selectedSubTopics.join(", "), detailPart]
        .filter(Boolean)
        .join(" / "),
      baseMessages: startingHistory,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-violet-950/35 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[540px] h-[92vh] sm:h-[85vh] rounded-t-[30px] sm:rounded-[30px] bg-gradient-to-b from-[#fdf6f0] via-[#fdf4fc] to-[#fff9f3] flex flex-col overflow-hidden shadow-2xl border border-white"
      >
        {/* 상단 헤더 */}
        <div className="bg-white/95 border-b border-violet-100 px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {step === "select-topic" && (
              <button
                type="button"
                onClick={() => setStep("select-model")}
                aria-label="상담사 다시 선택"
                className="p-1.5 rounded-full hover:bg-violet-100/70 text-slate-600 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <img
              src={
                step === "select-model"
                  ? "/mascot/dalto-party.jpg"
                  : activePersona.avatar
              }
              alt={activePersona.name}
              className="w-10 h-10 rounded-2xl object-cover border-2 border-orange-200 shrink-0 shadow-xs"
            />
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 break-keep">
                  {step === "select-model"
                    ? "🐇 달토 사주 수다방"
                    : activePersona.name}
                </h3>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold whitespace-nowrap ${
                    step === "select-model"
                      ? "bg-violet-100 text-violet-700 border-violet-200"
                      : activePersona.pillClass
                  }`}
                >
                  {step === "select-model"
                    ? "상담사 선택"
                    : activePersona.badge}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-snug break-keep">
                {profile.name}님 ({profile.birthDate}) · {countdownLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {step === "chat" && (
              <button
                type="button"
                onClick={() => setStep("select-model")}
                className="rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 text-[10.5px] font-extrabold text-violet-700 whitespace-nowrap transition"
              >
                상담사·주제
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="p-1.5 rounded-full hover:bg-violet-100/70 text-slate-500 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 잔여 수다권 / 당근 / 꼬리질문 바 */}
        <div className="bg-gradient-to-r from-orange-50/90 via-rose-50/70 to-violet-50/90 border-b border-violet-100 px-4 py-2 flex items-center justify-between gap-2 text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {followUpCredits > 0 && (
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                💬 꼬리질문 {followUpCredits}개
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-extrabold text-rose-700 bg-white px-2.5 py-1 rounded-full border border-rose-200/80 shadow-2xs">
              <Ticket className="w-3 h-3" />
              무료수다권 {freeChatTickets}장
            </span>
            <span className="inline-flex items-center gap-1 font-extrabold text-orange-800 bg-white px-2.5 py-1 rounded-full border border-orange-200/80 shadow-2xs">
              🥕 당근 {coins}개
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenChargeModal}
            className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white px-2.5 py-1 font-extrabold hover:brightness-105 transition whitespace-nowrap shadow-xs shrink-0"
          >
            <Plus className="w-3 h-3" />
            당근 충전
          </button>
        </div>

        {/* 당근 1개 = 꼬리질문 3개 안내 칸 */}
        <div className="bg-white/90 border-b border-violet-100/80 px-4 py-1.5 text-[11px] font-bold text-[#4c3787] flex items-center justify-center gap-1.5 text-center break-keep shrink-0">
          <span>🥕 당근 1개(또는 무료수다권 1장)</span>
          <span className="text-slate-400">=</span>
          <span className="text-rose-600 font-extrabold">
            꼬리질문 3개
          </span>
        </div>

        {/* STEP 1: 수다 상담사 모델 선택 */}
        {step === "select-model" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-left">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-violet-200 px-2.5 py-0.5 text-[10px] font-extrabold text-violet-700">
                STEP 1 / 2 · 상담 스타일 선택
              </span>
              <h4 className="font-serif text-base sm:text-lg font-black text-slate-900 break-keep text-balance">
                오늘 어떤 달토 상담사와 수다를 나눠볼까요?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed break-keep">
                선택한 상담사의 톤앤매너로 {profile.name}님의 만세력 원국을 풀어드려요.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHAT_PERSONAS.map((persona) => {
                const hasPrev = Boolean(personaHistoryMap[persona.id]);
                const isSelected = selectedPersonaId === persona.id;
                return (
                  <motion.button
                    key={persona.id}
                    type="button"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedPersonaId(persona.id);
                      setStep("select-topic");
                    }}
                    className={`rounded-3xl p-4 bg-white/95 border-2 text-left transition shadow-xs hover:shadow-md flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "border-violet-400 ring-2 ring-violet-100"
                        : "border-white hover:border-violet-200"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={persona.avatar}
                            alt={persona.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                          />
                          <div className="space-y-0.5">
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold ${persona.pillClass}`}
                            >
                              {persona.badge}
                            </span>
                            <p className="text-sm font-black text-slate-900 leading-snug break-keep">
                              {persona.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs font-extrabold text-[#4c3787] leading-snug break-keep">
                        “{persona.tagline}”
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed break-keep">
                        {persona.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      {hasPrev ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-emerald-600">
                          <MessageCircleHeart className="w-3.5 h-3.5" />
                          이전 대화 있음
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-bold text-slate-400">
                          만세력 정밀 연동
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${persona.accentGradient} text-white px-2.5 py-1 text-[10.5px] font-black shadow-2xs`}
                      >
                        선택하기
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: 포괄 주제 → 세부 고민 선택 / 직접 입력 */}
        {step === "select-topic" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-left">
            <div className="rounded-2xl bg-white/95 border border-violet-100 p-3 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={activePersona.avatar}
                  alt={activePersona.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-violet-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-violet-600 block">
                    선택한 상담사 · {activePersona.badge}
                  </span>
                  <p className="text-xs sm:text-sm font-black text-slate-900 break-keep">
                    {activePersona.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("select-model")}
                className="shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[10.5px] font-bold text-slate-600 transition"
              >
                변경
              </button>
            </div>

            {/* A. 포괄적인 상담 분야 선택 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900">
                  1. 어떤 큰 주제가 궁금하신가요? (포괄 선택)
                </span>
                <span className="text-[10.5px] font-bold text-violet-600">
                  STEP 2 / 2
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CHAT_TOPIC_CATEGORIES.map((cat) => {
                  const active = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSelectedSubTopics([]);
                      }}
                      className={`rounded-2xl p-2.5 border text-left transition space-y-0.5 ${
                        active
                          ? "bg-[#fff8ec] border-amber-400 shadow-xs ring-1 ring-amber-200"
                          : "bg-white/90 border-slate-200/80 hover:border-violet-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-base">{cat.emoji}</span>
                        {active && (
                          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-black text-slate-900 leading-snug break-keep">
                        {cat.shortLabel}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-snug break-keep">
                        {cat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. 세부 고민 칩 선택 */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">
                2. 세부 고민을 골라보세요{" "}
                <span className="font-bold text-slate-400">(최대 2개 · 선택)</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeCategory.subTopics.map((sub) => {
                  const picked = selectedSubTopics.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleToggleSubTopic(sub)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold border transition break-keep ${
                        picked
                          ? "bg-gradient-to-r from-[#5c489b] to-[#d96b8a] text-white border-transparent shadow-2xs"
                          : "bg-white text-slate-700 border-violet-200/80 hover:bg-violet-50"
                      }`}
                    >
                      {picked ? `✓ ${sub}` : sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. 세부 상황 직접 입력 */}
            <div className="space-y-1.5">
              <label
                htmlFor="saju-chat-custom-detail"
                className="text-xs font-black text-slate-900 block"
              >
                3. 내 상황을 직접 적어주시면 더 정확해요{" "}
                <span className="font-bold text-slate-400">(선택)</span>
              </label>
              <textarea
                id="saju-chat-custom-detail"
                rows={3}
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                placeholder="예: 3년 다닌 회사를 4월에 퇴사하고 이직을 준비 중인데, 상반기에 옮기는 게 좋을지 아니면 가을까지 버티는 게 좋을지 궁금해요."
                className="w-full rounded-2xl bg-white border border-violet-200/90 px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-slate-900 leading-relaxed outline-none focus:border-violet-400 resize-none"
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleStartTopicConsultation}
                className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${activePersona.accentGradient} hover:brightness-105 text-white text-xs sm:text-sm font-black shadow-lg flex items-center justify-center gap-1.5 transition`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {activePersona.shortName}에게 상담 시작하기 (
                  {followUpCredits > 0
                    ? `꼬리질문 ${followUpCredits}개 남음`
                    : freeChatTickets > 0
                    ? "무료수다권 1장 · 3회 질문"
                    : coins > 0
                    ? "당근 1개 · 3회 질문"
                    : "당근 충전"}
                  )
                </span>
              </button>

              {personaHistoryMap[selectedPersonaId] && (
                <button
                  type="button"
                  onClick={() => {
                    const saved = loadPersonaMessages(walletId, selectedPersonaId);
                    if (saved.length > 0) setMessages(saved);
                    setStep("chat");
                  }}
                  className="w-full py-2.5 rounded-2xl bg-white hover:bg-violet-50 border border-violet-200 text-xs font-extrabold text-[#4c3787] transition"
                >
                  이전 대화 이어보기 (무료)
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: 실시간 사주 수다 채팅 */}
        {step === "chat" && (
          <>
            {/* 메시지 리스트 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    } gap-1.5`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[88%] ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isUser && (
                        <img
                          src={activePersona.avatar}
                          alt={activePersona.shortName}
                          className="w-7 h-7 rounded-2xl object-cover border border-orange-200 shrink-0"
                        />
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-keep shadow-xs ${
                          isUser
                            ? "bg-gradient-to-br from-[#6248a8] to-[#c96a8b] text-white rounded-br-sm"
                            : "bg-white/95 text-slate-800 border border-violet-100 rounded-bl-sm"
                        }`}
                      >
                        {isUser ? msg.content : renderFormattedContent(msg.content)}
                      </div>
                    </div>

                    {!isUser &&
                      msg.suggestions &&
                      msg.suggestions.length > 0 && (
                        <div className="pl-9 flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => void handleSend(sug)}
                              className="rounded-full bg-white hover:bg-orange-50 border border-orange-200/90 px-2.5 py-1 text-[11px] font-bold text-slate-800 text-left break-keep transition flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-violet-700 font-semibold pl-1">
                  <img
                    src={activePersona.avatar}
                    alt={activePersona.shortName}
                    className="w-7 h-7 rounded-xl object-cover animate-bounce border border-violet-200"
                  />
                  <span>
                    {activePersona.shortName}가 {profile.name}님 원국을 살피는 중... 🐇
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* 입력창 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="bg-white/95 border-t border-violet-100 p-3 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  followUpCredits > 0
                    ? `꼬리질문 ${followUpCredits}개 남음 · 더 구체적으로 물어보세요`
                    : freeChatTickets > 0
                    ? `무료수다권 1장(꼬리질문 3개) · ${activePersona.shortName}에게 질문하기`
                    : coins > 0
                    ? `당근 1개(꼬리질문 3개) · ${activePersona.shortName}에게 질문하기`
                    : "무료수다권 또는 당근을 충전하고 물어보세요"
                }
                className="flex-1 rounded-2xl bg-[#fdf6f0] border border-violet-100 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="h-10 px-4 rounded-2xl bg-gradient-to-r from-[#5c489b] to-[#d96b8a] hover:brightness-105 text-white text-xs font-extrabold flex items-center gap-1 shrink-0 disabled:opacity-50 transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                질문
              </button>
            </form>
          </>
        )}

        {/* 꼬리질문 0개일 때 당근 1개 → 꼬리질문 3개 교환 안내 팝업 */}
        {pendingExchange && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[340px] rounded-3xl bg-white p-5 shadow-2xl border border-orange-100 space-y-4 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl">
                🥕
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-black text-slate-900 break-keep text-balance">
                  당근 1개로 꼬리질문 3개 교환하기
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed break-keep">
                  꼬리질문이 0개예요.{" "}
                  <strong className="text-orange-600">당근 1개</strong>를 사용해{" "}
                  <strong className="text-rose-600">꼬리질문 3개</strong>로 교환하고
                  이번 질문(1개 차감)을 바로 보낼까요?
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff8f1] border border-orange-200/70 px-3 py-2 text-[11px] font-extrabold text-orange-900">
                보유 당근 {coins}개 → {Math.max(0, coins - 1)}개 · 질문 후 꼬리질문 2개 남음
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPendingExchange(null)}
                  className="py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-slate-600 transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = pendingExchange;
                    setPendingExchange(null);
                    if (next.clearInput) setInput("");
                    void handleSend(next.text, next.overrides, true);
                  }}
                  className="py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:brightness-105 text-white text-xs font-black shadow-md transition"
                >
                  교환하고 질문하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
