import SesionNotificationModal from "@/app/components/SesionNotificationModal";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../src/app/components/TimerContext", () => ({
    useTimer: () => ({count: 0, running: true, startTimer: jest.fn(), resetTimer: jest.fn(), showNotification: true})
}))

describe("SesionNotificationModal", () => {
    it("should render correctly", async() => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        render(<SesionNotificationModal />);
        const button = screen.getByRole('button', {name: "Pagarināt"});
        await userEvent.click(button);
    });
});