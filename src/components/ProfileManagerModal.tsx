"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  Edit3,
  FolderOpen,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { BIRTH_HOUR_OPTIONS, previewFourPillars } from "@/lib/saju-engine";
import { WheelTimePicker, formatKoreanTimeLabel } from "./WheelTimePicker";
import type {
  AccountSession,
  CalendarType,
  ElementKey,
  GenderType,
  ProfileRelation,
  SavedSajuProfile,
} from "@/lib/saju-types";

const RELATION_OPTIONS: ProfileRelation[] = [
  "본인",
  "배우자",
  "연인",
  "부모",
  "자녀",
  "친구",
  "직장동료",
  "직접 입력",
];

const RELATION_BADGE_STYLE: Record<ProfileRelation, string> = {
  본인: "bg-amber-100 text-amber-800 border-amber-200",
  배우자: "bg-orange-100 text-orange-700 border-orange-200",
  연인: "bg-pink-100 text-pink-700 border-pink-200",
  부모: "bg-amber-50 text-amber-700 border-amber-200",
  자녀: "bg-lime-100 text-lime-700 border-lime-200",
  친구: "bg-emerald-100 text-emerald-700 border-emerald-200",
  직장동료: "bg-violet-100 text-violet-700 border-violet-200",
  "직접 입력": "bg-slate-100 text-slate-700 border-slate-200",
  "연인/썸": "bg-pink-100 text-pink-700 border-pink-200",
  가족: "bg-amber-100 text-amber-800 border-amber-200",
  지인: "bg-sky-100 text-sky-700 border-sky-200",
};

const PILLAR_BG_BY_ELEMENT: Record<ElementKey, string> = {
  wood: "bg-[#88d483] text-white",
  fire: "bg-[#f48b7b] text-white",
  earth: "bg-[#dfea9f] text-slate-800",
  metal: "bg-[#c8c8d8] text-slate-800",
  water: "bg-[#8e88be] text-white",
};

let profileSeq = 0;

export function createProfileId(): string {
  profileSeq += 1;
  return `prof-${Date.now()}-${profileSeq}`;
}

function mapExactTimeToBirthHour(timeStr: string): string {
  const [hRaw] = timeStr.split(":");
  const h = Number(hRaw);
  if (Number.isNaN(h)) return "12";
  if (h >= 23 || h < 1) return "0";
  const evenHour = Math.floor((h + 1) / 2) * 2;
  return String(Math.min(22, Math.max(0, evenHour)));
}

function formatBirthDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isValidBirthDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (y < 1900 || y > 2030 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

interface ProfileManagerModalProps {
  open: boolean;
  session: AccountSession | null;
  profiles: SavedSajuProfile[];
  activeProfileId: string | null;
  initialOpenForm?: boolean;
  pendingActionLabel?: string;
  onClose: () => void;
  onLogin: (provider: "naver" | "kakao" | "google" | "quick", label?: string) => void;
  onLogout: () => void;
  onSelectProfile: (profile: SavedSajuProfile) => void;
  onSaveProfile: (
    profile: Omit<SavedSajuProfile, "id"> & { id?: string }
  ) => void;
  onDeleteProfile: (id: string) => void;
  onOpenArchive: () => void;
}

export function ProfileManagerModal({
  open,
  session,
  profiles,
  activeProfileId,
  initialOpenForm = false,
  pendingActionLabel,
  onClose,
  onLogin,
  onLogout,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
  onOpenArchive,
}: ProfileManagerModalProps) {
  const [filterRel, setFilterRel] = useState<"전체" | ProfileRelation>("전체");
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [relation, setRelation] = useState<ProfileRelation>("본인");
  const [customRelation, setCustomRelation] = useState("");
  const [gender, setGender] = useState<GenderType>("female");
  const [birthDate, setBirthDate] = useState("1996-05-14");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [knowsTime, setKnowsTime] = useState(false);
  const [knowsExactTime, setKnowsExactTime] = useState(true);
  const [exactTime, setExactTime] = useState("13:00");
  const [birthHour, setBirthHour] = useState("12");
  const [birthCity, setBirthCity] = useState("서울");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setConfirmOpen(false);
      setFormError(null);
      if (initialOpenForm || profiles.length === 0) {
        setFormOpen(true);
        setEditingId(null);
        setRelation(profiles.length === 0 ? "본인" : "가족");
      } else {
        setFormOpen(false);
        setEditingId(null);
      }
    });
  }, [open, initialOpenForm, profiles.length]);

  const resolvedBirthHour = !knowsTime
    ? "unknown"
    : knowsExactTime
    ? mapExactTimeToBirthHour(exactTime)
    : birthHour === "unknown"
    ? "12"
    : birthHour;

  const livePillars = useMemo(
    () =>
      previewFourPillars(
        isValidBirthDate(birthDate) ? birthDate : "1996-05-14",
        calendarType,
        resolvedBirthHour
      ),
    [birthDate, calendarType, resolvedBirthHour]
  );

  if (!open) return null;

  const filteredProfiles =
    filterRel === "전체"
      ? profiles
      : profiles.filter((p) => p.relation === filterRel);

  const startNewForm = () => {
    setEditingId(null);
    setName("");
    setRelation(profiles.length === 0 ? "본인" : "연인");
    setCustomRelation("");
    setGender("female");
    setBirthDate("1996-05-14");
    setCalendarType("solar");
    setKnowsTime(false);
    setKnowsExactTime(true);
    setExactTime("13:00");
    setBirthHour("12");
    setBirthCity("서울");
    setFormError(null);
    setConfirmOpen(false);
    setFormOpen(true);
  };

  const startEditForm = (prof: SavedSajuProfile) => {
    setEditingId(prof.id);
    setName(prof.name);
    setRelation(prof.relation);
    setCustomRelation(prof.customRelation ?? "");
    setGender(prof.gender);
    setBirthDate(prof.birthDate);
    setCalendarType(prof.calendarType);
    const hasTime = prof.birthHour !== "unknown";
    setKnowsTime(hasTime);
    setKnowsExactTime(Boolean(prof.exactTime));
    setExactTime(prof.exactTime || "13:00");
    setBirthHour(hasTime ? prof.birthHour : "12");
    setBirthCity(prof.birthCity ?? "서울");
    setFormError(null);
    setConfirmOpen(false);
    setFormOpen(true);
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("이름(닉네임)을 입력해 주세요.");
      return;
    }
    if (!isValidBirthDate(birthDate)) {
      setFormError("생년월일 8자리를 정확히 입력해 주세요. (예: 1996-05-14)");
      return;
    }
    setFormError(null);
    setConfirmOpen(true);
  };

  const handleFinalConfirmSave = () => {
    const clean = name.trim();
    onSaveProfile({
      ...(editingId ? { id: editingId } : {}),
      name: clean,
      relation,
      customRelation: relation === "직접 입력" ? customRelation.trim() : undefined,
      gender,
      birthDate,
      calendarType,
      birthHour: resolvedBirthHour,
      exactTime: knowsTime && knowsExactTime ? exactTime : undefined,
      birthCity: knowsTime && birthCity.trim() ? birthCity.trim() : undefined,
    });
    setConfirmOpen(false);
    setFormOpen(false);
    setEditingId(null);
  };

  const timeDisplayText = !knowsTime
    ? "시간 모름"
    : knowsExactTime
    ? `${formatKoreanTimeLabel(exactTime)} (${exactTime})`
    : BIRTH_HOUR_OPTIONS.find((o) => o.value === birthHour)?.label.split(" ")[0] ??
      "시간 선택";

  const relationDisplayText =
    relation === "직접 입력" && customRelation.trim()
      ? customRelation.trim()
      : relation;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/45 backdrop-blur-xs p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[460px] rounded-t-[30px] sm:rounded-[30px] bg-[#fcfcfc] shadow-2xl border border-white max-h-[92vh] overflow-y-auto relative"
      >
        {/* 상단 바 */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {formOpen && profiles.length > 0 && (
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="뒤로"
                className="p-1 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-base font-black text-slate-900 truncate">
              {formOpen ? "새로운 사주 추가" : "🐇 내 사주 프로필 수첩"}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenArchive();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-violet-50 text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              보관함
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {pendingActionLabel && (
            <div className="rounded-2xl bg-gradient-to-r from-[#fff3e8] to-[#fdf0f6] border border-orange-200 px-3.5 py-2.5 text-xs font-extrabold text-[#5b3578] flex items-center gap-2 text-left">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <span>
                {pendingActionLabel} — 아래에서 사주를 선택하거나 등록해 주세요!
              </span>
            </div>
          )}

          {/* 로그인 상태 배너 (비폼 화면일 때 강조, 폼 화면일 땐 최소화) */}
          {!formOpen && (
            <>
              {!session?.loggedIn ? (
                <div className="rounded-3xl bg-[#fffaf4] border border-amber-200/80 p-4 space-y-2.5">
                  <p className="text-xs font-extrabold text-slate-800 text-left">
                    3초 간편 로그인으로 본인·가족·친구 사주를 안전하게 저장하세요!
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onLogin("naver", "네이버 회원")}
                      className="py-2.5 rounded-xl bg-[#03C75A] text-white text-xs font-black"
                    >
                      N 네이버
                    </button>
                    <button
                      type="button"
                      onClick={() => onLogin("kakao", "카카오 회원")}
                      className="py-2.5 rounded-xl bg-[#FEE500] text-[#191919] text-xs font-black"
                    >
                      💬 카카오
                    </button>
                    <button
                      type="button"
                      onClick={() => onLogin("google", "구글 회원")}
                      className="py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-black"
                    >
                      G 구글
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-extrabold shrink-0">
                      <Check className="w-3 h-3" />
                      로그인됨
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 truncate">
                      {session.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    로그아웃
                  </button>
                </div>
              )}

              {/* 저장된 사람 목록 */}
              {profiles.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      저장된 사주 ({profiles.length}명)
                    </span>
                    <button
                      type="button"
                      onClick={startNewForm}
                      className="inline-flex items-center gap-1 rounded-full bg-[#e35b96] text-white px-3 py-1 text-[11px] font-extrabold shadow-2xs"
                    >
                      <UserPlus className="w-3 h-3" />
                      새로운 사주 추가
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {(["전체", "본인", "배우자", "연인", "부모", "자녀", "친구", "직장동료"] as const).map(
                      (rel) => (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => setFilterRel(rel)}
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold border transition ${
                            filterRel === rel
                              ? "bg-[#ffd447] text-slate-900 border-[#f4c025]"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {rel}
                        </button>
                      )
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                    {filteredProfiles.map((prof) => {
                      const isActive = prof.id === activeProfileId;
                      return (
                        <div
                          key={prof.id}
                          className={`rounded-2xl p-3 border transition flex items-center justify-between gap-2 ${
                            isActive
                              ? "border-amber-400 bg-[#fffbec] shadow-xs"
                              : "border-slate-200/80 bg-white hover:border-amber-200"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectProfile(prof)}
                            className="flex-1 min-w-0 text-left space-y-0.5"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold border ${
                                  RELATION_BADGE_STYLE[prof.relation] ??
                                  RELATION_BADGE_STYLE["직접 입력"]
                                }`}
                              >
                                {prof.customRelation || prof.relation}
                              </span>
                              <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                {prof.name}
                              </span>
                              {isActive && (
                                <span className="text-[10px] font-extrabold text-amber-700">
                                  ✓ 선택됨
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {prof.gender === "female" ? "여자" : "남자"} ·{" "}
                              {prof.birthDate} (
                              {prof.calendarType === "solar" ? "양력" : "음력"} ·{" "}
                              {prof.birthHour === "unknown"
                                ? "시간 모름"
                                : prof.exactTime ||
                                  BIRTH_HOUR_OPTIONS.find(
                                    (o) => o.value === prof.birthHour
                                  )?.label.split(" ")[0]}
                              )
                            </p>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditForm(prof)}
                              aria-label={`${prof.name} 수정`}
                              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProfile(prof.id)}
                              aria-label={`${prof.name} 삭제`}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={startNewForm}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-300 bg-[#fffdf5] hover:bg-amber-50 text-xs font-extrabold text-amber-800 flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                본인 · 배우자 · 연인 · 부모 · 친구 새 사주 추가
              </button>
            </>
          )}

          {/* 새로운 사주 추가 폼 (벤치마킹 2번 화면 정밀 구현) */}
          {formOpen && (
            <form onSubmit={handleOpenConfirm} className="space-y-4 text-left">
              {/* 이름 */}
              <div className="space-y-1.5">
                <div className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                  이름
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 김민지"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 focus:border-amber-400 outline-none"
                />
              </div>

              {/* 관계 */}
              <div className="space-y-1.5">
                <div className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                  관계
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RELATION_OPTIONS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setRelation(rel)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold border transition ${
                        relation === rel
                          ? "bg-[#ffd447] text-slate-900 border-[#f2be22] shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
                {relation === "직접 입력" && (
                  <input
                    type="text"
                    value={customRelation}
                    onChange={(e) => setCustomRelation(e.target.value)}
                    placeholder="예: 썸남, 친언니, 팀장님"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:border-amber-400"
                  />
                )}
              </div>

              {/* 생년월일 */}
              <div className="space-y-1.5">
                <div className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                  생년월일
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {(["solar", "lunar"] as const).map((cal) => (
                    <button
                      key={cal}
                      type="button"
                      onClick={() => setCalendarType(cal)}
                      className={`rounded-full px-3.5 py-1 text-xs font-extrabold border transition ${
                        calendarType === cal
                          ? "bg-[#ffd447] text-slate-900 border-[#f2be22]"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      {cal === "solar" ? "양력" : "음력"}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={birthDate}
                    onChange={(e) =>
                      setBirthDate(formatBirthDateInput(e.target.value))
                    }
                    placeholder="예: 1996-05-14 (숫자 8자리 입력)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 tracking-wide focus:border-amber-400 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 flex items-center justify-between px-0.5">
                    <span>
                      숫자 8자리(YYYYMMDD)를 직접 입력하면 하이픈(-)이 자동으로 들어갑니다.
                    </span>
                    {birthDate.length > 0 && (
                      <span
                        className={
                          isValidBirthDate(birthDate)
                            ? "font-bold text-emerald-600 shrink-0 ml-2"
                            : "font-bold text-amber-600 shrink-0 ml-2"
                        }
                      >
                        {isValidBirthDate(birthDate) ? "✓ 완료" : "8자리 입력"}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* 성별 */}
              <div className="space-y-1.5">
                <div className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                  성별
                </div>
                <div className="flex gap-2">
                  {(["female", "male"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`rounded-full px-4 py-1.5 text-xs font-extrabold border transition ${
                        gender === g
                          ? "bg-[#ffd447] text-slate-900 border-[#f2be22]"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      {g === "female" ? "여자" : "남자"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 태어난 시간을 아시나요? */}
              <div className="space-y-2">
                <div className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                  태어난 시간을 아시나요?
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setKnowsTime(true)}
                    className={`rounded-full px-4 py-1.5 text-xs font-extrabold border transition ${
                      knowsTime
                        ? "bg-[#ffd447] text-slate-900 border-[#f2be22]"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    예
                  </button>
                  <button
                    type="button"
                    onClick={() => setKnowsTime(false)}
                    className={`rounded-full px-4 py-1.5 text-xs font-extrabold border transition ${
                      !knowsTime
                        ? "bg-[#ffd447] text-slate-900 border-[#f2be22]"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    아니오
                  </button>
                </div>

                {knowsTime && (
                  <div className="space-y-2.5 pt-1">
                    <div className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                      정확한 시간을 아시나요?
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setKnowsExactTime(true)}
                        className={`rounded-full px-4 py-1.5 text-xs font-extrabold border transition ${
                          knowsExactTime
                            ? "bg-[#ffd447] text-slate-900 border-[#f2be22]"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        예
                      </button>
                      <button
                        type="button"
                        onClick={() => setKnowsExactTime(false)}
                        className={`rounded-full px-4 py-1.5 text-xs font-extrabold border transition ${
                          !knowsExactTime
                            ? "bg-[#ffd447] text-slate-900 border-[#f2be22]"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        아니오 (12시진)
                      </button>
                    </div>

                    {knowsExactTime ? (
                      <WheelTimePicker value={exactTime} onChange={setExactTime} />
                    ) : (
                      <select
                        value={birthHour}
                        onChange={(e) => setBirthHour(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-amber-400"
                      >
                        {BIRTH_HOUR_OPTIONS.filter((o) => o.value !== "unknown").map(
                          (opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          )
                        )}
                      </select>
                    )}

                    <div className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                      태어난 도시를 아시나요? <span className="text-slate-400">(선택)</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={birthCity}
                        onChange={(e) => setBirthCity(e.target.value)}
                        placeholder="서울"
                        className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-amber-400"
                      />
                      {birthCity && (
                        <button
                          type="button"
                          onClick={() => setBirthCity("")}
                          aria-label="도시 지우기"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      입력해 주시면 지역 경도에 맞춰 태어난 시간을 정밀하게 반영해 드려요. (예: 서울 -32분 보정)
                    </p>
                  </div>
                )}
              </div>

              {/* 🔮 실시간 만세력 미리보기 🔮 */}
              <div className="pt-1 space-y-2 text-center">
                <p className="text-xs font-extrabold text-violet-700">
                  🔮 만세력 미리보기 🔮
                </p>
                <div className="grid grid-cols-4 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
                  {livePillars.map((p) => {
                    const isUnknown = p.hanja === "未詳";
                    return (
                      <div key={p.label} className="flex flex-col">
                        <div className="bg-white py-1 text-[10.5px] font-bold text-slate-500 border-b border-slate-100">
                          {p.label}
                        </div>
                        <div
                          className={`py-3 px-1 flex flex-col items-center justify-center ${
                            isUnknown
                              ? "bg-slate-200 text-slate-500"
                              : PILLAR_BG_BY_ELEMENT[p.stemElement]
                          }`}
                        >
                          <span className="font-serif text-lg font-black leading-none">
                            {p.hanja}
                          </span>
                          <span className="text-[10.5px] font-bold mt-1 opacity-90">
                            {p.hangul}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <p className="text-xs font-bold text-rose-600 text-center">
                  {formError}
                </p>
              )}

              {/* 하단 취소 / 저장하기 버튼 */}
              <div className="grid grid-cols-12 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => (profiles.length > 0 ? setFormOpen(false) : onClose())}
                  className="col-span-4 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-extrabold transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="col-span-8 py-3.5 rounded-full bg-[#e35b96] hover:brightness-105 text-white text-sm font-black shadow-md transition"
                >
                  저장하기
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3단계: "입력하신 내용이 맞나요?" 재확인 팝업 (벤치마킹 3번 화면) */}
        {confirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/55 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[360px] rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">
                  입력하신 내용이 맞나요?
                </h4>
                <p className="text-xs text-slate-500">
                  정확한 사주 풀이를 위해 다시 한 번 확인해 주세요! ( ˘ ³˘)♥
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/90 border border-slate-100 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 font-semibold">이름</span>
                  <span className="font-black text-slate-900">{name.trim()}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 font-semibold">관계</span>
                  <span className="font-black text-slate-900">
                    {relationDisplayText}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 font-semibold">생년월일</span>
                  <span className="font-black text-slate-900">
                    {birthDate} ({calendarType === "solar" ? "양력" : "음력"})
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 font-semibold">태어난 시간</span>
                  <span className="font-black text-slate-900">
                    {timeDisplayText}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 font-semibold">성별</span>
                  <span className="font-black text-slate-900">
                    {gender === "female" ? "여자" : "남자"}
                  </span>
                </div>
                {knowsTime && birthCity.trim() && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400 font-semibold">태어난 도시</span>
                    <span className="font-black text-slate-900">
                      {birthCity.trim()}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                등록한 생년월일과 출생시간은 정확할수록 사주 해석이 잘 맞아요. 한 번 더 확인해 주세요.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition"
                >
                  수정하기
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirmSave}
                  className="py-3 rounded-full bg-[#ffd447] hover:brightness-95 text-slate-900 text-xs font-black shadow-sm transition"
                >
                  맞습니다
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
