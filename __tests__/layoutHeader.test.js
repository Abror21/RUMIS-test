import { render, act, screen, logRoles } from "@testing-library/react";
import LayoutHeader from "@/app/components/layoutHeader";
import matchMediaPolyfill from "match-media-mock";

global.matchMedia = matchMediaPolyfill.create({
  type: "screen",
  width: 1024,
});

jest.mock("next-auth/react", () => ({
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
jest.mock("next/navigation", () => ({
  usePathname: () => "/test",
}));
jest.mock("../src/app/components/TimerContext", () => ({
  useTimer: () => ({resetTimer: () => {}}),
}));
jest.mock("../src/app/utils/utils", () => ({
  signOutHandler: () => '/test'
}));

jest.mock('../src/app/components/profileSelect', () => {
  const Test = () => {
    return(
      <div data-testid="test">test</div>  
    )
  }
  return Test
});

describe("LayoutHeader", () => {
  it("should render button", async () => {
    await act(async() => {
      render(<LayoutHeader />);
    });
    expect(screen.getByTestId("test")).toBeInTheDocument();
    const button = screen.queryByRole('button');
    expect(button).toHaveClass('!bg-transparent');
    expect(button).toBeInTheDocument();
  });
});
