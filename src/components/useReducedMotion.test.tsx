// @vitest-environment jsdom
import { renderHook, act, cleanup } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { useReducedMotion } from "./useReducedMotion";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("respeita a preferência de movimento e atualizações do dispositivo", () => {
  let changed: () => void = () => {};
  const media = {
    matches: true,
    addEventListener: vi.fn((_name: string, fn: () => void) => {
      changed = fn;
    }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  const { result, unmount } = renderHook(useReducedMotion);
  expect(result.current).toBe(true);
  act(() => {
    media.matches = false;
    changed();
  });
  expect(result.current).toBe(false);
  unmount();
  expect(media.removeEventListener).toHaveBeenCalledWith(
    "change",
    expect.any(Function),
  );
});
