import type { McpToolContext } from '../types'

export function promptNuxtAuth({ mcp, modules }: McpToolContext): void {
  if (!modules.hasNuxtAuth) return

  mcp.prompt('nuxt-auth-complete', () => {
    const lines: string[] = []

    lines.push(`
## Nuxt Auth Utils - Complete Authentication Guide

This project uses Nuxt Auth Utils (https://nuxt.com/modules/auth-utils) for minimalist authentication.

### Quick Setup & Requirements
\`\`\`bash
npx nuxi@latest module add auth-utils
\`\`\`

**Requirements:**
- Nuxt >=3.0.0
- Server-side rendering (NOT compatible with \`nuxt generate\`)
- NUXT_SESSION_PASSWORD environment variable (32+ characters)

### Session Architecture
- **Storage**: Secured & sealed cookies using iron encryption
- **Size Limit**: 4096 bytes (store only essential information)
- **Security**: HTTP-only, secure, SameSite protection
- **Expiration**: Configurable, default 7 days

### Client-Side Session Management
\`\`\`vue
<script setup>
const { loggedIn, user, session, clear, fetch } = useUserSession()

// Reactive authentication state
watchEffect(() => {
  if (loggedIn.value) {
    console.log('User authenticated:', user.value)
  }
})

// Logout function
async function logout() {
  await clear()  // Clears session and cookie
  await navigateTo('/login')
}

// Refresh session from server
async function refreshSession() {
  await fetch()
}
</script>

<template>
  <div>
    <div v-if="loggedIn">
      <h1>Welcome, {{ user?.name || user?.login }}!</h1>
      <p>Email: {{ user?.email }}</p>
      <UButton @click="logout" color="red">Logout</UButton>
    </div>
    
    <div v-else>
      <p>Please log in to continue</p>
      <UButton to="/login">Login</UButton>
    </div>
  </div>
</template>
\`\`\`

### Server-Side Session Utilities
\`\`\`typescript
// Get current session
const session = await getUserSession(event)
if (session.user) {
  console.log('User ID:', session.user.id)
}

// Set session (after login)
await setUserSession(event, {
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: ['user']  // Custom fields allowed
  },
  // Custom session data
  loginTime: new Date().toISOString()
})

// Clear session (logout)
await clearUserSession(event)

// Require authentication (throws 401 if not authenticated)
const session = await requireUserSession(event)

// Replace entire session
await replaceUserSession(event, newSessionData)
\`\`\`

### OAuth Integration (40+ Providers)
\`\`\`typescript
// server/api/auth/github.get.ts
export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['user:email']
  },
  async onSuccess(event, { user, tokens }) {
    // Save user to database or update existing
    const dbUser = await findOrCreateUser({
      githubId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar_url
    })
    
    // Set session
    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        provider: 'github'
      }
    })
    
    return sendRedirect(event, '/dashboard')
  },
  
  async onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=oauth_failed')
  }
})

// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile'],
    authorizationParams: {
      access_type: 'offline',  // For refresh tokens
    }
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        avatar: user.picture
      },
      // Store tokens if needed
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    })
    
    return sendRedirect(event, '/')
  }
})
\`\`\`

### Password Authentication
\`\`\`typescript
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  
  // Validate input
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password required'
    })
  }
  
  try {
    // Find user and verify password
    const user = await getUserByEmail(email)
    if (!user || !await verifyPassword(password, user.hashedPassword)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    // Set session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
    
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed'
    })
  }
})

// server/api/auth/register.post.ts
export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event)
  
  // Hash password using built-in utilities
  const hashedPassword = await hashPassword(password)
  
  // Create user
  const user = await createUser({
    email,
    name,
    hashedPassword
  })
  
  // Auto-login after registration
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  })
  
  return { success: true, user }
})
\`\`\`

### Middleware Patterns
\`\`\`typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})

// middleware/guest.ts  
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  
  if (loggedIn.value) {
    return navigateTo('/dashboard')
  }
})

// middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  
  if (!user.value?.roles?.includes('admin')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
})
\`\`\`

### WebAuthn (Passkeys) Support
\`\`\`typescript
// server/api/auth/webauthn/register.post.ts
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  const options = await generateRegistrationOptions({
    rpName: 'Your App',
    rpID: 'localhost',
    userID: session.user.id,
    userName: session.user.email,
    userDisplayName: session.user.name
  })
  
  // Store challenge in session
  await replaceUserSession(event, {
    ...session,
    challenge: options.challenge
  })
  
  return options
})
\`\`\`

### Security Best Practices
1. **Environment Variables**:
   - NUXT_SESSION_PASSWORD: 32+ character secret
   - OAuth credentials: NUXT_OAUTH_[PROVIDER]_CLIENT_ID/SECRET
   
2. **Session Security**:
   - Store minimal data in sessions (4KB limit)
   - Use HTTPS in production
   - Implement session rotation
   - Set appropriate cookie expiration
   
3. **Input Validation**:
   - Always validate on server-side
   - Sanitize user input
   - Use strong password policies
   - Implement rate limiting
   
4. **Error Handling**:
   - Don't expose sensitive errors to client
   - Log security events
   - Use proper HTTP status codes
   - Implement graceful fallbacks

### Common Patterns & Examples
\`\`\`vue
<!-- Login form with error handling -->
<script setup>
definePageMeta({ middleware: 'guest' })

const { loggedIn } = useUserSession()
const form = reactive({ email: '', password: '' })
const { pending, error } = await useLazyAsyncData('login', () => Promise.resolve())

watch(loggedIn, (value) => {
  if (value) navigateTo('/dashboard')
})

async function handleLogin() {
  try {
    pending.value = true
    error.value = null
    
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })
    
    // Will redirect via watcher
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UForm @submit="handleLogin">
    <UAlert v-if="error" color="red" :title="error.statusMessage" />
    
    <UFormField label="Email">
      <UInput v-model="form.email" type="email" required />
    </UFormField>
    
    <UFormField label="Password">
      <UInput v-model="form.password" type="password" required />
    </UFormField>
    
    <UButton type="submit" :loading="pending" block>
      Sign In
    </UButton>
    
    <div class="flex gap-2 mt-4">
      <UButton to="/api/auth/github" variant="outline" block>
        GitHub
      </UButton>
      <UButton to="/api/auth/google" variant="outline" block>
        Google  
      </UButton>
    </div>
  </UForm>
</template>
\`\`\`
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