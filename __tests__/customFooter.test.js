import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
// import userEvent from '@testing-library/user-event'
import CustomFooter from '@/app/components/CustomFooter';

describe("CustomFooter", () => {

    it('should render footer', () => {
        render(<CustomFooter />);
        const footer = screen.getByRole('contentinfo');
        expect(footer).toBeInTheDocument();
    })

    it('should render div with text', () => {
        render(<CustomFooter />);
        const text = screen.getByText(`©${dayjs().year()} Izglītības resursu uzskaites un monitoringa informācijas sistēma`);
        expect(text).toBeInTheDocument();
    })

    it('should render images', () => {
        render(<CustomFooter />);
        const images = screen.getAllByRole('img');
        images.forEach(img => {
            expect(img).toBeInTheDocument();
        });
    })

})