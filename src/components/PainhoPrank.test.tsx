// @vitest-environment jsdom
import { render, screen, act, cleanup } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { PainhoPrank } from "./PainhoPrank";
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
it("exibe zero cenográfico, revela a brincadeira e encerra sem gravar dados", () => {
  vi.useFakeTimers(); vi.spyOn(Math, "random").mockReturnValue(0);
  const save = vi.spyOn(Storage.prototype, "setItem");
  const props = { enabled: true, sound: false, effects: false, blocked: false };
  const { rerender } = render(<PainhoPrank {...props} newsKey="1" />);
  rerender(<PainhoPrank {...props} newsKey="2" />);
  expect(screen.getByText(/R\$ 0,00/)).toBeTruthy();
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByText(/ERA PEGADINHA/)).toBeTruthy();
  act(() => vi.advanceTimersByTime(6000));
  expect(screen.queryByRole("status")).toBeNull(); expect(save).not.toHaveBeenCalled();
});
it("não inicia sobre operações ou com eventos desativados", () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  const props = { enabled: true, sound: false, effects: true, blocked: true };
  const { rerender } = render(<PainhoPrank {...props} newsKey="1" />);
  rerender(<PainhoPrank {...props} newsKey="2" />);
  expect(screen.queryByRole("status")).toBeNull();
});
