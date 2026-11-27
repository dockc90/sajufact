"use client";

import { useEffect, useRef } from "react";

interface WheelTimePickerProps {
  value: string; // 24h "HH:MM", e.g. "13:00" or "14:56"
  onChange: (next24h: string) => void;
}

const ITEM_HEIGHT = 36;
const PERIOD_OPTIONS = ["오전", "오후"];
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function parse24hToWheel(hhmm: string): {
  period: "오전" | "오후";
  hour12: string;
  minute: string;
} {
  const [hRaw, mRaw] = (hhmm || "13:00").split(":");
  const hParsed = Number.parseInt(hRaw ?? "13", 10);
  const mParsed = Number.parseInt(mRaw ?? "0", 10);
  const h = Number.isFinite(hParsed) ? Math.min(23, Math.max(0, hParsed)) : 13;
  const m = Number.isFinite(mParsed) ? Math.min(59, Math.max(0, mParsed)) : 0;

  if (h < 12) {
    return {
      period: "오전",
      hour12: h === 0 ? "12" : pad2(h),
      minute: pad2(m),
    };
  }
  return {
    period: "오후",
    hour12: h === 12 ? "12" : pad2(h - 12),
    minute: pad2(m),
  };
}

function wheelTo24h(
  period: "오전" | "오후",
  hour12: string,
  minute: string
): string {
  const h12 = Number.parseInt(hour12, 10) || 12;
  let h24 = h12;
  if (period === "오전") {
    h24 = h12 === 12 ? 0 : h12;
  } else {
    h24 = h12 === 12 ? 12 : h12 + 12;
  }
  return `${pad2(h24)}:${minute}`;
}

export function formatKoreanTimeLabel(hhmm: string): string {
  const { period, hour12, minute } = parse24hToWheel(hhmm);
  return `${period} ${hour12}:${minute}`;
}

interface WheelColumnProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
}

function WheelColumn({
  options,
  selectedIndex,
  onSelect,
  ariaLabel,
}: WheelColumnProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const targetTop = selectedIndex * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - targetTop) > 2) {
      el.scrollTop = targetTop;
    }
  }, [selectedIndex]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleScroll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = Math.max(
        0,
        Math.min(options.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT))
      );
      const alignedTop = idx * ITEM_HEIGHT;
      if (Math.abs(el.scrollTop - alignedTop) > 1) {
        el.scrollTo({ top: alignedTop, behavior: "smooth" });
      }
      if (idx !== selectedIndex) {
        onSelect(idx);
      }
    }, 90);
  };

  const handleClick = (idx: number) => {
    const el = scrollRef.current;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (el) {
      el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
    }
    if (idx !== selectedIndex) {
      onSelect(idx);
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="listbox"
      aria-label={ariaLabel}
      className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[72px]"
    >
      {options.map((opt, idx) => {
        const dist = Math.abs(idx - selectedIndex);
        const textStyle =
          dist === 0
            ? "text-[15px] font-black text-slate-900"
            : dist === 1
            ? "text-[14px] font-semibold text-slate-400"
            : "text-[12.5px] font-medium text-slate-300";

        return (
          <button
            key={opt}
            type="button"
            role="option"
            aria-selected={dist === 0}
            onClick={() => handleClick(idx)}
            className={`h-[36px] w-full snap-center flex items-center justify-center transition-colors ${textStyle}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function WheelTimePicker({ value, onChange }: WheelTimePickerProps) {
  const { period, hour12, minute } = parse24hToWheel(value);
  const periodIdx = Math.max(0, PERIOD_OPTIONS.indexOf(period));
  const hourIdx = Math.max(0, HOUR_OPTIONS.indexOf(hour12));
  const minuteIdx = Math.max(0, MINUTE_OPTIONS.indexOf(minute));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500">
        <span>스크롤하거나 눌러서 시간 선택</span>
        <span className="font-extrabold text-amber-700">
          {period} {hour12}:{minute} ({wheelTo24h(period, hour12, minute)})
        </span>
      </div>

      <div className="rounded-2xl bg-[#f7f7f9] border border-slate-200/90 overflow-hidden relative h-[180px] select-none shadow-2xs">
        {/* 가운데 선택 하이라이트 줄 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[36px] border-y border-slate-300/80 bg-white/80"
        />

        {/* 위/아래 페이드 마스크 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-14 z-20 bg-gradient-to-b from-[#f7f7f9] via-[#f7f7f9]/85 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 z-20 bg-gradient-to-t from-[#f7f7f9] via-[#f7f7f9]/85 to-transparent"
        />

        {/* 3단 휠 컬럼 */}
        <div className="grid grid-cols-3 h-full relative z-10 px-3">
          <WheelColumn
            options={PERIOD_OPTIONS}
            selectedIndex={periodIdx}
            onSelect={(idx) =>
              onChange(
                wheelTo24h(
                  PERIOD_OPTIONS[idx] as "오전" | "오후",
                  hour12,
                  minute
                )
              )
            }
            ariaLabel="오전 오후 선택"
          />
          <WheelColumn
            options={HOUR_OPTIONS}
            selectedIndex={hourIdx}
            onSelect={(idx) =>
              onChange(wheelTo24h(period, HOUR_OPTIONS[idx], minute))
            }
            ariaLabel="시 선택"
          />
          <WheelColumn
            options={MINUTE_OPTIONS}
            selectedIndex={minuteIdx}
            onSelect={(idx) =>
              onChange(wheelTo24h(period, hour12, MINUTE_OPTIONS[idx]))
            }
            ariaLabel="분 선택"
          />
        </div>
      </div>
    </div>
  );
}
