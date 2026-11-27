"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Clock,
  Edit3,
  FolderOpen,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { BIRTH_HOUR_OPTIONS } from "@/lib/saju-engine";
import type {
  AccountSession,
  CalendarType,
  GenderType,
  ProfileRelation,
  SavedSajuProfile,
} from "@/lib/saju-types";

const RELATION_OPTIONS: ProfileRelation[] = [
  "본인",
  "가족",
  "연인/썸",
  "친구",
  "지인",
  "직장동료",
];

const RELATION_BADGE_STYLE: Record<ProfileRelation, string> = {
  본인: "bg-rose-100 text-rose-700 border-rose-200",
  가족: "bg-amber-100 text-amber-800 border-amber-200",
  "연인/썸": "bg-pink-100 text-pink-700 border-pink-200",
  친구: "bg-emerald-100 text-emerald-700 border-emerald-200",
  지인: "bg-sky-100 text-sky-700 border-sky-200",
  직장동료: "bg-violet-100 text-violet-700 border-violet-200",
};

let profileSeq = 0;

export function createProfileId(): string {
  profileSeq += 1;
  return `prof-${Date.now()}-${profileSeq}`;
}

interface ProfileManagerModalProps {
  open: boolean;
  session: AccountSession | null;
  profiles: SavedSajuProfile[];
  activeProfileId: string | null;
  pendingActionLabel?: string;
  onClose: () => void;
  onLogin: (provider: "kakao" | "google" | "quick", label?: string) => void;
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [relation, setRelation] = useState<ProfileRelation>("본인");
  const [gender, setGender] = useState<GenderType>("female");
  const [birthDate, setBirthDate] = useState("1996-05-14");
  const [birthQuickInput, setBirthQuickInput] = useState("19960514");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthHour, setBirthHour] = useState("unknown");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (profiles.length === 0) {
        setFormOpen(true);
        setEditingId(null);
        setRelation("본인");
      } else {
        setFormOpen(false);
        setEditingId(null);
      }
      setFormError(null);
    });
  }, [open, profiles.length]);

  if (!open) return null;

  const filteredProfiles =
    filterRel === "전체"
      ? profiles
      : profiles.filter((p) => p.relation === filterRel);

  const startNewForm = () => {
    setEditingId(null);
    setName("");
    setRelation(profiles.length === 0 ? "본인" : "가족");
    setGender("female");
    setBirthDate("1996-05-14");
    setBirthQuickInput("19960514");
    setCalendarType("solar");
    setBirthHour("unknown");
    setFormError(null);
    setFormOpen(true);
  };

  const startEditForm = (prof: SavedSajuProfile) => {
    setEditingId(prof.id);
    setName(prof.name);
    setRelation(prof.relation);
    setGender(prof.gender);
    setBirthDate(prof.birthDate);
    setBirthQuickInput(prof.birthDate.replace(/-/g, ""));
    setCalendarType(prof.calendarType);
    setBirthHour(prof.birthHour);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setFormError("이름(닉네임)을 입력해 주세요.");
      return;
    }
    if (!birthDate) {
      setFormError("생년월일 8자리를 입력해 주세요.");
      return;
    }
    onSaveProfile({
      ...(editingId ? { id: editingId } : {}),
      name: clean,
      relation,
      gender,
      birthDate,
      calendarType,
      birthHour,
    });
    setFormOpen(false);
    setEditingId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-violet-950/40 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[480px] rounded-t-[30px] sm:rounded-[30px] bg-gradient-to-b from-[#fffaf5] via-[#fdf5fb] to-white p-5 sm:p-6 shadow-2xl border border-white max-h-[90vh] overflow-y-auto space-y-4"
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/mascot/dalto-party.jpg"
              alt="달토끼 달토"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-orange-200 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 truncate">
                🐇 로그인 · 내 사주 프로필 수첩
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                본인·가족·연인·친구·동료 사주 저장
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenArchive();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-violet-100 text-[11px] font-bold text-violet-700 hover:bg-violet-50 transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              보관함
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-violet-100/70 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 선택 대기 작업 안내 */}
        {pendingActionLabel && (
          <div className="rounded-2xl bg-gradient-to-r from-[#fff3e8] to-[#fdf0f6] border border-orange-200 px-3.5 py-2.5 text-xs font-extrabold text-[#5b3578] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              {pendingActionLabel} — 아래에서 사주를 선택하거나 새로 추가해 주세요!
            </span>
          </div>
        )}

        {/* 간편 로그인 영역 */}
        {!session?.loggedIn ? (
          <div className="rounded-3xl bg-white/90 border border-violet-100 p-4 space-y-2.5 shadow-2xs">
            <p className="text-xs font-extrabold text-slate-800 leading-relaxed">
              로그인하면 본인·가족·친구·지인·직장동료 사주를 저장해 두고 언제든 꺼내볼 수 있어요!
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onLogin("kakao", "카카오 회원")}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#FEE500] hover:brightness-95 text-[#191919] text-xs font-black transition shadow-2xs"
              >
                💬 카카오로 3초 로그인
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onLogin("google", "구글 회원")}
                  className="py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-extrabold transition"
                >
                  G 구글로 간편 로그인
                </button>
                <button
                  type="button"
                  onClick={() => onLogin("quick", "달토 게스트")}
                  className="py-2.5 px-3 rounded-2xl bg-violet-100 hover:bg-violet-200/80 text-violet-800 text-xs font-extrabold transition"
                >
                  🐇 게스트로 바로 시작
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/90 border border-violet-100 px-3.5 py-2.5 flex items-center justify-between gap-2">
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

        {/* 저장된 사주 목록 + 관계 필터 */}
        {profiles.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-800">
                저장된 사람 ({profiles.length}명)
              </span>
              <button
                type="button"
                onClick={startNewForm}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#5c489b] to-[#d96b8a] text-white px-3 py-1 text-[11px] font-extrabold shadow-2xs hover:brightness-105 transition"
              >
                <UserPlus className="w-3 h-3" />
                새 사람 추가
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {(["전체", ...RELATION_OPTIONS] as const).map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => setFilterRel(rel)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold border transition ${
                    filterRel === rel
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-violet-100 hover:bg-violet-50"
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
              {filteredProfiles.map((prof) => {
                const isActive = prof.id === activeProfileId;
                const hourShort =
                  BIRTH_HOUR_OPTIONS.find((o) => o.value === prof.birthHour)
                    ?.label.split(" ")[0] ?? "시간";
                return (
                  <div
                    key={prof.id}
                    className={`rounded-2xl p-3 border transition flex items-center justify-between gap-2 ${
                      isActive
                        ? "border-violet-400 bg-gradient-to-r from-[#f4eeff] to-[#fff4f8] shadow-xs"
                        : "border-violet-100 bg-white/90 hover:border-orange-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectProfile(prof)}
                      className="flex-1 min-w-0 text-left space-y-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold border ${RELATION_BADGE_STYLE[prof.relation]}`}
                        >
                          {prof.relation}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {prof.name}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-violet-700">
                            <Check className="w-3 h-3" />
                            선택됨
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {prof.gender === "female" ? "여성" : "남성"} · {prof.birthDate} (
                        {prof.calendarType === "solar" ? "양력" : "음력"} · {hourShort})
                      </p>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditForm(prof)}
                        aria-label={`${prof.name} 수정`}
                        className="p-1.5 rounded-xl hover:bg-violet-100 text-slate-500"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProfile(prof.id)}
                        aria-label={`${prof.name} 삭제`}
                        className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProfiles.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-4">
                  해당 관계로 저장된 프로필이 아직 없어요.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 새 프로필 추가 / 수정 폼 */}
        {formOpen ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white/95 border border-orange-200/80 p-4 space-y-3 shadow-xs text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">
                {editingId ? "✏️ 사주 정보 수정" : "✨ 새 사주 정보 등록 (3초 완료)"}
              </span>
              {profiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-700"
                >
                  접기
                </button>
              )}
            </div>

            {/* 관계 선택 */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                관계
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RELATION_OPTIONS.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelation(rel)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold border transition ${
                      relation === rel
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-7">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                  <User className="w-3 h-3" />
                  이름 (닉네임)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 김민지"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-violet-400 outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  성별
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                  {(["female", "male"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        gender === g
                          ? "bg-slate-900 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {g === "female" ? "여" : "남"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    생년월일 (8자리)
                  </label>
                  <div className="flex gap-1 text-[10px] font-bold">
                    {(["solar", "lunar"] as const).map((cal) => (
                      <button
                        key={cal}
                        type="button"
                        onClick={() => setCalendarType(cal)}
                        className={`px-1.5 py-0.5 rounded ${
                          calendarType === cal
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 bg-slate-100"
                        }`}
                      >
                        {cal === "solar" ? "양력" : "음력"}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={birthQuickInput}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setBirthQuickInput(digits);
                    if (digits.length === 8) {
                      const y = digits.slice(0, 4);
                      const m = digits.slice(4, 6);
                      const d = digits.slice(6, 8);
                      if (
                        Number(m) >= 1 &&
                        Number(m) <= 12 &&
                        Number(d) >= 1 &&
                        Number(d) <= 31
                      ) {
                        setBirthDate(`${y}-${m}-${d}`);
                      }
                    }
                  }}
                  placeholder="19960514"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-violet-400 outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  태어난 시간
                </label>
                <select
                  value={birthHour}
                  onChange={(e) => setBirthHour(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-violet-400"
                >
                  {BIRTH_HOUR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-xs font-bold text-rose-600">{formError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#5c489b] via-[#c96a8b] to-[#f97316] hover:brightness-105 text-white text-sm font-black shadow-md transition"
            >
              {pendingActionLabel
                ? "저장하고 바로 사주 보기 →"
                : "사주 수첩에 저장하기 →"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={startNewForm}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-200 bg-white/75 hover:bg-violet-50/70 text-xs font-extrabold text-violet-700 flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            본인 · 가족 · 친구 · 동료 새 사주 추가하기
          </button>
        )}
      </motion.div>
    </div>
  );
}
