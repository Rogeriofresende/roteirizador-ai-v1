import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

// V7.5 Enhanced Navigation UX Design
const meta: Meta = {
  title: 'Design System/UX/Navigation',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        component: `
# Navigation UX Design - V7.5 Enhanced

Optimized navigation system with cognitive load management and accessibility focus.

## 🎯 UX Principles
- **<3 Clicks Rule**: Any component accessible within 3 clicks
- **<2s Search**: Find any component in under 2 seconds
- **<3 Decisions**: Maximum 3 decisions per page to reduce cognitive load
- **Clear Hierarchy**: Visual hierarchy guides user attention
- **Consistent Patterns**: Predictable interaction patterns

## 🔍 Search Efficiency
- Intelligent search with auto-suggestions
- Category-based filtering
- Recently viewed components
- Keyboard shortcuts for power users

## ♿ Accessibility Features
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast mode support
        `,
      },
    },
  },
  tags: ['autodocs', 'design-system', 'v7-enhanced', 'ux'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Main Navigation Story
export const MainNavigation: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '280px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
            Design System
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
            V7.5 Enhanced Components
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search components..."
            style={{
              width: '100%',
              padding: '0.75rem 2.5rem 0.75rem 1rem',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'inherit',
              fontSize: '0.875rem',
            }}
          />
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.6,
            fontSize: '0.75rem',
          }}>
            ⌘K
          </div>
        </div>

        {/* Navigation Categories */}
        <nav style={{ flex: 1 }}>
          <NavigationSection title="Foundation" items={[
            { label: 'Design Tokens', href: '#', badge: '12' },
            { label: 'Typography', href: '#', badge: '6' },
            { label: 'Colors', href: '#', badge: '8' },
            { label: 'Icons', href: '#', badge: '24' },
          ]} />
          
          <NavigationSection title="Components" items={[
            { label: 'Buttons', href: '#', badge: '5' },
            { label: 'Forms', href: '#', badge: '8' },
            { label: 'Layout', href: '#', badge: '6' },
            { label: 'Navigation', href: '#', badge: '4' },
          ]} />
          
          <NavigationSection title="Patterns" items={[
            { label: 'Page Layouts', href: '#', badge: '3' },
            { label: 'Data Display', href: '#', badge: '7' },
            { label: 'Feedback', href: '#', badge: '5' },
          ]} />
        </nav>

        {/* Quick Actions */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm">New Story</Button>
            <Button variant="ghost" size="sm">Export</Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
              Component Library
            </h1>
            <p style={{ fontSize: '1.125rem', opacity: 0.8, margin: 0 }}>
              Explore our comprehensive design system components
            </p>
          </div>

          {/* Breadcrumb */}
          <nav style={{ marginBottom: '2rem' }}>
            <ol style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              fontSize: '0.875rem',
              opacity: 0.8,
            }}>
              <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Home</a></li>
              <li>/</li>
              <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Components</a></li>
              <li>/</li>
              <li style={{ fontWeight: '500' }}>Buttons</li>
            </ol>
          </nav>

          {/* Content Preview */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '2rem',
            minHeight: '400px',
          }}>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Button Components</h2>
            <p style={{ margin: '0 0 2rem 0', opacity: 0.8 }}>
              Interactive elements for user actions and navigation.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Action</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Main navigation with optimized UX principles and <3 clicks accessibility.',
      },
    },
  },
};

// Mobile Navigation Story
export const MobileNavigation: Story = {
  render: () => (
    <div style={{ maxWidth: '375px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Mobile Header */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(15px)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          fontSize: '1.25rem',
          cursor: 'pointer',
        }}>
          ☰
        </button>
        <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
          Components
        </h1>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          fontSize: '1.25rem',
          cursor: 'pointer',
        }}>
          🔍
        </button>
      </header>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {['All', 'Foundation', 'Components', 'Patterns'].map((tab, index) => (
          <button
            key={tab}
            style={{
              flex: 1,
              padding: '0.875rem 0.5rem',
              background: index === 1 ? 'rgba(255,255,255,0.1)' : 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: index === 1 ? '500' : '400',
              borderBottom: index === 1 ? '2px solid currentColor' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile Content */}
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              color: 'inherit',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {['Buttons', 'Forms', 'Layout', 'Navigation', 'Typography'].map((item) => (
            <div
              key={item}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontWeight: '500' }}>{item}</span>
              <span style={{ opacity: 0.6, fontSize: '0.875rem' }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile-optimized navigation with touch-friendly interactions.',
      },
    },
  },
};

// Search Experience Story
export const SearchExperience: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Enhanced Search Experience</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Find any component in under 2 seconds</p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Type to search components, patterns, or tokens..."
          style={{
            width: '100%',
            padding: '1rem 3rem 1rem 1rem',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(15px)',
            color: 'inherit',
            fontSize: '1rem',
            transition: 'border-color 0.2s ease',
          }}
        />
        <div style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.6,
        }}>
          🔍
        </div>
      </div>

      {/* Quick Filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem', opacity: 0.8 }}>
          Quick Filters
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Recently Used', 'Components', 'Tokens', 'Patterns', 'Icons'].map((filter) => (
            <button
              key={filter}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                color: 'inherit',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>5 results found</div>
        </div>
        
        {[
          { title: 'Button - Primary', category: 'Components', description: 'Main action button with primary styling' },
          { title: 'Button - Secondary', category: 'Components', description: 'Secondary action button variant' },
          { title: 'Color Tokens', category: 'Foundation', description: 'Brand color palette and variants' },
          { title: 'Form Layout', category: 'Patterns', description: 'Standard form layout pattern' },
          { title: 'Navigation Menu', category: 'Components', description: 'Main navigation component' },
        ].map((result, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div style={{ fontWeight: '500' }}>{result.title}</div>
              <div style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '4px',
                opacity: 0.8,
              }}>
                {result.category}
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
              {result.description}
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
          Keyboard Shortcuts
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
          <div><kbd style={{ padding: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>⌘K</kbd> Open search</div>
          <div><kbd style={{ padding: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>↑↓</kbd> Navigate results</div>
          <div><kbd style={{ padding: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Enter</kbd> Select item</div>
          <div><kbd style={{ padding: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Esc</kbd> Close search</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Enhanced search experience with auto-suggestions and keyboard shortcuts.',
      },
    },
  },
};

// Helper Component
const NavigationSection = ({ title, items }: { title: string; items: { label: string; href: string; badge?: string }[] }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem', opacity: 0.8 }}>
      {title}
    </div>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {items.map((item, index) => (
        <li key={index}>
          <a
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'inherit',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s ease',
            }}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                opacity: 0.8,
              }}>
                {item.badge}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  </div>
); 