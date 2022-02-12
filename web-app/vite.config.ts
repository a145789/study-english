import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import viteCompression from 'vite-plugin-compression';
import { createStyleImportPlugin } from 'vite-plugin-style-import';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    viteCompression({ ext: '.gz', deleteOriginFile: false }),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    createStyleImportPlugin({
      libs: [
        {
          libraryName: 'antd-mobile',
          base: 'antd-mobile/es/global',
          resolveStyle: (name) => `antd-mobile/es/components/${name}`,
        },
      ],
    }),
  ],
  server: {
    host: '0.0.0.0',
  },
});
