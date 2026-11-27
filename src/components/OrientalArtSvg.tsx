"use client";

import type { ElementKey, ElementStat } from "@/lib/saju-types";

interface OrientalArtProps {
  element: ElementKey;
  goldPrimary?: string;
  goldSecondary?: string;
  dayMasterHanja?: string;
  className?: string;
  idPrefix?: string;
}

/**
 * 모던 동양화 금박(Gold-Foil) 아트워크 (외부 이미지 0원 / html-to-image 완벽 호환)
 */
export function OrientalElementArt({
  element,
  goldPrimary = "#d4af37",
  goldSecondary = "#9c7524",
  dayMasterHanja,
  className = "w-44 h-44",
  idPrefix = "card",
}: OrientalArtProps) {
  const gradId = `${idPrefix}-gold-${element}`;
  const haloId = `${idPrefix}-halo-${element}`;

  return (
    <svg
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="15" y1="15" x2="245" y2="245" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={goldPrimary} />
          <stop offset="45%" stopColor="#f8e8b0" />
          <stop offset="100%" stopColor={goldSecondary} />
        </linearGradient>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={goldPrimary} stopOpacity="0.34" />
          <stop offset="65%" stopColor={goldPrimary} stopOpacity="0.08" />
          <stop offset="100%" stopColor={goldPrimary} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 다중 오라 광채 */}
      <circle cx="130" cy="130" r="118" fill={`url(#${haloId})`} />

      {/* 팔괘·나침반 외곽 링 */}
      <circle
        cx="130"
        cy="130"
        r="108"
        stroke={`url(#${gradId})`}
        strokeWidth="0.9"
        strokeDasharray="2 5"
        opacity="0.75"
      />
      <circle
        cx="130"
        cy="130"
        r="96"
        stroke={`url(#${gradId})`}
        strokeWidth="1.3"
        opacity="0.9"
      />
      <circle
        cx="130"
        cy="130"
        r="88"
        stroke={`url(#${gradId})`}
        strokeWidth="0.7"
        opacity="0.55"
      />

      {/* 8방위 눈금 & 별 점 */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 130 + Math.cos(rad) * 96;
        const y1 = 130 + Math.sin(rad) * 96;
        const x2 = 130 + Math.cos(rad) * (deg % 90 === 0 ? 112 : 103);
        const y2 = 130 + Math.sin(rad) * (deg % 90 === 0 ? 112 : 103);
        return (
          <g key={deg}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`url(#${gradId})`}
              strokeWidth={deg % 90 === 0 ? "1.4" : "0.9"}
              opacity="0.85"
            />
            {deg % 90 === 0 && (
              <circle cx={x2} cy={y2} r="2.2" fill={`url(#${gradId})`} />
            )}
          </g>
        );
      })}

      {/* 오행별 정밀 동양화 모티프 */}
      {element === "wood" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 청룡 생명수 & 산수 구름 */}
          <path d="M130 202V64" strokeWidth="1.8" />
          <path d="M130 168C98 162 78 140 72 112C96 116 116 134 130 158" />
          <path d="M130 144C162 138 182 116 188 88C164 92 144 110 130 134" />
          <path d="M130 112C106 106 90 90 88 68C108 72 122 86 130 104" />
          <path d="M130 64C140 48 156 44 166 52C158 66 144 72 130 64Z" />
          <path d="M58 190C80 174 106 174 130 184C154 194 180 190 202 178" opacity="0.8" />
          <path d="M74 202C96 192 114 192 130 198C146 204 166 202 186 192" opacity="0.5" />
          <circle cx="176" cy="72" r="11" strokeWidth="1.2" opacity="0.85" />
        </g>
      )}

      {element === "fire" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 태양 광배 & 피어오르는 만개 연꽃 */}
          <circle cx="130" cy="116" r="30" strokeWidth="1.7" />
          <circle cx="130" cy="116" r="19" strokeWidth="1" strokeDasharray="2 3" opacity="0.85" />
          <path d="M130 48V74M130 158V184M62 116H88M172 116H198" />
          <path d="M82 68L101 87M159 145L178 164M178 68L159 87M101 145L82 164" opacity="0.85" />
          <path d="M130 204C110 186 106 164 130 148C154 164 150 186 130 204Z" />
          <path d="M110 198C86 188 76 168 92 150C104 160 114 176 116 192" opacity="0.85" />
          <path d="M150 198C174 188 184 168 168 150C156 160 146 176 144 192" opacity="0.85" />
        </g>
      )}

      {element === "earth" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 일월오봉도(日月五峰圖) 모던 라인 */}
          <circle cx="86" cy="82" r="14" strokeWidth="1.5" />
          <path d="M174 68C164 70 159 82 166 91C173 98 184 96 187 86C178 88 171 79 174 68Z" />
          <path d="M52 178L94 110L130 158L162 118L208 178Z" strokeWidth="1.7" />
          <path d="M78 178L124 128L166 178" opacity="0.75" />
          <path d="M106 178L142 138L182 178" opacity="0.55" />
          <path d="M62 192H198" strokeWidth="1.3" />
          <path d="M86 204H174" strokeWidth="1" opacity="0.7" />
        </g>
      )}

      {element === "metal" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 백호 다이아몬드 & 천체 기하학 */}
          <polygon points="130,48 184,104 130,210 76,104" strokeWidth="1.7" />
          <polygon points="130,68 166,106 130,184 94,106" strokeWidth="1.1" opacity="0.85" />
          <polygon points="130,86 150,108 130,154 110,108" strokeWidth="0.9" opacity="0.65" />
          <path d="M76 104H184" />
          <path d="M130 48V210" strokeWidth="1.1" opacity="0.75" />
          <path d="M52 130H76M184 130H208" opacity="0.75" />
        </g>
      )}

      {element === "water" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 초승달, 북극성, 겹치는 동양 파도 */}
          <path
            d="M144 64C120 66 104 86 108 108C112 130 132 144 156 139C138 134 126 119 126 101C126 83 134 70 144 64Z"
            strokeWidth="1.7"
          />
          <path d="M164 76L167 84L175 87L167 90L164 98L161 90L153 87L161 84Z" strokeWidth="1.1" />
          <path d="M52 158C72 142 92 142 112 158C132 174 152 174 172 158C184 148 196 146 208 152" />
          <path d="M56 176C76 160 96 160 116 176C136 192 156 192 176 176C188 168 196 166 204 170" opacity="0.85" />
          <path d="M74 194C94 182 112 182 130 194C148 206 166 204 186 192" opacity="0.65" />
        </g>
      )}

      {/* 중앙 일간(日干) 한자 인장 코어 (선택) */}
      {dayMasterHanja && (
        <g>
          <circle
            cx="130"
            cy="130"
            r="22"
            fill="rgba(15, 23, 42, 0.72)"
            stroke={`url(#${gradId})`}
            strokeWidth="1.4"
          />
          <text
            x="130"
            y="139"
            textAnchor="middle"
            fill="#f8e8b0"
            fontSize="24"
            fontWeight="800"
            fontFamily="serif"
          >
            {dayMasterHanja}
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * 카드 네 모서리를 감싸는 전통 금선 코너 장식
 */
export function OrientalCardFrameSvg({
  color = "#d4af37",
  className = "absolute inset-2.5 w-[calc(100%-20px)] h-[calc(100%-20px)] pointer-events-none",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="none" fill="none" className={className}>
      <rect x="1" y="1" width="298" height="398" rx="18" stroke={color} strokeOpacity="0.45" strokeWidth="1" />
      <rect x="6" y="6" width="288" height="388" rx="14" stroke={color} strokeOpacity="0.22" strokeWidth="0.7" />
      {/* 4 코너 전통 ㄱ자 문양 */}
      <path d="M12 28V12H28M16 20H22V16" stroke={color} strokeWidth="1.4" strokeOpacity="0.85" />
      <path d="M288 28V12H272M284 20H278V16" stroke={color} strokeWidth="1.4" strokeOpacity="0.85" />
      <path d="M12 372V388H28M16 380H22V384" stroke={color} strokeWidth="1.4" strokeOpacity="0.85" />
      <path d="M288 372V388H272M284 380H278V384" stroke={color} strokeWidth="1.4" strokeOpacity="0.85" />
    </svg>
  );
}

/**
 * 붉은 주홍 낙관(紅印) 도장 SVG
 */
export function VermilionSealSvg({
  label = "팩트印",
  className = "w-10 h-10",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="4" y="4" width="56" height="56" rx="8" stroke="#c8372d" strokeWidth="2.4" fill="rgba(200,55,45,0.08)" />
      <rect x="9" y="9" width="46" height="46" rx="5" stroke="#c8372d" strokeWidth="1" strokeOpacity="0.7" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fill="#c8372d"
        fontSize="15"
        fontWeight="900"
        fontFamily="serif"
        letterSpacing="1"
      >
        {label}
      </text>
    </svg>
  );
}

/**
 * 5오행 오각형(Pentagon) 레이더 차트 SVG
 */
export function FiveElementRadarSvg({
  elements,
  accentColor = "#0f172a",
  fillColor = "rgba(212, 175, 55, 0.28)",
  strokeColor = "#c59b38",
  className = "w-40 h-40",
}: {
  elements: ElementStat[];
  accentColor?: string;
  fillColor?: string;
  strokeColor?: string;
  className?: string;
}) {
  const cx = 100;
  const cy = 102;
  const maxR = 64;
  const order: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];
  const orderedStats = order.map(
    (key) => elements.find((e) => e.key === key) ?? { key, nameKo: key, hanja: "", percentage: 20, count: 1 }
  );

  const maxPct = Math.max(45, ...orderedStats.map((s) => s.percentage));

  const pointAt = (idx: number, radius: number) => {
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / 5;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  };

  const ringLevels = [0.33, 0.66, 1];
  const dataPoints = orderedStats.map((stat, idx) => {
    const normalized = Math.max(0.18, stat.percentage / maxPct);
    return pointAt(idx, maxR * normalized);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* 동심 오각형 격자 */}
      {ringLevels.map((lvl) => {
        const pts = Array.from({ length: 5 }, (_, i) => pointAt(i, maxR * lvl));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
        return <path key={lvl} d={d} stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1" />;
      })}

      {/* 축선 */}
      {orderedStats.map((_, idx) => {
        const outer = pointAt(idx, maxR);
        return (
          <line
            key={idx}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="#94a3b8"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
        );
      })}

      {/* 데이터 다각형 */}
      <path d={dataPath} fill={fillColor} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* 꼭지점 점 & 라벨 */}
      {orderedStats.map((stat, idx) => {
        const pt = dataPoints[idx];
        const labelPt = pointAt(idx, maxR + 20);
        return (
          <g key={stat.key}>
            <circle cx={pt.x} cy={pt.y} r="3.4" fill={strokeColor} stroke="#fff" strokeWidth="1.2" />
            <text
              x={labelPt.x}
              y={labelPt.y + 3}
              textAnchor="middle"
              fill={accentColor}
              fontSize="10.5"
              fontWeight="700"
            >
              {stat.nameKo} {stat.percentage}%
            </text>
          </g>
        );
      })}
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
