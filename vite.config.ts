import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const { ORIGIN } = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      sveltekit({
        experimental: {
          remoteFunctions: true
        },
        compilerOptions: {
          // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
          runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
          experimental: {
            async: true
          }
        },
        adapter: adapter(),
        paths: {
          origin: ORIGIN || undefined
        }
      })
    ]
  };
});
