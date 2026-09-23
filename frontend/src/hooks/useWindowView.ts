import { useContext } from "react";
import { WindowViewContext } from "@/context/WindowViewContext";

export function useWindowView() {
  const ctx = useContext(WindowViewContext);
  if (!ctx) throw new Error("useWindowView must be used within WindowViewProvider");
  return ctx;
}