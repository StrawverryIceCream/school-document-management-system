import { useState } from "react";
import { WindowViewContext } from "@/context/WindowViewContext";
import type { WindowViewId } from "@/types/window";

export function WindowViewProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<WindowViewId | null>(null);

  function selectView(id: WindowViewId) {
    setActiveView(id);
  }

  function clearView() {
    setActiveView(null);
  }

  return (
    <WindowViewContext.Provider value={{ activeView, selectView, clearView }}>
      {children}
    </WindowViewContext.Provider>
  );
}