import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@main': resolve('src/main'),
        '@contracts': resolve('src/contracts')
      }
    },
    build: {
      rollupOptions: {
        external: ['better-sqlite3', 'electron-devtools-installer']
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@contracts': resolve('src/contracts')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src'),
        '@components': resolve('src/renderer/src/components'),
        '@shared': resolve('src/shared'),
        '@infra': resolve('src/renderer/src/infra'),
        '@contracts': resolve('src/contracts'),
        '@sdk': resolve('src/sdk')
      }
    },
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler']
        }
      }),
      tailwindcss() as any
    ]
  }
})
