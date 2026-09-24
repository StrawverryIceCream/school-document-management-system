import { MyRequestContext } from "@/context/MyRequestContext";
import { useContext } from "react";

export function useMyRequest() {
  const context = useContext(MyRequestContext);

  if (!context) {
    throw new Error("useMyRequest must be used within a MyRequestProvider");
  }

  return context;
}
