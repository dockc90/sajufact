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

  const moonClipId = `moon-orb-${uid}`;
  const cameoClipId = `moon-cameo-${uid}`;
  const moonAuraId = `moon-aura-${uid}`;
  const moonBodyId = `moon-body-${uid}`;
  const moonSheenId = `moon-sheen-${uid}`;
  const goldMetalId = `moon-gold-${uid}`;
  const pearlMedallionId = `moon-pearl-${uid}`;
  const cloudLeftId = `moon-cloud-l-${uid}`;
  const cloudRightId = `moon-cloud-r-${uid}`;

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="DALTO CATCHER 달토 보름달"
      className={`group relative inline-flex flex-col items-center select-none focus:outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] ${
        isSmall ? "w-[138px]" : "w-[236px] sm:w-[258px]"
      }`}
    >
      <div className="relative w-full">
        <svg
          viewBox="0 0 280 296"
          className="w-full h-auto drop-shadow-[0_14px_28px_rgba(124,84,160,0.2)]"
          aria-hidden="true"
        >
          <defs>
            {/* 보름달 구체 클립패스 */}
            <clipPath id={moonClipId}>
              <circle cx="140" cy="170" r="95" />
            </clipPath>

            {/* 3D 달토끼 카메오(보름달 상단 아치) 클립패스 */}
            <clipPath id={cameoClipId}>
              <path d="M 94 112 L 94 67 C 94 33 186 33 186 67 L 186 112 Q 140 123 94 112 Z" />
            </clipPath>

            {/* 달빛 오라 후광 */}
            <radialGradient id={moonAuraId} cx="50%" cy="52%" r="50%">
              <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.98" />
              <stop offset="52%" stopColor="#fde4ef" stopOpacity="0.58" />
              <stop offset="82%" stopColor="#e9ddff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e9ddff" stopOpacity="0" />
            </radialGradient>

            {/* 보름달 표면 3D 크림-골드 그라데이션 */}
            <radialGradient id={moonBodyId} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#fffef6" />
              <stop offset="36%" stopColor="#fff1bd" />
              <stop offset="72%" stopColor="#f5d380" />
              <stop offset="100%" stopColor="#e3b154" />
            </radialGradient>

            {/* 달 좌상단 하이라이트 광택 */}
            <radialGradient id={moonSheenId} cx="30%" cy="24%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* 샴페인 골드 테두리/별 그라데이션 */}
            <linearGradient id={goldMetalId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff5cf" />
              <stop offset="48%" stopColor="#eac26a" />
              <stop offset="100%" stopColor="#bf8d36" />
            </linearGradient>

            {/* 진주 크림 중앙 메달 */}
            <radialGradient id={pearlMedallionId} cx="42%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="68%" stopColor="#fffaf0" />
              <stop offset="100%" stopColor="#f8e8ca" />
            </radialGradient>

            {/* 파스텔 구름 그라데이션 */}
            <linearGradient id={cloudLeftId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#f3e8ff" stopOpacity="0.92" />
            </linearGradient>
            <linearGradient id={cloudRightId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff8fc" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#fde7f3" stopOpacity="0.92" />
            </linearGradient>
          </defs>

          {/* 바닥 스튜디오 그림자 */}
          <ellipse
            cx="140"
            cy="279"
            rx="92"
            ry="10.5"
            fill="rgba(104, 72, 146, 0.14)"
          />
          <ellipse
            cx="140"
            cy="275"
            rx="64"
            ry="6"
            fill="rgba(104, 72, 146, 0.1)"
          />

          {/* 보름달 후광 오라 */}
          <circle
            cx="140"
            cy="158"
            r={mode === "off" ? 105 : 124}
            fill={`url(#${moonAuraId})`}
            opacity={mode === "off" ? 0.55 : 1}
          />
          <circle
            cx="140"
            cy="170"
            r="104"
            fill="none"
            stroke="#fff3c4"
            strokeWidth="1.8"
            strokeDasharray="4 5"
            opacity={mode === "off" ? 0.35 : 0.78}
          />

          {/* 밤하늘 별 & 별빛 반짝이 장식 */}
          <g className={mode === "loading" ? "animate-pulse" : ""}>
            {/* 좌상단 4각 별 */}
            <path
              d="M 42 52 L 45 60 L 53 63 L 45 66 L 42 74 L 39 66 L 31 63 L 39 60 Z"
              fill={`url(#${goldMetalId})`}
              opacity={mode === "off" ? 0.45 : 0.95}
            />
            {/* 우상단 4각 별 */}
            <path
              d="M 238 56 L 241 64 L 249 67 L 241 70 L 238 78 L 235 70 L 227 67 L 235 64 Z"
              fill={`url(#${goldMetalId})`}
              opacity={mode === "off" ? 0.45 : 0.95}
            />
            {/* 작은 별빛 점들 */}
            <circle cx="64" cy="42" r="2.6" fill="#fde68a" opacity={mode === "off" ? 0.4 : 0.9} />
            <circle cx="216" cy="40" r="2.4" fill="#fbcfe8" opacity={mode === "off" ? 0.4 : 0.9} />
            <circle cx="27" cy="148" r="2.3" fill="#ddd6fe" opacity={mode === "off" ? 0.35 : 0.85} />
            <circle cx="253" cy="146" r="2.3" fill="#fde68a" opacity={mode === "off" ? 0.35 : 0.85} />
            <circle cx="230" cy="248" r="2.8" fill="#fef08a" opacity={mode === "off" ? 0.4 : 0.9} />
            <circle cx="52" cy="246" r="2.2" fill="#e9d5ff" opacity={mode === "off" ? 0.4 : 0.85} />
          </g>

          {/* 보름달 본체 */}
          <circle
            cx="140"
            cy="170"
            r="97"
            fill="#f3d68b"
            opacity="0.45"
          />
          <circle
            cx="140"
            cy="170"
            r="95"
            fill={`url(#${moonBodyId})`}
            stroke={`url(#${goldMetalId})`}
            strokeWidth="2.8"
          />

          {/* 보름달 내부 크레이터 & 달빛 질감 */}
          <g clipPath={`url(#${moonClipId})`}>
            <circle cx="140" cy="170" r="95" fill={`url(#${moonSheenId})`} />

            {/* 부드러운 달 분화구(크레이터) */}
            <ellipse
              cx="74"
              cy="145"
              rx="18"
              ry="14"
              transform="rotate(-18 74 145)"
              fill="#e4b85e"
              opacity="0.22"
            />
            <ellipse
              cx="206"
              cy="154"
              rx="15"
              ry="12"
              transform="rotate(14 206 154)"
              fill="#e4b85e"
              opacity="0.22"
            />
            <circle cx="64" cy="196" r="11" fill="#e0b052" opacity="0.2" />
            <circle cx="212" cy="204" r="13" fill="#e0b052" opacity="0.2" />
            <circle cx="94" cy="242" r="9" fill="#dfac4c" opacity="0.18" />
            <circle cx="188" cy="240" r="10" fill="#dfac4c" opacity="0.18" />

            {/* 오프 상태 달빛 톤 다운 */}
            {mode === "off" && (
              <rect
                x="40"
                y="70"
                width="200"
                height="200"
                fill="rgba(88, 72, 128, 0.14)"
              />
            )}
          </g>

          {/* 좌·우 파스텔 구름 (보름달 하단 가장자리를 감싸는 몽실구름) */}
          <g>
            {/* 왼쪽 라벤더 크림 구름 */}
            <path
              d="M 28 242 C 20 242 14 235 16 227 C 18 220 25 217 31 218 C 34 208 45 204 54 209 C 60 202 72 204 77 213 C 85 213 92 220 90 229 C 89 237 82 242 74 242 Z"
              fill={`url(#${cloudLeftId})`}
              stroke="#e9ddff"
              strokeWidth="1.4"
            />
            {/* 오른쪽 핑크 크림 구름 */}
            <path
              d="M 206 244 C 198 244 192 238 193 230 C 194 223 201 218 208 219 C 212 209 224 206 233 212 C 239 206 250 209 253 218 C 261 218 267 225 265 234 C 263 241 257 244 249 244 Z"
              fill={`url(#${cloudRightId})`}
              stroke="#fbd6e6"
              strokeWidth="1.4"
            />
          </g>

          {/* 보송보송 3D 실사 달토끼 카메오 (보름달 상단 아치 위에서 빼꼼) */}
          <g className={mode === "loading" ? "animate-pixel-hop" : ""}>
            <path
              d="M 92 112 L 92 66 C 92 29 188 29 188 66 L 188 112 Q 140 124 92 112 Z"
              fill="#fff9f2"
              stroke={`url(#${goldMetalId})`}
              strokeWidth="3.8"
              strokeLinejoin="round"
            />
            <g clipPath={`url(#${cameoClipId})`}>
              <image
                href="/mascot/dalto-basic.jpg"
                x="88"
                y="26"
                width="104"
                height="104"
                preserveAspectRatio="xMidYMid slice"
                opacity={mode === "off" ? 0.7 : 1}
              />
              {mode === "off" && (
                <rect
                  x="88"
                  y="26"
                  width="104"
                  height="104"
                  fill="rgba(76, 62, 108, 0.24)"
                />
              )}
            </g>

            {/* 아치 위 진주 장식 비즈 */}
            <circle cx="112" cy="42" r="2.5" fill="#fffdf9" stroke="#e4c274" strokeWidth="1" />
            <circle cx="140" cy="35" r="3" fill="#fffdf9" stroke="#e4c274" strokeWidth="1.1" />
            <circle cx="168" cy="42" r="2.5" fill="#fffdf9" stroke="#e4c274" strokeWidth="1" />

            {/* 오프 상태일 때 잠든 zZ / 로딩일 때 반짝 별 */}
            {mode === "off" && (
              <g>
                <rect
                  x="178"
                  y="32"
                  width="26"
                  height="17"
                  rx="8.5"
                  fill="#ffffff"
                  stroke="#ddd6fe"
                  strokeWidth="1.2"
                />
                <text
                  x="191"
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
                <text x="66" y="48" fontSize="15">
                  ✦
                </text>
                <text x="198" y="48" fontSize="15">
                  ✦
                </text>
              </g>
            )}
          </g>

          {/* 보름달 중앙 하단 진주-골드 주얼 메달 (상단 카메오와 겹침 0%) */}
          <circle cx="140" cy="196" r="49" fill="#d9ad54" opacity="0.28" />
          <circle
            cx="140"
            cy="196"
            r="46"
            fill={`url(#${pearlMedallionId})`}
            stroke={`url(#${goldMetalId})`}
            strokeWidth="5"
          />
          <circle
            cx="140"
            cy="196"
            r="39.5"
            fill="none"
            stroke="#f0d394"
            strokeWidth="1.4"
          />
          <circle cx="140" cy="154" r="2" fill="#fffdf9" />
          <circle cx="140" cy="238" r="2" fill="#fffdf9" />
        </svg>

        {/* 중앙 메달 안쪽 상태 UI (한 줄 보장 · 겹침 0%) */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center leading-none"
          style={{ top: "50.7%", width: "33%", height: "31.1%" }}
        >
          {mode === "off" && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={`font-serif font-black text-[#c99b44] ${
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
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={`font-serif font-black text-[#d49635] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                月
              </span>
              {!isSmall && (
                <span className="rounded-full bg-rose-100/95 border border-rose-200 text-rose-600 px-2 py-0.5 text-[9px] font-black whitespace-nowrap animate-pulse">
                  달빛 뽑기!
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
                月
              </span>
              <span className={isSmall ? "text-[9px]" : "text-xs"}>✨</span>
            </div>
          )}

          {mode === "result" && (
            <div className="relative flex flex-col items-center justify-center w-full">
              <span
                aria-hidden="true"
                className={`font-serif font-black text-[#f4dcb0]/55 leading-none select-none ${
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
                  className={`font-mono font-black tracking-tight text-[#d9467a] whitespace-nowrap drop-shadow-[0_1px_0_rgba(255,255,255,0.95)] ${
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
            : "-mt-1 inline-flex items-center gap-1 rounded-full bg-white/95 border border-amber-200/80 px-3 py-0.5 text-[10px] font-black tracking-wider text-[#6f4b9c] shadow-2xs"
        }
      >
        🌕 DALTO CATCHER
      </span>
    </button>
  );
}
