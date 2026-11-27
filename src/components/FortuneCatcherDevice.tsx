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
  const bodyClipId = `bok-body-${uid}`;
  const coralGradId = `bok-coral-${uid}`;
  const haloGradId = `bok-halo-${uid}`;

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="DALTO CATCHER 달토 복주머니"
      className={`group relative inline-flex flex-col items-center select-none focus:outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] ${
        isSmall ? "w-[132px]" : "w-[224px] sm:w-[244px]"
      }`}
    >
      <div className="relative w-full">
        <svg
          viewBox="0 0 260 272"
          className="w-full h-auto drop-shadow-[0_10px_22px_rgba(124,92,168,0.16)]"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={bodyClipId}>
              <path d="M 80 112 C 102 120 158 120 180 112 C 218 126 236 164 234 196 C 231 232 192 252 130 252 C 68 252 29 232 26 196 C 24 164 42 126 80 112 Z" />
            </clipPath>
            <linearGradient id={coralGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff928b" />
              <stop offset="100%" stopColor="#ff768f" />
            </linearGradient>
            <radialGradient id={haloGradId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff4b8" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#ffd7e8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffd7e8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 바닥 부드러운 그림자 */}
          <ellipse
            cx="130"
            cy="255"
            rx="88"
            ry="11"
            fill="rgba(124, 98, 168, 0.14)"
          />

          {/* 행운 뽑기 완료/로딩 시 은은한 뒤 광채 */}
          {(mode === "loading" || mode === "result") && (
            <circle cx="130" cy="76" r="64" fill={`url(#${haloGradId})`} />
          )}

          {/* 복주머니 뒷주름 & 깊은 안쪽 */}
          <path
            d="M 66 76 C 74 68 88 78 96 71 C 106 64 118 75 130 69 C 142 75 154 64 164 71 C 172 78 186 68 194 76 L 180 118 L 80 118 Z"
            fill="#f45d7b"
          />
          <ellipse cx="130" cy="96" rx="46" ry="20" fill="#c93e5d" />

          {/* 복주머니 안에서 빼꼼 고개 내민 달토끼 달토 */}
          <g className={mode === "loading" ? "animate-pixel-hop" : ""}>
            {/* 왼쪽 귀 */}
            <g transform="rotate(-11 104 52)">
              <rect
                x="92"
                y="14"
                width="22"
                height="50"
                rx="11"
                fill="#ffffff"
                stroke="#efe6f4"
                strokeWidth="2"
              />
              <rect x="97" y="22" width="12" height="34" rx="6" fill="#ffacc4" />
            </g>

            {/* 오른쪽 귀 */}
            <g transform="rotate(11 156 52)">
              <rect
                x="146"
                y="14"
                width="22"
                height="50"
                rx="11"
                fill="#ffffff"
                stroke="#efe6f4"
                strokeWidth="2"
              />
              <rect x="151" y="22" width="12" height="34" rx="6" fill="#ffacc4" />
            </g>

            {/* 토끼 얼굴 */}
            <ellipse
              cx="130"
              cy="80"
              rx="41"
              ry="32"
              fill="#ffffff"
              stroke="#efe6f4"
              strokeWidth="2"
            />

            {/* 볼터치 */}
            <ellipse cx="101" cy="84" rx="7" ry="4.5" fill="#ffabc2" opacity="0.8" />
            <ellipse cx="159" cy="84" rx="7" ry="4.5" fill="#ffabc2" opacity="0.8" />

            {/* 상태별 표정 */}
            {mode === "off" && (
              <g>
                <path
                  d="M 105 76 Q 111 81 117 76"
                  fill="none"
                  stroke="#5f4e77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 143 76 Q 149 81 155 76"
                  fill="none"
                  stroke="#5f4e77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <text
                  x="174"
                  y="44"
                  fill="#8c75b3"
                  fontSize="12"
                  fontWeight="800"
                  opacity="0.85"
                >
                  zZ
                </text>
              </g>
            )}

            {(mode === "idle" || mode === "result") && (
              <g>
                <circle cx="111" cy="76" r="4.5" fill="#35264c" />
                <circle cx="149" cy="76" r="4.5" fill="#35264c" />
                <circle cx="109.5" cy="74.2" r="1.6" fill="#ffffff" />
                <circle cx="147.5" cy="74.2" r="1.6" fill="#ffffff" />
              </g>
            )}

            {mode === "loading" && (
              <g>
                <path
                  d="M 105 78 Q 111 71 117 78"
                  fill="none"
                  stroke="#35264c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path
                  d="M 143 78 Q 149 71 155 78"
                  fill="none"
                  stroke="#35264c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <text x="64" y="42" fontSize="14">
                  ✨
                </text>
                <text x="182" y="40" fontSize="14">
                  ✨
                </text>
              </g>
            )}

            {/* 분홍 코 & 오밀조밀 입 */}
            <ellipse cx="130" cy="83" rx="3.4" ry="2.4" fill="#ff6b93" />
            <path
              d="M 124 87 Q 127 90 130 87 Q 133 90 136 87"
              fill="none"
              stroke="#6b5278"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* 복주머니 입구에 올려놓은 작은 당근 & 토끼 앞발 */}
            <g transform="translate(88, 86) rotate(-22)">
              <path
                d="M 0 10 C 0 3 12 3 12 10 L 9 28 C 8 32 4 32 3 28 Z"
                fill="#ff8838"
              />
              <path
                d="M 4 5 C 1 -2 5 -4 6 4 C 7 -4 12 -2 8 5 Z"
                fill="#66c97f"
              />
            </g>
            <ellipse
              cx="102"
              cy="101"
              rx="8.5"
              ry="6"
              fill="#ffffff"
              stroke="#efe6f4"
              strokeWidth="1.6"
            />
            <ellipse
              cx="158"
              cy="101"
              rx="8.5"
              ry="6"
              fill="#ffffff"
              stroke="#efe6f4"
              strokeWidth="1.6"
            />
          </g>

          {/* 복주머니 앞주름 칼라 */}
          <path
            d="M 66 94 Q 77 104 88 97 Q 99 107 110 99 Q 120 108 130 101 Q 140 108 150 99 Q 161 107 172 97 Q 183 104 194 94 L 181 116 C 155 124 105 124 79 116 Z"
            fill="#ff738f"
          />
          <path
            d="M 96 101 L 100 116 M 118 103 L 120 118 M 142 103 L 140 118 M 164 101 L 160 116"
            stroke="#eb5877"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* 복주머니 통통한 파스텔 색동 몸통 */}
          <g clipPath={`url(#${bodyClipId})`}>
            <rect x="20" y="108" width="220" height="150" fill={`url(#${coralGradId})`} />
            {/* 좌측 파스텔 인디고 조각 */}
            <path
              d="M 18 164 C 46 168 62 192 66 254 L 18 254 Z"
              fill="#5360a8"
            />
            {/* 중앙 하단 파스텔 로즈핑크 조각 */}
            <path
              d="M 52 174 C 102 184 158 184 208 174 L 196 256 L 64 256 Z"
              fill="#f18fb1"
            />
            {/* 우측 파스텔 라벤더 보라 조각 */}
            <path
              d="M 242 164 C 214 168 198 192 194 254 L 242 254 Z"
              fill="#8a68c8"
            />
            {/* 윗부분 은은한 광택 */}
            <ellipse
              cx="84"
              cy="148"
              rx="22"
              ry="10"
              transform="rotate(-24 84 148)"
              fill="#ffffff"
              opacity="0.18"
            />
          </g>

          {/* 샴페인 골드 조임 끈 */}
          <path
            d="M 76 113 Q 130 132 184 113"
            fill="none"
            stroke="#f1cb7e"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 76 113 Q 130 132 184 113"
            fill="none"
            stroke="#d4a44e"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* 중앙 크림·골드 복(福) 메달 (리본 아래) */}
          <circle
            cx="130"
            cy="196"
            r="44"
            fill="#fffdf9"
            stroke="#e3bd72"
            strokeWidth="5.5"
          />
          <circle
            cx="130"
            cy="196"
            r="38"
            fill="none"
            stroke="#f6e5be"
            strokeWidth="1.5"
          />

          {/* 메달 위로 늘어지는 샴페인 골드 리본 매듭 & 꼬리 */}
          <g>
            {/* 왼쪽 리본 루프 */}
            <path
              d="M 126 128 C 94 114 82 146 108 156 C 118 159 124 144 128 134 Z"
              fill="#f3cf87"
              stroke="#d4a44e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 121 134 C 103 128 97 143 111 149"
              fill="none"
              stroke="#d4a44e"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* 오른쪽 리본 루프 */}
            <path
              d="M 134 128 C 166 114 178 146 152 156 C 142 159 136 144 132 134 Z"
              fill="#f3cf87"
              stroke="#d4a44e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 139 134 C 157 128 163 143 149 149"
              fill="none"
              stroke="#d4a44e"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* 아래로 드리운 두 리본 꼬리 */}
            <path
              d="M 124 137 Q 108 170 96 206"
              fill="none"
              stroke="#f1cb7e"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <path
              d="M 136 137 Q 152 170 164 206"
              fill="none"
              stroke="#f1cb7e"
              strokeWidth="6.5"
              strokeLinecap="round"
            />

            {/* 중앙 매듭 */}
            <circle
              cx="130"
              cy="131"
              r="7.5"
              fill="#f5d593"
              stroke="#d4a44e"
              strokeWidth="2.5"
            />
          </g>
        </svg>

        {/* 중앙 메달 안쪽 상태 텍스트 오버레이 */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center leading-none"
          style={{ top: "56.5%", width: "31%", height: "30%" }}
        >
          {mode === "off" && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={`font-serif font-black text-[#d8b46d] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                福
              </span>
              {!isSmall && (
                <span className="text-[9.5px] font-extrabold text-slate-400 tracking-tight">
                  터치해 켜기
                </span>
              )}
            </div>
          )}

          {mode === "idle" && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={`font-serif font-black text-[#d8983e] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                福
              </span>
              {!isSmall && (
                <span className="rounded-full bg-rose-100/90 text-rose-600 px-2 py-0.5 text-[9px] font-black animate-pulse">
                  뽑기!
                </span>
              )}
            </div>
          )}

          {mode === "loading" && (
            <div className="flex flex-col items-center justify-center gap-0.5 animate-pulse">
              <span
                className={`font-serif font-black text-[#d8983e] ${
                  isSmall ? "text-xl" : "text-4xl"
                }`}
              >
                福
              </span>
              <span className={isSmall ? "text-[9px]" : "text-xs"}>✨</span>
            </div>
          )}

          {mode === "result" && (
            <div className="relative flex flex-col items-center justify-center">
              <span
                aria-hidden="true"
                className={`font-serif font-black text-[#f5dfb2]/55 leading-none select-none ${
                  isSmall ? "text-2xl" : "text-5xl"
                }`}
              >
                福
              </span>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-extrabold text-slate-600 ${
                    isSmall ? "text-[7.5px] mb-0.5" : "text-[10.5px] mb-0.5"
                  }`}
                >
                  행운점수
                </span>
                <span
                  className={`font-mono font-black tracking-tight text-[#e94e7c] drop-shadow-[0_1px_0_rgba(255,255,255,0.95)] ${
                    isSmall ? "text-lg" : "text-3xl sm:text-4xl"
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
            : "-mt-1 inline-flex items-center gap-1 rounded-full bg-white/85 border border-rose-200/80 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-rose-500 shadow-2xs"
        }
      >
        DALTO CATCHER
      </span>
    </button>
  );
}
