import type { McpToolContext, AuthConfig } from '../types'
import { z } from 'zod'

export function toolsNuxtAuth({ mcp, nuxt, modules }: McpToolContext): void {
  if (!modules.hasNuxtAuth) return

  mcp.tool(
    'get-auth-config',
    'Get the current Nuxt Auth Utils configuration including providers, session settings, and pages',
    {},
    async () => {
      const authConfig = await getAuthConfiguration(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            config: authConfig,
            info: 'Authentication configuration from nuxt.config.ts and runtime config',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'get-auth-session',
    'Inspect current session data structure and available session methods',
    {},
    async () => {
      const sessionInfo = await getSessionInfo(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            sessionStructure: sessionInfo,
            availableMethods: [
              'await getUserSession(event)',
              'await setUserSession(event, data)',
              'await clearUserSession(event)',
              'await requireUserSession(event)',
              'await replaceUserSession(event, data)',
            ],
            composables: [
              'const { loggedIn, user, session, fetch, clear } = useUserSession()',
            ],
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'list-auth-providers',
    'List configured authentication providers and their settings',
    {},
    async () => {
      const providers = await getAuthProviders(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            providers,
            info: 'OAuth providers configured in the application. Use these in your login flows.',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'scaffold-auth-pages',
    'Generate authentication pages (login, register, profile) with proper patterns',
    {
      pageType: z.enum(['login', 'register', 'profile', 'settings', 'forgot-password'])
        .describe('Type of auth page to generate'),
      withUI: z.boolean().optional()
        .describe('Use Nuxt UI components'),
      withProviders: z.boolean().optional()
        .describe('Include OAuth provider buttons'),
    },
    async ({ pageType, withUI = true, withProviders = true }) => {
      const template = generateAuthPageTemplate({
        pageType,
        withUI,
        withProviders,
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            template,
            filePath: `pages/auth/${pageType}.vue`,
            middleware: pageType === 'profile' || pageType === 'settings' ? 'auth' : 'guest',
            info: `Generated ${pageType} page with auth patterns. Place in pages/auth/ directory.`,
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-auth-middleware',
    'Generate authentication middleware for route protection',
    {
      middlewareType: z.enum(['auth', 'guest', 'admin', 'role-based'])
        .describe('Type of middleware to generate'),
      redirectTo: z.string().optional()
        .describe('Redirect path for unauthorized users'),
    },
    async ({ middlewareType, redirectTo }) => {
      const middleware = generateAuthMiddleware(middlewareType, redirectTo)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            middleware,
            filePath: `middleware/${middlewareType}.ts`,
            usage: `Add definePageMeta({ middleware: '${middlewareType}' }) to pages`,
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-auth-api',
    'Generate server API routes for authentication (login, logout, register)',
    {
      routeType: z.enum(['login', 'logout', 'register', 'profile', 'oauth-callback'])
        .describe('Type of auth API route to generate'),
      provider: z.string().optional()
        .describe('OAuth provider name (for oauth-callback)'),
    },
    async ({ routeType, provider }) => {
      const apiRoute = generateAuthAPIRoute(routeType, provider)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            route: apiRoute,
            filePath: `server/api/auth/${routeType}${provider ? `/${provider}` : ''}.post.ts`,
            info: `Generated ${routeType} API route with proper error handling and validation`,
          }, null, 2),
        }],
      }
    },
  )
}

async function getAuthConfiguration(nuxt: any): Promise<AuthConfig> {
  return {
    module: {
      name: 'nuxt-auth-utils',
      version: 'Latest',
      documentation: 'https://nuxt.com/modules/auth-utils',
      repository: 'https://github.com/atinux/nuxt-auth-utils'
    },
    installation: {
      command: 'npx nuxi@latest module add auth-utils',
      requirements: [
        'Nuxt >=3.0.0',
        'Server-side rendering (not compatible with nuxt generate)',
        'NUXT_SESSION_PASSWORD environment variable (32+ characters)'
      ]
    },
    providers: {
      available: [
        'Auth0', 'AWS Cognito', 'Azure', 'Battledotnet', 'Discord', 'Facebook',
        'GitHub', 'GitLab', 'Google', 'Instagram', 'Keycloak', 'LinkedIn',
        'Microsoft', 'Okta', 'Paypal', 'Spotify', 'Steam', 'Stripe', 'Twitch',
        'Twitter', 'Vk', 'WorkOS', 'Yandex', 'Zoom'
      ],
      oauth: {
        pattern: 'defineOAuth<Provider>EventHandler({ onSuccess, config?, onError? })',
        example: `// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile']
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        avatar: user.picture
      }
    })
    return sendRedirect(event, '/')
  }
})`
      }
    },
    session: {
      description: 'Secured & sealed cookies using iron for session storage',
      environment: {
        NUXT_SESSION_PASSWORD: {
          required: true,
          minLength: 32,
          description: 'Secret key for encrypting session cookies'
        }
      },
      cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      },
      sizeLimit: '4096 bytes (store only essential information)'
    },
    composables: {
      useUserSession: {
        description: 'Client-side session management',
        properties: {
          loggedIn: 'Computed<boolean> - User authentication status',
          user: 'ComputedRef<User | null> - Current user data',
          session: 'Ref<UserSession> - Full session object',
          clear: '() => Promise<void> - Clear session and logout',
          fetch: '() => Promise<void> - Refresh session from server',
          openInPopup: '(route: string, size?) => void - OAuth in popup'
        },
        example: `<script setup>
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div v-if="loggedIn">
    <p>Welcome {{ user.name }}!</p>
    <button @click="logout">Logout</button>
  </div>
</template>`
      }
    },
    serverUtils: {
      getUserSession: {
        description: 'Get current user session',
        usage: 'const session = await getUserSession(event)',
        returns: 'UserSession | null'
      },
      setUserSession: {
        description: 'Set user session data',
        usage: 'await setUserSession(event, { user: userData })',
        parameters: 'event: H3Event, session: UserSession'
      },
      clearUserSession: {
        description: 'Clear user session',
        usage: 'await clearUserSession(event)'
      },
      requireUserSession: {
        description: 'Require authenticated session (throws 401 if not)',
        usage: 'const session = await requireUserSession(event)',
        returns: 'UserSession (or throws error)'
      },
      replaceUserSession: {
        description: 'Replace entire session',
        usage: 'await replaceUserSession(event, newSession)'
      }
    },
    features: {
      passwordHashing: {
        available: true,
        description: 'Built-in password hashing utilities',
        functions: ['hashPassword', 'verifyPassword']
      },
      webauthn: {
        available: true,
        description: 'WebAuthn (passkey) authentication support'
      },
      oauth: {
        providers: '40+ OAuth providers supported',
        customization: 'Easy to add custom OAuth providers'
      },
      ssr: {
        compatible: true,
        note: 'Full server-side rendering support'
      }
    }
  }
}

async function getSessionInfo(nuxt: any): Promise<any> {
  return {
    structure: {
      user: {
        description: 'User data stored in session',
        properties: {
          id: { type: 'string | number', required: true, description: 'Unique user identifier' },
          email: { type: 'string', required: false, description: 'User email address' },
          name: { type: 'string', required: false, description: 'User display name' },
          avatar: { type: 'string', required: false, description: 'Avatar image URL' },
          roles: { type: 'string[]', required: false, description: 'User roles/permissions' },
          // Custom fields can be added based on provider
        }
      },
      session: {
        description: 'Session metadata',
        properties: {
          createdAt: { type: 'Date', description: 'Session creation time' },
          updatedAt: { type: 'Date', description: 'Last session update' },
          expiresAt: { type: 'Date', description: 'Session expiration' }
        }
      }
    },
    clientSide: {
      useUserSession: {
        example: `const { loggedIn, user, session, clear, fetch } = useUserSession()

// Check authentication
if (loggedIn.value) {
  console.log('User:', user.value)
  console.log('Session:', session.value)
}

// Logout
await clear()

// Refresh session
await fetch()`
      }
    },
    serverSide: {
      examples: [
        {
          title: 'Get Session in API Route',
          code: `// server/api/profile.get.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  return { user: session.user }
})`
        },
        {
          title: 'Set Session After Login',
          code: `// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  
  // Verify credentials...
  const user = await verifyUser(email, password)
  
  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  })
  
  return { success: true }
})`
        },
        {
          title: 'Require Authentication',
          code: `// server/api/protected.get.ts
export default defineEventHandler(async (event) => {
  // This will throw 401 if not authenticated
  const session = await requireUserSession(event)
  
  return {
    message: 'Protected data',
    user: session.user
  }
})`
        }
      ]
    },
    security: {
      encryption: 'Sessions encrypted using iron (sealed cookies)',
      httpOnly: 'Cookies are HTTP-only by default',
      secure: 'HTTPS required in production',
      sameSite: 'CSRF protection via SameSite cookies',
      maxAge: 'Configurable session expiration'
    }
  }
}

async function getAuthProviders(nuxt: any): Promise<any> {
  return {
    popular: {
      github: {
        name: 'GitHub',
        envVars: ['NUXT_OAUTH_GITHUB_CLIENT_ID', 'NUXT_OAUTH_GITHUB_CLIENT_SECRET'],
        setup: 'https://github.com/settings/developers',
        scopes: ['user:email', 'read:user'],
        example: `// server/api/auth/github.get.ts
export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar_url
      }
    })
    return sendRedirect(event, '/')
  }
})`
      },
      google: {
        name: 'Google',
        envVars: ['NUXT_OAUTH_GOOGLE_CLIENT_ID', 'NUXT_OAUTH_GOOGLE_CLIENT_SECRET'],
        setup: 'https://console.developers.google.com',
        scopes: ['openid', 'email', 'profile'],
        example: `// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile']
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        avatar: user.picture
      }
    })
    return sendRedirect(event, '/')
  }
})`
      },
      discord: {
        name: 'Discord',
        envVars: ['NUXT_OAUTH_DISCORD_CLIENT_ID', 'NUXT_OAUTH_DISCORD_CLIENT_SECRET'],
        setup: 'https://discord.com/developers/applications',
        scopes: ['identify', 'email'],
        example: `export default defineOAuthDiscordEventHandler({
  config: {
    scope: ['identify', 'email']
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar ? 
          \`https://cdn.discordapp.com/avatars/\${user.id}/\${user.avatar}.png\` : 
          null
      }
    })
    return sendRedirect(event, '/')
  }
})`
      }
    },
    allProviders: [
      'Auth0', 'AWS Cognito', 'Azure', 'Battledotnet', 'Discord', 'Facebook',
      'GitHub', 'GitLab', 'Google', 'Instagram', 'Keycloak', 'LinkedIn',
      'Microsoft', 'Okta', 'Paypal', 'Spotify', 'Steam', 'Stripe', 'Twitch',
      'Twitter', 'Vk', 'WorkOS', 'Yandex', 'Zoom'
    ],
    customProvider: {
      pattern: 'defineOAuth<Provider>EventHandler',
      example: `// For a custom OAuth provider
export default defineOAuthCustomEventHandler({
  config: {
    clientId: process.env.CUSTOM_CLIENT_ID,
    clientSecret: process.env.CUSTOM_CLIENT_SECRET,
    authorizationURL: 'https://provider.com/oauth/authorize',
    tokenURL: 'https://provider.com/oauth/token',
    userURL: 'https://provider.com/api/user'
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, { user })
    return sendRedirect(event, '/')
  }
})`
    },
    clientRedirect: {
      description: 'Client-side OAuth redirect',
      example: `<template>
  <UButton @click="login" v-if="!loggedIn">
    Login with GitHub
  </UButton>
</template>

<script setup>
const { loggedIn } = useUserSession()

function login() {
  return navigateTo('/api/auth/github')
}
</script>`
    }
  }
}

function generateAuthPageTemplate({
  pageType,
  withUI,
  withProviders,
}: {
  pageType: string
  withUI: boolean
  withProviders: boolean
}): string {
  const uiComponents = withUI
  const providerButtons = withProviders && (pageType === 'login' || pageType === 'register')

  switch (pageType) {
    case 'login':
      return `<script setup lang="ts">
${uiComponents ? "import { z } from 'zod'" : ''}

definePageMeta({
  middleware: 'guest'
})

const { loggedIn } = useUserSession()

// Redirect if already logged in
watch(loggedIn, (value) => {
  if (value) {
    navigateTo('/dashboard')
  }
})

${uiComponents ? `
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const state = reactive({
  email: '',
  password: ''
})

const { pending } = await useLazyAsyncData('login', () => Promise.resolve())
` : `
const form = reactive({
  email: '',
  password: '',
  pending: false
})
`}

async function onSubmit() {
  try {
    ${uiComponents ? 'pending.value = true' : 'form.pending = true'}
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: ${uiComponents ? 'state' : 'form'}
    })
    await navigateTo('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    ${uiComponents ? 'pending.value = false' : 'form.pending = false'}
  }
}

${providerButtons ? `
async function loginWithProvider(provider: string) {
  await navigateTo(\`/api/auth/\${provider}\`)
}
` : ''}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold">Sign in to your account</h2>
      </div>
      
      ${uiComponents ? `
      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" placeholder="Enter your email" />
        </UFormField>
        
        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" placeholder="Enter your password" />
        </UFormField>
        
        <UButton type="submit" :loading="pending" block>
          Sign in
        </UButton>
      </UForm>
      ` : `
      <form @submit.prevent="onSubmit" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full border rounded-md px-3 py-2"
          >
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="mt-1 block w-full border rounded-md px-3 py-2"
          >
        </div>
        
        <button
          type="submit"
          :disabled="form.pending"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ form.pending ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
      `}
      
      ${providerButtons ? `
      <div class="space-y-3">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        ${uiComponents ? `
        <UButton @click="loginWithProvider('github')" variant="outline" block>
          <Icon name="mdi:github" class="w-5 h-5 mr-2" />
          GitHub
        </UButton>
        
        <UButton @click="loginWithProvider('google')" variant="outline" block>
          <Icon name="mdi:google" class="w-5 h-5 mr-2" />
          Google
        </UButton>
        ` : `
        <button @click="loginWithProvider('github')" class="w-full border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50">
          GitHub
        </button>
        
        <button @click="loginWithProvider('google')" class="w-full border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50">
          Google
        </button>
        `}
      </div>
      ` : ''}
      
      <div class="text-center">
        <NuxtLink to="/auth/register" class="text-blue-600 hover:text-blue-500">
          Don't have an account? Sign up
        </NuxtLink>
      </div>
    </div>
  </div>
</template>`

    case 'profile':
      return `<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, clear } = useUserSession()

${uiComponents ? `
const state = reactive({
  name: user.value?.name || '',
  email: user.value?.email || '',
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})
` : `
const form = reactive({
  name: user.value?.name || '',
  email: user.value?.email || '',
  pending: false
})
`}

async function updateProfile() {
  try {
    ${uiComponents ? '' : 'form.pending = true'}
    await $fetch('/api/auth/profile', {
      method: 'PATCH',
      body: ${uiComponents ? 'state' : 'form'}
    })
    // Show success message
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    ${uiComponents ? '' : 'form.pending = false'}
  }
}

async function logout() {
  await clear()
  await navigateTo('/auth/login')
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Profile Settings</h1>
      ${uiComponents ? `
      <UButton @click="logout" color="red" variant="outline">
        Logout
      </UButton>
      ` : `
      <button @click="logout" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Logout
      </button>
      `}
    </div>
    
    ${uiComponents ? `
    <UForm :schema="schema" :state="state" @submit="updateProfile" class="space-y-6">
      <UFormField label="Name" name="name">
        <UInput v-model="state.name" placeholder="Your name" />
      </UFormField>
      
      <UFormField label="Email" name="email">
        <UInput v-model="state.email" type="email" placeholder="Your email" />
      </UFormField>
      
      <UButton type="submit">
        Update Profile
      </UButton>
    </UForm>
    ` : `
    <form @submit.prevent="updateProfile" class="space-y-6">
      <div>
        <label class="block text-sm font-medium mb-1">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full border rounded-md px-3 py-2"
        >
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full border rounded-md px-3 py-2"
        >
      </div>
      
      <button
        type="submit"
        :disabled="form.pending"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ form.pending ? 'Updating...' : 'Update Profile' }}
      </button>
    </form>
    `}
  </div>
</template>`

    default:
      return `<script setup lang="ts">
// Generated ${pageType} page
</script>

<template>
  <div>
    <h1>${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page</h1>
    <!-- Add your ${pageType} content here -->
  </div>
</template>`
  }
}

function generateAuthMiddleware(type: string, redirectTo?: string): string {
  switch (type) {
    case 'auth':
      return `export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  
  if (!loggedIn.value) {
    return navigateTo('${redirectTo || '/auth/login'}')
  }
})`

    case 'guest':
      return `export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  
  if (loggedIn.value) {
    return navigateTo('/dashboard')
  }
})`

    case 'admin':
      return `export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  
  if (!user.value || !user.value.roles?.includes('admin')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }
})`

    case 'role-based':
      return `export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession()
  const requiredRole = to.meta.role
  
  if (!user.value || !user.value.roles?.includes(requiredRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions'
    })
  }
})`

    default:
      return `export default defineNuxtRouteMiddleware(() => {
  // Custom middleware logic
})`
  }
}

function generateAuthAPIRoute(type: string, provider?: string): string {
  switch (type) {
    case 'login':
      return `export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  
  // Validate input
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    })
  }
  
  try {
    // TODO: Implement your authentication logic here
    // Example: verify credentials with database
    const user = await verifyCredentials(email, password)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    // Set user session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
    
    return { success: true, user }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication failed'
    })
  }
})`

    case 'logout':
      return `export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { success: true }
})`

    case 'register':
      return `export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event)
  
  // Validate input
  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, password, and name are required'
    })
  }
  
  try {
    // TODO: Implement user registration logic
    // Example: create user in database
    const user = await createUser({ email, password, name })
    
    // Set user session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
    
    return { success: true, user }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed'
    })
  }
})`

    case 'oauth-callback':
      return `export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { code, state } = query
  
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Authorization code is required'
    })
  }
  
  try {
    // TODO: Exchange code for access token
    const tokenResponse = await $fetch('${provider === 'github' ? 'https://github.com/login/oauth/access_token' : 'https://oauth2.googleapis.com/token'}', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: {
        client_id: process.env.${provider?.toUpperCase()}_CLIENT_ID,
        client_secret: process.env.${provider?.toUpperCase()}_CLIENT_SECRET,
        code,
      }
    })
    
    // TODO: Get user info from provider
    const userInfo = await $fetch('${provider === 'github' ? 'https://api.github.com/user' : 'https://www.googleapis.com/oauth2/v2/userinfo'}', {
      headers: {
        'Authorization': \`Bearer \${tokenResponse.access_token}\`
      }
    })
    
    // TODO: Create or update user in your database
    const user = await findOrCreateUser({
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar_url || userInfo.picture,
      provider: '${provider}',
      providerId: userInfo.id.toString(),
    })
    
    // Set user session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      }
    })
    
    return sendRedirect(event, '/dashboard')
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OAuth authentication failed'
    })
  }
})`

    default:
      return `export default defineEventHandler(async (event) => {
  // Custom auth API route
  return { success: true }
})`
  }
}