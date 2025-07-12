/**
 * 🔄 User Migration Design Patterns
 * 
 * Familiar elements preservation with enhanced aesthetics
 * Smooth transition patterns for existing user comfort
 * 
 * Part of: WEEK 0 - IA Beta Design System Foundation
 * Integration: Migration services + A/B testing framework + Communication templates
 */

import { colors, typography, spacing, shadows, borderRadius, transitions } from './tokens';
import { migrationAnimations } from './animations';

// ============================================================================
// FAMILIAR ELEMENT PRESERVATION
// ============================================================================

/**
 * Core UI elements that users recognize and expect
 * Enhanced but maintaining visual familiarity
 */
export const familiarElements = {
  // Primary button - enhanced but recognizable
  primaryButton: {
    // Original familiar styling
    familiar: {
      backgroundColor: colors.migration.familiar,
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      transition: transitions.common.colors
    },
    
    // Enhanced version with subtle improvements
    enhanced: {
      backgroundColor: colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.lg,
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      boxShadow: shadows.sm,
      transition: transitions.common.all,
      
      '&:hover': {
        backgroundColor: colors.primary[600],
        boxShadow: shadows.md,
        transform: 'translateY(-1px)'
      },
      
      '&:focus-visible': {
        outline: `2px solid ${colors.primary[300]}`,
        outlineOffset: '2px'
      }
    }
  },

  // Input field - maintaining expected behavior
  inputField: {
    familiar: {
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.base,
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.base,
      backgroundColor: 'white',
      color: colors.neutral[900],
      transition: transitions.common.colors,
      
      '&:focus': {
        borderColor: colors.migration.familiar,
        outline: 'none'
      }
    },
    
    enhanced: {
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      backgroundColor: 'white',
      color: colors.neutral[900],
      transition: transitions.common.all,
      
      '&:focus': {
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
        outline: 'none'
      },
      
      '&:hover': {
        borderColor: colors.neutral[400]
      }
    }
  },

  // Navigation menu - keeping structure familiar
  navigationMenu: {
    familiar: {
      backgroundColor: 'white',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      padding: `${spacing[3]} 0`,
      
      item: {
        padding: `${spacing[2]} ${spacing[4]}`,
        color: colors.neutral[700],
        textDecoration: 'none',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.normal,
        
        '&:hover': {
          color: colors.migration.familiar,
          backgroundColor: colors.neutral[50]
        },
        
        '&.active': {
          color: colors.migration.familiar,
          fontWeight: typography.fontWeight.medium
        }
      }
    },
    
    enhanced: {
      backgroundColor: 'white',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      padding: `${spacing[4]} 0`,
      boxShadow: shadows.sm,
      
      item: {
        padding: `${spacing[3]} ${spacing[4]}`,
        color: colors.neutral[700],
        textDecoration: 'none',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.normal,
        borderRadius: borderRadius.md,
        transition: transitions.common.all,
        
        '&:hover': {
          color: colors.primary[600],
          backgroundColor: colors.primary[50],
          transform: 'translateY(-1px)'
        },
        
        '&.active': {
          color: colors.primary[600],
          fontWeight: typography.fontWeight.semibold,
          backgroundColor: colors.primary[100]
        }
      }
    }
  },

  // Card component - familiar container pattern
  card: {
    familiar: {
      backgroundColor: 'white',
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borderRadius.base,
      padding: spacing[4],
      marginBottom: spacing[4]
    },
    
    enhanced: {
      backgroundColor: 'white',
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      marginBottom: spacing[6],
      boxShadow: shadows.sm,
      transition: transitions.common.all,
      
      '&:hover': {
        boxShadow: shadows.md,
        transform: 'translateY(-2px)',
        borderColor: colors.neutral[300]
      }
    }
  }
};

// ============================================================================
// PROGRESSIVE ENHANCEMENT PATTERNS
// ============================================================================

/**
 * Gradual enhancement patterns that maintain familiarity
 * while introducing modern design elements
 */
export const progressiveEnhancement = {
  // Visual hierarchy improvements
  typography: {
    // Heading evolution
    headingEvolution: {
      phase1: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing[4]
      },
      
      phase2: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing[6],
        letterSpacing: typography.letterSpacing.tight
      },
      
      phase3: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[900],
        marginBottom: spacing[6],
        letterSpacing: typography.letterSpacing.tight,
        lineHeight: typography.lineHeight.tight
      }
    },
    
    // Body text refinement
    bodyTextRefinement: {
      phase1: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.normal,
        color: colors.neutral[700]
      },
      
      phase2: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.relaxed,
        color: colors.neutral[700]
      },
      
      phase3: {
        fontSize: typography.fontSize.lg,
        lineHeight: typography.lineHeight.relaxed,
        color: colors.neutral[800],
        fontWeight: typography.fontWeight.normal
      }
    }
  },

  // Color scheme evolution
  colorScheme: {
    phase1: {
      primary: colors.migration.familiar,
      secondary: colors.neutral[600],
      background: 'white',
      text: colors.neutral[900]
    },
    
    phase2: {
      primary: colors.migration.enhanced,
      secondary: colors.neutral[600],
      background: colors.neutral[50],
      text: colors.neutral[900]
    },
    
    phase3: {
      primary: colors.primary[500],
      secondary: colors.secondary[600],
      background: colors.neutral[50],
      text: colors.neutral[900],
      accent: colors.primary[100]
    }
  },

  // Spacing refinement
  spacingRefinement: {
    phase1: {
      container: spacing[4],
      section: spacing[6],
      element: spacing[3]
    },
    
    phase2: {
      container: spacing[6],
      section: spacing[8],
      element: spacing[4]
    },
    
    phase3: {
      container: spacing[8],
      section: spacing[12],
      element: spacing[6]
    }
  }
};

// ============================================================================
// TRANSITION ANIMATION PATTERNS
// ============================================================================

/**
 * Smooth transition patterns for UI changes
 */
export const transitionPatterns = {
  // Gentle introduction of new elements
  gentleIntroduction: {
    fadeInWithSlide: {
      initial: {
        opacity: 0,
        transform: 'translateY(10px)'
      },
      animate: {
        opacity: 1,
        transform: 'translateY(0)'
      },
      transition: {
        duration: '400ms',
        easing: 'ease-out'
      }
    },
    
    scaleFromCenter: {
      initial: {
        opacity: 0,
        transform: 'scale(0.95)'
      },
      animate: {
        opacity: 1,
        transform: 'scale(1)'
      },
      transition: {
        duration: '300ms',
        easing: 'ease-out'
      }
    }
  },

  // Highlight new features without disruption
  featureHighlight: {
    subtleGlow: {
      keyframes: `
        @keyframes subtleGlow {
          0% { box-shadow: 0 0 0 0 ${colors.primary[500]}30; }
          50% { box-shadow: 0 0 0 8px ${colors.primary[500]}10; }
          100% { box-shadow: 0 0 0 0 ${colors.primary[500]}00; }
        }
      `,
      animation: 'subtleGlow 2s ease-in-out'
    },
    
    colorWave: {
      keyframes: `
        @keyframes colorWave {
          0% { background-color: transparent; }
          50% { background-color: ${colors.migration.highlight}; }
          100% { background-color: transparent; }
        }
      `,
      animation: 'colorWave 1.5s ease-in-out'
    }
  },

  // Color migration animations
  colorMigration: {
    gradualShift: {
      keyframes: `
        @keyframes gradualShift {
          0% { background-color: var(--from-color); }
          100% { background-color: var(--to-color); }
        }
      `,
      animation: 'gradualShift 800ms ease-in-out forwards'
    },
    
    pulseTransition: {
      keyframes: `
        @keyframes pulseTransition {
          0% { background-color: var(--from-color); transform: scale(1); }
          50% { background-color: var(--transition-color); transform: scale(1.02); }
          100% { background-color: var(--to-color); transform: scale(1); }
        }
      `,
      animation: 'pulseTransition 1200ms ease-in-out forwards'
    }
  }
};

// ============================================================================
// BACKWARD COMPATIBILITY COMPONENTS
// ============================================================================

/**
 * Components that maintain backward compatibility
 * while enabling progressive enhancement
 */
export const backwardCompatibility = {
  // Button variants that look familiar
  buttonVariants: {
    // Classic button style
    classic: {
      backgroundColor: colors.migration.familiar,
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.base,
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      
      '&:hover': {
        backgroundColor: colors.primary[600]
      }
    },
    
    // Modern button with classic feel
    modernClassic: {
      backgroundColor: colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      boxShadow: shadows.sm,
      transition: transitions.common.all,
      
      '&:hover': {
        backgroundColor: colors.primary[600],
        boxShadow: shadows.md,
        transform: 'translateY(-1px)'
      }
    }
  },

  // Form elements that feel familiar
  formElements: {
    // Traditional input
    traditionalInput: {
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.base,
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.base,
      backgroundColor: 'white',
      
      '&:focus': {
        borderColor: colors.migration.familiar,
        outline: 'none'
      }
    },
    
    // Enhanced traditional input
    enhancedTraditional: {
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      backgroundColor: 'white',
      transition: transitions.common.all,
      
      '&:focus': {
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 2px ${colors.primary[100]}`,
        outline: 'none'
      },
      
      '&:hover': {
        borderColor: colors.neutral[400]
      }
    }
  },

  // Layout patterns that users recognize
  layoutPatterns: {
    // Traditional header
    traditionalHeader: {
      backgroundColor: 'white',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      padding: `${spacing[3]} ${spacing[6]}`,
      
      logo: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900]
      },
      
      navigation: {
        display: 'flex',
        gap: spacing[6],
        
        item: {
          color: colors.neutral[700],
          textDecoration: 'none',
          fontSize: typography.fontSize.sm,
          
          '&:hover': {
            color: colors.migration.familiar
          }
        }
      }
    },
    
    // Enhanced header maintaining structure
    enhancedHeader: {
      backgroundColor: 'white',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      padding: `${spacing[4]} ${spacing[6]}`,
      boxShadow: shadows.sm,
      
      logo: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[900],
        letterSpacing: typography.letterSpacing.tight
      },
      
      navigation: {
        display: 'flex',
        gap: spacing[8],
        
        item: {
          color: colors.neutral[700],
          textDecoration: 'none',
          fontSize: typography.fontSize.sm,
          padding: `${spacing[2]} ${spacing[3]}`,
          borderRadius: borderRadius.md,
          transition: transitions.common.all,
          
          '&:hover': {
            color: colors.primary[600],
            backgroundColor: colors.primary[50]
          }
        }
      }
    }
  }
};

// ============================================================================
// USER COMFORT PATTERNS
// ============================================================================

/**
 * Design patterns focused on user comfort during transitions
 */
export const userComfortPatterns = {
  // Familiar interaction patterns
  interactions: {
    // Classic hover states
    classicHover: {
      cursor: 'pointer',
      transition: 'color 150ms ease-in-out',
      
      '&:hover': {
        color: colors.migration.familiar
      }
    },
    
    // Enhanced hover with animation
    enhancedHover: {
      cursor: 'pointer',
      transition: transitions.common.all,
      
      '&:hover': {
        color: colors.primary[600],
        transform: 'translateY(-1px)'
      }
    }
  },

  // Feedback patterns
  feedback: {
    // Simple success state
    simpleSuccess: {
      color: colors.success[600],
      fontWeight: typography.fontWeight.medium
    },
    
    // Enhanced success with animation
    enhancedSuccess: {
      color: colors.success[600],
      fontWeight: typography.fontWeight.medium,
      animation: migrationAnimations.fadeInUp.animation,
      
      '&::before': {
        content: '"✓ "',
        color: colors.success[500]
      }
    }
  },

  // Loading states that feel familiar
  loadingStates: {
    // Simple spinner
    simpleSpinner: {
      border: `2px solid ${colors.neutral[200]}`,
      borderTop: `2px solid ${colors.migration.familiar}`,
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      animation: 'spin 1s linear infinite'
    },
    
    // Enhanced loading with pulse
    enhancedLoading: {
      border: `2px solid ${colors.primary[100]}`,
      borderTop: `2px solid ${colors.primary[500]}`,
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      animation: 'spin 1s linear infinite',
      boxShadow: `0 0 0 2px ${colors.primary[50]}`
    }
  }
};

// ============================================================================
// MIGRATION PHASE ORCHESTRATION
// ============================================================================

/**
 * Orchestration of migration phases for smooth transitions
 */
export const migrationOrchestration = {
  // Phase-based rollout
  phases: {
    phase1_foundation: {
      description: 'Subtle improvements maintaining familiarity',
      changes: [
        'Enhanced shadows on cards',
        'Slightly rounded corners',
        'Improved hover states',
        'Better spacing'
      ],
      timeline: '1-2 days',
      userImpact: 'minimal'
    },
    
    phase2_enhancement: {
      description: 'Visual improvements with familiar structure',
      changes: [
        'Updated color palette',
        'Improved typography',
        'Better contrast ratios',
        'Smooth animations'
      ],
      timeline: '3-5 days',
      userImpact: 'low'
    },
    
    phase3_modernization: {
      description: 'Full design system implementation',
      changes: [
        'Complete design system',
        'Advanced interactions',
        'Accessibility improvements',
        'Performance optimizations'
      ],
      timeline: '6-7 days',
      userImpact: 'medium'
    }
  },

  // Rollback strategies
  rollbackStrategies: {
    immediateRollback: {
      trigger: 'User satisfaction < 70%',
      action: 'Revert to previous phase immediately',
      timeline: '< 30 minutes'
    },
    
    gradualRollback: {
      trigger: 'User confusion > 20%',
      action: 'Gradually revert changes over 24 hours',
      timeline: '24 hours'
    },
    
    componentRollback: {
      trigger: 'Specific component issues',
      action: 'Revert individual components only',
      timeline: '< 2 hours'
    }
  }
};

// ============================================================================
// MAIN MIGRATION PATTERNS EXPORT
// ============================================================================

export const migrationPatterns = {
  familiar: familiarElements,
  progressive: progressiveEnhancement,
  transitions: transitionPatterns,
  compatibility: backwardCompatibility,
  comfort: userComfortPatterns,
  orchestration: migrationOrchestration
};

export default migrationPatterns; 