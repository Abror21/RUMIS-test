import { renderHook } from "@testing-library/react";
import useHandleError from "../useHandleError";

describe("useHandleError", () => {
  it("should call console.error when dontShowMessages is true", () => {
    const [handleError] = useHandleError();
    const { result } = renderHook(useHandleError);
    const originalConsoleError = console.error;
    console.error = jest.fn();
    result.current[0]({ error: "Test error" }, undefined, undefined);
    expect(console.error).toHaveBeenCalled();
    console.error = originalConsoleError;
  });
});
