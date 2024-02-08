import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import LinkButton from '@/app/components/LinkButton';

describe("LinkButton", () => {
    it('should render LinkButton', () => {
        const expectedHref = '/something'
        render(<LinkButton
            href={expectedHref}
        >
            something
        </LinkButton>)
        const link = screen.getByRole('link')
        const button = screen.getByRole('button', { name: 'something' });

        expect(link).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        expect(link).toContainElement(button);
        expect(link).toHaveAttribute('href', expectedHref);
    })
})