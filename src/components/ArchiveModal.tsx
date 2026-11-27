"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  FolderOpen,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ELEMENT_THEMES, MENU_ITEMS } from "@/lib/saju-engine";
import type { ElementKey, PaymentPlan, SajuReport } from "@/lib/saju-types";

export interface SavedReportRecord {
  report: SajuReport;
  paidPlan: PaymentPlan | null;
  keeperPhone?: string;
  savedAt: string;
}

const STORAGE_KEY = "sajufact_reports_v1";

export function loadLocalArchive(): SavedReportRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<
      string,
      { report: SajuReport; plan?: PaymentPlan | null; paidPlan?: PaymentPlan | null; keeperPhone?: string; savedAt?: string }
    >;
    return Object.values(map)
      .filter((v) => v && v.report && v.report.id)
      .map((v) => ({
        report: v.report,
        paidPlan: v.paidPlan ?? v.plan ?? null,
        keeperPhone: v.keeperPhone,
        savedAt: v.savedAt || v.report.createdAt || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
}

export function upsertLocalArchive(
  report: SajuReport,
  paidPlan: PaymentPlan | null,
  keeperPhone?: string
) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    map[report.id] = {
      report,
      plan: paidPlan,
      paidPlan,
      keeperPhone,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

export function removeFromLocalArchive(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, unknown>;
    delete map[id];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

interface ArchiveModalProps {
  open: boolean;
  onClose: () => void;
  onSelectReport: (report: SajuReport, paidPlan: PaymentPlan | null, keeperPhone?: string) => void;
  currentReportId?: string;
}

export function ArchiveModal({
  open,
  onClose,
  onSelectReport,
  currentReportId,
}: ArchiveModalProps) {
  const [localItems, setLocalItems] = useState<SavedReportRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cloudItems, setCloudItems] = useState<SavedReportRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>("all");

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setLocalItems(loadLocalArchive());
    });
  }, [open]);

  const userNames = Array.from(
    new Set(localItems.map((item) => item.report.input.name || "익명"))
  );

  const filteredLocalItems =
    selectedUserFilter === "all"
      ? localItems
      : localItems.filter(
          (item) => (item.report.input.name || "익명") === selectedUserFilter
        );

  const handleCloudSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/reports?user=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          items?: Array<{
            id: string;
            paidPlan: PaymentPlan | null;
            keeperPhone?: string;
            createdAt: string;
            report: SajuReport | null;
          }>;
        };
        const mapped = (data.items || [])
          .filter((x): x is typeof x & { report: SajuReport } => Boolean(x.report))
          .map((x) => ({
            report: x.report,
            paidPlan: x.paidPlan,
            keeperPhone: x.keeperPhone,
            savedAt: x.createdAt,
          }));
        setCloudItems(mapped);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyUrl = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?saved=${encodeURIComponent(id)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDeleteLocal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromLocalArchive(id);
    setLocalItems(loadLocalArchive());
  };

  const getPlanBadge = (plan: PaymentPlan | null) => {
    if (plan === "allinone") {
      return (
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-amber-200">
          올인원 해제
        </span>
      );
    }
    if (plan === "single") {
      return (
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
          단건 리포트 해제
        </span>
      );
    }
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
        무료 미리보기
      </span>
    );
  };

  const getMenuLabel = (menu: string) =>
    MENU_ITEMS.find((m) => m.id === menu)?.title ?? "사주 분석";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: 36, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-white/60 bg-white/95 p-5 shadow-2xl sm:rounded-[2rem] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-amber-200">
                  <FolderOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    내 사주 평생 보관함
                  </h3>
                  <p className="text-xs text-slate-500">
                    결과 URL 복사 또는 이름·번호로 언제든 다시 열기
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 클라우드 검색 폼 */}
            <form onSubmit={handleCloudSearch} className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="다른 기기 기록 찾기: 이름 또는 휴대폰 번호"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {isSearching ? "조회 중..." : "서버 조회"}
              </button>
            </form>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {/* 서버 조회 결과 */}
              {hasSearched && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">
                      ☁️ 서버 보관함 검색 결과 ({cloudItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setHasSearched(false);
                        setCloudItems([]);
                      }}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                    >
                      닫기
                    </button>
                  </div>
                  {cloudItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                      일치하는 서버 기록이 없습니다. 결제 시 입력한 번호나 정확한 이름을 확인해 주세요.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cloudItems.map((item) => {
                        const elTheme =
                          ELEMENT_THEMES[
                            (item.report.dominantElement as ElementKey) || "fire"
                          ];
                        return (
                          <div
                            key={`cloud-${item.report.id}`}
                            onClick={() => {
                              upsertLocalArchive(
                                item.report,
                                item.paidPlan,
                                item.keeperPhone
                              );
                              onSelectReport(
                                item.report,
                                item.paidPlan,
                                item.keeperPhone
                              );
                              onClose();
                            }}
                            className="cursor-pointer rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 transition hover:border-indigo-400 hover:bg-indigo-50"
                          >
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: elTheme.accentColor }}
                                />
                                <span className="text-xs font-extrabold text-slate-900">
                                  {item.report.input.name}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {item.report.input.birthDate}
                                </span>
                              </div>
                              {getPlanBadge(item.paidPlan)}
                            </div>
                            <p className="line-clamp-2 break-keep leading-snug text-xs font-semibold text-slate-700">
                              [{getMenuLabel(item.report.input.menu)}]{" "}
                              {item.report.oneLineFact}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 사용자별 필터 칩 */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    📱 이 기기에 자동 보관된 리포트 ({localItems.length})
                  </span>
                </div>

                {userNames.length > 1 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedUserFilter("all")}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        selectedUserFilter === "all"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      전체 ({localItems.length})
                    </button>
                    {userNames.map((uname) => (
                      <button
                        key={uname}
                        type="button"
                        onClick={() => setSelectedUserFilter(uname)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                          selectedUserFilter === uname
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {uname}
                      </button>
                    ))}
                  </div>
                )}

                {filteredLocalItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <Sparkles className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-600">
                      아직 이 기기에 저장된 사주 결과가 없습니다.
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      사주를 1회만 분석해도 이곳과 전용 URL에 자동 보관됩니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredLocalItems.map((item) => {
                      const elTheme = ELEMENT_THEMES[item.report.dominantElement];
                      const isCurrent = item.report.id === currentReportId;
                      return (
                        <div
                          key={item.report.id}
                          onClick={() => {
                            onSelectReport(
                              item.report,
                              item.paidPlan,
                              item.keeperPhone
                            );
                            onClose();
                          }}
                          className={`group cursor-pointer rounded-2xl border p-3.5 transition ${
                            isCurrent
                              ? "border-slate-900 bg-amber-50/50"
                              : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm"
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: elTheme.accentColor }}
                              />
                              <span className="text-xs font-extrabold text-slate-900">
                                {item.report.input.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                ({item.report.input.birthDate})
                              </span>
                              {isCurrent && (
                                <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                  현재 보는 중
                                </span>
                              )}
                            </div>
                            {getPlanBadge(item.paidPlan)}
                          </div>

                          <p className="mb-2 line-clamp-2 break-keep leading-snug text-xs font-semibold text-slate-700">
                            [{getMenuLabel(item.report.input.menu)}]{" "}
                            {item.report.oneLineFact}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              {item.report.dayMasterHangul}
                              {item.report.dayBranchHangul ?? ""} 일주 ·{" "}
                              {new Date(item.savedAt).toLocaleDateString("ko-KR")}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => handleCopyUrl(e, item.report.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                              >
                                {copiedId === item.report.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />{" "}
                                    복사됨
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" /> URL 복사
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteLocal(e, item.report.id)}
                                title="기기 목록에서 삭제"
                                className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
