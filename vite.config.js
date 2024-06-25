import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'js-as-jsx',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.js')) {
          return {
            code: code.replace(/(<[A-Za-z])/g, (match) => {
              return `/* @jsxImportSource @jsx */${match}`;
            }),
            map: null,
          };
        }
      },
    },
  ],
    server: {
        host: '0.0.0.0',
    },
})
