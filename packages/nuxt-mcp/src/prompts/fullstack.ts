import type { McpToolContext } from '../types'

export function promptFullstack({ mcp, nuxt, modules }: McpToolContext): void {
  if (!modules.hasNuxtUI || !modules.hasNuxtAuth || !modules.hasDrizzle) return

  mcp.prompt('fullstack-patterns', () => {
    const lines: string[] = []

    lines.push(`
## Fullstack Architecture with Nuxt UI + Auth Utils + Drizzle

This project combines Nuxt UI, Nuxt Auth Utils, and Drizzle ORM for a complete fullstack solution.

### Application Architecture
- **Frontend**: Nuxt UI components for consistent design system
- **Authentication**: Nuxt Auth Utils for secure session management
- **Database**: Drizzle ORM for type-safe database operations
- **API Layer**: Server routes with proper validation and error handling

### Common Patterns

#### Protected CRUD Operations
\`\`\`typescript
// API route with auth + database
export default defineEventHandler(async (event) => {
  // 1. Check authentication
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  // 2. Validate input
  const body = await readBody(event)
  const validatedData = schema.parse(body)
  
  // 3. Database operation
  const result = await db.insert(table).values(validatedData).returning()
  return result[0]
})
\`\`\`

#### Form with Validation and UI
\`\`\`vue
<script setup>
const schema = z.object({
  title: z.string().min(1),
  content: z.string().optional()
})

const state = reactive({ title: '', content: '' })

async function onSubmit() {
  await $fetch('/api/posts', { method: 'POST', body: state })
  // Handle success
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormField label="Title" name="title">
      <UInput v-model="state.title" />
    </UFormField>
    <UFormField label="Content" name="content">
      <UTextarea v-model="state.content" />
    </UFormField>
    <UButton type="submit">Create Post</UButton>
  </UForm>
</template>
\`\`\`

#### Data Fetching with Authentication
\`\`\`vue
<script setup>
definePageMeta({ middleware: 'auth' })

const { data: posts, refresh } = await useFetch('/api/posts')
const { user } = useUserSession()
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <h1>Welcome, {{ user?.name }}</h1>
      </template>
      
      <UTable :rows="posts" :columns="columns">
        <template #actions="{ row }">
          <UButton @click="deletePost(row.id)" color="red" variant="ghost">
            Delete
          </UButton>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
\`\`\`

### Development Workflow
1. **Schema First**: Define database schema with Drizzle
2. **API Routes**: Create server routes with auth and validation
3. **UI Components**: Build forms and displays with Nuxt UI
4. **Type Safety**: Leverage TypeScript across the stack

### Best Practices
- Always validate data at API boundaries
- Use transactions for complex database operations
- Implement proper error handling with user-friendly messages
- Follow security best practices for authentication and authorization
- Use Nuxt UI patterns for consistent user experience
- Leverage TypeScript for compile-time safety across the stack
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