"use client";

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
  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="영험한 달 · DALTO MOON 달토 운세"
      className={`group relative inline-flex flex-col items-center select-none focus:outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] ${
        isSmall ? "w-[116px] sm:w-[126px]" : "w-[228px] sm:w-[248px]"
      }`}
    >
      <div className="relative w-full aspect-square flex items-center justify-center">
        {/* 외곽 달빛 후광 오라 */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-2 rounded-full blur-xl transition-opacity duration-500 ${
            mode === "off"
              ? "bg-violet-400/20 opacity-45"
              : mode === "loading"
              ? "bg-gradient-to-tr from-amber-300/65 via-amber-100/55 to-violet-300/60 opacity-100 animate-pulse"
              : "bg-gradient-to-tr from-amber-300/50 via-yellow-100/40 to-violet-300/45 opacity-90"
          }`}
        />

        {/* 영험한 달 원형 아트 프레임 */}
        <div
          className={`relative aspect-square w-full rounded-full overflow-hidden border-2 border-amber-200/80 shadow-[0_0_38px_rgba(248,214,132,0.45)] bg-[#1f153b] ${
            mode === "loading" ? "ring-4 ring-amber-200/45" : ""
          }`}
        >
          <img
            src="/mascot/mystic-moon.jpg"
            alt="영험한 달"
            className={`w-full h-full object-cover object-center scale-[1.06] transition duration-500 ${
              mode === "off"
                ? "brightness-75 saturate-75"
                : mode === "loading"
                ? "brightness-110 saturate-110 animate-pulse"
                : "brightness-100 saturate-105"
            }`}
          />

          {/* 내곽 골드 헤어라인 테두리 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-full border border-amber-100/45"
          />

          {/* 중앙 상태/점수 진주빛 메달 오버레이 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {mode === "off" && (
              <div
                className={`rounded-full bg-[#191130]/65 backdrop-blur-xs border border-amber-200/55 shadow-md flex flex-col items-center justify-center text-center ${
                  isSmall ? "w-12 h-12" : "w-24 h-24 gap-1"
                }`}
              >
                <span
                  className={`font-serif font-black text-amber-200 leading-none ${
                    isSmall ? "text-xl" : "text-3xl"
                  }`}
                >
                  月
                </span>
                {!isSmall && (
                  <span className="text-[10px] font-extrabold text-amber-100/90 whitespace-nowrap">
                    터치해 켜기
                  </span>
                )}
              </div>
            )}

            {mode === "idle" && (
              <div
                className={`rounded-full bg-white/82 backdrop-blur-md border-2 border-amber-200/90 shadow-lg flex flex-col items-center justify-center text-center ${
                  isSmall ? "w-13 h-13" : "w-26 h-26 gap-1.5"
                }`}
              >
                <span
                  className={`font-serif font-black text-[#b5741c] leading-none ${
                    isSmall ? "text-xl" : "text-3xl"
                  }`}
                >
                  月
                </span>
                {!isSmall && (
                  <span className="rounded-full bg-rose-100 border border-rose-200 text-rose-700 px-2.5 py-0.5 text-[9.5px] font-black whitespace-nowrap animate-pulse">
                    달빛 뽑기
                  </span>
                )}
              </div>
            )}

            {mode === "loading" && (
              <div
                className={`rounded-full bg-white/85 backdrop-blur-md border-2 border-amber-300 shadow-lg flex flex-col items-center justify-center text-center animate-pulse ${
                  isSmall ? "w-13 h-13" : "w-24 h-24 gap-1"
                }`}
              >
                <span
                  className={`font-serif font-black text-[#b5741c] leading-none ${
                    isSmall ? "text-xl" : "text-3xl"
                  }`}
                >
                  月
                </span>
                <span
                  className={
                    isSmall ? "text-[9px] text-amber-700" : "text-xs text-amber-600 font-bold"
                  }
                >
                  ✦
                </span>
              </div>
            )}

            {mode === "result" && (
              <div
                className={`rounded-full bg-white/88 backdrop-blur-md border-2 border-amber-300/90 shadow-lg flex flex-col items-center justify-center text-center leading-none ${
                  isSmall ? "w-[58px] h-[58px] px-1" : "w-[104px] h-[104px] px-2"
                }`}
              >
                <span
                  className={`font-extrabold text-slate-600 whitespace-nowrap tracking-tight ${
                    isSmall ? "text-[8px] mb-0.5" : "text-[11px] mb-1"
                  }`}
                >
                  행운점수
                </span>
                <span
                  className={`font-mono font-black tracking-tight text-[#9d1d55] whitespace-nowrap ${
                    isSmall ? "text-[20px]" : "text-3xl sm:text-[34px]"
                  }`}
                >
                  {score ?? 88}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 오프 상태일 때 우상단 zZ 배지 */}
        {mode === "off" && (
          <span className="pointer-events-none absolute top-1.5 right-1.5 rounded-full bg-white/95 border border-violet-200 px-2 py-0.5 text-[9.5px] font-black text-[#4c3787] shadow-sm">
            zZ
          </span>
        )}
      </div>

      {/* 브랜드 라벨 */}
      <span
        className={
          isSmall
            ? "sr-only"
            : "mt-2 inline-flex items-center gap-1 rounded-full bg-white/95 border border-amber-300/80 px-3.5 py-0.5 text-[10px] font-black tracking-[0.1em] text-[#5c3e88] shadow-xs"
        }
      >
        ✦ 영험한 달 · DALTO MOON ✦
      </span>
    </button>
  );
}
