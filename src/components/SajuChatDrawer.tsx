"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send, Sparkles, Ticket, X } from "lucide-react";
import { getNext23KstCountdown } from "@/lib/saju-engine";
import type { ChatMessage, WalletProfile } from "@/lib/saju-types";

interface SajuChatDrawerProps {
  open: boolean;
  walletId: string;
  profile: WalletProfile;
  coins: number;
  freeChatTickets: number;
  initialContext?: string;
  onClose: () => void;
  onConsumeForChat: () => boolean; // returns true if ticket/coin was consumed, false if empty (opens charge modal)
  onOpenChargeModal: () => void;
}

const STARTER_PROMPTS = [
  "올해 내 연애·결혼운 언제쯤 열릴까?",
  "지금 이직할까 버틸까? 나한테 맞는 돈 버는 길은?",
  "내 사주에서 제일 조심해야 할 인간관계 유형은?",
  "2027년에 꼭 피해야 할 달이랑 액땜 방법 알려줘",
];

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

export function SajuChatDrawer({
  open,
  walletId,
  profile,
  coins,
  freeChatTickets,
  initialContext,
  onClose,
  onConsumeForChat,
  onOpenChargeModal,
}: SajuChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState("매일 밤 11시 충전");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setCountdownLabel(getNext23KstCountdown());
      try {
        const raw = localStorage.getItem(`sajufact_chat_${walletId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as ChatMessage[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch {
        // ignore storage parse errors
      }
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `${profile.name}님 어서 와요! 🐇 당근 1개(또는 무료수다권)만 주시면 달에서 내려다본 ${profile.name}님(${profile.birthDate}) 원국 그대로 뼈 때리는 채찍과 따뜻한 처방전을 아낌없이 드릴게요. 궁금한 고민 뭐든 물어보세요! 🥕✨`,
          createdAt: new Date().toISOString(),
          suggestions: [STARTER_PROMPTS[0], STARTER_PROMPTS[1]],
        },
      ]);
    });
  }, [open, walletId, profile.name, profile.birthDate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  if (!open) return null;

  const persistMessages = (next: ChatMessage[]) => {
    try {
      localStorage.setItem(
        `sajufact_chat_${walletId}`,
        JSON.stringify(next.slice(-30))
      );
    } catch {
      // ignore quota
    }
  };

  const handleSend = async (textToSend?: string) => {
    const clean = (textToSend ?? input).trim();
    if (!clean || isSending) return;

    const ok = onConsumeForChat();
    if (!ok) {
      onOpenChargeModal();
      return;
    }

    const userMsg = createChatMessage("user", clean);
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    persistMessages(nextHistory);
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
        data.suggestions
      );
      const updated = [...nextHistory, assistantMsg];
      setMessages(updated);
      persistMessages(updated);
    } catch {
      const errMsg = createChatMessage(
        "assistant",
        "네트워크 연결이 잠깐 흔들렸어요. 다시 질문 버튼을 눌러주세요!"
      );
      const updated = [...nextHistory, errMsg];
      setMessages(updated);
      persistMessages(updated);
    } finally {
      setIsSending(false);
    }
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
        className="w-full max-w-[520px] h-[90vh] sm:h-[82vh] rounded-t-[30px] sm:rounded-[30px] bg-gradient-to-b from-[#fdf6f0] via-[#fdf4fc] to-[#fff9f3] flex flex-col overflow-hidden shadow-2xl border border-white"
      >
        {/* 상단 헤더 */}
        <div className="bg-white/90 border-b border-violet-100 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/mascot/dalto-party.jpg"
              alt="달토끼 달토"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-orange-200 shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 truncate">
                  🐇 달토의 사주 수다방
                </h3>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9.5px] font-extrabold text-violet-700 whitespace-nowrap">
                  만세력 연동
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-snug break-keep">
                {profile.name}님 ({profile.birthDate}) · {countdownLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-violet-100/70 text-slate-500 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 잔여 수다권 / 당근 바 */}
        <div className="bg-gradient-to-r from-orange-50/90 via-rose-50/70 to-violet-50/90 border-b border-violet-100 px-4 py-2 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
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
            className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white px-2.5 py-1 font-extrabold hover:brightness-105 transition whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3 h-3" />
            당근 충전
          </button>
        </div>

        {/* 메시지 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-1.5`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[88%] ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isUser && (
                    <img
                      src="/mascot/dalto-party.jpg"
                      alt="달토"
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
                    {msg.content}
                  </div>
                </div>

                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
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
                src="/mascot/dalto-mortar.jpg"
                alt="절구 찧는 달토"
                className="w-7 h-7 rounded-xl object-cover animate-bounce border border-violet-200"
              />
              <span>달토가 절구 찧으며 원국을 살펴보는 중... 🐇</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 빠른 추천 질문 (초반 유도) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {STARTER_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void handleSend(q)}
                className="shrink-0 rounded-full bg-white border border-violet-200 hover:border-orange-300 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition"
              >
                💬 {q}
              </button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="bg-white/95 border-t border-violet-100 p-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              freeChatTickets > 0
                ? "무료수다권 1장 사용 · 궁금한 고민을 편하게 물어보세요"
                : coins > 0
                ? "당근 1개 사용 · 달토에게 꼬리 질문을 이어가세요"
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
      </motion.div>
    </div>
  );
}
