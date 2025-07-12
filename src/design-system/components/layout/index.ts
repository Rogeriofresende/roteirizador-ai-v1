/**
 * 📐 Layout Components Index - Complete Export Organization
 * 
 * Centralized exports for all layout components with utilities and patterns
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4.2
 * 
 * Components included:
 * - Container (responsive container with breakpoints)
 * - Grid (flexible grid system)
 * - Sidebar (collapsible navigation)
 * - Panel (resizable panels)
 */

// ============================================================================
// CONTAINER EXPORTS
// ============================================================================

export {
  default as Container,
  FluidContainer,
  FixedContainer,
  ConstrainedContainer,
  FullscreenContainer,
  ContainerUtils,
  ContainerComposition,
  useContainer,
  useResponsiveContainer,
  DEFAULT_BREAKPOINTS,
  SIZE_CONFIG,
  type ContainerProps,
  type ContainerBreakpoint
} from './Container';

// ============================================================================
// GRID EXPORTS
// ============================================================================

export {
  default as Grid,
  GridItem,
  type GridProps,
  type GridItemProps
} from './Grid';

// ============================================================================
// SIDEBAR EXPORTS
// ============================================================================

export {
  default as Sidebar,
  type SidebarProps,
  type SidebarItem
} from './Sidebar';

// ============================================================================
// PANEL EXPORTS
// ============================================================================

export {
  default as Panel,
  SplitPanel,
  type PanelProps,
  type SplitPanelProps
} from './Panel';

// ============================================================================
// LAYOUT COMPONENT COLLECTIONS
// ============================================================================

import Container from './Container';
import Grid from './Grid';
import Sidebar from './Sidebar';
import Panel from './Panel';

export const LayoutComponents = {
  Container,
  Grid,
  Sidebar,
  Panel
};

export const ResponsiveComponents = {
  Container,
  Grid
};

export const NavigationComponents = {
  Sidebar
};

export const FlexibleComponents = {
  Grid,
  Panel
};

// ============================================================================
// LAYOUT PATTERNS
// ============================================================================

export const LayoutPatterns = {
  // Dashboard Layout
  dashboard: {
    components: ['Container', 'Grid', 'Sidebar'],
    description: 'Full dashboard layout with sidebar navigation'
  },
  
  // Content Layout
  content: {
    components: ['Container', 'Grid'],
    description: 'Content-focused layout with responsive grid'
  },
  
  // Application Layout
  application: {
    components: ['Container', 'Sidebar', 'Panel'],
    description: 'Complex application layout with resizable panels'
  },
  
  // Landing Layout
  landing: {
    components: ['Container', 'Grid'],
    description: 'Marketing/landing page layout'
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default LayoutComponents; 