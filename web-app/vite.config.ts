import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import viteCompression from 'vite-plugin-compression';
import styleImport from 'vite-plugin-style-import';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    assetsDir: './static',
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        // warnings: false,
        drop_console: true, //打包时删除console
        drop_debugger: true, //打包时删除 debugger
        pure_funcs: ['console.log'],
      },
      output: {
        // 去掉注释内容
        comments: true,
      },
    },
  },
  plugins: [
    reactRefresh(),
    viteCompression({ ext: '.gz', deleteOriginFile: false }),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    styleImport({
      libs: [
        {
          libraryName: 'antd-mobile',
          base: 'antd-mobile/es/global',
          resolveComponent: (name) => `antd-mobile/es/components/${name}`,
          resolveStyle: () => 'antd-mobile/es/global/global.css',
        },
      ],
    }),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://192.168.31.39:8080',
        changeOrigin: true,
      },
    },
  },
});
