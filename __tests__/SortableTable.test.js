import SortableTable from "@/app/components/SortableTable"
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import matchMediaPolyfill from "match-media-mock";

global.matchMedia = matchMediaPolyfill.create({
    type: "screen",
    width: 1024,
  });

describe("SortableTable", () => {
    it("should check checkbox", async() => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        render(<SortableTable initialData={[{key: 'key'}, {key: 'key2'}]} />);
        const checkboxes = screen.getAllByRole("checkbox");
        const checkbox = checkboxes[0];
        await userEvent.click(checkbox);
    });

    it("should call functions when buttons are clicked", async() => {
        const onCancel = jest.fn();
        const onSubmit = jest.fn();
        render(<SortableTable initialData={[{key: 'key'}, {key: 'key2'}]} onCancel={onCancel} onSubmit={onSubmit} />);
        const cancelButton = screen.getByText("Atcelt");
        const confirmButton = screen.getByText("Saglabāt");
        await userEvent.click(cancelButton);
        await userEvent.click(confirmButton);
        expect(onCancel).toHaveBeenCalled();
        expect(onSubmit).toHaveBeenCalled();
    })
})