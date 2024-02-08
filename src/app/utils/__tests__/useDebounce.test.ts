import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

jest.useFakeTimers();

describe('useDebounce', () => {
  it('should update the debounced value after the specified delay', () => {
    const { result } = renderHook(() => useDebounce('test', 500));

    expect(result.current).toBe('test');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('test');
  });
});