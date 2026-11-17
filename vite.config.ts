import { defineConfig } from 'vite';

// base './' so the same build works on GitHub Pages (project site),
// a custom domain, and a plain local static server. See docs/decisions.md D-001.
export default defineConfig({ base: './' });
