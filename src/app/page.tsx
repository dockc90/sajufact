"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Flame,
  HeartHandshake,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  BIRTH_HOUR_OPTIONS,
  ELEMENT_THEMES,
  MENU_ITEMS,
  WORRY_OPTIONS,
  generateSajuReport,
} from "@/lib/saju-engine";
import type {
  CalendarType,
  ElementKey,
  GenderType,
  MenuCategory,
  SajuInput,
  SajuReport,
  WorryTopic,
} from "@/lib/saju-types";
import { AuraBackground } from "@/components/AuraBackground";
import { AnalyzingView } from "@/components/AnalyzingView";
import { ResultView } from "@/components/ResultView";
import { TarotModal } from "@/components/TarotModal";
import {
  OrientalCardFrameSvg,
  OrientalElementArt,
  VermilionSealSvg,
} from "@/components/OrientalArtSvg";
import type { CardEdition } from "@/components/ShareCardStudio";

type ScreenPhase = "home" | "analyzing" | "result";

const NAV_LABELS: Record<MenuCategory, string> = {
  newyear2027: "2027 신년운세",
  lifetime: "평생 사주 팩폭",
  wealth: "재물·이직운",
  compatibility: "연애·궁합 스캔",
  health: "건강·번아웃",
  tarot: "오늘의 무료 타로",
};

export default function HomePage() {
  const [phase, setPhase] = useState<ScreenPhase>("home");
  const [selectedMenu, setSelectedMenu] = useState<MenuCategory>("newyear2027");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<GenderType>("female");
  const [birthDate, setBirthDate] = useState("1996-05-14");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthHour, setBirthHour] = useState<string>("10");
  const [worry, setWorry] = useState<WorryTopic>("wealth");

  // 연애·궁합 스캔 및 초대 링크용 상대방 정보
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("1995-08-20");
  const [inviterBanner, setInviterBanner] = useState<{
    name: string;
    birth: string;
  } | null>(null);

  const [report, setReport] = useState<SajuReport | null>(null);
  const [tarotOpen, setTarotOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showcaseEdition, setShowcaseEdition] = useState<CardEdition>("aura");

  // URL 쿼리 파라미터(궁합 초대 링크 / 저장된 리포트 복원) 처리
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const inviter = params.get("inviter");
      const inviterBirth = params.get("inviterBirth");
      const savedId = params.get("saved");

      if (inviter && inviterBirth) {
        setInviterBanner({ name: inviter, birth: inviterBirth });
        setPartnerName(inviter);
        setPartnerBirthDate(inviterBirth);
        setSelectedMenu("compatibility");
        setWorry("love");
      } else if (savedId) {
        try {
          const raw = localStorage.getItem(`sajufact_report_${savedId}`);
          if (raw) {
            const parsed = JSON.parse(raw) as { report: SajuReport };
            if (parsed?.report) {
              setReport(parsed.report);
              setPhase("result");
            }
          }
        } catch {
          // ignore invalid storage
        }
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleMenuClick = (id: MenuCategory) => {
    if (id === "tarot") {
      setTarotOpen(true);
      return;
    }
    setSelectedMenu(id);
    if (phase !== "home") {
      setPhase("home");
    }
    if (id === "compatibility") {
      setWorry("love");
    } else if (id === "wealth") {
      setWorry("wealth");
    } else if (id === "health") {
      setWorry("health");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("이름 또는 닉네임을 입력해 주세요.");
      return;
    }
    if (!birthDate) {
      setFormError("생년월일을 선택해 주세요.");
      return;
    }
    setFormError(null);

    const payload: SajuInput = {
      name: name.trim(),
      gender,
      birthDate,
      calendarType,
      birthHour,
      worry,
      menu: selectedMenu,
      partnerName:
        selectedMenu === "compatibility"
          ? partnerName.trim() || inviterBanner?.name || "그 사람"
          : undefined,
      partnerBirthDate:
        selectedMenu === "compatibility"
          ? partnerBirthDate || inviterBanner?.birth
          : undefined,
    };

    setPhase("analyzing");

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 3000));
    const apiPromise = fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("API error");
        const data = (await res.json()) as { report: SajuReport };
        return data.report;
      })
      .catch(() => generateSajuReport(payload));

    const [, computedReport] = await Promise.all([minDelayPromise, apiPromise]);
    setReport(computedReport);
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AuraBackground
        element={phase === "result" && report ? report.dominantElement : "default"}
      />

      {/* PC + 모바일 공용 웹사이트 GNB 헤더 */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/60 border-b border-white/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setPhase("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 text-left shrink-0"
          >
            <span className="font-serif text-lg sm:text-xl font-black tracking-tight text-slate-900">
              사주팩트{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-rose-600 to-indigo-700">
                SajuFact
              </span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-serif font-bold tracking-widest text-slate-500 border border-slate-300/80 rounded-full px-2 py-0.5">
              sajufact.kr
            </span>
          </button>

          {/* PC 전용 퀵 메뉴 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {MENU_ITEMS.map((item) => {
              const active = phase === "home" && selectedMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuClick(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    item.id === "tarot"
                      ? "text-indigo-700 hover:bg-indigo-50"
                      : active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  {NAV_LABELS[item.id]}
                </button>
              );
            })}
          </nav>

          {/* 우측 실시간 카운터 & 모바일 타로 바로가기 */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-slate-700">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              오늘 14,820명 스캔 중
            </span>
            <button
              type="button"
              onClick={() => setTarotOpen(true)}
              className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold shadow-sm"
            >
              🃏 무료 타로
            </button>
          </div>
        </div>
      </header>

      {phase === "analyzing" && <AnalyzingView userName={name.trim() || "당신"} />}

      {phase === "result" && report && (
        <ResultView
          initialReport={report}
          isInvitedFriendMode={Boolean(inviterBanner)}
          onResetHome={() => {
            setPhase("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {phase === "home" && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* 좌측 영역 (모바일: 상단 / PC: 히어로 + 5대 메뉴 + 오라 미리보기) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 히어로 섹션 */}
              <div className="text-center lg:text-left space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-slate-700 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  모바일·PC 웹 즉시 실행 · 로그인 없이 10초 스캔
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight break-keep">
                  위로 대신 뼈 때리는{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-rose-600 to-indigo-700">
                    AI 사주·타로 팩트폭격
                  </span>
                </h1>

                <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed break-keep">
                  만세력 사주 원국 기반 정밀 분석부터 인스타그램 공유용{" "}
                  <strong className="text-slate-900">오행 오라(Aura) 운명 카드</strong>까지 한 번에 확인하세요.
                </p>
              </div>

              {/* 궁합 초대 배너 (초대 링크 유입 시) */}
              {inviterBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-pink-500/90 to-rose-500/90 text-white p-4 shadow-lg"
                >
                  <div className="flex items-center gap-2 text-xs font-extrabold mb-1">
                    <HeartHandshake className="w-4 h-4" />
                    {inviterBanner.name}님이 궁합 스캔을 요청했어요!
                  </div>
                  <p className="text-[11px] text-white/90">
                    생년월일만 입력하면 두 분의 궁합 점수를{" "}
                    <strong>무료</strong>로 즉시 확인할 수 있습니다.
                  </p>
                </motion.div>
              )}

              {/* ① 5대 범용 메뉴 선택 카드 */}
              {/* 인스타 소장용 3종 결과 카드 쇼케이스 (차별화 비주얼) */}
              <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3.5 border border-amber-200/70">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-rose-600 uppercase">
                      SIGNATURE RESULT CARD
                    </span>
                    <h2 className="font-serif text-sm sm:text-base font-black text-slate-900">
                      스캔 즉시 3가지 컨셉 카드로 소장 & 인스타 공유
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900/10 p-1 rounded-xl">
                    {[
                      { id: "aura" as const, label: "✨ 오라 동양화" },
                      { id: "receipt" as const, label: "🧾 팩폭 영수증" },
                      { id: "tarot" as const, label: "🌙 홀로그램 타로" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setShowcaseEdition(tab.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition ${
                          showcaseEdition === tab.id
                            ? "bg-slate-900 text-amber-200 shadow-sm"
                            : "text-slate-700 hover:bg-white/60"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* 좌측 카드 미니어처 프리뷰 */}
                  <div className="sm:col-span-6 flex justify-center">
                    {showcaseEdition === "aura" && (
                      <div
                        style={{
                          background: ELEMENT_THEMES.water.cardBgStyle,
                          color: ELEMENT_THEMES.water.textOnCard,
                        }}
                        className="w-full max-w-[240px] rounded-2xl p-4 relative overflow-hidden shadow-xl flex flex-col items-center text-center"
                      >
                        <OrientalCardFrameSvg color="#f0d285" />
                        <span className="relative z-10 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-300 text-slate-950 mb-1">
                          TIER: SSR · 상위 4%
                        </span>
                        <OrientalElementArt
                          element="water"
                          goldPrimary="#f0d285"
                          goldSecondary="#c49c42"
                          dayMasterHanja="辛"
                          className="w-24 h-24 relative z-10"
                          idPrefix="home-aura"
                        />
                        <p className="relative z-10 font-serif text-xs font-black mt-1 leading-snug break-keep">
                          “머리는 천재급인데 생각이 많아 실행이 늦는 팔자”
                        </p>
                        <div className="relative z-10 w-full grid grid-cols-2 gap-1 mt-2 text-[9px]">
                          <div className="bg-white/10 rounded-lg py-1 px-1.5">💰 8월 횡재</div>
                          <div className="bg-white/10 rounded-lg py-1 px-1.5">⚠️ 4월 주의</div>
                        </div>
                      </div>
                    )}

                    {showcaseEdition === "receipt" && (
                      <div className="w-full max-w-[240px] rounded-2xl p-4 bg-[#fdfaf2] text-slate-900 border border-stone-300 shadow-xl relative space-y-2">
                        <div className="flex justify-between items-center border-b border-dashed border-slate-400 pb-1.5">
                          <span className="font-serif text-xs font-black">SAJUFACT RECEIPT</span>
                          <span className="text-[9px] font-mono bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded">
                            #SSR-04
                          </span>
                        </div>
                        <p className="font-serif text-xs font-black leading-snug bg-white p-2 rounded-lg border border-stone-200 break-keep">
                          “기분 좋으면 지갑 열고 스트레스 받으면 결제부터 누르는 타입”
                        </p>
                        <div className="space-y-1 text-[9px] font-mono">
                          <div className="flex justify-between">
                            <span>재물·횡재운</span>
                            <span className="font-bold text-emerald-700">91%</span>
                          </div>
                          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 w-[91%]" />
                          </div>
                          <div className="flex justify-between pt-0.5">
                            <span>팩폭 적중률</span>
                            <span className="font-bold">99%</span>
                          </div>
                        </div>
                        <div className="absolute right-2 bottom-2 rotate-[-8deg]">
                          <VermilionSealSvg label="팩폭印" className="w-8 h-8" />
                        </div>
                      </div>
                    )}

                    {showcaseEdition === "tarot" && (
                      <div
                        style={{
                          background:
                            "radial-gradient(circle at 30% 20%, #3b2667 0%, #16112b 55%, #090714 100%)",
                        }}
                        className="w-full max-w-[240px] rounded-2xl p-4 text-amber-50 border border-amber-300/40 shadow-xl relative overflow-hidden flex flex-col items-center text-center"
                      >
                        <OrientalCardFrameSvg color="#f0d285" />
                        <span className="relative z-10 text-[9px] font-bold tracking-widest text-amber-300">
                          ARCANA 辛亥 · 2027
                        </span>
                        <OrientalElementArt
                          element="fire"
                          goldPrimary="#f5db94"
                          goldSecondary="#b8892c"
                          dayMasterHanja="丙"
                          className="w-24 h-24 relative z-10 my-1"
                          idPrefix="home-tarot"
                        />
                        <p className="relative z-10 font-serif text-xs font-black leading-snug break-keep">
                          “눈치 0% 직설 화법, 2027년엔 판을 뒤집는 주작의 해”
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 우측 핵심 차별점 리스트 */}
                  <div className="sm:col-span-6 space-y-2.5 text-left">
                    <div className="rounded-2xl bg-white/75 border border-white p-3 space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        🎨 1. 오행 자동 컬러 + 일간 한자 인장
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        내 사주에서 가장 강한 오행에 맞춰 배경 오라와 동양화 금박 일러스트가 자동 생성됩니다.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/75 border border-white p-3 space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        📊 2. 오행 레이더 + 12개월 흐름 + 건강 처방
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        재물·이직·연애 궁합은 물론, 취약 장기와 2027 번아웃 시기까지 뼈 때리게 짚어줍니다.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">
                    1. 어떤 팩폭을 받아볼까요?
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    사계절 범용 운세 플랫폼
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MENU_ITEMS.map((item) => {
                    const isSelected = selectedMenu === item.id;
                    const isSeasonMain = item.id === "newyear2027";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                          isSeasonMain ? "sm:col-span-2" : ""
                        } ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] scale-[1.01]"
                            : "glass-card hover:bg-white/85 text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                              isSelected ? "bg-white/15" : "bg-white/80 shadow-sm"
                            }`}
                          >
                            {item.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-sm">
                                {item.title}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeStyle}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] mt-0.5 line-clamp-1 ${
                                isSelected ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-amber-300 bg-amber-300 text-slate-950"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-slate-950" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* PC 전용: 오행별 오라(Aura) 카드 테마 안내 스트립 */}
              <section className="hidden lg:block glass-card rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-800">
                    ✨ 내 사주 오행에 따라 자동 매칭되는 5가지 오라(Aura) 결과 카드
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    9:16 스토리 & 4:5 피드 PNG 저장 지원
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {(Object.keys(ELEMENT_THEMES) as ElementKey[]).map((key) => {
                    const t = ELEMENT_THEMES[key];
                    return (
                      <div
                        key={key}
                        style={{
                          background: t.cardBgStyle,
                          color: t.textOnCard,
                        }}
                        className="rounded-2xl p-3 border border-white/70 shadow-sm text-center"
                      >
                        <p className="font-serif text-base font-black">{t.hanja}</p>
                        <p className="text-[11px] font-extrabold mt-0.5">{t.nameKo}</p>
                        <p className="text-[9px] opacity-75 mt-0.5 line-clamp-1">
                          {t.auraLabel.replace(" 오라", "")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* 우측 영역 (모바일: 하단 / PC: 스티키 원페이지 입력 폼) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <form
                onSubmit={handleSubmit}
                className="glass-card rounded-3xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">
                    2. 내 사주 정보 입력 (10초 완료)
                  </h2>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    만세력 정밀 분석
                  </span>
                </div>

                {/* 이름 + 성별 */}
                <div className="grid grid-cols-5 gap-2.5">
                  <div className="col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" />
                      이름 (닉네임)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 김민지"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      성별
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-white/75 border border-slate-200/80 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          gender === "female"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600"
                        }`}
                      >
                        여성
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          gender === "male"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600"
                        }`}
                      >
                        남성
                      </button>
                    </div>
                  </div>
                </div>

                {/* 생년월일 + 양력/음력 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      생년월일
                    </label>
                    <div className="flex items-center gap-1 bg-white/75 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCalendarType("solar")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                          calendarType === "solar"
                            ? "bg-slate-900 text-white"
                            : "text-slate-500"
                        }`}
                      >
                        양력
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarType("lunar")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                          calendarType === "lunar"
                            ? "bg-slate-900 text-white"
                            : "text-slate-500"
                        }`}
                      >
                        음력
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={birthDate}
                    max="2026-12-31"
                    min="1940-01-01"
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* 태어난 시간 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      태어난 시간
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={birthHour === "unknown"}
                        onChange={(e) =>
                          setBirthHour(e.target.checked ? "unknown" : "10")
                        }
                        className="rounded accent-slate-900"
                      />
                      시간 모름
                    </label>
                  </div>
                  <select
                    value={birthHour}
                    onChange={(e) => setBirthHour(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {BIRTH_HOUR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 연애·궁합 스캔 선택 시 상대방 정보 자동 확장 */}
                {selectedMenu === "compatibility" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-2xl bg-pink-50/80 border border-pink-200 p-3.5 space-y-2.5"
                  >
                    <p className="text-[11px] font-extrabold text-pink-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      상대방 생년월일 입력 (썸·연인·상사)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="상대방 이름"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold"
                      />
                      <input
                        type="date"
                        value={partnerBirthDate}
                        onChange={(e) => setPartnerBirthDate(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold"
                      />
                    </div>
                  </motion.div>
                )}

                {/* 핵심 고민 1개 선택 */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    지금 가장 팩폭 받고 싶은 고민 (1개)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORRY_OPTIONS.map((opt) => {
                      const active = worry === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setWorry(opt.value)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                            opt.value === "health" ? "col-span-2" : ""
                          } ${
                            active
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white/75 text-slate-700 border-slate-200 hover:bg-white"
                          }`}
                        >
                          <span>{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formError && (
                  <p className="text-xs font-bold text-rose-600 text-center">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#221d3a] to-slate-900 hover:brightness-110 text-white font-extrabold text-sm shadow-[0_14px_30px_rgba(15,23,42,0.28)] flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  무료 팩폭 스캔 & 오라 등급 확인하기
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  오행 차트 · 한 줄 팩폭 · 종합 등급(TIER)은 100% 무료로 바로 공개됩니다
                </p>
              </form>
            </div>
          </div>

          {/* 하단 웹사이트 푸터 */}
          <footer className="mt-12 pt-6 border-t border-slate-300/50 text-center text-[11px] text-slate-400 space-y-1">
            <p className="font-serif tracking-widest text-slate-500">sajufact.kr</p>
            <p>사주팩트 (SajuFact) · PC·모바일 반응형 AI 사주·타로 웹서비스</p>
          </footer>
        </div>
      )}

      <TarotModal
        open={tarotOpen}
        onClose={() => setTarotOpen(false)}
        onConvertToSaju={() => {
          setPhase("home");
          setSelectedMenu("newyear2027");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
