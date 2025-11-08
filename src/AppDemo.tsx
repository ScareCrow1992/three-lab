import React from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Cpu, Palette, Lightbulb, Sparkles } from "lucide-react";

// --- Data model for tabs ---
const TABS = [
  { id: "animation", label: "animation", icon: Sparkles },
  { id: "material", label: "material", icon: Palette },
  { id: "lighting", label: "lighting", icon: Lightbulb },
  { id: "webgpu", label: "webgpu", icon: Cpu },
] as const;

type TabId = typeof TABS[number]["id"];

// --- Reusable Sidebar Button ---
function SidebarTab({
  id,
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onClick: (id: TabId) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={[
        "group relative w-full select-none",
        "rounded-xl px-4 py-3 text-left",
        "transition-colors duration-200",
        selected
          ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-400 ring-1 ring-inset ring-indigo-400/50"
          : "text-zinc-400 hover:text-zinc-200",
      ].join(" ")}
      aria-pressed={selected}
      aria-current={selected ? "page" : undefined}
    >
      {/* Hover highlight halo */}
      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120px 60px at var(--mx,50%) var(--my,50%), rgba(99,102,241,0.15), transparent 70%)",
        }}
      />
      <span className="relative z-10 flex items-center gap-3">
        <Icon className="h-4 w-4 opacity-80" />
        <span className="font-medium tracking-wide capitalize">{label}</span>
      </span>
    </button>
  );
}

// --- Demo: Animation ---
function AnimationDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-black">
      <motion.div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-3xl"
        style={{ background: "conic-gradient(from 45deg, #22d3ee, #818cf8, #22d3ee)" }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-10 left-10 h-6 w-6 rounded-full bg-white/80"
        animate={{ x: [0, 280, 0], y: [0, -120, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-10 top-10 h-24 w-24 rounded-full"
        style={{ background: "radial-gradient(circle at 30% 30%, #f472b6, transparent 60%)" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
      <div className="absolute inset-x-0 bottom-0 p-6 text-sm text-zinc-300/80">
        Keyframe loops, transforms, and easing via Framer Motion.
      </div>
    </div>
  );
}

// --- Demo: Material ---
function MaterialDemo() {
  return (
    <div className="grid h-full w-full place-items-center overflow-hidden rounded-2xl bg-zinc-950 p-8">
      <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(60rem_40rem_at_80%_-10%,rgba(99,102,241,.25),transparent),radial-gradient(40rem_30rem_at_20%_120%,rgba(34,211,238,.2),transparent)]" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {["Frosted", "Metal", "Card"].map((title, i) => (
          <motion.div
            key={title}
            className="rounded-2xl p-6 backdrop-blur-xl"
            style={{
              background:
                i === 1
                  ? "linear-gradient(145deg, #1f2937, #0b1220)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              boxShadow:
                i === 1
                  ? "inset 1px 1px 2px rgba(255,255,255,.06), inset -1px -1px 2px rgba(0,0,0,.6)"
                  : "0 10px 30px rgba(0,0,0,.45)",
              border: i === 1 ? "1px solid rgba(148,163,184,.2)" : "1px solid rgba(148,163,184,.15)",
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <div className="text-lg font-semibold text-zinc-200">{title}</div>
            <div className="mt-4 text-sm text-zinc-400">
              {i === 0 && "Glassmorphism: blur + translucent gradient + subtle border."}
              {i === 1 && "Brushed metal: dark gradient, crisp border, inset highlights."}
              {i === 2 && "Soft card: low-contrast surfaces with depth shadows."}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Demo: Lighting (cursor spotlight) ---
function LightingDemo() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 30 });
  const sy = useSpring(y, { stiffness: 200, damping: 30 });

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl bg-zinc-950"
      onMouseMove={(e) => {
        const rect = (e.target as HTMLDivElement).getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: sx && sy ? sx.to((vx) => vx) && sy.to((vy) => vy) : undefined,
        }}
      />
      {/* Spotlight mask layer */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{``
          WebkitMaskImage: sx && sy ? (sx as any).to((vx: number) => (sy as any).get && (sy as any).get()) : undefined,
        }}
      />
      {/* Simpler implementation using CSS variables */}
      <motion.div
        className="absolute inset-0"
        style={{
          // Use motion values to update CSS vars
          // @ts-ignore
          "--sx": sx,
          // @ts-ignore
          "--sy": sy,
          background:
            "radial-gradient(160px 160px at var(--sx,50%) var(--sy,50%), rgba(255,255,255,0.1), transparent 70%), radial-gradient(800px 400px at 120% -10%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(800px 400px at -20% 110%, rgba(34,211,238,0.07), transparent 60%)",
        } as React.CSSProperties}
      />
      <div className="relative z-10 grid grid-cols-2 gap-6 p-8 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
            <div className="text-sm font-medium text-zinc-200">Object #{i + 1}</div>
            <div className="mt-2 text-xs text-zinc-400">
              Follows a cursor-driven spotlight with soft falloff.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Demo: WebGPU (capability check + fallback) ---
function WebGPUDemo() {
  const [supported, setSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Feature detect
    // @ts-ignore
    setSupported(!!navigator.gpu);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
        <Cpu className="h-4 w-4" />
        <span>WebGPU capability</span>
        <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
          supported ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
        }`}>
          {supported === null ? "checking…" : supported ? "supported" : "not available"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-zinc-300">
          <pre className="whitespace-pre-wrap text-xs opacity-90">{`
// Minimal setup
const adapter = await navigator.gpu?.requestAdapter();
const device = await adapter?.requestDevice();
// If this works, render a triangle… (mocked here)
          `}</pre>
        </div>
        <div className="grid place-items-center rounded-xl border border-white/10 bg-black/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="h-32 w-32 rounded-lg"
            style={{ background: "conic-gradient(#22d3ee, #818cf8, #22d3ee)" }}
          />
        </div>
      </div>
      {!supported && supported !== null && (
        <div className="mt-6 text-xs text-zinc-400">
          WebGPU가 지원되지 않으면 WebGL/Canvas 대체 또는 비디오 데모를 제공하세요.
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function AppDemo() {
  const [active, setActive] = React.useState<TabId>("animation");
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Keyboard navigation for accessibility
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      const idx = TABS.findIndex((t) => t.id === active);
      if (e.key === "ArrowUp" || (e.key === "ArrowLeft" && e.metaKey === false)) {
        e.preventDefault();
        setActive(TABS[(idx - 1 + TABS.length) % TABS.length].id);
      }
      if (e.key === "ArrowDown" || (e.key === "ArrowRight" && e.metaKey === false)) {
        e.preventDefault();
        setActive(TABS[(idx + 1) % TABS.length].id);
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [active]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="mx-auto min-h-[560px] max-w-6xl rounded-3xl border border-white/10 bg-[radial-gradient(60rem_40rem_at_120%_-10%,rgba(99,102,241,.15),transparent),radial-gradient(40rem_30rem_at_-20%_120%,rgba(34,211,238,.12),transparent)] p-4 text-white outline-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400" />
          <div>
            <div className="text-sm font-semibold">My Feature Gallery</div>
            <div className="text-xs text-zinc-400">Hover & select highlights • Arrow key navigation</div>
          </div>
        </div>
        <div className="hidden text-xs text-zinc-400 md:block">React • Tailwind • Framer Motion</div>
      </div>

      {/* Layout */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <nav className="rounded-2xl border border-white/10 bg-white/5 p-2">
          <ul className="flex flex-col gap-2">
            {TABS.map((t) => (
              <li key={t.id}
                  onMouseMove={(e) => {
                    const target = e.currentTarget.querySelector("button") as HTMLButtonElement | null;
                    if (!target) return;
                    const rect = target.getBoundingClientRect();
                    const mx = ((e.clientX - rect.left) / rect.width) * 100;
                    const my = ((e.clientY - rect.top) / rect.height) * 100;
                    target.style.setProperty("--mx", `${mx}%`);
                    target.style.setProperty("--my", `${my}%`);
                  }}
              >
                <SidebarTab
                  id={t.id}
                  label={t.label}
                  icon={t.icon}
                  selected={active === t.id}
                  onClick={setActive}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Demo panel */}
        <section className="relative min-h-[420px] rounded-2xl border border-white/10 bg-white/5 p-3">
          <AnimatePresence mode="wait">
            {active === "animation" && (
              <motion.div key="animation" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="h-full">
                <AnimationDemo />
              </motion.div>
            )}
            {active === "material" && (
              <motion.div key="material" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="h-full">
                <MaterialDemo />
              </motion.div>
            )}
            {active === "lighting" && (
              <motion.div key="lighting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="h-full">
                <LightingDemo />
              </motion.div>
            )}
            {active === "webgpu" && (
              <motion.div key="webgpu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="h-full">
                <WebGPUDemo />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Footer tips */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Tip>탭마다 라이브 데모를 넣고, 오른쪽 패널에 캔버스/비디오를 삽입하세요.</Tip>
        <Tip>좌측 버튼은 hover와 selected 상태를 분리된 스타일로 강조합니다.</Tip>
        <Tip>반응형: 모바일에서는 위/아래, 데스크탑에서는 좌/우 레이아웃.</Tip>
      </div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300">
      {children}
    </div>
  );
}
