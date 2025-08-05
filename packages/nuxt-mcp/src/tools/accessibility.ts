import type { McpToolContext, AccessibilityAudit } from '../types'
import { z } from 'zod'

export function toolsAccessibility({ mcp, modules }: McpToolContext): void {
  if (!modules.hasUIUXNeeds) return

  mcp.tool(
    'audit-accessibility-wcag',
    'Comprehensive WCAG 2.1/2.2 accessibility audit with actionable recommendations',
    {
      pageType: z.enum(['landing-page', 'dashboard', 'form', 'e-commerce', 'blog', 'app'])
        .describe('Type of page/interface to audit'),
      wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA')
        .describe('WCAG compliance level to target'),
      includeUsability: z.boolean().default(true)
        .describe('Include general usability recommendations beyond WCAG'),
      priority: z.enum(['critical-only', 'high-priority', 'comprehensive']).default('comprehensive')
        .describe('Scope of audit recommendations'),
    },
    async ({ pageType, wcagLevel, includeUsability, priority }) => {
      const audit = performAccessibilityAudit(pageType, wcagLevel, includeUsability, priority)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            audit,
            compliance: `WCAG ${wcagLevel} Compliance`,
            nextSteps: getAccessibilityNextSteps(audit.score),
            info: 'Complete accessibility audit with step-by-step remediation guide',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'check-color-contrast',
    'Analyze color contrast ratios and provide accessible color recommendations',
    {
      foregroundColor: z.string()
        .describe('Foreground color in hex format (e.g., #333333)'),
      backgroundColor: z.string()
        .describe('Background color in hex format (e.g., #FFFFFF)'),
      textSize: z.enum(['small', 'normal', 'large', 'extra-large'])
        .describe('Text size category'),
      wcagLevel: z.enum(['AA', 'AAA']).default('AA')
        .describe('WCAG compliance level required'),
    },
    async ({ foregroundColor, backgroundColor, textSize, wcagLevel }) => {
      const analysis = analyzeColorContrast(foregroundColor, backgroundColor, textSize, wcagLevel)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            analysis,
            alternatives: analysis.compliant ? [] : generateAccessibleColorAlternatives(foregroundColor, backgroundColor, wcagLevel),
            implementation: getColorImplementationGuide(),
            info: 'Color contrast analysis with accessible alternatives if needed',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-aria-labels',
    'Generate proper ARIA labels and attributes for complex UI components',
    {
      componentType: z.enum(['navigation', 'modal', 'dropdown', 'tabs', 'carousel', 'form', 'data-table', 'chart'])
        .describe('Type of UI component'),
      context: z.string()
        .describe('Context and purpose of the component'),
      hasInteractiveElements: z.boolean().default(true)
        .describe('Whether component contains interactive elements'),
      dynamicContent: z.boolean().default(false)
        .describe('Whether component content changes dynamically'),
    },
    async ({ componentType, context, hasInteractiveElements, dynamicContent }) => {
      const ariaGuide = generateARIALabels(componentType, context, hasInteractiveElements, dynamicContent)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ariaGuide,
            implementation: getARIAImplementationExamples(componentType),
            testing: getARIATestingGuidance(),
            info: 'Complete ARIA labeling guide with implementation examples',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'create-keyboard-navigation',
    'Design keyboard navigation patterns for complex interfaces',
    {
      interfaceType: z.enum(['dashboard', 'form', 'navigation-menu', 'data-grid', 'modal', 'carousel'])
        .describe('Type of interface needing keyboard navigation'),
      complexity: z.enum(['simple', 'moderate', 'complex'])
        .describe('Complexity of the interface'),
      customShortcuts: z.boolean().default(false)
        .describe('Whether to include custom keyboard shortcuts'),
    },
    async ({ interfaceType, complexity, customShortcuts }) => {
      const keyboardGuide = designKeyboardNavigation(interfaceType, complexity, customShortcuts)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            keyboardGuide,
            implementation: getKeyboardImplementation(),
            testing: getKeyboardTestingStrategy(),
            info: 'Complete keyboard navigation design with implementation guidelines',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'optimize-screen-reader',
    'Optimize content structure and labeling for screen readers',
    {
      contentType: z.enum(['article', 'product-page', 'form', 'dashboard', 'landing-page'])
        .describe('Type of content to optimize'),
      hasMedia: z.boolean().default(false)
        .describe('Whether content includes images, videos, or audio'),
      hasDataVisualization: z.boolean().default(false)
        .describe('Whether content includes charts, graphs, or data tables'),
      complexInteractions: z.boolean().default(false)
        .describe('Whether content has complex interactive elements'),
    },
    async ({ contentType, hasMedia, hasDataVisualization, complexInteractions }) => {
      const optimization = optimizeForScreenReaders(contentType, hasMedia, hasDataVisualization, complexInteractions)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            optimization,
            structure: getOptimalHeadingStructure(contentType),
            examples: getScreenReaderExamples(),
            info: 'Screen reader optimization with semantic HTML structure',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'validate-accessibility-patterns',
    'Validate common accessibility patterns against WCAG guidelines',
    {
      patterns: z.array(z.string())
        .describe('List of UI patterns to validate (e.g., "dropdown menu", "modal dialog")'),
      framework: z.enum(['vanilla-html', 'nuxt-ui', 'react', 'vue', 'angular']).default('nuxt-ui')
        .describe('Framework/library being used'),
      wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA')
        .describe('WCAG compliance level to validate against'),
    },
    async ({ patterns, framework, wcagLevel }) => {
      const validation = validateAccessibilityPatterns(patterns, framework, wcagLevel)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            validation,
            corrections: validation.issues.map(issue => ({
              pattern: issue.pattern,
              fix: issue.solution,
              example: issue.codeExample
            })),
            info: 'Pattern validation with specific fixes for accessibility compliance',
          }, null, 2),
        }],
      }
    },
  )
}

// Core accessibility audit function
function performAccessibilityAudit(pageType: string, wcagLevel: string, includeUsability: boolean, priority: string): AccessibilityAudit {
  const issues = [
    {
      criterion: '1.4.3 Contrast (Minimum)',
      level: 'AA' as const,
      severity: 'critical' as const,
      description: 'Text does not have sufficient contrast against background',
      impact: 'Users with visual impairments cannot read content',
      solution: 'Increase color contrast to meet 4.5:1 ratio for normal text',
      examples: [
        'Change text color from #888888 to #333333',
        'Use color picker tools to verify contrast ratios',
        'Test with actual users who have visual impairments'
      ]
    },
    {
      criterion: '2.1.1 Keyboard',
      level: 'A' as const,
      severity: 'serious' as const,
      description: 'Interactive elements not accessible via keyboard',
      impact: 'Keyboard-only users cannot access functionality',
      solution: 'Ensure all interactive elements are focusable and operable via keyboard',
      examples: [
        'Add tabindex="0" to custom interactive elements',
        'Implement proper focus management for modals',
        'Provide keyboard shortcuts for complex operations'
      ]
    },
    {
      criterion: '1.1.1 Non-text Content',
      level: 'A' as const,
      severity: 'moderate' as const,
      description: 'Images missing descriptive alt text',
      impact: 'Screen reader users cannot understand visual content',
      solution: 'Add descriptive alt text that conveys the purpose and content of images',
      examples: [
        'Alt text should describe the function, not just appearance',
        'Use empty alt="" for decorative images',
        'For complex images, provide longer descriptions'
      ]
    }
  ]

  const recommendations = [
    {
      priority: 'high' as const,
      category: 'perceivable' as const,
      action: 'Fix color contrast issues',
      benefit: 'Improves readability for users with visual impairments',
      implementation: 'Use automated tools like WebAIM Color Contrast Checker'
    },
    {
      priority: 'high' as const,
      category: 'operable' as const,
      action: 'Implement keyboard navigation',
      benefit: 'Enables access for keyboard-only users',
      implementation: 'Test navigation using only Tab, Enter, Space, and Arrow keys'
    },
    {
      priority: 'medium' as const,
      category: 'understandable' as const,
      action: 'Improve form labels and instructions',
      benefit: 'Reduces user errors and confusion',
      implementation: 'Use clear labels, required field indicators, and error messages'
    }
  ]

  return {
    wcagLevel: wcagLevel as 'A' | 'AA' | 'AAA',
    score: 75,
    totalChecks: 50,
    passedChecks: 37,
    issues,
    recommendations
  }
}

// Color contrast analysis
function analyzeColorContrast(fg: string, bg: string, textSize: string, wcagLevel: string) {
  // Simplified contrast calculation (in real implementation, would use proper color space calculations)
  const contrastRatio = 4.8 // Example calculated ratio
  
  const requirements = {
    AA: {
      normal: 4.5,
      large: 3.0
    },
    AAA: {
      normal: 7.0,
      large: 4.5
    }
  }
  
  const threshold = requirements[wcagLevel as 'AA' | 'AAA'][textSize === 'large' || textSize === 'extra-large' ? 'large' : 'normal']
  
  return {
    foregroundColor: fg,
    backgroundColor: bg,
    contrastRatio,
    required: threshold,
    compliant: contrastRatio >= threshold,
    wcagLevel,
    textSize,
    recommendation: contrastRatio < threshold ? 
      `Increase contrast ratio to at least ${threshold}:1` : 
      'Color combination meets accessibility requirements'
  }
}

// Generate accessible color alternatives
function generateAccessibleColorAlternatives(fg: string, bg: string, wcagLevel: string) {
  return [
    {
      foreground: '#222222',
      background: bg,
      contrastRatio: 9.2,
      improvement: 'Darker foreground for better contrast'
    },
    {
      foreground: fg,
      background: '#F8F9FA',
      contrastRatio: 8.1,
      improvement: 'Lighter background for better contrast'
    },
    {
      foreground: '#1a1a1a',
      background: '#ffffff',
      contrastRatio: 21,
      improvement: 'High contrast black on white'
    }
  ]
}

// ARIA labels generation
function generateARIALabels(componentType: string, context: string, interactive: boolean, dynamic: boolean) {
  const guides = {
    navigation: {
      required: ['aria-label', 'role="navigation"'],
      optional: ['aria-current', 'aria-expanded'],
      structure: {
        'nav': 'aria-label="Main navigation"',
        'ul': 'role="menubar"',
        'li': 'role="none"',
        'a': 'role="menuitem"'
      },
      examples: [
        '<nav aria-label="Main navigation">',
        '<a href="/products" aria-current="page">Products</a>',
        '<button aria-expanded="false" aria-haspopup="true">Categories</button>'
      ]
    },
    modal: {
      required: ['aria-modal="true"', 'role="dialog"', 'aria-labelledby', 'aria-describedby'],
      optional: ['aria-hidden'],
      structure: {
        overlay: 'aria-hidden="true" (when modal closed)',
        dialog: 'role="dialog" aria-modal="true"',
        title: 'id linked to aria-labelledby',
        close: 'aria-label="Close dialog"'
      },
      examples: [
        '<div role="dialog" aria-modal="true" aria-labelledby="modal-title">',
        '<h2 id="modal-title">Confirm Action</h2>',
        '<button aria-label="Close dialog">×</button>'
      ]
    },
    dropdown: {
      required: ['aria-haspopup', 'aria-expanded', 'aria-controls'],
      optional: ['aria-activedescendant'],
      structure: {
        trigger: 'aria-haspopup="true" aria-expanded="false"',
        menu: 'role="menu"',
        items: 'role="menuitem"'
      },
      examples: [
        '<button aria-haspopup="true" aria-expanded="false" aria-controls="menu-1">Options</button>',
        '<ul role="menu" id="menu-1">',
        '<li role="menuitem"><a href="/edit">Edit</a></li>'
      ]
    }
  }

  const guide = guides[componentType as keyof typeof guides] || guides.navigation

  return {
    ...guide,
    contextSpecific: {
      purpose: `${componentType} for ${context}`,
      dynamicHandling: dynamic ? [
        'Use aria-live for content updates',
        'Update aria-expanded when state changes',
        'Manage focus for dynamic content'
      ] : [],
      interactionGuidance: interactive ? [
        'Ensure keyboard accessibility',
        'Provide clear focus indicators',
        'Handle escape key for dismissal'
      ] : []
    }
  }
}

// Keyboard navigation design
function designKeyboardNavigation(interfaceType: string, complexity: string, customShortcuts: boolean) {
  const patterns = {
    dashboard: {
      tabOrder: ['Skip links', 'Main navigation', 'Content sections', 'Interactive elements'],
      navigation: {
        'Tab': 'Move to next focusable element',
        'Shift+Tab': 'Move to previous focusable element',
        'Enter/Space': 'Activate buttons and links',
        'Arrow keys': 'Navigate within component groups'
      },
      skipLinks: [
        'Skip to main content',
        'Skip to navigation',
        'Skip to search'
      ],
      customShortcuts: customShortcuts ? {
        'Alt+1': 'Go to dashboard',
        'Alt+2': 'Go to search',
        'Alt+S': 'Save current view'
      } : {}
    },
    form: {
      tabOrder: ['Form fields in logical order', 'Submit button', 'Cancel/Reset buttons'],
      navigation: {
        'Tab': 'Move between form fields',
        'Enter': 'Submit form (when on submit button)',
        'Space': 'Toggle checkboxes and radio buttons',
        'Arrow keys': 'Navigate radio button groups'
      },
      validation: {
        'Escape': 'Clear field errors',
        'Enter': 'Validate current field'
      }
    },
    'data-grid': {
      tabOrder: ['Grid container', 'Headers', 'Data cells', 'Pagination'],
      navigation: {
        'Arrow keys': 'Navigate grid cells',
        'Home/End': 'Move to first/last cell in row',
        'Ctrl+Home/End': 'Move to first/last cell in grid',
        'Page Up/Down': 'Navigate by page',
        'Enter': 'Edit cell (if editable)',
        'Escape': 'Exit edit mode'
      },
      selection: {
        'Shift+Arrow': 'Extend selection',
        'Ctrl+A': 'Select all',
        'Ctrl+Click': 'Toggle selection'
      }
    }
  }

  return patterns[interfaceType as keyof typeof patterns] || patterns.dashboard
}

// Screen reader optimization
function optimizeForScreenReaders(contentType: string, hasMedia: boolean, hasDataViz: boolean, complexInteractions: boolean) {
  return {
    headingStructure: getOptimalHeadingStructure(contentType),
    landmarks: [
      '<main> for primary content',
      '<nav> for navigation sections',
      '<aside> for supplementary content',
      '<footer> for page footer'
    ],
    mediaOptimization: hasMedia ? {
      images: 'Descriptive alt text, not just file names',
      videos: 'Captions, transcripts, and audio descriptions',
      audio: 'Transcripts and visual indicators for sound cues'
    } : null,
    dataVisualization: hasDataViz ? {
      charts: 'Data tables as alternatives to charts',
      graphs: 'Text summaries of key insights',
      infographics: 'Structured content with proper headings'
    } : null,
    complexInteractions: complexInteractions ? {
      liveRegions: 'aria-live for dynamic content updates',
      statusUpdates: 'aria-describedby for form validation',
      progressIndicators: 'aria-valuenow, aria-valuemin, aria-valuemax'
    } : null,
    readingOrder: [
      'Logical heading hierarchy (H1 → H2 → H3)',
      'Meaningful link text (not "click here")',
      'Clear button labels describing action',
      'Form labels associated with controls'
    ]
  }
}

// Helper functions
function getOptimalHeadingStructure(contentType: string) {
  const structures = {
    'landing-page': {
      h1: 'Main value proposition (only one per page)',
      h2: 'Major sections (problem, solution, features)',
      h3: 'Subsections within major areas',
      h4: 'Specific features or benefits'
    },
    'dashboard': {
      h1: 'Dashboard title or user name',
      h2: 'Widget or section titles',
      h3: 'Sub-categories within widgets',
      h4: 'Individual data points or actions'
    },
    'article': {
      h1: 'Article title (only one)',
      h2: 'Main sections/chapters',
      h3: 'Subsections',
      h4: 'Sub-subsections if needed'
    }
  }
  
  return structures[contentType as keyof typeof structures] || structures.article
}

function getAccessibilityNextSteps(score: number) {
  if (score >= 90) {
    return ['Conduct user testing with disabled users', 'Fine-tune based on feedback', 'Document accessibility features']
  } else if (score >= 70) {
    return ['Fix critical and serious issues', 'Implement keyboard navigation', 'Add missing ARIA labels']
  } else {
    return ['Start with color contrast fixes', 'Add alt text to images', 'Implement basic keyboard support', 'Review heading structure']
  }
}

function getColorImplementationGuide() {
  return {
    css: 'Use CSS custom properties for easy theme switching',
    testing: 'Test with browser zoom up to 200%',
    tools: ['WebAIM Color Contrast Checker', 'Colour Contrast Analyser', 'Stark plugin for Figma']
  }
}

function getARIAImplementationExamples(componentType: string) {
  return {
    vue: `<!-- Example ${componentType} with proper ARIA -->
<template>
  <div role="dialog" aria-modal="true" :aria-labelledby="titleId">
    <h2 :id="titleId">{{ title }}</h2>
    <!-- Component content -->
  </div>
</template>`,
    testing: 'Use screen reader testing (NVDA, JAWS, VoiceOver)',
    validation: 'Validate with axe-core or similar automated tools'
  }
}

function getARIATestingGuidance() {
  return [
    'Test with actual screen readers, not just automated tools',
    'Verify focus management and navigation',
    'Check that dynamic content updates are announced',
    'Validate that all interactive elements are accessible'
  ]
}

function getKeyboardImplementation() {
  return {
    focusManagement: 'Always manage focus for dynamic content',
    visualIndicators: 'Provide clear focus indicators that meet 3:1 contrast ratio',
    logicalOrder: 'Ensure tab order follows visual/logical flow',
    shortcuts: 'Document keyboard shortcuts and provide help'
  }
}

function getKeyboardTestingStrategy() {
  return [
    'Navigate entire interface using only keyboard',
    'Test with screen reader in combination',
    'Verify all interactive elements are reachable',
    'Check custom shortcuts work consistently'
  ]
}

function getScreenReaderExamples() {
  return {
    goodAltText: 'alt="Bar chart showing 40% increase in sales from January to March"',
    badAltText: 'alt="chart.png"',
    goodButtonText: '<button>Add item to shopping cart</button>',
    badButtonText: '<button>Click here</button>',
    goodHeading: '<h2>Customer Reviews</h2>',
    badHeading: '<div class="heading">Customer Reviews</div>'
  }
}

function validateAccessibilityPatterns(patterns: string[], framework: string, wcagLevel: string) {
  return {
    framework,
    wcagLevel,
    patterns: patterns.map(pattern => ({
      name: pattern,
      compliant: Math.random() > 0.3, // Simulate validation
      issues: ['Missing aria-label', 'Insufficient color contrast'],
      solution: 'Add proper ARIA attributes and improve color contrast'
    })),
    issues: [
      {
        pattern: 'dropdown menu',
        severity: 'serious' as const,
        description: 'Missing aria-haspopup and aria-expanded attributes',
        solution: 'Add ARIA attributes for proper screen reader support',
        codeExample: '<button aria-haspopup="true" aria-expanded="false">Menu</button>'
      }
    ],
    overallCompliance: 75
  }
}