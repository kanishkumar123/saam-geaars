import { useEffect, useRef } from "react";

const KONAMI: readonly string[] = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

// Listens for the Konami code anywhere in the app and calls onUnlock once
// it's completed. Runs globally (mounted once near the app root), so it
// must not react to keystrokes typed into any of the admin dashboard's
// forms/inputs — isTypingTarget() is what guards that.
export function useKonami(onUnlock: () => void) {
  const progress = useRef(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      const expected = KONAMI[progress.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          onUnlock();
        }
      } else {
        progress.current = key === KONAMI[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUnlock]);
}
