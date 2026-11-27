"use client";

import type { ElementKey } from "@/lib/saju-types";

const AURA_PALETTE: Record<
  ElementKey | "default",
  { orb1: string; orb2: string; orb3: string; base: string }
> = {
  default: {
    base: "from-[#f8f3ee] via-[#f4eef8] to-[#eef5f3]",
    orb1: "bg-rose-200/55",
    orb2: "bg-amber-100/60",
    orb3: "bg-indigo-200/45",
  },
  wood: {
    base: "from-emerald-50 via-teal-50/70 to-amber-50/80",
    orb1: "bg-emerald-300/45",
    orb2: "bg-amber-200/50",
    orb3: "bg-teal-200/45",
  },
  fire: {
    base: "from-rose-50 via-orange-50/80 to-purple-50/80",
    orb1: "bg-rose-300/45",
    orb2: "bg-orange-200/50",
    orb3: "bg-purple-200/50",
  },
  earth: {
    base: "from-amber-50 via-stone-50 to-yellow-50/80",
    orb1: "bg-amber-300/45",
    orb2: "bg-yellow-200/50",
    orb3: "bg-stone-300/35",
  },
  metal: {
    base: "from-slate-50 via-sky-50/80 to-indigo-50/75",
    orb1: "bg-sky-200/55",
    orb2: "bg-slate-300/45",
    orb3: "bg-indigo-200/45",
  },
  water: {
    base: "from-indigo-100/80 via-purple-50/80 to-slate-100",
    orb1: "bg-indigo-300/45",
    orb2: "bg-violet-300/40",
    orb3: "bg-sky-200/40",
  },
};

export function AuraBackground({ element = "default" }: { element?: ElementKey | "default" }) {
  const palette = AURA_PALETTE[element];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br ${palette.base} transition-colors duration-700`}
    >
      <div
        className={`absolute -top-24 -left-20 h-80 w-80 rounded-full blur-3xl animate-aura-slow ${palette.orb1}`}
      />
      <div
        className={`absolute top-1/3 -right-24 h-96 w-96 rounded-full blur-3xl animate-aura-slower ${palette.orb2}`}
      />
      <div
        className={`absolute -bottom-28 left-1/4 h-80 w-80 rounded-full blur-3xl animate-aura-pulse ${palette.orb3}`}
      />
    </div>
  );
}
