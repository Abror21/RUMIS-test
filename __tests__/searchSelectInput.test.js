import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchSelectInput from '@/app/components/searchSelectInput';

describe("SearchSelectInput", () => {
  it('filters options based on input', () => {
    const options = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Orange', value: 'orange' },
    ];
    render(<SearchSelectInput options={options} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Banana' } });
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Orange')).not.toBeInTheDocument();
  });

  it('filters options based on input', () => {
    render(<SearchSelectInput />);
  });

  it('filters options based on input', () => {
    const options = [
      { label: undefined, value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: undefined, value: 'orange' },
    ];
    render(<SearchSelectInput options={options} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Banana' } });
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Orange')).not.toBeInTheDocument();
  });
})