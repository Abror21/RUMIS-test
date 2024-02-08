import { UserProfile } from "@/app/components/userProfile"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event";
import matchMediaPolyfill from "match-media-mock";
import { useEffect } from "react";

global.matchMedia = matchMediaPolyfill.create({
    type: "screen",
    width: 1024,
});
jest.mock("../src/app/utils/useQueryApiClient", () => {
    return useTestHook = (props) => {
        useEffect(() => {
            if (props.onSuccess) {
                props.onSuccess();
            }
        }, [])
        return { appendData: jest.fn() }
    }
});

jest.mock('antd', () => {
    const antd = jest.requireActual('antd');
    const { Form } = antd;
    return {
        ...antd, Form: {
            ...Form, useForm: () => {
                const [res] = Form.useForm();
                return [{ ...res, validateFields: jest.fn() }]
            }
        }
    }
});

describe("UserProfile", () => {
    it("should render correctly", async () => {
        jest.spyOn(console, "error").mockImplementation();
        render(<UserProfile />);
        const testDiv = screen.getByTestId("test-div");
        const span = screen.getByText("Persona");
        const button = screen.queryByRole('button', { name: /Rediģēt/i });

        expect(testDiv).toBeInTheDocument();
        expect(span).toBeInTheDocument();
        expect(button).not.toBeInTheDocument();
        const testModal = screen.queryByTestId("test-modal");
        expect(testModal).not.toBeInTheDocument();
    });

    it("should render correctly", async () => {
        jest.spyOn(console, "error").mockImplementation();
        render(<UserProfile
            title='test'
            status={true}
            label={false}
            allowEdit={true}
            person='test'
            setPerson={() => { }}
            userId={1}
            refresh={() => { }}
        />);
        const testDiv = screen.getByTestId("test-div");
        const span = screen.queryByText("Persona");
        const button = screen.getByRole('button', { name: /Rediģēt/i });

        expect(testDiv).toBeInTheDocument();
        expect(span).not.toBeInTheDocument();
        expect(button).toBeInTheDocument();
        await userEvent.click(button);
        const testModal = screen.getByTestId("test-modal");
        expect(testModal).toBeInTheDocument();

        const codeInput = screen.getByLabelText('Personas kods');
        const nameInput = screen.getByLabelText('Vārds');
        const surnameInput = screen.getByLabelText('Uzvārds');
        await userEvent.type(codeInput, 'code');
        await userEvent.type(nameInput, 'name');
        await userEvent.type(surnameInput, 'surname');

        const confirm = screen.getByRole('button', { name: /Saglabāt/i });
        await userEvent.click(confirm);

        const closeButton = screen.getByLabelText('Close');
        await userEvent.click(closeButton);
        await userEvent.click(button);
        const cancelButton = screen.getByRole('button', { name: /Atcelt/i });
        await userEvent.click(cancelButton);
    });
})