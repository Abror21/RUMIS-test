import matchMediaPolyfill from "match-media-mock";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import ProfileSelect from "@/app/components/profileSelect";

global.matchMedia = matchMediaPolyfill.create({
  type: "screen",
  width: 1024,
});

jest.mock("axios");
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        cookies: ["value1", "value2"],
        accessToken: "testToken",
        permissions: ["permissions"],
      },
    },
    update: jest.fn()
  }),
  signOut: () => {}
}));
jest.mock("next/navigation", () => ({
    usePathname: () => '/test',
    useRouter: () => ({ router: jest.fn(), replace: jest.fn() }),
}));
jest.mock("../src/app/components/TimerContext", () => ({
    useTimer: () => ({resetTimer: () => {}}),
}));
jest.mock("../src/app/utils/useQueryApiClient", () => (props) => {
    if(props.onSuccess && props.request.url === "/account/profiles"){
        props.onSuccess([{id: 'test'}])
    }
    if(props.onSuccess && props.request.url === "/account/setprofile(undefined)"){
        props.onSuccess({
            token: "testToken", 
            tokenExpires: "testTokenExpires",
            permissions: ['testPermission1', 'testPermission2', 'testPermission3']
        })
    }
    return{appendData: () => {}}
});
jest.mock("../src/app/utils/utils", () => ({
    profileName: () => 'string',
    signOutHandler: () => {}
}));

describe("ProfileSelect", () => {
  it("should call axios post", async() => {
    axios.post.mockResolvedValue({data: {status_code: 200}});
      await act(async() => {
        render(<ProfileSelect showButtons={true} />);
      })
      const button = screen.getByText('Atcelt');
      fireEvent.click(button);
  });

  it("should throw error", async() => {
    axios.post.mockResolvedValue({data: {status_code: 300}});
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    await act(async() => {
        render(<ProfileSelect showButtons={true} />);
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith({"error": "Kaut kas nogāja greizi!"})
  });

  it("should throw error", async() => {
    axios.post.mockResolvedValue({data: {status_code: 200}});
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    await act(async() => {
        render(<ProfileSelect />);
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith({"error": "Kaut kas nogāja greizi!"})
  });
});
