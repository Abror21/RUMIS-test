
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ViewValue } from '@/app/components/viewValue'

describe("renders ViewValue component with label and value", () => {
    const label = 'Test Label';
    const value = 'Test Value';

    it("should be in document", () => {
        render(<ViewValue label={label} value={value} />);
        const wrapperDiv = screen.getByText(label).closest('.mb-2');
        
        expect(wrapperDiv).toBeInTheDocument();
        expect(wrapperDiv).toHaveClass('mb-2');
        
        const labelDiv = wrapperDiv.querySelector(':first-child');
        expect(labelDiv).toHaveTextContent(label);
        expect(labelDiv).toBeInTheDocument();

        const valueDiv = wrapperDiv.querySelector('.font-bold');
        expect(valueDiv).toHaveTextContent(value);
        expect(valueDiv).toBeInTheDocument();
    });
});