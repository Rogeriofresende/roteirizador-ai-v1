import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';

describe('Button - Reactivated Test', () => {
  it('renders correctly', () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByText('Test Button');
    expect(button).toBeDefined();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
  
  it('applies custom className', () => {
    render(<Button className="custom-class">Styled</Button>);
    const button = screen.getByText('Styled');
    expect(button.className).toContain('custom-class');
  });
}); 