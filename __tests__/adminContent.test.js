import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AdminContent from '@/app/components/adminContent';

describe("AdminContent", () => {
    it('should render AdminContent', () => {
        render(<AdminContent title="test" background="red" breadcrumb={[{title: 'test'}]}><div>test</div></AdminContent>);
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
    })
    it('should have style', () => {
        render(<AdminContent title="test" breadcrumb={[{title: 'test'}]}><div>test</div></AdminContent>);
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
        expect(main).toHaveStyle("background: rgb(255, 255, 255);");
    })
})