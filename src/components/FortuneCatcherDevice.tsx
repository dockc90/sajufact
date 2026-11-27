"use client";

interface FortuneCatcherDeviceProps {
  mode: "off" | "idle" | "loading" | "result";
  score?: number;
  size?: "lg" | "sm";
  onPress?: () => void;
}

function PixelBunnySvg({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* 외곽선 귀 */}
      <rect x="7" y="2" width="2" height="5" fill="#2d2242" />
      <rect x="15" y="2" width="2" height="5" fill="#2d2242" />
      <rect x="6" y="3" width="1" height="4" fill="#2d2242" />
      <rect x="9" y="3" width="1" height="4" fill="#2d2242" />
      <rect x="14" y="3" width="1" height="4" fill="#2d2242" />
      <rect x="17" y="3" width="1" height="4" fill="#2d2242" />
      {/* 분홍 속귀 */}
      <rect x="7" y="4" width="2" height="3" fill="#ff9bb3" />
      <rect x="15" y="4" width="2" height="3" fill="#ff9bb3" />
      {/* 흰 머리 & 몸 */}
      <rect x="7" y="7" width="10" height="7" fill="#ffffff" />
      <rect x="6" y="9" width="12" height="5" fill="#ffffff" />
      <rect x="8" y="14" width="8" height="5" fill="#ffffff" />
      {/* 머리/몸 외곽 */}
      <rect x="9" y="6" width="6" height="1" fill="#2d2242" />
      <rect x="5" y="9" width="1" height="5" fill="#2d2242" />
      <rect x="18" y="9" width="1" height="5" fill="#2d2242" />
      <rect x="6" y="14" width="2" height="1" fill="#2d2242" />
      <rect x="16" y="14" width="2" height="1" fill="#2d2242" />
      <rect x="7" y="15" width="1" height="4" fill="#2d2242" />
      <rect x="16" y="15" width="1" height="4" fill="#2d2242" />
      <rect x="8" y="19" width="3" height="1" fill="#2d2242" />
      <rect x="13" y="19" width="3" height="1" fill="#2d2242" />
      <rect x="11" y="18" width="2" height="1" fill="#2d2242" />
      {/* 눈, 볼터치, 코 */}
      <rect x="8" y="10" width="2" height="2" fill="#2d2242" />
      <rect x="14" y="10" width="2" height="2" fill="#2d2242" />
      <rect x="7" y="12" width="2" height="1" fill="#ffb3c6" />
      <rect x="15" y="12" width="2" height="1" fill="#ffb3c6" />
      <rect x="11" y="11" width="2" height="1" fill="#ff6b95" />
      {/* 작은 당근 */}
      <rect x="11" y="15" width="2" height="3" fill="#ff7f2a" />
      <rect x="11" y="14" width="2" height="1" fill="#5ec96f" />
    </svg>
  );
}

export function FortuneCatcherDevice({
  mode,
  score,
  size = "lg",
  onPress,
}: FortuneCatcherDeviceProps) {
  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={onPress}
      className={`group relative inline-flex flex-col items-center select-none focus:outline-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97] ${
        isSmall ? "w-[132px]" : "w-[228px] sm:w-[244px]"
      }`}
    >
      {/* 달토끼 귀 + 리본 상단 장식 */}
      <div
        className={`relative flex items-end justify-center gap-4 -mb-2 z-10 ${
          isSmall ? "gap-2.5 -mb-1.5" : "gap-5 -mb-2.5"
        }`}
      >
        <div
          className={`rounded-t-full bg-gradient-to-b from-[#ff7b89] to-[#f44e65] border-2 border-[#c92a46] -rotate-12 flex items-end justify-center shadow-sm ${
            isSmall ? "w-5 h-7 pb-1" : "w-9 h-12 pb-1.5"
          }`}
        >
          <div
            className={`rounded-t-full bg-[#ffd3dc] ${
              isSmall ? "w-2.5 h-4" : "w-4.5 h-7"
            }`}
          />
        </div>

        {/* 중앙 복주머니 리본 매듭 */}
        <div
          className={`rounded-full bg-[#ffe28a] border-2 border-[#d99b26] shadow-xs flex items-center justify-center ${
            isSmall ? "w-6 h-4" : "w-10 h-6"
          }`}
        >
          <span className={isSmall ? "text-[9px]" : "text-xs"}>🎀</span>
        </div>

        <div
          className={`rounded-t-full bg-gradient-to-b from-[#ff7b89] to-[#f44e65] border-2 border-[#c92a46] rotate-12 flex items-end justify-center shadow-sm ${
            isSmall ? "w-5 h-7 pb-1" : "w-9 h-12 pb-1.5"
          }`}
        >
          <div
            className={`rounded-t-full bg-[#ffd3dc] ${
              isSmall ? "w-2.5 h-4" : "w-4.5 h-7"
            }`}
          />
        </div>
      </div>

      {/* 본체: 레트로 포춘 캐처 토이 케이스 */}
      <div
        className={`w-full relative rounded-[44px] bg-gradient-to-b from-[#f44d5f] via-[#e63b4f] to-[#d42c41] border-b-[6px] border-[#a81c30] shadow-[0_14px_30px_rgba(212,44,65,0.28)] flex flex-col items-center ${
          isSmall ? "px-2.5 pt-2.5 pb-2.5 rounded-[28px] border-b-[4px]" : "px-4 pt-3.5 pb-4"
        }`}
      >
        {/* 하단 한복 조각보 배색 장식 */}
        <div
          aria-hidden="true"
          className={`absolute bottom-1.5 inset-x-3 flex justify-between pointer-events-none opacity-85 ${
            isSmall ? "h-2.5" : "h-4"
          }`}
        >
          <span className="w-1/4 rounded-bl-2xl bg-[#273869]/80" />
          <span className="w-1/4 bg-[#f5e7cf]/85" />
          <span className="w-1/4 bg-[#df9ebc]/85" />
          <span className="w-1/4 rounded-br-2xl bg-[#f7d890]/85" />
        </div>

        {/* 상단 영문 타이틀 */}
        <p
          className={`font-black tracking-tight text-white drop-shadow-[0_2px_0_rgba(168,28,48,0.65)] leading-none text-center ${
            isSmall ? "text-[10px] mb-1.5" : "text-[17px] mb-2"
          }`}
        >
          DALTO CATCHER
        </p>

        {/* 크림색 톱니 프레임 LCD */}
        <div
          className={`w-full rounded-[18px] bg-[#ffecc7] border-2 border-[#f6c478] p-1.5 shadow-inner ${
            isSmall ? "rounded-[12px] p-1" : ""
          }`}
        >
          <div
            className={`w-full aspect-square rounded-[12px] border-2 flex flex-col items-center justify-center relative overflow-hidden ${
              mode === "off"
                ? "border-[#54545e] bg-[#666670]"
                : "border-[#e7c7b2] bg-[#fff5e4]"
            }`}
            style={{
              backgroundImage:
                mode === "off"
                  ? "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%)"
                  : "linear-gradient(45deg, rgba(255,224,185,0.38) 25%, transparent 25%, transparent 75%, rgba(255,224,185,0.38) 75%), linear-gradient(45deg, rgba(255,224,185,0.38) 25%, transparent 25%, transparent 75%, rgba(255,224,185,0.38) 75%)",
              backgroundPosition: "0 0, 10px 10px",
              backgroundSize: "20px 20px",
            }}
          >
            {mode === "off" && (
              <span
                className={`font-black tracking-widest text-white/35 ${
                  isSmall ? "text-[9px]" : "text-xs"
                }`}
              >
                LOCKED
              </span>
            )}

            {(mode === "idle" || mode === "loading") && (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-pixel-hop">
                  <PixelBunnySvg className={isSmall ? "w-10 h-10" : "w-20 h-20"} />
                </div>
                {mode === "loading" && (
                  <span className="text-[10px] font-black text-rose-500 tracking-wider animate-pulse">
                    ✨ ✨ ✨
                  </span>
                )}
              </div>
            )}

            {mode === "result" && (
              <div className="flex flex-col items-center justify-center leading-none">
                <span
                  className={`font-extrabold text-slate-700 ${
                    isSmall ? "text-[8px] mb-0.5" : "text-xs mb-1"
                  }`}
                >
                  행운점수
                </span>
                <span
                  className={`font-mono font-black tracking-tight text-[#ef4d86] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] ${
                    isSmall ? "text-2xl" : "text-5xl"
                  }`}
                >
                  {score ?? 88}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 하단 원형 푸시 버튼 */}
        <div
          className={`relative z-10 rounded-full bg-gradient-to-b from-[#ff6a7b] to-[#d9263c] border-2 border-[#a81c30] shadow-md group-active:translate-y-0.5 transition-transform ${
            isSmall ? "w-5 h-5 mt-1.5" : "w-9 h-9 mt-2.5"
          }`}
        />
      </div>
    </button>
  );
}
