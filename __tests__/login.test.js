import { Login } from "@/app/components/login";
import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import axios from "axios";
import * as nextAuth from 'next-auth/react';
import { act } from "react-dom/test-utils";
import matchMediaPolyfill from "match-media-mock";
import userEvent from "@testing-library/user-event";

global.matchMedia = matchMediaPolyfill.create({
  type: "screen",
  width: 1024,
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => {} }),
}));
jest.mock("axios");
jest.mock("next-auth/react");
jest.mock("../src/app/utils/useQueryApiClient", () => () => ({appendData: jest.fn()}));

describe("Login", () => {
  it("should call axios.get", async () => {
    axios.get.mockResolvedValue({data: {content: "test"}});
    await act(async() => {
      render(<Login />);
    })
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should call console.error", async () => {
    const axiosError = new Error("Network Error");
    axios.get.mockRejectedValueOnce(axiosError);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    await act(async() => {
      await render(<Login />);
    })
    expect(consoleErrorSpy).toHaveBeenCalled()
  });

  it("should call axios.get", async () => {
    render(<Login />);

    const checkbox = screen.getByRole("checkbox");
    const button = screen.getByRole("button", { name: /Latvija.lv/i });
    expect(button).toBeDisabled();
    await userEvent.click(checkbox);
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(window.location.pathname).toBe('/');

    const testP = screen.queryByTestId("test-text");
    expect(testP).not.toBeInTheDocument();

    const span = screen.getByText("lietošanas noteikumiem.");
    await userEvent.click(span);
    const testModal = screen.getByTestId('test-modal');
    expect(testModal).toBeInTheDocument();
    const testDiv = screen.getByTestId('test-div');
    expect(testDiv).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toHaveClass('ant-modal-close');
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);
  });

  it("should check form", async() => {
    nextAuth.signIn.mockResolvedValue({error: 'error'});
    render(<Login />);

    const usernameInput = screen.getByLabelText(/lietotājvārds/i);
    const passwordInput = screen.getByLabelText(/parole/i);
    const checkbox = screen.getByLabelText(/apliecinu/i);

    await userEvent.type(usernameInput, 'testUsername');
    await userEvent.type(passwordInput, 'testPassword');
    await userEvent.click(checkbox);

    const form = screen.getByTestId("test-form");
    fireEvent.submit(form);
  });

  it("should check form", async() => {
    nextAuth.signIn.mockResolvedValue({data: 'data'});
    render(<Login />);

    const usernameInput = screen.getByLabelText(/lietotājvārds/i);
    const passwordInput = screen.getByLabelText(/parole/i);
    const checkbox = screen.getByLabelText(/apliecinu/i);

    await userEvent.type(usernameInput, 'testUsername');
    await userEvent.type(passwordInput, 'testPassword');
    await userEvent.click(checkbox);

    const form = screen.getByTestId("test-form");
    fireEvent.submit(form);
  });
  
});
