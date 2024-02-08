import { TimerProvider, useTimer } from "@/app/components/TimerContext";
import { render } from "@testing-library/react";
import { useEffect } from "react";
import { act } from "react-dom/test-utils";

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
  useSession: () => ({
    data: {
      user: {
        cookies: ["value1", "value2"],
        accessToken: "testToken",
        permissions: ["permissions"],
      },
    },
  }),
}));
jest.mock("../src/app/utils/utils", () => ({
  signOutHandler: () => "/test",
}));
jest.mock("../src/app/components/TimerContext", () => {
  const originalModule = jest.requireActual(
    "../src/app/components/TimerContext"
  );
  return {
    __esModule: true,
    ...originalModule,
  };
});

const TestComponent = ({duration, notifyBeforeTimeoutInMinutes}) => {
  const { count, running, startTimer, resetTimer} = useTimer();
  useEffect(() => {
    startTimer(duration, notifyBeforeTimeoutInMinutes);
  }, [])
};
jest.useFakeTimers();

describe("TimerContext", () => {
  it("should check useEffect", () => {
    render(<TimerProvider><TestComponent duration={5} notifyBeforeTimeoutInMinutes={70} /></TimerProvider>);
    act(() => jest.advanceTimersByTime(4000));
  });

  it("should check useEffect", () => {
    render(<TimerProvider><TestComponent duration={0} notifyBeforeTimeoutInMinutes={70} /></TimerProvider>);
    act(() => jest.advanceTimersByTime(4000));
  });

  it("should check useEffect", () => {
    render(
      <TimerProvider>
        <TestComponent duration={-1} notifyBeforeTimeoutInMinutes={70} />
      </TimerProvider>
    );
  });
});
