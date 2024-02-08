import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Link from 'next/link';
import { AdminBreadcrumbs } from '@/app/components/breadcrumbs';

describe("renders Navigation with items", () => {
    const items = [
        { title: <Link href="/admin">Test title1</Link> },
        { title: <Link href="/admin/applications">Test title2</Link> },
        { title: 'Test title3' },
    ]
    it('should be in document', () => {
        render(<AdminBreadcrumbs items={items} />)

        const breadcrumb = screen.getByRole('navigation');
        expect(breadcrumb).toBeInTheDocument();
    })
});