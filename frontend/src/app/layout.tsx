import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pet Platform - 宠物综合服务平台',
  description: '一站式宠物服务：食品用品、医疗健康、领养交易、社区交流',
  keywords: '宠物，宠物食品，宠物用品，宠物医院，宠物领养，宠物健康',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
