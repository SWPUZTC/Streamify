import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React 核心
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react'
          }
          
          // Ant Design 相关 - 更细粒度分割
          if (id.includes('antd')) {
            return 'antd'
          }
          if (id.includes('@ant-design')) {
            return 'ant-design-patch'
          }
          
          // Stream.io 相关 - 分开处理
          if (id.includes('@stream-io/video-react-sdk')) {
            return 'stream-video'
          }
          if (id.includes('stream-chat-react')) {
            return 'stream-chat-react'
          }
          if (id.includes('stream-chat')) {
            return 'stream-chat'
          }
          
          // 路由相关
          if (id.includes('react-router')) {
            return 'router'
          }
          
          // 状态管理
          if (id.includes('zustand')) {
            return 'state'
          }
          
          // 查询库
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }
          
          // 工具库
          if (id.includes('axios')) {
            return 'http'
          }
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          
          // Tailwind 相关
          if (id.includes('tailwindcss') || id.includes('daisyui')) {
            return 'styles'
          }
          
          // 第三方库统一处理
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // 额外优化
    minify: 'terser',  // 更好的压缩
    sourcemap: false,  // 生产环境不生成 sourcemap
    }
  })
