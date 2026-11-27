"use client";

import type { ElementKey } from "@/lib/saju-types";

interface OrientalArtProps {
  element: ElementKey;
  goldPrimary?: string;
  goldSecondary?: string;
  className?: string;
  idPrefix?: string;
}

/**
 * 모던 동양화 금선(Gold-Line) 일러스트 (외부 이미지 의존 0원 / html-to-image 완벽 호환)
 */
export function OrientalElementArt({
  element,
  goldPrimary = "#d4af37",
  goldSecondary = "#9c7524",
  className = "w-44 h-44",
  idPrefix = "card",
}: OrientalArtProps) {
  const gradId = `${idPrefix}-gold-${element}`;
  const haloId = `${idPrefix}-halo-${element}`;

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={goldPrimary} />
          <stop offset="50%" stopColor="#f5e1a4" />
          <stop offset="100%" stopColor={goldSecondary} />
        </linearGradient>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={goldPrimary} stopOpacity="0.28" />
          <stop offset="70%" stopColor={goldPrimary} stopOpacity="0.06" />
          <stop offset="100%" stopColor={goldPrimary} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 은은한 후광 원 */}
      <circle cx="120" cy="120" r="105" fill={`url(#${haloId})`} />

      {/* 외곽 팔괘/달력 링 */}
      <circle
        cx="120"
        cy="120"
        r="94"
        stroke={`url(#${gradId})`}
        strokeWidth="1"
        strokeDasharray="3 5"
        opacity="0.7"
      />
      <circle
        cx="120"
        cy="120"
        r="82"
        stroke={`url(#${gradId})`}
        strokeWidth="1.2"
        opacity="0.85"
      />

      {/* 사방 장식 점 */}
      <circle cx="120" cy="26" r="2.2" fill={`url(#${gradId})`} />
      <circle cx="120" cy="214" r="2.2" fill={`url(#${gradId})`} />
      <circle cx="26" cy="120" r="2.2" fill={`url(#${gradId})`} />
      <circle cx="214" cy="120" r="2.2" fill={`url(#${gradId})`} />

      {/* 오행별 모던 동양화 핵심 모티프 */}
      {element === "wood" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* 생명수·대나무·청룡 곡선 */}
          <path d="M120 184V64" strokeWidth="2" />
          <path d="M120 152C95 148 78 130 74 106C94 110 110 124 120 144" />
          <path d="M120 132C145 128 162 110 166 86C146 90 130 104 120 124" />
          <path d="M120 104C100 98 88 84 86 64C102 68 114 80 120 96" />
          <path d="M120 64C128 50 142 46 150 52C144 64 132 70 120 64Z" />
          {/* 산수와 구름 */}
          <path d="M62 178C80 166 102 166 120 174C138 182 160 180 178 170" opacity="0.75" />
          <circle cx="164" cy="64" r="10" strokeWidth="1.2" opacity="0.8" />
        </g>
      )}

      {element === "fire" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* 태양 & 피어오르는 연꽃 주작 깃털 */}
          <circle cx="120" cy="112" r="28" strokeWidth="1.8" />
          <circle cx="120" cy="112" r="14" strokeWidth="1.2" opacity="0.85" />
          <path d="M120 52V74M120 150V172M60 112H82M158 112H180" />
          <path d="M77 69L93 85M147 139L163 155M163 69L147 85M93 139L77 155" opacity="0.8" />
          {/* 하단 연꽃 */}
          <path d="M120 184C104 170 100 152 120 140C140 152 136 170 120 184Z" />
          <path d="M104 178C84 170 76 154 88 140C98 148 106 160 108 174" opacity="0.85" />
          <path d="M136 178C156 170 164 154 152 140C142 148 134 160 132 174" opacity="0.85" />
        </g>
      )}

      {element === "earth" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* 산수일월도(日月峰) 모던 라인 */}
          <circle cx="86" cy="78" r="14" strokeWidth="1.5" />
          <path d="M158 66C150 68 146 78 152 86C158 92 168 90 170 82C162 84 156 76 158 66Z" />
          <path d="M54 162L92 104L124 146L148 116L186 162Z" strokeWidth="1.8" />
          <path d="M76 162L116 122L152 162" opacity="0.7" />
          <path d="M62 178H178" strokeWidth="1.4" />
          <path d="M84 190H156" strokeWidth="1.1" opacity="0.7" />
        </g>
      )}

      {element === "metal" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* 팔각 보석과 성좌 기하학 */}
          <polygon points="120,48 168,96 120,192 72,96" strokeWidth="1.8" />
          <polygon points="120,66 152,98 120,168 88,98" strokeWidth="1.1" opacity="0.8" />
          <path d="M72 96H168" />
          <path d="M120 48V192" strokeWidth="1.2" opacity="0.75" />
          <path d="M52 120L72 120M168 120L188 120" opacity="0.7" />
          <circle cx="120" cy="96" r="6" />
        </g>
      )}

      {element === "water" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* 초승달, 별자리, 겹치는 동양 파도 */}
          <path
            d="M132 62C112 64 98 82 102 102C106 122 124 134 144 130C128 126 118 112 118 96C118 80 124 68 132 62Z"
            strokeWidth="1.8"
          />
          <path d="M150 74L153 81L160 84L153 87L150 94L147 87L140 84L147 81Z" strokeWidth="1.1" />
          {/* 물결 */}
          <path d="M54 148C72 134 90 134 108 148C126 162 144 162 162 148C170 142 178 140 186 144" />
          <path d="M58 166C76 152 94 152 112 166C130 180 148 180 166 166C174 160 180 158 184 160" opacity="0.85" />
          <path d="M74 182C92 172 108 172 124 182C140 192 154 190 168 180" opacity="0.65" />
        </g>
      )}
    </svg>
  );
}

export function AnalyzingMandalaSvg({ className = "w-48 h-48" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <defs>
        <linearGradient id="mandala-gold" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#f3e5ab" />
          <stop offset="100%" stopColor="#9e7320" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="88" stroke="url(#mandala-gold)" strokeWidth="1.2" strokeDasharray="4 6" />
      <circle cx="100" cy="100" r="70" stroke="url(#mandala-gold)" strokeWidth="1.5" />
      <polygon points="100,20 169,140 31,140" stroke="url(#mandala-gold)" strokeWidth="1.1" opacity="0.75" />
      <polygon points="100,180 169,60 31,60" stroke="url(#mandala-gold)" strokeWidth="1.1" opacity="0.75" />
      <circle cx="100" cy="100" r="34" stroke="url(#mandala-gold)" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="8" fill="url(#mandala-gold)" />
    </svg>
  );
}

export function TalismanSealSvg({
  hanja,
  className = "w-20 h-20",
}: {
  hanja: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <rect x="6" y="6" width="88" height="88" rx="16" stroke="#d4af37" strokeWidth="2" />
      <rect x="13" y="13" width="74" height="74" rx="11" stroke="#d4af37" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="28" stroke="#d4af37" strokeWidth="1.2" opacity="0.75" />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fill="#d4af37"
        fontSize="30"
        fontWeight="700"
        fontFamily="serif"
      >
        {hanja}
      </text>
    </svg>
  );
}
