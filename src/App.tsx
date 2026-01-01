import { Link, Outlet, useLocation } from "react-router-dom";
// import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
// import { Cpu, Palette, Lightbulb, Sparkles } from "lucide-react";

const TABS = [
  { id: "animations", label: "Animations" },
  { id: "material", label: "Material" },
  { id: "lighting", label: "Lighting" },
  { id: "webgpu", label: "Webgpu" },
  { id: "zustand-exercise", label: "Zustand-Exercise" },
  { id: "post-process", label: "Post-Process" },

  // { id: "1animations", label: "Animations" },
  // { id: "1material", label: "Material" },
  // { id: "1lighting", label: "Lighting" },
  // { id: "1webgpu", label: "Webgpu" },
  // { id: "2animations", label: "Animations" },
  // { id: "2material", label: "Material" },
  // { id: "2lighting", label: "Lighting" },
  // { id: "2webgpu", label: "Webgpu" },
  // { id: "3animations", label: "Animations" },
  // { id: "3material", label: "Material" },
  // { id: "3lighting", label: "Lighting" },
  // { id: "3webgpu", label: "Webgpu" },
  // { id: "4animations", label: "Animations" },
  // { id: "4material", label: "Material" },
  // { id: "4lighting", label: "Lighting" },
  // { id: "4webgpu", label: "Webgpu" },
];

function SideTab({
  id,
  label,
  selected,
}: {
  id: string;
  label: string;
  selected: boolean;
}) {
  return (
    <>
      <Link to={id}>
        <div
          className={[
            "rounded-xl cursor-pointer mx-2 px-4 py-3 hover:bg-[#3a414f]",
            selected
              ? "bg-gradient-to-r from-indigo-500/50 to-cyan-500/50 text-indigo-400 ring-1 ring-inset ring-indigo-400"
              : "",
          ].join(" ")}
        >
          <p className="font-medium text-xl text-white">{label}</p>
        </div>
      </Link>
    </>
  );
}

function SideTabNav() {
  const location = useLocation();
  const selected_tab = location.pathname.split("/")[1];

  return (
    <>
      <ul
        className="
      relative flex flex-col gap-2 h-full w-[250px] overflow-auto
      [&::-webkit-scrollbar]:w-3
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:bg-zinc-500
      [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {TABS.map((t) => (
          <li key={t.id}>
            <SideTab
              id={t.id}
              label={t.label}
              selected={t.id === selected_tab}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function App() {
  return (
    <>
      <div className="relative w-screen h-screen flex content-stretch">
        <div className="bg-[#282E38] h-screen relative shrink">
          <SideTabNav />
        </div>
        <div className="relative bg-yellow-100 grow min-w-0  h-full w-full">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default App;
