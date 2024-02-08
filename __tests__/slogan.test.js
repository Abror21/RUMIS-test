// my-first-react-test.test.js
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Slogan } from '@/app/components/slogan';

describe("Slogan", () => {
  it("should have name", () => {
    render(<Slogan />);
    const main = screen.getByRole('heading', {
      name: "RUMIS",
    });

    expect(main).toBeInTheDocument();
  });
});
