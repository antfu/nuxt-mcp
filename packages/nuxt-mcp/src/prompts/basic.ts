import type { McpToolContext } from '../types'

export function promptNuxtBasic({ mcp, nuxt }: McpToolContext): void {
  mcp.prompt('nuxt-basic', () => {
    const lines: string[] = []

    lines.push(`
You are a professional developer specializing in Nuxt and Vue.

This nuxt project is configured with following structure:
- Root directory: ${nuxt.options.rootDir}
- App directory: ${nuxt.options.appDir}
- Source code directory: ${nuxt.options.srcDir}
- Server directory: ${nuxt.options.serverDir}

`)

    // TODO: components, typescript, tailwind, unocss

    if (nuxt.options.ssr) {
      lines.push(`
## SSR

This is a Nuxt 3 application with SSR enabled. Components should be isomorphic and can be executed on both server or client side.

In scenarios where you need different logic for server and client, use \`import.meta.client\` and \`import.meta.server\` 
to branch the code, and use dynamic imports if needed.
`)
    }
    else {
      lines.push(`
## CSR

This is a Nuxt 3 application with SSR disabled. While components are primarily rendered on the client side, still try to make the code as isomorphic as possible to be future-proof.
`)
    }

    if (nuxt.options.imports.autoImport) {
      lines.push(`
## Auto-imports

This Nuxt project is configured have auto-imports enabled.

For example, Vue apis (ref, computed, watch, etc.) are auto-imported, so you can directly use them in your code without import statements.

You can find the full auto-import items with tool \`list-nuxt-auto-imports-items\`.
`)
    }
    else {
      lines.push(`
## No auto-imports

This Nuxt project is configured have auto-imports disabled.

You can still reference the registered entries with tool \`list-nuxt-auto-imports-items\`.
But you need to always manually import the usages when modifying the code, either directly import the item from their source, 
or use explicit \`import { xxx } from '#imports'\` to import any items from the registry.
`)
    }

    // Referene prompts from https://github.com/antfu/nuxt-mcp/issues/2 by @DannyVogel
    //     lines.push(`
    // - This is a Nuxt 3 application using the Composition API with <script setup> syntax.
    // - Leverage Nuxt 3's auto-imports system:
    //   - Vue features (ref, computed, watch, etc.) are auto-imported
    //   - Components in the /components directory are auto-imported
    //   - Composables in the /composables directory are auto-imported
    //   - Utils in the /utils directory are auto-imported
    //   - Never manually import these items
    // - For data fetching:
    //   - Always use useFetch or useAsyncData at the top level of <script setup> (never inside functions or lifecycle hooks)
    //   - Always destructure and use the status property (not the deprecated pending property)
    //   - Status values are: 'idle', 'pending', 'success', or 'error'
    //   - Use $fetch for imperative API calls within methods or event handlers
    // - useAsyncData example:
    // <script setup>
    //   const { data, status, error, refresh, clear } = await useAsyncData(
    //   'mountains',
    //   () => $fetch('https://api.nuxtjs.dev/mountains')
    //   )
    // </script>
    // - Always handle all data fetching states in templates:
    // <template>
    //   <div v-if="status === 'pending'">Loading...</div>
    //   <div v-else-if="status === 'error'">Error: {{ error }}</div>
    //   <div v-else>{{ data }}</div>
    // </template>

    // - Follow component best practices:

    //   - Create small, focused components for specific tasks
    //   - Use defineModel for two-way binding between parent and child components
    //   - Use props for passing data down to child components
    //   - Use emits for communicating events up to parent components
    //   - Use composables for shared state and logic across components
    //   - Use Pinia for global state management
    //   - Consider provide/inject only for specific cases like theme providers or deeply nested component trees

    // - Always structure Vue Single File Components in this exact order:

    // 1. <script setup> section first
    // 2. <template> section second
    // 3. <style> section last

    // - When styling Vue components:

    //   - If you see Tailwind being used in a file, use Tailwind for styling.
    //   - Prioritize Tailwind utility classes in the template for most styling needs.
    //   - Only use the <style> section for CSS properties that Tailwind doesn't support well, such as:
    //     - Complex animations and transitions
    //     - Advanced selectors and pseudo-elements
    //     - Custom scrollbar styling
    //     - CSS variables for dynamic theming
    //     - Keyframe animations

    // - Accessibility:

    //   - Ensure proper ARIA attributes on interactive elements
    //   - Maintain keyboard navigation support
    //   - Use semantic HTML elements appropriately

    // - For component props and emits:

    //   - Always use TypeScript interfaces or type aliases with defineProps and defineEmits
    //   - Define complex types in separate files within the /types directory
    //   - Use the withDefaults helper for props with default values
    //   - Mark optional props with the ? symbol
    //   - Required props should not have the ? symbol

    //   Example:

    //   \`\`\`ts
    //   // In types/card.ts
    //   export type CardProps = {
    //     title: string;
    //     description: string;
    //     image?: string;
    //     variant?: "primary" | "secondary";
    //   };

    //   // In the component
    //   import type { CardProps } from "~/types/card";

    //   const props = withDefaults(defineProps<CardProps>(), {
    //     image: "/default.png",
    //     variant: "primary",
    //   });

    //   const emit = defineEmits<{
    //     "update:selected": [value: boolean];
    //     click: [event: MouseEvent];
    //   }>();
    //   \`\`\`

    //   - Transitions and animations:

    //   * Use Vue's built-in \`<Transition>\` and \`<TransitionGroup>\` components
    //   * Combine with CSS classes for complex animations (apply Tailwind if available and possible)

    // - Vue-specific TypeScript patterns:

    //   - Type ref() values explicitly when TypeScript can't infer correctly: ref<string>('')
    //   - Type event handlers with appropriate event types (MouseEvent, KeyboardEvent, etc.)
    //   - Use PropType for complex prop types in runtime declarations
    //   - Return explicitly typed objects from composables
    //   - Use generics for reusable composables that work with different data types

    // ## TypeScript best practices:

    // - Create dedicated type files in the /types directory organized by domain
    // - Use namespaces or barrel exports (index.ts) to organize related types
    // - Define API response types that match your backend contracts
    // - Use readonly modifiers for immutable properties
    // - Use Record<K, V> instead of {[key: string]: T} for better type safety
    // - Avoid using type assertions (as Type) whenever possible
    // - Never use "as any" as it defeats TypeScript's type checking
    // - Instead of type casting, prefer:
    //   - Type guards (if (typeof x === 'string') or custom is\* functions)
    //   - Type narrowing with instanceof, in operators, or discriminated unions
    //   - Proper generic types to maintain type information throughout the code
    // - Only use type assertions when:
    //   - You have more information than TypeScript can determine
    //   - Working with external libraries with incomplete type definitions
    //   - After validating the type with runtime checks
    // - When needed, prefer "as unknown as Type" over direct "as Type" for safer casting
    // - Consider using type predicates (user is User) for custom type guards
    // - Code should be self-documenting; limit the use of comments

    // ## Directory Structure

    // - All TypeScript interfaces, types, and enums must be defined in dedicated files within the \`/types\` directory
    // - Types should be organized by domain (e.g., \`user.ts\`, \`post.ts\`, \`auth.ts\`)
    // - Use barrel exports with an \`index.ts\` file to simplify imports

    // ## Naming Conventions

    // - Use PascalCase for interface, type, and enum names
    // - Use singular nouns for entity types (e.g., \`Post\` not \`Posts\`)
    // - Suffix interfaces representing props with \`Props\` (e.g., \`ButtonProps\`)
    // - Suffix interfaces representing state with \`State\` (e.g., \`AuthState\`)

    // ## Import Pattern

    // - Always use named imports with the \`type\` keyword: \`import type { Post } from '~/types'\`
    // - Import from the barrel file when possible: \`import type { Post, User } from '~/types'\`
    // - Only import directly from specific files when the type is not exported in the barrel file

    // ## Type Definitions

    // - Keep interfaces focused and cohesive - one interface per concept
    // - Use composition over inheritance (prefer interface extension over class inheritance)
    // - Document complex types with JSDoc comments when necessary
    // - Use TypeScript utility types (Partial, Pick, Omit, etc.) to derive types from base interfaces
    // `,
    //     )

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
