"use client";

import { useId } from "react";

interface FortuneCatcherDeviceProps {
  mode: "off" | "idle" | "loading" | "result";
  score?: number;
  size?: "lg" | "sm";
  onPress?: () => void;
}

export function FortuneCatcherDevice({
  mode,
  score,
  size = "lg",
  onPress,
}: FortuneCatcherDeviceProps) {
  const uid = useId().replace(/:/g, "");
  const isSmall = size === "sm";

  const moonClipId = `lux-moon-orb-${uid}`;
  const moonAuraId = `lux-moon-aura-${uid}`;
  const moonBodyId = `lux-moon-body-${uid}`;
  const moonSheenId = `lux-moon-sheen-${uid}`;
  const moonBounceId = `lux-moon-bounce-${uid}`;
  const goldMetalId = `lux-moon-gold-${uid}`;
  const goldRingId = `lux-moon-ring-${uid}`;
  const pearlMedallionId = `lux-moon-pearl-${uid}`;
  const mistLeftId = `lux-mist-l-${uid}`;
  const mistRightId = `lux-mist-r-${uid}`;

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="DALTO FULL MOON 달토 보름달"
      className={`group relative inline-flex flex-col items-center select-none focus:outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] ${
        isSmall ? "w-[138px]" : "w-[236px] sm:w-[258px]"
      }`}
    >
      <div className="relative w-full">
        <svg
          viewBox="0 0 280 280"
          className="w-full h-auto drop-shadow-[0_16px_32px_rgba(92,72,155,0.22)]"
          aria-hidden="true"
        >
          <defs>
            {/* 보름달 구체 클립패스 */}
            <clipPath id={moonClipId}>
              <circle cx="140" cy="140" r="96" />
            </clipPath>

            {/* 다층 셀레스티얼 달빛 후광 */}
            <radialGradient id={moonAuraId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffdf0" stopOpacity="0.98" />
              <stop offset="48%" stopColor="#fbe9bd" stopOpacity="0.62" />
              <stop offset="78%" stopColor="#e9dcff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#e9dcff" stopOpacity="0" />
            </radialGradient>

            {/* 5단 구면 입체 보름달 그라데이션 */}
            <radialGradient id={moonBodyId} cx="36%" cy="30%" r="72%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#fff9e4" />
              <stop offset="62%" stopColor="#f9df97" />
              <stop offset="88%" stopColor="#deb053" />
              <stop offset="100%" stopColor="#b6812c" />
            </radialGradient>

            {/* 좌상단 초승달 광택 하이라이트 */}
            <radialGradient id={moonSheenId} cx="28%" cy="22%" r="52%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* 우하단 은은한 바운스 림 라이트 */}
            <radialGradient id={moonBounceId} cx="78%" cy="80%" r="48%">
              <stop offset="0%" stopColor="#fff3d1" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#fff3d1" stopOpacity="0" />
            </radialGradient>

            {/* 샴페인 골드 금속 베젤 */}
            <linearGradient id={goldMetalId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7d9" />
              <stop offset="42%" stopColor="#ebc368" />
              <stop offset="76%" stopColor="#ca973a" />
              <stop offset="100%" stopColor="#9f7021" />
            </linearGradient>

            {/* 천체 궤도 헤어라인 링 */}
            <linearGradient id={goldRingId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7dfa0" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#d7ad56" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f2d6ff" stopOpacity="0.85" />
            </linearGradient>

            {/* 진주-아이보리 중앙 메달 */}
            <radialGradient id={pearlMedallionId} cx="40%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#fffaf0" />
              <stop offset="100%" stopColor="#f4e0b8" />
            </radialGradient>

            {/* 실크 달빛 안개/운무 레이어 */}
            <linearGradient id={mistLeftId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#efe5ff" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id={mistRightId} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff7fc" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#fde6f1" stopOpacity="0.22" />
            </linearGradient>
          </defs>

          {/* 바닥 스튜디오 그림자 */}
          <ellipse
            cx="140"
            cy="262"
            rx="88"
            ry="9.5"
            fill="rgba(88, 66, 134, 0.14)"
          />
          <ellipse
            cx="140"
            cy="259"
            rx="58"
            ry="5"
            fill="rgba(88, 66, 134, 0.1)"
          />

          {/* 셀레스티얼 오라 후광 */}
          <circle
            cx="140"
            cy="140"
            r={mode === "off" ? 116 : 134}
            fill={`url(#${moonAuraId})`}
            opacity={mode === "off" ? 0.52 : 1}
          />

          {/* 이중 천체 궤도 골드 링 */}
          <circle
            cx="140"
            cy="140"
            r="116"
            fill="none"
            stroke={`url(#${goldRingId})`}
            strokeWidth="1.2"
            opacity={mode === "off" ? 0.38 : 0.88}
          />
          <circle
            cx="140"
            cy="140"
            r="107"
            fill="none"
            stroke="#f4d68c"
            strokeWidth="1.2"
            strokeDasharray="2.5 5.5"
            opacity={mode === "off" ? 0.35 : 0.85}
          />

          {/* 4방위 다이아몬드 별 & 진주 성좌 비즈 */}
          <g className={mode === "loading" ? "animate-pulse" : ""}>
            {/* 좌상단 4각 다이아몬드 별 */}
            <path
              d="M 48 44 L 51.5 53.5 L 61 57 L 51.5 60.5 L 48 70 L 44.5 60.5 L 35 57 L 44.5 53.5 Z"
              fill={`url(#${goldMetalId})`}
              opacity={mode === "off" ? 0.45 : 0.96}
            />
            {/* 우상단 4각 다이아몬드 별 */}
            <path
              d="M 232 48 L 235 56 L 243 59 L 235 62 L 232 70 L 229 62 L 221 59 L 229 56 Z"
              fill={`url(#${goldMetalId})`}
              opacity={mode === "off" ? 0.45 : 0.96}
            />
            {/* 하단 좌·우 미세 별빛 */}
            <path
              d="M 42 214 L 44 220 L 50 222 L 44 224 L 42 230 L 40 224 L 34 222 L 40 220 Z"
              fill="#f3d07a"
              opacity={mode === "off" ? 0.35 : 0.9}
            />
            <path
              d="M 238 214 L 240 220 L 246 222 L 240 224 L 238 230 L 236 224 L 230 222 L 236 220 Z"
              fill="#f3d07a"
              opacity={mode === "off" ? 0.35 : 0.9}
            />
            {/* 궤도 위 진주 스터드 */}
            <circle cx="140" cy="24" r="3" fill="#fffdf7" stroke="#d7ad56" strokeWidth="1.1" />
            <circle cx="24" cy="140" r="2.6" fill="#fffdf7" stroke="#d7ad56" strokeWidth="1" />
            <circle cx="256" cy="140" r="2.6" fill="#fffdf7" stroke="#d7ad56" strokeWidth="1" />
            <circle cx="140" cy="256" r="2.6" fill="#fffdf7" stroke="#d7ad56" strokeWidth="1" />
          </g>

          {/* 보름달 외곽 금테 베젤 & 본체 */}
          <circle cx="140" cy="140" r="98.5" fill="#e5be67" opacity="0.32" />
          <circle
            cx="140"
            cy="140"
            r="96"
            fill={`url(#${moonBodyId})`}
            stroke={`url(#${goldMetalId})`}
            strokeWidth="3"
          />

          {/* 보름달 내부 입체 달빛 질감 & 월면(마리아) */}
          <g clipPath={`url(#${moonClipId})`}>
            <circle cx="140" cy="140" r="96" fill={`url(#${moonSheenId})`} />
            <circle cx="140" cy="140" r="96" fill={`url(#${moonBounceId})`} />

            {/* 은은한 월면 질감 (고급스러운 음영) */}
            <ellipse
              cx="84"
              cy="96"
              rx="22"
              ry="15"
              transform="rotate(-24 84 96)"
              fill="#cf9c40"
              opacity="0.14"
            />
            <ellipse
              cx="198"
              cy="102"
              rx="18"
              ry="13"
              transform="rotate(18 198 102)"
              fill="#cf9c40"
              opacity="0.12"
            />
            <ellipse
              cx="74"
              cy="176"
              rx="16"
              ry="12"
              transform="rotate(15 74 176)"
              fill="#c89336"
              opacity="0.14"
            />
            <ellipse
              cx="204"
              cy="184"
              rx="19"
              ry="13"
              transform="rotate(-16 204 184)"
              fill="#c89336"
              opacity="0.14"
            />
            <circle cx="116" cy="64" r="10" fill="#d3a146" opacity="0.1" />
            <circle cx="168" cy="214" r="11" fill="#c89336" opacity="0.12" />

            {/* 내곽 헤어라인 음각 링 */}
            <circle
              cx="140"
              cy="140"
              r="86"
              fill="none"
              stroke="#fff7da"
              strokeWidth="1"
              opacity="0.65"
            />

            {/* 오프 상태 달빛 톤 다운 */}
            {mode === "off" && (
              <rect
                x="40"
                y="40"
                width="200"
                height="200"
                fill="rgba(76, 62, 114, 0.16)"
              />
            )}
          </g>

          {/* 하단 가장자리를 감싸는 슬림한 실크 운무(빛의 안개) */}
          <path
            d="M 28 214 Q 54 198 86 210 Q 108 218 130 212 Q 92 232 48 228 Q 34 226 28 214 Z"
            fill={`url(#${mistLeftId})`}
          />
          <path
            d="M 252 214 Q 226 198 194 210 Q 172 218 150 212 Q 188 232 232 228 Q 246 226 252 214 Z"
            fill={`url(#${mistRightId})`}
          />

          {/* 중앙 진주-샴페인 골드 주얼 메달 (완벽한 동심원 대칭) */}
          <circle cx="140" cy="140" r="54" fill="#c99535" opacity="0.22" />
          <circle
            cx="140"
            cy="140"
            r="50"
            fill={`url(#${pearlMedallionId})`}
            stroke={`url(#${goldMetalId})`}
            strokeWidth="4.8"
          />
          <circle
            cx="140"
            cy="140"
            r="43"
            fill="none"
            stroke="#ecd08c"
            strokeWidth="1.2"
          />
          {/* 메달 4방위 미세 스터드 */}
          <circle cx="140" cy="94" r="1.8" fill="#d9ad54" />
          <circle cx="140" cy="186" r="1.8" fill="#d9ad54" />
          <circle cx="94" cy="140" r="1.8" fill="#d9ad54" />
          <circle cx="186" cy="140" r="1.8" fill="#d9ad54" />

          {/* 오프 상태일 때 우상단 zZ 배지 */}
          {mode === "off" && (
            <g>
              <rect
                x="194"
                y="48"
                width="28"
                height="18"
                rx="9"
                fill="#ffffff"
                stroke="#ddd6fe"
                strokeWidth="1.2"
              />
              <text
                x="208"
                y="61"
                textAnchor="middle"
                fill="#6f589c"
                fontSize="10"
                fontWeight="800"
              >
                zZ
              </text>
            </g>
          )}
        </svg>

        {/* 중앙 메달 안쪽 상태 UI (한 줄 보장 · 완벽한 정중앙 배치) */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center leading-none"
          style={{ top: "32.1%", width: "35.8%", height: "35.8%" }}
        >
          {mode === "off" && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={`font-serif font-black text-[#c2923c] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                月
              </span>
              {!isSmall && (
                <span className="text-[9.5px] font-extrabold text-slate-500 whitespace-nowrap">
                  터치해 켜기
                </span>
              )}
            </div>
          )}

          {mode === "idle" && (
            <div className="flex flex-col items-center justify-center gap-1">
              <span
                className={`font-serif font-black text-[#cc8c2a] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                月
              </span>
              {!isSmall && (
                <span className="rounded-full bg-rose-100/95 border border-rose-200 text-rose-600 px-2.5 py-0.5 text-[9.5px] font-black whitespace-nowrap animate-pulse">
                  달빛 뽑기
                </span>
              )}
            </div>
          )}

          {mode === "loading" && (
            <div className="flex flex-col items-center justify-center gap-0.5 animate-pulse">
              <span
                className={`font-serif font-black text-[#cc8c2a] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                月
              </span>
              <span className={isSmall ? "text-[9px]" : "text-xs text-[#c49234]"}>
                ✦
              </span>
            </div>
          )}

          {mode === "result" && (
            <div className="relative flex flex-col items-center justify-center w-full">
              <span
                aria-hidden="true"
                className={`font-serif font-black text-[#f0d6a4]/50 leading-none select-none ${
                  isSmall ? "text-2xl" : "text-5xl"
                }`}
              >
                月
              </span>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-extrabold text-slate-600 whitespace-nowrap tracking-tight ${
                    isSmall ? "text-[8.5px] mb-0.5" : "text-[11px] mb-0.5"
                  }`}
                >
                  행운점수
                </span>
                <span
                  className={`font-mono font-black tracking-tight text-[#c4366b] whitespace-nowrap drop-shadow-[0_1px_0_rgba(255,255,255,0.95)] ${
                    isSmall ? "text-[22px]" : "text-3xl sm:text-4xl"
                  }`}
                >
                  {score ?? 88}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 브랜드 라벨 */}
      <span
        className={
          isSmall
            ? "sr-only"
            : "-mt-1 inline-flex items-center gap-1 rounded-full bg-white/95 border border-amber-300/80 px-3.5 py-0.5 text-[10px] font-black tracking-[0.12em] text-[#6a4796] shadow-2xs"
        }
      >
        DALTO FULL MOON
      </span>
    </button>
  );
}
