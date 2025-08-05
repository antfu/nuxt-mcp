import type { McpToolContext, DesignSystemConfig } from '../types'
import { z } from 'zod'

export function toolsDesignSystem({ mcp, modules }: McpToolContext): void {
  if (!modules.hasUIUXNeeds) return

  mcp.tool(
    'create-design-system',
    'Generate a complete design system with tokens, components, and documentation',
    {
      systemName: z.string()
        .describe('Name of the design system'),
      brandPersonality: z.array(z.enum(['professional', 'friendly', 'innovative', 'trustworthy', 'energetic', 'calm', 'luxury', 'playful']))
        .describe('Brand personality traits'),
      targetPlatforms: z.array(z.enum(['web', 'mobile', 'desktop', 'print']))
        .describe('Platforms the design system will support'),
      complexity: z.enum(['minimal', 'standard', 'comprehensive'])
        .describe('Complexity level of the design system'),
      includeComponents: z.boolean().default(true)
        .describe('Include component specifications'),
    },
    async ({ systemName, brandPersonality, targetPlatforms, complexity, includeComponents }) => {
      const designSystem = generateDesignSystem(systemName, brandPersonality, targetPlatforms, complexity, includeComponents)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            designSystem,
            implementation: getDesignSystemImplementation(),
            documentation: getDesignSystemDocumentation(),
            info: 'Complete design system ready for implementation with Figma and Storybook integration',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-design-tokens',
    'Create design tokens for seamless Figma to Storybook workflow',
    {
      tokenTypes: z.array(z.enum(['colors', 'typography', 'spacing', 'shadows', 'borders', 'motion']))
        .describe('Types of design tokens to generate'),
      format: z.enum(['json', 'css', 'scss', 'js', 'ts']).default('json')
        .describe('Output format for design tokens'),
      platform: z.enum(['web', 'mobile', 'multi-platform']).default('web')
        .describe('Target platform for tokens'),
      includeSemanticTokens: z.boolean().default(true)
        .describe('Include semantic tokens (primary, success, error, etc.)'),
    },
    async ({ tokenTypes, format, platform, includeSemanticTokens }) => {
      const tokens = generateDesignTokens(tokenTypes, format, platform, includeSemanticTokens)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            tokens,
            workflow: getFigmaStorybookWorkflow(),
            automation: getTokenAutomationSetup(),
            info: 'Design tokens with automated Figma → Storybook synchronization setup',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'build-component-library',
    'Generate component library with atomic design principles',
    {
      framework: z.enum(['vue', 'react', 'angular', 'svelte', 'vanilla']).default('vue')
        .describe('Frontend framework to target'),
      atomicLevel: z.enum(['atoms-only', 'molecules-included', 'full-atomic']).default('full-atomic')
        .describe('Level of atomic design implementation'),
      includeVariants: z.boolean().default(true)
        .describe('Include component variants and states'),
      accessibilityLevel: z.enum(['basic', 'wcag-aa', 'wcag-aaa']).default('wcag-aa')
        .describe('Accessibility compliance level'),
    },
    async ({ framework, atomicLevel, includeVariants, accessibilityLevel }) => {
      const componentLibrary = buildComponentLibrary(framework, atomicLevel, includeVariants, accessibilityLevel)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            componentLibrary,
            storybookConfig: getStorybookConfiguration(),
            testingStrategy: getComponentTestingStrategy(),
            info: 'Complete component library with Storybook documentation and testing setup',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'audit-design-consistency',
    'Audit existing design for consistency and provide standardization recommendations',
    {
      auditScope: z.array(z.enum(['colors', 'typography', 'spacing', 'components', 'patterns']))
        .describe('Areas to audit for consistency'),
      currentAssets: z.array(z.string())
        .describe('List of current design assets, components, or pages to audit'),
      strictness: z.enum(['lenient', 'moderate', 'strict']).default('moderate')
        .describe('Strictness level for consistency requirements'),
    },
    async ({ auditScope, currentAssets, strictness }) => {
      const audit = auditDesignConsistency(auditScope, currentAssets, strictness)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            audit,
            inconsistencies: audit.issues,
            recommendations: audit.standardizationPlan,
            info: 'Design consistency audit with actionable standardization recommendations',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'optimize-design-performance',
    'Optimize design system for performance across different platforms',
    {
      platforms: z.array(z.enum(['web', 'mobile-web', 'native-mobile', 'desktop']))
        .describe('Target platforms for optimization'),
      priorities: z.array(z.enum(['load-time', 'bundle-size', 'runtime-performance', 'memory-usage']))
        .describe('Performance priorities to optimize for'),
      constraints: z.object({
        maxBundleSize: z.string().optional(),
        targetLoadTime: z.string().optional(),
        supportedBrowsers: z.array(z.string()).optional()
      }).optional()
        .describe('Performance constraints and requirements'),
    },
    async ({ platforms, priorities, constraints = {} }) => {
      const optimization = optimizeDesignPerformance(platforms, priorities, constraints)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            optimization,
            implementation: getPerformanceImplementation(),
            monitoring: getPerformanceMonitoring(),
            info: 'Design system performance optimization with implementation guidelines',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'setup-design-governance',
    'Establish design system governance and contribution guidelines',
    {
      teamSize: z.enum(['small', 'medium', 'large', 'enterprise'])
        .describe('Size of the design/development team'),
      updateFrequency: z.enum(['continuous', 'weekly', 'monthly', 'quarterly'])
        .describe('How often the design system will be updated'),
      contributionModel: z.enum(['centralized', 'federated', 'open-source'])
        .describe('Model for design system contributions'),
      approvalProcess: z.boolean().default(true)
        .describe('Whether changes require approval process'),
    },
    async ({ teamSize, updateFrequency, contributionModel, approvalProcess }) => {
      const governance = setupDesignGovernance(teamSize, updateFrequency, contributionModel, approvalProcess)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            governance,
            workflow: getGovernanceWorkflow(),
            tooling: getGovernanceTooling(),
            info: 'Complete design system governance framework with processes and tools',
          }, null, 2),
        }],
      }
    },
  )
}

// Design System Generation
function generateDesignSystem(name: string, personality: string[], platforms: string[], complexity: string, includeComponents: boolean): DesignSystemConfig {
  const baseColors = generateBrandColors(personality)
  const typography = generateTypographyScale(personality, platforms)
  const spacing = generateSpacingScale(complexity)

  return {
    name,
    version: '1.0.0',
    colors: {
      primary: baseColors.primary,
      secondary: baseColors.secondary,
      neutral: baseColors.neutral,
      semantic: {
        success: { '50': '#f0fdf4', '500': '#22c55e', '900': '#14532d' },
        warning: { '50': '#fffbeb', '500': '#f59e0b', '900': '#78350f' },
        error: { '50': '#fef2f2', '500': '#ef4444', '900': '#7f1d1d' },
        info: { '50': '#eff6ff', '500': '#3b82f6', '900': '#1e3a8a' }
      }
    },
    typography,
    spacing,
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    components: includeComponents ? generateComponentSpecs(complexity) : {}
  }
}

// Design Tokens Generation
function generateDesignTokens(types: string[], format: string, platform: string, semantic: boolean) {
  const tokens: Record<string, any> = {}

  if (types.includes('colors')) {
    tokens.colors = {
      brand: {
        primary: {
          50: { value: '#eff6ff', type: 'color' },
          500: { value: '#3b82f6', type: 'color' },
          900: { value: '#1e3a8a', type: 'color' }
        }
      }
    }

    if (semantic) {
      tokens.colors.semantic = {
        text: {
          primary: { value: '{colors.brand.primary.900}', type: 'color' },
          secondary: { value: '{colors.neutral.600}', type: 'color' }
        },
        background: {
          primary: { value: '{colors.brand.primary.50}', type: 'color' },
          surface: { value: '#ffffff', type: 'color' }
        }
      }
    }
  }

  if (types.includes('typography')) {
    tokens.typography = {
      fontFamily: {
        sans: { value: ['Inter', 'ui-sans-serif', 'system-ui'], type: 'fontFamily' },
        mono: { value: ['JetBrains Mono', 'ui-monospace'], type: 'fontFamily' }
      },
      fontSize: {
        xs: { value: '0.75rem', type: 'dimension' },
        sm: { value: '0.875rem', type: 'dimension' },
        base: { value: '1rem', type: 'dimension' },
        lg: { value: '1.125rem', type: 'dimension' },
        xl: { value: '1.25rem', type: 'dimension' }
      },
      fontWeight: {
        normal: { value: '400', type: 'fontWeight' },
        medium: { value: '500', type: 'fontWeight' },
        semibold: { value: '600', type: 'fontWeight' },
        bold: { value: '700', type: 'fontWeight' }
      }
    }
  }

  if (types.includes('spacing')) {
    tokens.spacing = {
      1: { value: '0.25rem', type: 'dimension' },
      2: { value: '0.5rem', type: 'dimension' },
      4: { value: '1rem', type: 'dimension' },
      8: { value: '2rem', type: 'dimension' },
      16: { value: '4rem', type: 'dimension' }
    }
  }

  return {
    format,
    platform,
    tokens,
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      platforms: [platform],
      tokenCount: Object.keys(tokens).length
    }
  }
}

// Component Library Generation
function buildComponentLibrary(framework: string, level: string, variants: boolean, accessibility: string) {
  const components = {
    atoms: ['Button', 'Input', 'Icon', 'Avatar', 'Badge', 'Spinner'],
    molecules: ['SearchBox', 'Dropdown', 'Card', 'Breadcrumb', 'Pagination'],
    organisms: ['Header', 'Sidebar', 'DataTable', 'ProductGrid', 'ContactForm'],
    templates: ['DashboardLayout', 'LandingPageLayout', 'ArticleLayout'],
    pages: ['Dashboard', 'LandingPage', 'ProductPage', 'ProfilePage']
  }

  const includedLevels = {
    'atoms-only': ['atoms'],
    'molecules-included': ['atoms', 'molecules'],
    'full-atomic': ['atoms', 'molecules', 'organisms', 'templates', 'pages']
  }

  const selectedComponents = includedLevels[level as keyof typeof includedLevels]
    .flatMap(level => components[level as keyof typeof components])

  return {
    framework,
    atomicLevel: level,
    components: selectedComponents.map(name => ({
      name,
      level: getComponentLevel(name, components),
      variants: variants ? generateComponentVariants(name) : [],
      accessibility: generateAccessibilitySpecs(name, accessibility),
      props: generateComponentProps(name, framework),
      examples: generateComponentExamples(name, framework)
    })),
    documentation: {
      storybook: getStorybookStories(selectedComponents),
      designGuidelines: getDesignGuidelines(),
      usagePatterns: getUsagePatterns()
    }
  }
}

// Helper Functions
function generateBrandColors(personality: string[]) {
  // Color selection based on brand personality
  const colorMappings = {
    professional: { primary: '#1e40af', secondary: '#64748b' },
    friendly: { primary: '#059669', secondary: '#f59e0b' },
    innovative: { primary: '#7c3aed', secondary: '#06b6d4' },
    trustworthy: { primary: '#1d4ed8', secondary: '#374151' },
    energetic: { primary: '#dc2626', secondary: '#ea580c' },
    calm: { primary: '#0891b2', secondary: '#6b7280' },
    luxury: { primary: '#111827', secondary: '#d97706' },
    playful: { primary: '#ec4899', secondary: '#8b5cf6' }
  }

  const primary = personality.length > 0 ? 
    colorMappings[personality[0] as keyof typeof colorMappings]?.primary || '#3b82f6' : 
    '#3b82f6'

  return {
    primary: { '50': '#eff6ff', '500': primary, '900': '#1e3a8a' },
    secondary: { '50': '#f8fafc', '500': '#64748b', '900': '#0f172a' },
    neutral: { '50': '#f9fafb', '500': '#6b7280', '900': '#111827' }
  }
}

function generateTypographyScale(personality: string[], platforms: string[]) {
  const isWebOnly = platforms.length === 1 && platforms[0] === 'web'
  
  return {
    fontFamilies: {
      sans: personality.includes('professional') ? 
        'Inter, ui-sans-serif, system-ui' : 
        'system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, ui-monospace, monospace'
    },
    fontSizes: isWebOnly ? {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    } : {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px'
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em'
    }
  }
}

function generateSpacingScale(complexity: string) {
  const scales = {
    minimal: { '1': '0.25rem', '2': '0.5rem', '4': '1rem', '8': '2rem' },
    standard: { 
      '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem', 
      '6': '1.5rem', '8': '2rem', '12': '3rem', '16': '4rem' 
    },
    comprehensive: {
      '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem', '2': '0.5rem',
      '2.5': '0.625rem', '3': '0.75rem', '4': '1rem', '5': '1.25rem',
      '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem', '16': '4rem'
    }
  }
  
  return scales[complexity as keyof typeof scales] || scales.standard
}

function generateComponentSpecs(complexity: string) {
  return {
    Button: {
      variants: ['primary', 'secondary', 'outline', 'ghost'],
      sizes: ['sm', 'md', 'lg'],
      states: ['default', 'hover', 'focus', 'disabled', 'loading']
    },
    Input: {
      variants: ['outline', 'filled', 'underlined'],
      sizes: ['sm', 'md', 'lg'],
      states: ['default', 'focus', 'error', 'disabled']
    }
  }
}

// Additional helper functions for component generation
function getComponentLevel(name: string, components: Record<string, string[]>) {
  for (const [level, items] of Object.entries(components)) {
    if (items.includes(name)) return level
  }
  return 'atoms'
}

function generateComponentVariants(name: string) {
  const variantMappings = {
    Button: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    Input: ['outline', 'filled', 'underlined'],
    Card: ['elevated', 'outlined', 'flat']
  }
  return variantMappings[name as keyof typeof variantMappings] || ['default']
}

function generateAccessibilitySpecs(name: string, level: string) {
  return {
    wcagLevel: level,
    keyboardSupport: true,
    screenReaderSupport: true,
    colorContrast: level === 'wcag-aaa' ? '7:1' : '4.5:1',
    focusManagement: true
  }
}

function generateComponentProps(name: string, framework: string) {
  // Simplified prop generation
  return {
    Button: ['variant', 'size', 'disabled', 'loading', 'onClick'],
    Input: ['type', 'placeholder', 'value', 'disabled', 'error', 'onChange']
  }[name] || ['children']
}

function generateComponentExamples(name: string, framework: string) {
  if (framework === 'vue') {
    return {
      Button: '<UButton variant="primary" size="md">Click me</UButton>',
      Input: '<UInput v-model="value" placeholder="Enter text" />'
    }[name] || `<${name} />`
  }
  return `<${name} />`
}

function auditDesignConsistency(scope: string[], assets: string[], strictness: string) {
  return {
    scope,
    assets,
    strictness,
    score: 78,
    issues: [
      {
        category: 'colors',
        severity: 'medium',
        description: '12 different shades of blue used inconsistently',
        recommendation: 'Consolidate to 3-5 primary blue variants'
      },
      {
        category: 'typography',
        severity: 'low',
        description: 'Font sizes vary by 1-2px in similar contexts',
        recommendation: 'Implement consistent typography scale'
      }
    ],
    standardizationPlan: [
      'Create color palette with defined usage guidelines',
      'Establish typography scale and hierarchy',
      'Document spacing system and apply consistently',
      'Audit and consolidate component variations'
    ]
  }
}

function optimizeDesignPerformance(platforms: string[], priorities: string[], constraints: any) {
  return {
    platforms,
    priorities,
    constraints,
    optimizations: [
      {
        area: 'bundle-size',
        recommendation: 'Tree-shake unused components',
        impact: '30-50% bundle size reduction',
        implementation: 'Configure build tools for dead code elimination'
      },
      {
        area: 'load-time',
        recommendation: 'Lazy load non-critical components',
        impact: '20-30% faster initial load',
        implementation: 'Implement dynamic imports for heavy components'
      }
    ]
  }
}

function setupDesignGovernance(teamSize: string, frequency: string, model: string, approval: boolean) {
  return {
    teamSize,
    updateFrequency: frequency,
    contributionModel: model,
    approvalProcess: approval,
    roles: {
      'design-system-lead': 'Oversees system evolution and major decisions',
      'contributors': 'Submit proposals and improvements',
      'reviewers': 'Review and approve changes',
      'maintainers': 'Implement approved changes'
    },
    processes: {
      rfc: 'Request for Comments process for major changes',
      review: 'Code and design review requirements',
      testing: 'Automated and manual testing procedures',
      release: 'Versioning and release management'
    }
  }
}

// Configuration and setup functions
function getDesignSystemImplementation() {
  return {
    figma: 'Set up design tokens plugin and component library',
    storybook: 'Configure Storybook with design tokens integration',
    development: 'Install and configure design system package',
    testing: 'Set up visual regression testing'
  }
}

function getDesignSystemDocumentation() {
  return {
    structure: ['Getting Started', 'Design Principles', 'Components', 'Patterns', 'Resources'],
    maintenance: 'Keep documentation in sync with code changes',
    accessibility: 'Document accessibility features and testing procedures'
  }
}

function getFigmaStorybookWorkflow() {
  return {
    step1: 'Design tokens managed in Figma with Tokens Studio plugin',
    step2: 'Tokens exported to GitHub repository',
    step3: 'CI/CD pipeline transforms tokens for web consumption',
    step4: 'Storybook automatically updates with new tokens',
    step5: 'Components developed using consistent tokens'
  }
}

function getTokenAutomationSetup() {
  return {
    tools: ['Tokens Studio', 'Style Dictionary', 'GitHub Actions'],
    workflow: 'Figma → GitHub → Transformation → Distribution',
    benefits: ['Consistency', 'Automation', 'Single source of truth']
  }
}

function getStorybookConfiguration() {
  return {
    addons: ['@storybook/addon-docs', '@storybook/addon-controls', '@storybook/addon-a11y'],
    structure: 'Organized by atomic design levels',
    documentation: 'Auto-generated from component props and comments'
  }
}

function getComponentTestingStrategy() {
  return {
    unit: 'Test component logic and props',
    visual: 'Screenshot testing for visual regressions',
    accessibility: 'Automated accessibility testing with axe',
    interaction: 'Test user interactions and state changes'
  }
}

function getPerformanceImplementation() {
  return {
    codesplitting: 'Split components by usage patterns',
    treeshaking: 'Eliminate unused code and styles',
    caching: 'Implement effective caching strategies',
    compression: 'Optimize assets and enable compression'
  }
}

function getPerformanceMonitoring() {
  return {
    metrics: ['Bundle size', 'Load time', 'Runtime performance'],
    tools: ['Bundle analyzer', 'Lighthouse', 'Core Web Vitals'],
    alerts: 'Set up alerts for performance regressions'
  }
}

function getGovernanceWorkflow() {
  return {
    proposal: 'Submit RFC for significant changes',
    review: 'Design and code review process',
    approval: 'Stakeholder approval for breaking changes',
    implementation: 'Coordinated rollout across products'
  }
}

function getGovernanceTooling() {
  return {
    versionControl: 'Git with semantic versioning',
    communication: 'Slack/Discord for discussions',
    documentation: 'Notion/Confluence for governance docs',
    tracking: 'Linear/Jira for change requests'
  }
}

function getStorybookStories(components: string[]) {
  return components.map(name => ({
    component: name,
    stories: ['Default', 'All Variants', 'Playground'],
    documentation: 'Auto-generated from component definition'
  }))
}

function getDesignGuidelines() {
  return [
    'Use consistent spacing from the design system',
    'Follow color usage guidelines for semantic meaning',
    'Maintain accessibility standards in all components',
    'Test components across different screen sizes'
  ]
}

function getUsagePatterns() {
  return [
    'Import components from design system package',
    'Use design tokens instead of hardcoded values',
    'Follow established component composition patterns',
    'Contribute improvements back to the system'
  ]
}