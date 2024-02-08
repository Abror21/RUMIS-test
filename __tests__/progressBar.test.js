import NextProgressBar from "@/app/components/progressBar";
import { fireEvent, render } from "@testing-library/react";
import { useSearchParams } from 'next/navigation';

jest.mock('next/navigation');
jest.mock("nprogress", () => ({
    start: () => {},
    done: () => {}
}));
jest.mock("nextjs-toploader", () => {
    const Test = ({ children }) => {
        return children
    };
    return Test;
})

describe("NextProgressBar", () => {
    it("should start nProgress on popstate", () => {
        useSearchParams.mockReturnValue({});
        render(<NextProgressBar><div>test</div></NextProgressBar>);
        fireEvent(window, new Event('popstate'));
    })
})