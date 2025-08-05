import type { Nuxt } from '@nuxt/schema'
import type { Nitro } from 'nitropack'
import type { Unimport } from 'unimport'
import type { ViteDevServer } from 'vite'
import type { McpServer } from 'vite-plugin-mcp'

export interface McpToolContext {
  nuxt: Nuxt
  mcp: McpServer
  vite: ViteDevServer
  nitro: Promise<Nitro>
  unimport: Promise<Unimport>
  modules: {
    hasNuxtUI: boolean
    hasNuxtAuth: boolean
    hasDrizzle: boolean
    hasUIUXNeeds: boolean
  }
}

export interface NuxtUITheme {
  colors?: Record<string, any>
  components?: Record<string, any>
  tokens?: Record<string, any>
}

export interface AuthConfig {
  providers?: string[]
  session?: {
    name?: string
    password?: string
    cookie?: Record<string, any>
  }
  pages?: {
    login?: string
    register?: string
    error?: string
  }
}

export interface DatabaseSchema {
  tables: Array<{
    name: string
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      primaryKey: boolean
    }>
    relations?: Array<{
      type: 'one-to-one' | 'one-to-many' | 'many-to-many'
      table: string
      column: string
    }>
  }>
}

export interface UIUXAuditResult {
  score: number
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA'
    issues: Array<{
      severity: 'critical' | 'serious' | 'moderate' | 'minor'
      rule: string
      description: string
      element?: string
      suggestion: string
    }>
  }
  visualHierarchy: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  typography: {
    score: number
    readability: number
    hierarchy: boolean
    issues: string[]
  }
  colorPalette: {
    score: number
    contrastRatio: number
    harmony: boolean
    accessibility: boolean
    psychology: string[]
  }
  userExperience: {
    score: number
    usability: number
    mobileOptimized: boolean
    loadingTime: number
    issues: string[]
  }
}

export interface DesignSystemConfig {
  name: string
  version: string
  colors: {
    primary: Record<string, string>
    secondary: Record<string, string>
    neutral: Record<string, string>
    semantic: Record<string, Record<string, string>>
  }
  typography: {
    fontFamilies: Record<string, string>
    fontSizes: Record<string, string>
    fontWeights: Record<string, number>
    lineHeights: Record<string, number>
    letterSpacing: Record<string, string>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  breakpoints: Record<string, string>
  components: Record<string, any>
}

export interface ColorPalette {
  name: string
  primary: string
  colors: Array<{
    name: string
    hex: string
    hsl: string
    rgb: string
    usage: string
    accessibility: {
      contrastWhite: number
      contrastBlack: number
      wcagAA: boolean
      wcagAAA: boolean
    }
  }>
  harmony: {
    type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'
    description: string
  }
  psychology: {
    emotions: string[]
    associations: string[]
    culturalMeaning: string[]
  }
}

export interface AccessibilityAudit {
  wcagLevel: 'A' | 'AA' | 'AAA'
  score: number
  totalChecks: number
  passedChecks: number
  issues: Array<{
    criterion: string
    level: 'A' | 'AA' | 'AAA'
    severity: 'critical' | 'serious' | 'moderate' | 'minor'
    description: string
    impact: string
    solution: string
    examples: string[]
  }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: 'perceivable' | 'operable' | 'understandable' | 'robust'
    action: string
    benefit: string
    implementation: string
  }>
}
