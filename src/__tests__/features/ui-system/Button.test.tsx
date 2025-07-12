import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Button } from '../../../features/ui-system/components/Button';

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza corretamente com texto', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('chama onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('aplica variant default corretamente', () => {
    render(<Button variant="default">Default Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('aplica variant secondary corretamente', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('aplica variant outline corretamente', () => {
    render(<Button variant="outline">Outline Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });

  it('aplica size small corretamente', () => {
    render(<Button size="sm">Small Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
  });

  it('aplica size large corretamente', () => {
    render(<Button size="lg">Large Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('fica disabled quando prop disabled é true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('não chama onClick quando disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('aplica classes de micro-interação corretamente', () => {
    render(<Button>Interactive Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-all', 'duration-200');
  });

  it('aplica className customizada', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('suporta children como ReactNode', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('forwarda ref corretamente', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('mantém outras props HTML', () => {
    render(<Button data-testid="custom-button" type="submit">Submit</Button>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('type', 'submit');
  });
}); 