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
        manualChunks: {
          // 核心框架
          vendor: ['react', 'react-dom'],
          
          // UI 组件库
          antd: ['antd', '@ant-design/v5-patch-for-react-19'],
          
          // 流媒体功能
          stream: ['@stream-io/video-react-sdk', 'stream-chat', 'stream-chat-react'],
          
          // 路由和状态管理
          router: ['react-router-dom', 'zustand'],
          
          // 工具库
          utils: ['axios', 'lucide-react', 'react-hot-toast'],
          
          // 查询和样式
          query: ['@tanstack/react-query', 'tailwindcss']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    
    // 额外优化
    minify: 'terser',  // 更好的压缩
    sourcemap: false,  // 生产环境不生成 sourcemap
  }
})
