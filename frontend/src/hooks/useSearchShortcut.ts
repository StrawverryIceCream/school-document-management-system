import { useEffect, type RefObject } from "react";

const SHORTCUT_KEY = "k";

export function useSearchShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut =
        event.key.toLowerCase() === SHORTCUT_KEY &&
        (event.metaKey || event.ctrlKey);
      if (!isShortcut) return;

      // Browsers bind Ctrl/Cmd+K to their own search or address bar
      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputRef]);
}
