import { useState } from "react";
import type { WindowViewId } from "@/types/window";

export function useWindowView() {
  const [activeView, setActiveView] = useState<WindowViewId | null>(null);

  const selectView = (view: WindowViewId) => setActiveView(view);
  const clearView = () => setActiveView(null);

  return {
    activeView,
    selectView,
    clearView,
  };
}