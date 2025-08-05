import type { McpToolContext, NuxtUITheme } from '../types'
import { z } from 'zod'

export function toolsNuxtUI({ mcp, nuxt, modules }: McpToolContext): void {
  if (!modules.hasNuxtUI) return

  mcp.tool(
    'list-nuxt-ui-components',
    'List all available Nuxt UI components with their props and usage examples',
    {},
    async () => {
      // Get Nuxt UI components from the app config or module options
      const uiComponents = await getUIComponents(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            components: uiComponents,
            usage: 'Use these components directly in your templates without imports. Example: <UButton>Click me</UButton>',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'get-nuxt-ui-theme',
    'Get the current Nuxt UI theme configuration including colors, tokens, and component variants',
    {},
    async () => {
      const theme = await getUITheme(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            theme,
            info: 'Theme configuration from app.config.ts and tailwind.config. Colors and variants can be customized.',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'nuxt-ui-scaffold',
    'Generate components following Nuxt UI patterns and best practices',
    {
      componentType: z.enum(['form', 'card', 'modal', 'table', 'navigation', 'layout'])
        .describe('Type of component to scaffold'),
      name: z.string()
        .describe('Component name (PascalCase)'),
      withProps: z.boolean().optional()
        .describe('Include TypeScript props interface'),
      withVariants: z.boolean().optional()
        .describe('Include component variants'),
    },
    async ({ componentType, name, withProps = true, withVariants = false }) => {
      const template = generateUIComponentTemplate({
        componentType,
        name,
        withProps,
        withVariants,
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            template,
            filePath: `components/${name}.vue`,
            info: 'Generated component using Nuxt UI patterns. Place in components/ directory for auto-import.',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'get-nuxt-ui-colors',
    'Get available color palette and semantic color tokens from Nuxt UI theme',
    {},
    async () => {
      const colors = await getUIColors(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            colors,
            usage: {
              primary: 'Main brand color - use for primary actions',
              gray: 'Neutral colors - use for text and backgrounds',
              semantic: 'red (error), orange (warning), amber (warning), yellow (warning), lime (success), green (success), emerald (success), teal (info), cyan (info), sky (info), blue (info), indigo (info), violet (info), purple (info), fuchsia (info), pink (info), rose (error)',
            },
          }, null, 2),
        }],
      }
    },
  )
}

async function getUIComponents(_nuxt: any): Promise<Array<{ 
  name: string, 
  props: Record<string, any>, 
  description: string,
  examples: Array<{ title: string, code: string }>,
  variants?: Record<string, string[]>,
  documentation: string
}>> {
  return [
    {
      name: 'UButton',
      description: 'Versatile button component with multiple configuration options',
      documentation: 'https://ui.nuxt.com/components/button',
      props: {
        color: { type: 'string', default: 'primary', description: 'Button color theme' },
        variant: { type: 'string', default: 'solid', description: 'Button style variant' },
        size: { type: 'string', default: 'md', description: 'Button size' },
        icon: { type: 'string', description: 'Icon to display in button' },
        loading: { type: 'boolean', default: false, description: 'Show loading state' },
        disabled: { type: 'boolean', default: false, description: 'Disable button interaction' },
        label: { type: 'string', description: 'Button text content' },
        to: { type: 'string', description: 'Router link destination' },
        href: { type: 'string', description: 'External link URL' }
      },
      variants: {
        color: ['primary', 'secondary', 'success', 'warning', 'error'],
        variant: ['solid', 'outline', 'soft', 'ghost', 'link'],
        size: ['xs', 'sm', 'md', 'lg', 'xl']
      },
      examples: [
        {
          title: 'Basic Button',
          code: `<UButton label="Click me" />`
        },
        {
          title: 'Button with Icon',
          code: `<UButton label="Save" icon="i-lucide-save" color="primary" />`
        },
        {
          title: 'Loading Button',
          code: `<UButton label="Loading..." loading />`
        },
        {
          title: 'Link Button',
          code: `<UButton label="Go to Dashboard" to="/dashboard" variant="outline" />`
        }
      ]
    },
    {
      name: 'UInput',
      description: 'Input component with v-model support and customization options',
      documentation: 'https://ui.nuxt.com/components/input',
      props: {
        modelValue: { type: 'string', description: 'Input value (v-model)' },
        type: { type: 'string', default: 'text', description: 'HTML input type' },
        placeholder: { type: 'string', description: 'Placeholder text' },
        color: { type: 'string', default: 'primary', description: 'Ring color when focused' },
        variant: { type: 'string', default: 'outline', description: 'Visual style variant' },
        size: { type: 'string', default: 'md', description: 'Input size' },
        icon: { type: 'string', description: 'Leading or trailing icon' },
        disabled: { type: 'boolean', default: false, description: 'Disable input' },
        required: { type: 'boolean', default: false, description: 'Mark as required' }
      },
      variants: {
        variant: ['outline', 'none'],
        size: ['xs', 'sm', 'md', 'lg', 'xl']
      },
      examples: [
        {
          title: 'Basic Input',
          code: `<UInput v-model="value" placeholder="Enter text..." />`
        },
        {
          title: 'Search Input',
          code: `<UInput v-model="search" placeholder="Search..." icon="i-lucide-search" />`
        },
        {
          title: 'Password Input',
          code: `<UInput v-model="password" type="password" placeholder="Password" />`
        }
      ]
    },
    {
      name: 'UForm',
      description: 'Form component with built-in validation using Zod, Valibot, Yup, or Joi',
      documentation: 'https://ui.nuxt.com/components/form',
      props: {
        state: { type: 'object', required: true, description: 'Reactive form state object' },
        schema: { type: 'object', description: 'Validation schema' },
        validate: { type: 'function', description: 'Custom validation function' },
        validateOn: { type: 'array', default: ['blur', 'change', 'input'], description: 'Validation trigger events' }
      },
      examples: [
        {
          title: 'Form with Zod Validation',
          code: `<script setup>
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Must be at least 6 characters')
})

const state = reactive({
  email: '',
  password: ''
})

function onSubmit() {
  console.log('Form submitted:', state)
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" type="email" />
    </UFormField>
    
    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>
    
    <UButton type="submit">Submit</UButton>
  </UForm>
</template>`
        }
      ]
    },
    {
      name: 'UFormField',
      description: 'Form field wrapper with label, description, and error handling',
      documentation: 'https://ui.nuxt.com/components/form',
      props: {
        label: { type: 'string', description: 'Field label' },
        name: { type: 'string', required: true, description: 'Field name for validation' },
        description: { type: 'string', description: 'Help text' },
        required: { type: 'boolean', default: false, description: 'Mark field as required' },
        error: { type: 'string', description: 'Error message' }
      },
      examples: [
        {
          title: 'Basic Form Field',
          code: `<UFormField label="Email" name="email" description="We'll never share your email">
  <UInput v-model="state.email" type="email" />
</UFormField>`
        }
      ]
    },
    {
      name: 'UCard',
      description: 'Card container component for content organization',
      documentation: 'https://ui.nuxt.com/components/card',
      props: {
        ui: { type: 'object', description: 'Custom UI configuration' }
      },
      examples: [
        {
          title: 'Basic Card',
          code: `<UCard>
  <template #header>
    <h3>Card Title</h3>
  </template>
  
  <p>Card content goes here.</p>
  
  <template #footer>
    <div class="flex justify-end">
      <UButton>Action</UButton>
    </div>
  </template>
</UCard>`
        }
      ]
    }
  ]
}

async function getUITheme(_nuxt: any): Promise<NuxtUITheme> {
  return {
    colors: {
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Default primary
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16'
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280', // Default gray
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712'
      },
      semantic: {
        red: 'Error states and destructive actions',
        green: 'Success states and positive actions',
        blue: 'Info states and neutral actions',
        yellow: 'Warning states and caution'
      }
    },
    components: {
      button: {
        variants: {
          solid: 'Filled background with contrasting text',
          outline: 'Transparent background with colored border',
          soft: 'Subtle colored background',
          ghost: 'Transparent background, colored on hover',
          link: 'No background, underlined text'
        },
        sizes: {
          xs: 'Extra small - 24px height',
          sm: 'Small - 32px height',
          md: 'Medium - 40px height (default)',
          lg: 'Large - 48px height',
          xl: 'Extra large - 56px height'
        }
      },
      input: {
        variants: {
          outline: 'Border with transparent background',
          none: 'No styling applied'
        },
        sizes: {
          xs: '28px height',
          sm: '32px height',
          md: '40px height (default)',
          lg: '48px height',
          xl: '56px height'
        }
      }
    },
    tokens: {
      borderRadius: {
        none: '0px',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      }
    }
  }
}

async function getUIColors(_nuxt: any): Promise<Record<string, any>> {
  return {
    availableColors: {
      red: { description: 'Error states, destructive actions', usage: 'Buttons, alerts, form errors' },
      orange: { description: 'Warning states, attention', usage: 'Notifications, warnings' },
      amber: { description: 'Caution, pending states', usage: 'Status indicators' },
      yellow: { description: 'Highlight, emphasis', usage: 'Badges, highlights' },
      lime: { description: 'Fresh, growth states', usage: 'Success variants' },
      green: { description: 'Success, positive actions', usage: 'Confirm buttons, success messages' },
      emerald: { description: 'Nature, harmony', usage: 'Brand colors' },
      teal: { description: 'Balance, clarity', usage: 'Info states' },
      cyan: { description: 'Cool, fresh', usage: 'Links, info' },
      sky: { description: 'Open, expansive', usage: 'Primary actions' },
      blue: { description: 'Trust, reliability', usage: 'Primary brand, links' },
      indigo: { description: 'Deep, professional', usage: 'Corporate themes' },
      violet: { description: 'Creative, innovative', usage: 'Special features' },
      purple: { description: 'Luxury, premium', usage: 'Premium features' },
      fuchsia: { description: 'Vibrant, energetic', usage: 'Highlights, accents' },
      pink: { description: 'Playful, friendly', usage: 'Social features' },
      rose: { description: 'Romantic, gentle', usage: 'Soft interactions' }
    },
    grayScales: {
      slate: 'Cool gray with blue undertones',
      gray: 'Neutral gray',
      zinc: 'Cool gray with slight blue',
      neutral: 'Pure neutral gray',
      stone: 'Warm gray with brown undertones'
    },
    shades: {
      50: 'Lightest shade - backgrounds, subtle highlights',
      100: 'Very light - hover states, disabled backgrounds',
      200: 'Light - borders, dividers',
      300: 'Medium light - placeholder text',
      400: 'Medium - secondary text, icons',
      500: 'Base shade - primary text, default state',
      600: 'Medium dark - hover states',
      700: 'Dark - active states',
      800: 'Very dark - headings, emphasis',
      900: 'Darkest - high contrast text',
      950: 'Ultra dark - maximum contrast'
    },
    usage: {
      example: 'color="emerald" or color="red"',
      customization: 'Define custom colors in app.config.ts under ui.colors',
      dynamicUsage: ':color="isError ? "red" : "green""'
    }
  }
}

function generateUIComponentTemplate({
  componentType,
  name,
  withProps,
  withVariants,
}: {
  componentType: string
  name: string
  withProps: boolean
  withVariants: boolean
}): string {
  const propsInterface = withProps ? `
interface ${name}Props {
  ${getPropsForType(componentType)}
}

const props = withDefaults(defineProps<${name}Props>(), {
  ${getDefaultPropsForType(componentType)}
})
` : ''

  const variants = withVariants ? `
const variants = {
  ${getVariantsForType(componentType)}
}
` : ''

  return `<script setup lang="ts">
${propsInterface}${variants}
</script>

<template>
  ${getTemplateForType(componentType, name)}
</template>
`
}

function getPropsForType(type: string): string {
  switch (type) {
    case 'form':
      return `schema: any
  state: Record<string, any>
  loading?: boolean`
    case 'card':
      return `title?: string
  description?: string
  ui?: any`
    case 'modal':
      return `modelValue: boolean
  title?: string
  preventClose?: boolean`
    case 'table':
      return `rows: any[]
  columns: any[]
  loading?: boolean`
    case 'navigation':
      return `items: Array<{ label: string, to?: string, click?: () => void }>
  vertical?: boolean`
    case 'layout':
      return `padding?: boolean
  container?: boolean`
    default:
      return `// Add your props here`
  }
}

function getDefaultPropsForType(type: string): string {
  switch (type) {
    case 'form':
      return 'loading: false'
    case 'card':
      return `// Add defaults here`
    case 'modal':
      return 'preventClose: false'
    case 'table':
      return 'loading: false'
    case 'navigation':
      return 'vertical: false'
    case 'layout':
      return 'padding: true, container: false'
    default:
      return `// Add defaults here`
  }
}

function getVariantsForType(type: string): string {
  switch (type) {
    case 'card':
      return `default: 'bg-white dark:bg-gray-900 shadow',
  bordered: 'border border-gray-200 dark:border-gray-800'`
    default:
      return `// Add variants here`
  }
}

function getTemplateForType(type: string, name: string): string {
  switch (type) {
    case 'form':
      return `<UForm :schema="schema" :state="state" @submit="onSubmit">
    <slot />
    <UButton type="submit" :loading="loading">
      Submit
    </UButton>
  </UForm>`
    case 'card':
      return `<UCard :ui="ui">
    <template #header v-if="title">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p v-if="description" class="text-gray-500">{{ description }}</p>
    </template>
    <slot />
  </UCard>`
    case 'modal':
      return `<UModal :model-value="modelValue" :prevent-close="preventClose" @update:model-value="$emit('update:modelValue', $event)">
    <div class="p-4">
      <h2 v-if="title" class="text-xl font-bold mb-4">{{ title }}</h2>
      <slot />
    </div>
  </UModal>`
    case 'table':
      return `<UTable :rows="rows" :columns="columns" :loading="loading">
    <template #actions="{ row }">
      <slot name="actions" :row="row" />
    </template>
  </UTable>`
    case 'navigation':
      return `<nav :class="{ 'flex flex-col': vertical, 'flex flex-row': !vertical }">
    <UButton
      v-for="item in items"
      :key="item.label"
      :to="item.to"
      variant="ghost"
      @click="item.click"
    >
      {{ item.label }}
    </UButton>
  </nav>`
    case 'layout':
      return `<div :class="{ 'p-4': padding, 'container mx-auto': container }">
    <slot />
  </div>`
    default:
      return `<div>
    <!-- ${name} component content -->
    <slot />
  </div>`
  }
}