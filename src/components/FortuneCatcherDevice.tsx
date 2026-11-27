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

  const bodyClipId = `royal-body-${uid}`;
  const cameoClipId = `royal-cameo-${uid}`;
  const coralSilkId = `royal-coral-${uid}`;
  const indigoSilkId = `royal-indigo-${uid}`;
  const roseSilkId = `royal-rose-${uid}`;
  const lavenderSilkId = `royal-lavender-${uid}`;
  const velvetInnerId = `royal-velvet-${uid}`;
  const goldMetalId = `royal-gold-${uid}`;
  const pearlMedallionId = `royal-pearl-${uid}`;
  const brocadePatternId = `royal-brocade-${uid}`;
  const haloGradId = `royal-halo-${uid}`;
  const satinSheenId = `royal-sheen-${uid}`;

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="DALTO CATCHER 달토 복주머니"
      className={`group relative inline-flex flex-col items-center select-none focus:outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] ${
        isSmall ? "w-[138px]" : "w-[236px] sm:w-[258px]"
      }`}
    >
      <div className="relative w-full">
        <svg
          viewBox="0 0 280 296"
          className="w-full h-auto drop-shadow-[0_14px_26px_rgba(124,84,160,0.22)]"
          aria-hidden="true"
        >
          <defs>
            {/* 복주머니 실루엣 클립패스 */}
            <clipPath id={bodyClipId}>
              <path d="M 86 122 C 110 132 170 132 194 122 C 234 138 256 178 252 214 C 248 254 206 274 140 274 C 74 274 32 254 28 214 C 24 178 46 138 86 122 Z" />
            </clipPath>

            {/* 3D 달토끼 카메오(복주머니 입구 안쪽) 클립패스 */}
            <clipPath id={cameoClipId}>
              <path d="M 90 112 L 90 66 C 90 30 190 30 190 66 L 190 112 Q 140 124 90 112 Z" />
            </clipPath>

            {/* 파스텔 오라 광채 */}
            <radialGradient id={haloGradId} cx="50%" cy="46%" r="50%">
              <stop offset="0%" stopColor="#fff6c7" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#ffd7e8" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#ffd7e8" stopOpacity="0" />
            </radialGradient>

            {/* 실크 브로케이드(금박 구름·꽃) 패턴 */}
            <pattern
              id={brocadePatternId}
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="14"
                cy="14"
                r="8.5"
                fill="none"
                stroke="#ffe9b3"
                strokeWidth="0.9"
                strokeDasharray="2.5 2"
                opacity="0.35"
              />
              <circle cx="14" cy="14" r="2.2" fill="#ffe9b3" opacity="0.32" />
              <circle cx="0" cy="0" r="1.5" fill="#fff4d1" opacity="0.28" />
              <circle cx="28" cy="28" r="1.5" fill="#fff4d1" opacity="0.28" />
              <circle cx="28" cy="0" r="1.5" fill="#fff4d1" opacity="0.28" />
              <circle cx="0" cy="28" r="1.5" fill="#fff4d1" opacity="0.28" />
            </pattern>

            {/* 3D 새틴 실크 그라데이션 */}
            <linearGradient id={coralSilkId} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#ffabb0" />
              <stop offset="48%" stopColor="#f46885" />
              <stop offset="100%" stopColor="#d9486b" />
            </linearGradient>

            <linearGradient id={indigoSilkId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#656cb8" />
              <stop offset="100%" stopColor="#434886" />
            </linearGradient>

            <linearGradient id={roseSilkId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8a7c5" />
              <stop offset="100%" stopColor="#e5759e" />
            </linearGradient>

            <linearGradient id={lavenderSilkId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9c7de0" />
              <stop offset="100%" stopColor="#7251b3" />
            </linearGradient>

            <linearGradient id={velvetInnerId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#832140" />
              <stop offset="100%" stopColor="#c43f64" />
            </linearGradient>

            {/* 입체 샴페인 골드 금속/매듭 그라데이션 */}
            <linearGradient id={goldMetalId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff2c6" />
              <stop offset="48%" stopColor="#e8be66" />
              <stop offset="100%" stopColor="#ba8832" />
            </linearGradient>

            {/* 진주 크림 메달 배경 */}
            <radialGradient id={pearlMedallionId} cx="42%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="68%" stopColor="#fffaf0" />
              <stop offset="100%" stopColor="#f8e8ca" />
            </radialGradient>

            {/* 비단 광택 하이라이트 */}
            <linearGradient id={satinSheenId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 다층 스튜디오 그림자 */}
          <ellipse
            cx="140"
            cy="279"
            rx="94"
            ry="11"
            fill="rgba(104, 72, 146, 0.14)"
          />
          <ellipse
            cx="140"
            cy="275"
            rx="68"
            ry="6.5"
            fill="rgba(104, 72, 146, 0.12)"
          />

          {/* 뒤쪽 파스텔 오라 후광 */}
          <circle
            cx="140"
            cy="88"
            r={mode === "off" ? 56 : 74}
            fill={`url(#${haloGradId})`}
            opacity={mode === "off" ? 0.45 : 0.95}
          />

          {/* 복주머니 뒷단 실크 셔링 & 벨벳 안쪽 */}
          <path
            d="M 68 82 C 78 72 94 84 104 75 C 115 66 127 79 140 72 C 153 79 165 66 176 75 C 186 84 202 72 212 82 L 194 128 L 86 128 Z"
            fill="#df4e6f"
          />
          <ellipse cx="140" cy="100" rx="52" ry="24" fill={`url(#${velvetInnerId})`} />

          {/* 보송보송 3D 실사 달토끼 카메오 (복주머니 입구에서 빼꼼) */}
          <g className={mode === "loading" ? "animate-pixel-hop" : ""}>
            {/* 금실·진주 아치 프레임 */}
            <path
              d="M 88 112 L 88 65 C 88 26 192 26 192 65 L 192 112"
              fill="#fff7fa"
              stroke={`url(#${goldMetalId})`}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <g clipPath={`url(#${cameoClipId})`}>
              <image
                href="/mascot/dalto-basic.jpg"
                x="84"
                y="24"
                width="112"
                height="112"
                preserveAspectRatio="xMidYMid slice"
                opacity={mode === "off" ? 0.68 : 1}
              />
              {mode === "off" && (
                <rect
                  x="84"
                  y="24"
                  width="112"
                  height="112"
                  fill="rgba(76, 62, 108, 0.24)"
                />
              )}
            </g>

            {/* 아치 위 진주 장식 비즈 */}
            <circle cx="110" cy="41" r="2.6" fill="#fffdf9" stroke="#e4c274" strokeWidth="1" />
            <circle cx="140" cy="34" r="3.1" fill="#fffdf9" stroke="#e4c274" strokeWidth="1.1" />
            <circle cx="170" cy="41" r="2.6" fill="#fffdf9" stroke="#e4c274" strokeWidth="1" />

            {/* 오프 상태일 때 잠든 zZ / 로딩일 때 반짝 별 */}
            {mode === "off" && (
              <g>
                <rect
                  x="179"
                  y="32"
                  width="26"
                  height="17"
                  rx="8.5"
                  fill="#ffffff"
                  stroke="#ddd6fe"
                  strokeWidth="1.2"
                />
                <text
                  x="192"
                  y="44"
                  textAnchor="middle"
                  fill="#7c63a6"
                  fontSize="10"
                  fontWeight="800"
                >
                  zZ
                </text>
              </g>
            )}
            {mode === "loading" && (
              <g fill="#f5c451">
                <text x="64" y="48" fontSize="15">
                  ✦
                </text>
                <text x="200" y="48" fontSize="15">
                  ✦
                </text>
              </g>
            )}
          </g>

          {/* 복주머니 앞쪽 입체 비단 셔링 칼라 */}
          <path
            d="M 68 102 Q 80 114 92 106 Q 105 117 118 108 Q 129 118 140 110 Q 151 118 162 108 Q 175 117 188 106 Q 200 114 212 102 L 195 126 C 166 135 114 135 85 126 Z"
            fill={`url(#${coralSilkId})`}
            stroke="#f7d794"
            strokeWidth="1.2"
          />
          <path
            d="M 96 108 L 101 125 M 118 110 L 121 128 M 140 112 L 140 130 M 162 110 L 159 128 M 184 108 L 179 125"
            stroke="#c73759"
            strokeWidth="1.9"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* 비단 조각보 복주머니 몸통 (금박 브로케이드 + 금실 파이핑) */}
          <g clipPath={`url(#${bodyClipId})`}>
            {/* 메인 코랄 비단 */}
            <rect x="20" y="116" width="240" height="164" fill={`url(#${coralSilkId})`} />

            {/* 좌측 로열 인디고 비단 조각 */}
            <path
              d="M 20 176 C 52 182 70 208 74 276 L 20 276 Z"
              fill={`url(#${indigoSilkId})`}
            />
            {/* 중앙 하단 블러시 로즈 비단 조각 */}
            <path
              d="M 60 186 C 110 198 170 198 220 186 L 206 278 L 74 278 Z"
              fill={`url(#${roseSilkId})`}
            />
            {/* 우측 로열 아메시스트 라벤더 비단 조각 */}
            <path
              d="M 260 176 C 228 182 210 208 206 276 L 260 276 Z"
              fill={`url(#${lavenderSilkId})`}
            />

            {/* 전통 금박 구름/꽃 브로케이드 질감 */}
            <rect x="20" y="116" width="240" height="164" fill={`url(#${brocadePatternId})`} />

            {/* 조각보 이음새 금실 자수 파이핑 */}
            <path
              d="M 22 176 C 54 182 70 208 74 275"
              fill="none"
              stroke="#f5d488"
              strokeWidth="2.2"
              opacity="0.85"
            />
            <path
              d="M 258 176 C 226 182 210 208 206 275"
              fill="none"
              stroke="#f5d488"
              strokeWidth="2.2"
              opacity="0.85"
            />
            <path
              d="M 60 186 C 110 198 170 198 220 186"
              fill="none"
              stroke="#f8dfa0"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* 비단 3D 곡면 광택 */}
            <path
              d="M 42 152 C 74 134 128 134 176 146 C 138 158 92 178 48 212 C 34 190 34 166 42 152 Z"
              fill={`url(#${satinSheenId})`}
            />
          </g>

          {/* 샴페인 골드 노리개 술 (양 어깨 쪽으로 흘러내려 중앙 메달을 가리지 않음) */}
          <g>
            {/* 좌측 금끈 & 태슬 */}
            <path
              d="M 86 126 Q 68 152 66 184"
              fill="none"
              stroke={`url(#${goldMetalId})`}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="66" cy="186" r="4.2" fill="#fffdf9" stroke="#d4a44e" strokeWidth="1.5" />
            <path d="M 62 190 L 58 210 L 74 210 L 70 190 Z" fill={`url(#${goldMetalId})`} />
            <path
              d="M 62 192 L 60 209 M 66 192 L 66 209 M 70 192 L 72 209"
              stroke="#a87624"
              strokeWidth="1"
              opacity="0.6"
            />

            {/* 우측 금끈 & 태슬 */}
            <path
              d="M 194 126 Q 212 152 214 184"
              fill="none"
              stroke={`url(#${goldMetalId})`}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="214" cy="186" r="4.2" fill="#fffdf9" stroke="#d4a44e" strokeWidth="1.5" />
            <path d="M 210 190 L 206 210 L 222 210 L 218 190 Z" fill={`url(#${goldMetalId})`} />
            <path
              d="M 210 192 L 208 209 M 214 192 L 214 209 M 218 192 L 220 209"
              stroke="#a87624"
              strokeWidth="1"
              opacity="0.6"
            />
          </g>

          {/* 허리 조임 샴페인 골드 끈 & 입체 전통 매듭 리본 */}
          <path
            d="M 80 123 Q 140 144 200 123"
            fill="none"
            stroke={`url(#${goldMetalId})`}
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <path
            d="M 80 123 Q 140 144 200 123"
            fill="none"
            stroke="#b5832c"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* 리본 나비 매듭 (cy=134, 하단 메달 cy=208과 충분한 간격 확보) */}
          <g>
            {/* 왼쪽 루프 */}
            <path
              d="M 134 134 C 102 120 92 148 116 155 C 125 157 132 146 136 139 Z"
              fill={`url(#${goldMetalId})`}
              stroke="#b8842d"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* 오른쪽 루프 */}
            <path
              d="M 146 134 C 178 120 188 148 164 155 C 155 157 148 146 144 139 Z"
              fill={`url(#${goldMetalId})`}
              stroke="#b8842d"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* 짧은 리본 끝 (메달 테두리 바깥 위쪽까지만) */}
            <path
              d="M 134 143 Q 124 156 114 166"
              fill="none"
              stroke={`url(#${goldMetalId})`}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d="M 146 143 Q 156 156 166 166"
              fill="none"
              stroke={`url(#${goldMetalId})`}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* 중앙 매듭 + 진주 3알 장식 */}
            <circle
              cx="140"
              cy="135"
              r="7.5"
              fill={`url(#${goldMetalId})`}
              stroke="#b8842d"
              strokeWidth="2"
            />
            <circle cx="131" cy="136" r="2.7" fill="#fffdf9" stroke="#d4a44e" strokeWidth="1" />
            <circle cx="149" cy="136" r="2.7" fill="#fffdf9" stroke="#d4a44e" strokeWidth="1" />
            <circle cx="140" cy="135" r="3" fill="#fffdf9" stroke="#d4a44e" strokeWidth="1" />
          </g>

          {/* 하단 중앙 주얼 베젤 진주-크림 福 메달 (노리개·매듭과 절대 겹치지 않음) */}
          <circle
            cx="140"
            cy="208"
            r="49"
            fill="#d9ad54"
            opacity="0.35"
          />
          <circle
            cx="140"
            cy="208"
            r="46"
            fill={`url(#${pearlMedallionId})`}
            stroke={`url(#${goldMetalId})`}
            strokeWidth="5.5"
          />
          <circle
            cx="140"
            cy="208"
            r="39.5"
            fill="none"
            stroke="#f0d394"
            strokeWidth="1.4"
          />
          <circle cx="140" cy="166" r="2" fill="#fffdf9" />
          <circle cx="140" cy="250" r="2" fill="#fffdf9" />
        </svg>

        {/* 중앙 메달 안쪽 상태 UI (한 줄 보장 · 겹침 0%) */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center leading-none"
          style={{ top: "54.2%", width: "35%", height: "32.2%" }}
        >
          {mode === "off" && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={`font-serif font-black text-[#c99b44] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                福
              </span>
              {!isSmall && (
                <span className="text-[9.5px] font-extrabold text-slate-500 whitespace-nowrap">
                  터치해 켜기
                </span>
              )}
            </div>
          )}

          {mode === "idle" && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={`font-serif font-black text-[#d49635] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                福
              </span>
              {!isSmall && (
                <span className="rounded-full bg-rose-100/95 border border-rose-200 text-rose-600 px-2 py-0.5 text-[9px] font-black whitespace-nowrap animate-pulse">
                  뽑기!
                </span>
              )}
            </div>
          )}

          {mode === "loading" && (
            <div className="flex flex-col items-center justify-center gap-0.5 animate-pulse">
              <span
                className={`font-serif font-black text-[#d49635] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                福
              </span>
              <span className={isSmall ? "text-[9px]" : "text-xs"}>✨</span>
            </div>
          )}

          {mode === "result" && (
            <div className="relative flex flex-col items-center justify-center w-full">
              <span
                aria-hidden="true"
                className={`font-serif font-black text-[#f4dcb0]/50 leading-none select-none ${
                  isSmall ? "text-2xl" : "text-5xl"
                }`}
              >
                福
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
                  className={`font-mono font-black tracking-tight text-[#e84b7a] whitespace-nowrap drop-shadow-[0_1px_0_rgba(255,255,255,0.95)] ${
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

      {/* 브랜드 라벨 (스크린리더 & 대형 카드 하단 표기) */}
      <span
        className={
          isSmall
            ? "sr-only"
            : "-mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 border border-rose-200/80 px-3 py-0.5 text-[10px] font-black tracking-wider text-rose-500 shadow-2xs"
        }
      >
        DALTO CATCHER
      </span>
    </button>
  );
}
