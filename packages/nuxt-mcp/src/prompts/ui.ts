import type { McpToolContext } from '../types'

export function promptNuxtUI({ mcp, modules }: McpToolContext): void {
  if (!modules.hasNuxtUI) return

  mcp.prompt('nuxt-ui-patterns', () => {
    const lines: string[] = []

    lines.push(`
## Nuxt UI Integration - Complete Guide

This project uses Nuxt UI (https://ui.nuxt.com) for component design system and styling.

### Installation & Setup
Nuxt UI is installed via: \`npx nuxi@latest module add ui\`
Requires Tailwind CSS and Headless UI as dependencies.

### Component Auto-Import System
- All components auto-imported with 'U' prefix: UButton, UInput, UCard, UForm, etc.
- No manual imports required in Vue components
- TypeScript support with full intellisense

### Core Design Principles
1. **Consistent API**: All components share color, variant, size, and ui props
2. **Tailwind Integration**: Built on Tailwind CSS utility classes
3. **Accessibility First**: WCAG compliant with ARIA attributes
4. **Customizable**: Theme via app.config.ts, component-level via ui prop

### Color System (Updated 2024)
\`\`\`typescript
// Available colors
const colors = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
  'fuchsia', 'pink', 'rose'
]

// Usage examples
<UButton color="emerald" />  // Green theme
<UAlert color="red" />       // Error state
<UInput color="blue" />      // Focus ring color
\`\`\`

### Component Variants & Sizes
**Button Variants:**
- \`solid\`: Filled background (default)
- \`outline\`: Border with transparent background
- \`soft\`: Subtle colored background
- \`ghost\`: Transparent, colored on hover
- \`link\`: No background, underlined text

**Sizes:** \`xs\`, \`sm\`, \`md\` (default), \`lg\`, \`xl\`

### Form Components & Validation
\`\`\`vue
<script setup>
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Must be at least 6 characters')
})

const state = reactive({ email: '', password: '' })
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" type="email" icon="i-lucide-mail" />
    </UFormField>
    
    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>
    
    <UButton type="submit" color="primary">Submit</UButton>
  </UForm>
</template>
\`\`\`

### Data Display Patterns
\`\`\`vue
<!-- Card with header/footer -->
<UCard>
  <template #header>
    <h3 class="text-lg font-semibold">Card Title</h3>
  </template>
  
  <p>Card content with automatic padding and styling.</p>
  
  <template #footer>
    <div class="flex justify-end gap-2">
      <UButton variant="outline">Cancel</UButton>
      <UButton>Confirm</UButton>
    </div>
  </template>
</UCard>

<!-- Data table with actions -->
<UTable :rows="data" :columns="columns">
  <template #actions="{ row }">
    <UDropdown :items="getActions(row)">
      <UButton variant="ghost" icon="i-lucide-more-horizontal" />
    </UDropdown>
  </template>
</UTable>
\`\`\`

### Navigation Components
\`\`\`vue
<!-- Dropdown menu -->
<UDropdown :items="menuItems">
  <UButton>Menu</UButton>
</UDropdown>

<!-- Command palette -->
<UCommandPalette
  :groups="[{ commands: commands }]"
  @update:model-value="onSelect"
/>
\`\`\`

### Feedback & Overlay Components
\`\`\`vue
<!-- Modal dialog -->
<UModal v-model="isOpen">
  <UCard>
    <template #header>
      <h3>Confirm Action</h3>
    </template>
    
    <p>Are you sure you want to delete this item?</p>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
        <UButton color="red" @click="confirmDelete">Delete</UButton>
      </div>
    </template>
  </UCard>
</UModal>

<!-- Toast notifications -->
<script setup>
const toast = useToast()

function showSuccess() {
  toast.add({
    title: 'Success!',
    description: 'Action completed successfully',
    color: 'green'
  })
}
</script>
\`\`\`

### Customization via app.config.ts
\`\`\`typescript
export default defineAppConfig({
  ui: {
    primary: 'emerald',  // Change primary color
    gray: 'zinc',        // Change neutral color
    
    // Component-specific customization
    button: {
      rounded: 'rounded-full',
      default: {
        size: 'lg',
        color: 'primary'
      }
    },
    
    // Custom colors
    colors: {
      brand: {
        50: '#f0f9ff',
        500: '#3b82f6',
        900: '#1e3a8a'
      }
    }
  }
})
\`\`\`

### Icons Integration
- Uses Iconify icons: \`icon="i-lucide-search"\`
- Supports any Iconify icon set (Lucide, Heroicons, etc.)
- Icons automatically sized and colored

### Accessibility Features
- Full keyboard navigation support
- Screen reader friendly with proper ARIA labels
- Focus management for modals and dropdowns
- High contrast mode support
- Reduced motion preferences respected

### Performance Considerations
- Tree-shaking: Only used components are bundled
- CSS optimization via Tailwind purge
- Lazy loading for heavy components (tables, etc.)
- Minimal runtime overhead

### Best Practices
1. **Consistent Spacing**: Use built-in component spacing, avoid custom margins
2. **Theme Adherence**: Stick to defined colors and variants
3. **Form Validation**: Always use schema validation with UForm
4. **Loading States**: Utilize built-in loading props
5. **Error Handling**: Use proper error styling and toast notifications
6. **Mobile First**: Components are responsive by default
7. **Dark Mode**: Automatic dark mode support via Nuxt UI
`)

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: lines.join('\n'),
          },
        },
      ],
    }
  })
}