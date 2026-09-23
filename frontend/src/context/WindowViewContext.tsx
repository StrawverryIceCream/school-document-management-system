import { createContext } from "react";
import type { WindowViewId } from "@/types/window";

interface WindowViewContextType {
  activeView: WindowViewId | null;
  selectView: (id: WindowViewId) => void;
  clearView: () => void;
}

export const WindowViewContext = createContext<WindowViewContextType | null>(null);
