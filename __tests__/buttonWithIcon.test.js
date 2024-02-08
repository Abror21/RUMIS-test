// my-first-react-test.test.js
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { ButtonWithIcon } from '@/app/components/buttonWithIcon';

const label = 'Test';
const mockEvent = jest.fn();

describe("Button with icon", () => {

  describe('Render', () => {
    it("should render button with icon", () => {
      render(<ButtonWithIcon label={label} event={mockEvent} />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  })

  describe('Behavior', () => {
    it("should call mockEvent when button clicked", async() => {
      render(<ButtonWithIcon label={label} event={mockEvent} />);
      const button = screen.getByRole("button");
      await userEvent.click(button);
      expect(mockEvent).toBeCalled();
    })
  })

});
