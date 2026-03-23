# 开发指南

## 项目结构

```
pet-platform/
├── frontend/          # Next.js 前端应用
│   ├── src/
│   │   ├── app/       # App Router 页面
│   │   ├── components/# 可复用组件
│   │   ├── hooks/     # 自定义 Hooks
│   │   ├── store/     # Zustand 状态管理
│   │   └── utils/     # 工具函数
│   └── public/        # 静态资源
├── backend/           # Express 后端 API
│   └── src/
│       ├── controllers/# 控制器
│       ├── models/    # 数据模型
│       ├── routes/    # 路由
│       ├── middleware/# 中间件
│       └── config/    # 配置
├── mobile/            # React Native 移动端
├── docker/            # Docker 配置
│   ├── docker-compose.yml
│   └── init-scripts/  # 数据库初始化脚本
└── docs/              # 项目文档
```

## 快速开始

### 1. 环境准备

确保已安装:
- Node.js >= 18
- Docker & Docker Compose
- Git

### 2. 克隆项目

```bash
git clone https://github.com/<username>/pet-platform.git
cd pet-platform
```

### 3. 启动开发环境

使用 Docker Compose 一键启动所有服务:

```bash
cd docker
docker-compose up -d
```

服务说明:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MongoDB: localhost:27017
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

### 4. 本地开发 (不使用 Docker)

#### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 配置数据库连接
npm install
npm run dev
```

#### 前端

```bash
cd frontend
npm install
npm run dev
```

## API 开发规范

### RESTful 设计

```
GET    /api/resource          # 获取列表
GET    /api/resource/:id      # 获取单个
POST   /api/resource          # 创建
PUT    /api/resource/:id      # 更新
DELETE /api/resource/:id      # 删除
```

### 响应格式

成功:
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

失败:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述"
}
```

### 认证

使用 JWT Token，在 Header 中携带:
```
Authorization: Bearer <token>
```

## 数据库开发

### 迁移

数据库初始化脚本位于 `docker/init-scripts/`

添加新表或修改结构:
1. 创建新的 SQL 文件 (按顺序编号)
2. 重启 PostgreSQL 容器

### 种子数据

创建测试数据:
```bash
cd backend
npm run seed
```

## 前端开发

### 组件开发

遵循以下结构:

```tsx
// src/components/Button/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

### 状态管理

使用 Zustand:

```ts
// src/store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## 测试

### 后端测试

```bash
cd backend
npm test
```

### 前端测试

```bash
cd frontend
npm test
```

## 部署

### 生产环境构建

```bash
# 前端
cd frontend
npm run build

# 后端
cd backend
npm run build
```

### Docker 部署

```bash
cd docker
docker-compose --profile production up -d
```

## 代码规范

### Git Commit 规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

示例:
```bash
git commit -m "feat: 添加宠物健康记录功能"
```

## 常见问题

### 数据库连接失败

检查 Docker 容器状态:
```bash
docker ps
docker logs pet-platform-db
```

### 端口冲突

修改 `docker-compose.yml` 中的端口映射

### 依赖安装失败

清除缓存重试:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)
