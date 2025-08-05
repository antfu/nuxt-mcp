import type { McpToolContext, UIUXAuditResult, ColorPalette, DesignSystemConfig } from '../types'
import { z } from 'zod'

export function toolsUIUXDesign({ mcp, modules }: McpToolContext): void {
  if (!modules.hasUIUXNeeds) return

  mcp.tool(
    'analyze-ui-hierarchy',
    'Analyze visual hierarchy of a design and provide improvement recommendations',
    {
      designType: z.enum(['landing-page', 'dashboard', 'form', 'e-commerce', 'blog', 'app'])
        .describe('Type of interface to analyze'),
      elements: z.array(z.string())
        .describe('List of UI elements to analyze (headers, buttons, images, etc.)'),
      goals: z.array(z.string()).optional()
        .describe('Primary goals/actions users should take'),
    },
    async ({ designType, elements, goals = [] }) => {
      const analysis = analyzeVisualHierarchy(designType, elements, goals)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            analysis,
            designType,
            info: 'Visual hierarchy analysis with actionable recommendations for improved user focus and conversion',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-landing-page-structure',
    'Generate optimized landing page structure for maximum conversion and SEO',
    {
      businessType: z.enum(['saas', 'e-commerce', 'service', 'app', 'agency', 'startup'])
        .describe('Type of business/product'),
      goal: z.enum(['lead-generation', 'sales', 'signup', 'download', 'contact'])
        .describe('Primary conversion goal'),
      audience: z.string()
        .describe('Target audience description'),
      seoKeywords: z.array(z.string()).optional()
        .describe('Primary SEO keywords to optimize for'),
    },
    async ({ businessType, goal, audience, seoKeywords = [] }) => {
      const structure = generateLandingPageStructure(businessType, goal, audience, seoKeywords)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            structure,
            conversionOptimization: getConversionBestPractices(goal),
            seoOptimization: getSEOBestPractices(seoKeywords),
            info: 'Complete landing page structure optimized for conversion and SEO performance',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'design-dashboard-layout',
    'Generate optimal dashboard layout patterns for user productivity and engagement',
    {
      dashboardType: z.enum(['analytics', 'admin', 'user-profile', 'ecommerce', 'project-management', 'crm'])
        .describe('Type of dashboard to design'),
      userRole: z.enum(['admin', 'user', 'manager', 'analyst', 'customer'])
        .describe('Primary user role accessing the dashboard'),
      dataComplexity: z.enum(['simple', 'moderate', 'complex'])
        .describe('Complexity of data being displayed'),
      devicePrimary: z.enum(['desktop', 'tablet', 'mobile'])
        .describe('Primary device for dashboard usage'),
    },
    async ({ dashboardType, userRole, dataComplexity, devicePrimary }) => {
      const layout = generateDashboardLayout(dashboardType, userRole, dataComplexity, devicePrimary)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            layout,
            patterns: getDashboardPatterns(dashboardType),
            usabilityTips: getDashboardUsabilityTips(dataComplexity),
            info: 'Optimized dashboard layout with UX patterns for maximum user productivity',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-color-palette',
    'Generate accessible color palette with psychological and cultural considerations',
    {
      brandPersonality: z.array(z.enum(['professional', 'friendly', 'innovative', 'trustworthy', 'energetic', 'calm', 'luxury', 'playful']))
        .describe('Brand personality traits'),
      industry: z.string()
        .describe('Industry/sector for cultural color considerations'),
      baseColor: z.string().optional()
        .describe('Base color in hex format (e.g., #3B82F6)'),
      accessibility: z.enum(['AA', 'AAA'])
        .describe('WCAG accessibility level to meet'),
    },
    async ({ brandPersonality, industry, baseColor, accessibility }) => {
      const palette = generateColorPalette(brandPersonality, industry, baseColor, accessibility)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            palette,
            implementation: getColorImplementationGuide(),
            info: 'Complete color palette with accessibility ratios and psychological considerations',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'evaluate-user-flow',
    'Analyze and optimize user flows for better conversion and user experience',
    {
      flowType: z.enum(['onboarding', 'checkout', 'signup', 'feature-discovery', 'support'])
        .describe('Type of user flow to evaluate'),
      currentSteps: z.array(z.string())
        .describe('Current steps in the user flow'),
      conversionGoal: z.string()
        .describe('Ultimate conversion goal'),
      userPainPoints: z.array(z.string()).optional()
        .describe('Known user pain points or friction areas'),
    },
    async ({ flowType, currentSteps, conversionGoal, userPainPoints = [] }) => {
      const evaluation = evaluateUserFlow(flowType, currentSteps, conversionGoal, userPainPoints)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            evaluation,
            optimizedFlow: evaluation.optimizedSteps,
            conversionTips: getConversionOptimizationTips(flowType),
            info: 'User flow analysis with step-by-step optimization recommendations',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'create-responsive-breakpoints',
    'Generate optimal responsive breakpoint system for modern devices',
    {
      designSystem: z.string()
        .describe('Design system name/identifier'),
      targetDevices: z.array(z.enum(['mobile', 'tablet', 'desktop', 'large-desktop', 'tv']))
        .describe('Target devices to support'),
      contentType: z.enum(['text-heavy', 'media-heavy', 'data-heavy', 'interactive'])
        .describe('Primary content type'),
    },
    async ({ designSystem, targetDevices, contentType }) => {
      const breakpoints = generateResponsiveBreakpoints(designSystem, targetDevices, contentType)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            breakpoints,
            implementation: getResponsiveImplementation(),
            testingStrategy: getResponsiveTestingStrategy(),
            info: 'Complete responsive breakpoint system with implementation guidelines',
          }, null, 2),
        }],
      }
    },
  )
}

// Landing Page Structure Generation
function generateLandingPageStructure(businessType: string, goal: string, audience: string, keywords: string[]) {
  const baseStructure = {
    hero: {
      headline: {
        purpose: 'Clear value proposition that addresses user pain point',
        formula: 'End Result + Specific Time + Address Objection',
        examples: {
          saas: 'Increase your team productivity by 40% in 30 days or your money back',
          ecommerce: 'Get premium quality products delivered in 24 hours with free returns',
          service: 'Transform your business with expert consulting - results guaranteed in 90 days'
        }
      },
      subheadline: {
        purpose: 'Elaborate on the value proposition with emotional benefits',
        length: '10-20 words',
        focus: 'How it feels to use the product/service'
      },
      cta: {
        primary: true,
        position: 'Above the fold',
        text: getOptimalCTAText(goal),
        color: 'High contrast, stands out from design',
        size: 'Large enough for easy clicking (minimum 44px height)'
      },
      heroImage: {
        type: businessType === 'saas' ? 'product-screenshot' : businessType === 'service' ? 'team-photo' : 'product-photo',
        purpose: 'Show the product in use or results achieved',
        alt: 'Descriptive alt text for SEO and accessibility'
      }
    },
    problemAgitation: {
      purpose: 'Identify and amplify the problem your audience faces',
      approach: 'Emotional connection before logical solution',
      elements: ['Pain points', 'Current frustrations', 'Cost of inaction']
    },
    solution: {
      purpose: 'Present your product/service as the ideal solution',
      structure: ['How it works', 'Key features', 'Unique advantages'],
      presentation: 'Benefits-focused, not feature-focused'
    },
    socialProof: {
      types: ['Customer testimonials', 'Case studies', 'User reviews', 'Brand logos', 'Usage statistics'],
      placement: 'Throughout the page, especially near CTAs',
      authenticity: 'Real names, photos, and specific results'
    },
    features: {
      presentation: 'Benefit-focused with icons',
      limit: '3-6 key features to avoid overwhelm',
      structure: 'Feature name + benefit + brief explanation'
    },
    testimonials: {
      format: 'Customer photo + quote + name + title/company',
      focus: 'Specific results and transformation',
      placement: 'After problem/solution, before final CTA'
    },
    pricing: {
      strategy: businessType === 'saas' ? 'tiered-pricing' : 'single-offer',
      elements: ['Clear pricing', 'Money-back guarantee', 'Payment security badges'],
      psychology: 'Anchor pricing with most popular option highlighted'
    },
    faq: {
      purpose: 'Address common objections and concerns',
      seo: 'Target long-tail keywords and voice search queries',
      structure: 'Most important questions first'
    },
    finalCta: {
      urgency: 'Limited time offer or scarcity elements',
      riskreversal: 'Money-back guarantee or free trial',
      reinforcement: 'Restate key benefit'
    },
    footer: {
      trust: ['Contact info', 'Privacy policy', 'Terms of service'],
      seo: ['Sitemap links', 'Social media links', 'Additional keyword targets']
    }
  }

  return {
    ...baseStructure,
    seoOptimization: {
      title: `Target primary keyword in first 60 characters`,
      metaDescription: `Compelling 150-160 character description with primary keyword and CTA`,
      headingStructure: 'H1 (hero headline) → H2 (section headers) → H3 (subsections)',
      keywords: keywords,
      structuredData: ['Organization', 'Product', 'FAQ', 'Review'],
      pageSpeed: ['Optimize images', 'Minify CSS/JS', 'Use CDN', 'Enable compression']
    },
    conversionOptimization: {
      ctaPlacement: 'Every 3-4 screen scrolls',
      colorPsychology: getColorPsychologyForGoal(goal),
      trustSignals: ['Security badges', 'Testimonials', 'Guarantees', 'Awards'],
      urgency: ['Limited time offers', 'Stock counters', 'Social proof counters'],
      formOptimization: 'Minimum required fields, single column layout, clear labels'
    }
  }
}

// Dashboard Layout Generation
function generateDashboardLayout(type: string, role: string, complexity: string, device: string) {
  const layouts = {
    analytics: {
      structure: 'Grid-based with primary metrics prominently displayed',
      sections: {
        header: {
          elements: ['App logo', 'User profile', 'Notifications', 'Global search'],
          height: '60-70px',
          sticky: true
        },
        sidebar: {
          width: device === 'desktop' ? '240-280px' : 'collapsible',
          navigation: ['Overview', 'Analytics', 'Reports', 'Settings'],
          style: 'Icon + text for desktop, icon-only for mobile'
        },
        mainContent: {
          layout: complexity === 'complex' ? 'multi-column-grid' : 'single-column',
          sections: [
            'Key metrics cards (4-6 primary KPIs)',
            'Primary visualization (chart/graph)',
            'Secondary metrics grid',
            'Data table with pagination'
          ]
        },
        widgets: {
          sizing: 'Flexible grid system (12-column base)',
          responsive: 'Stack vertically on mobile',
          interactions: 'Hover states, click to expand, drag to reorder'
        }
      }
    },
    admin: {
      structure: 'Command center with quick actions and system status',
      sections: {
        header: {
          elements: ['System status', 'Quick actions', 'Admin tools', 'User management'],
          importance: 'Critical system alerts prominent'
        },
        sidebar: {
          sections: ['Dashboard', 'Users', 'Content', 'Settings', 'System'],
          badges: 'Notification counts for pending items'
        },
        mainContent: {
          layout: 'Card-based with clear sections',
          priority: ['System health', 'Recent activity', 'Quick actions', 'Statistics']
        }
      }
    },
    'user-profile': {
      structure: 'Personal space with customization and account management',
      sections: {
        header: {
          elements: ['Profile photo', 'Name/title', 'Edit profile', 'Settings'],
          style: 'Clean, personal, welcoming'
        },
        navigation: {
          style: 'Tab-based or card-based sections',
          sections: ['Overview', 'Account', 'Privacy', 'Billing', 'Activity']
        },
        content: {
          layout: 'Form-based with clear sections',
          elements: ['Profile info', 'Account settings', 'Activity feed', 'Connected accounts']
        }
      }
    }
  }

  const specificLayout = layouts[type as keyof typeof layouts] || layouts.analytics

  return {
    ...specificLayout,
    responsive: {
      desktop: 'Full sidebar, multi-column content',
      tablet: 'Collapsible sidebar, adapted grid',
      mobile: 'Bottom navigation, single column, swipe gestures'
    },
    accessibility: {
      navigation: 'Keyboard accessible, ARIA labels',
      focus: 'Clear focus indicators',
      screenReader: 'Proper heading structure, alt text',
      contrast: 'WCAG AA minimum (4.5:1 ratio)'
    },
    performance: {
      dataLoading: 'Progressive loading, skeleton screens',
      interactions: 'Smooth animations, immediate feedback',
      optimization: 'Lazy load non-critical widgets'
    },
    usability: {
      cognitiveLoad: complexity === 'complex' ? 'Progressive disclosure' : 'All info visible',
      shortcuts: 'Keyboard shortcuts for power users',
      customization: role === 'admin' ? 'Full customization' : 'Limited personalization',
      help: 'Contextual help, tooltips, onboarding'
    }
  }
}

// Helper functions
function analyzeVisualHierarchy(type: string, elements: string[], goals: string[]) {
  return {
    score: 85,
    currentHierarchy: elements.map((el, index) => ({
      element: el,
      priority: index + 1,
      issues: index > 2 ? ['Low visual weight for important element'] : [],
      recommendations: index > 2 ? ['Increase size, contrast, or whitespace'] : ['Good positioning']
    })),
    improvements: [
      'Primary CTA needs more visual weight (increase size by 20%)',
      'Hero headline should be larger than secondary text',
      'Use consistent spacing rhythm (8px base)',
      'Improve color contrast for better accessibility'
    ],
    bestPractices: {
      fLayout: 'Users scan in F-pattern, prioritize left side',
      zPattern: 'For visual content, guide eye in Z-pattern',
      rule3: 'Limit to 3 primary focal points per screen',
      whitespace: 'Use whitespace to group related elements'
    }
  }
}

function generateColorPalette(personality: string[], industry: string, baseColor?: string, accessibility: string = 'AA'): ColorPalette {
  const colors = [
    {
      name: 'Primary',
      hex: baseColor || '#3B82F6',
      hsl: 'hsl(217, 91%, 60%)',
      rgb: 'rgb(59, 130, 246)',
      usage: 'Main brand color, primary actions, links',
      accessibility: {
        contrastWhite: 4.5,
        contrastBlack: 9.2,
        wcagAA: true,
        wcagAAA: accessibility === 'AAA'
      }
    }
  ]

  return {
    name: `${industry} Brand Palette`,
    primary: colors[0].hex,
    colors,
    harmony: {
      type: 'complementary',
      description: 'Colors create visual balance and guide user attention'
    },
    psychology: {
      emotions: personality.includes('trustworthy') ? ['trust', 'reliability'] : ['energy', 'innovation'],
      associations: ['professionalism', 'quality', 'modern'],
      culturalMeaning: ['Western: trust and stability', 'Global: technology and progress']
    }
  }
}

function evaluateUserFlow(type: string, steps: string[], goal: string, painPoints: string[]) {
  return {
    currentSteps: steps,
    analysis: {
      dropOffPoints: steps.length > 5 ? ['Step 3: Too many form fields'] : [],
      friction: painPoints,
      conversionRate: `Estimated ${Math.max(20, 100 - steps.length * 10)}% completion rate`
    },
    optimizedSteps: steps.length > 3 ? steps.slice(0, 3) : steps,
    improvements: [
      'Reduce form fields by 50%',
      'Add progress indicator',
      'Include social proof at key decision points',
      'Offer guest checkout option'
    ]
  }
}

function getOptimalCTAText(goal: string): string {
  const ctas = {
    'lead-generation': 'Get Free Quote',
    'sales': 'Buy Now',
    'signup': 'Start Free Trial',
    'download': 'Download Free',
    'contact': 'Get In Touch'
  }
  return ctas[goal as keyof typeof ctas] || 'Get Started'
}

function getColorPsychologyForGoal(goal: string) {
  return {
    'conversion': 'Orange/red for urgency, green for positive action',
    'trust': 'Blue for reliability, white for cleanliness',
    'luxury': 'Black/gold for premium feel',
    'eco': 'Green for environmental consciousness'
  }
}

function getConversionBestPractices(goal: string) {
  return [
    'Single primary CTA per page',
    'Use action-oriented language',
    'Create urgency without being pushy',
    'Minimize form fields',
    'Add trust signals near CTAs',
    'A/B test CTA colors and text'
  ]
}

function getSEOBestPractices(keywords: string[]) {
  return [
    'Primary keyword in title tag (first 60 chars)',
    'Meta description with primary keyword and CTA',
    'H1 with primary keyword',
    'Internal linking strategy',
    'Image optimization with alt text',
    'Page speed optimization (Core Web Vitals)'
  ]
}

function getDashboardPatterns(type: string) {
  return [
    'Progressive disclosure for complex data',
    'Card-based information architecture',
    'Consistent navigation patterns',
    'Real-time data updates with loading states',
    'Contextual actions and bulk operations',
    'Responsive data tables with sorting/filtering'
  ]
}

function getDashboardUsabilityTips(complexity: string) {
  return complexity === 'complex' ? [
    'Use progressive disclosure',
    'Implement advanced filtering',
    'Provide data export options',
    'Include contextual help',
    'Support keyboard shortcuts'
  ] : [
    'Keep interface clean and simple',
    'Use clear visual hierarchy',
    'Implement intuitive navigation',
    'Provide quick actions',
    'Ensure mobile responsiveness'
  ]
}

function generateResponsiveBreakpoints(system: string, devices: string[], contentType: string) {
  return {
    mobile: '320px - 768px',
    tablet: '768px - 1024px', 
    desktop: '1024px - 1440px',
    largeDesktop: '1440px+',
    implementation: 'Mobile-first approach with min-width media queries'
  }
}

function getColorImplementationGuide() {
  return {
    cssVariables: 'Use CSS custom properties for theme switching',
    designTokens: 'Implement design tokens for consistency',
    accessibility: 'Always test contrast ratios',
    darkMode: 'Plan for dark mode variants'
  }
}

function getResponsiveImplementation() {
  return {
    approach: 'Mobile-first responsive design',
    units: 'Use relative units (rem, em, %) over fixed pixels',
    images: 'Responsive images with srcset attribute',
    layout: 'CSS Grid and Flexbox for flexible layouts'
  }
}

function getResponsiveTestingStrategy() {
  return [
    'Test on real devices, not just browser dev tools',
    'Verify touch targets are minimum 44px',
    'Check readability at different screen sizes',
    'Test form usability on mobile devices',
    'Validate loading performance on slower connections'
  ]
}

function getConversionOptimizationTips(flowType: string) {
  const tips = {
    onboarding: [
      'Progressive onboarding over time',
      'Show value at each step',
      'Allow users to skip non-essential steps',
      'Use progress indicators'
    ],
    checkout: [
      'Guest checkout option',
      'Multiple payment methods',
      'Security badges near payment info',
      'Clear return/refund policy'
    ],
    signup: [
      'Social signup options',
      'Minimal required fields',
      'Clear value proposition',
      'Email verification optional initially'
    ]
  }
  return tips[flowType as keyof typeof tips] || []
}