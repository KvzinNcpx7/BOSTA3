import { useEffect } from "react";
/** Keep keyboard navigation inside the topmost dialog and restore prior focus. */
export function useDialogFocus(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prior = document.activeElement as HTMLElement | null;
    const dialog = Array.from(
      document.querySelectorAll<HTMLElement>('[role="dialog"]'),
    ).at(-1);
    if (!dialog) return;
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button,input,a[href],[tabindex="0"]',
        ),
      ).filter((e) => !e.hasAttribute("disabled"));
    focusable()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = overflow;
      prior?.focus();
    };
  }, [active]);
}
