# 🐾 Pet Platform - 宠物综合服务平台

**一个全面的宠物周边产品销售和服务平台**

[English](./README.md) | 简体中文

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14-blue.svg)](https://www.postgresql.org/)

---

## 🎯 项目简介

Pet Platform 致力于为爱宠人士提供一站式服务，涵盖:

- 🛍️ **宠物电商** - 食品、用品、智能推荐
- 🏥 **医疗服务** - 医院预约、健康咨询
- 🏠 **领养中心** - 流浪动物领养
- 💬 **宠物社区** - 分享交流、经验互助
- 📊 **健康管理** - 电子档案、疫苗提醒

---

## ✨ 核心功能

### 1. 电商模块
- ✅ 商品浏览和搜索
- ✅ 商品分类管理
- ✅ 购物车和订单系统
- ✅ 订单支付和物流跟踪
- ✅ 库存管理

### 2. 医疗服务
- ✅ 附近医院查询 (基于地理位置)
- ✅ 在线预约
- ✅ 预约管理
- ✅ 健康档案

### 3. 领养中心
- ✅ 领养信息发布
- ✅ 领养申请流程
- ✅ 状态跟踪
- ✅ 领养故事分享

### 4. 宠物社区
- ✅ 帖子发布和浏览
- ✅ 评论和回复
- ✅ 点赞互动
- ✅ 热门帖子
- ✅ 标签系统

### 5. 健康管理
- ✅ 宠物档案
- ✅ 疫苗记录
- ✅ 体检记录
- ✅ 健康提醒

---

## 🛠️ 技术栈

### 后端
- **框架**: Express.js
- **数据库**: PostgreSQL 14 (主库) + MongoDB 7 (日志)
- **缓存**: Redis 7
- **认证**: JWT
- **语言**: JavaScript/Node.js

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand

### 运维
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Docker & Docker Compose

### 一键启动 (推荐)

```bash
# 克隆项目
git clone https://github.com/KBMVPf24/pet-platform.git
cd pet-platform/docker

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 访问服务
# 前端：http://localhost:3001
# 后端 API: http://localhost:3000
# API 文档：http://localhost:3000/api
```

### 本地开发

```bash
# 后端
cd backend
cp .env.example .env
npm install
npm run dev

# 前端
cd frontend
npm install
npm run dev
```

---

## 📁 项目结构

```
pet-platform/
├── backend/              # 后端 API
│   ├── src/
│   │   ├── controllers/  # 控制器 (9 个模块)
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   └── middleware/   # 中间件
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── app/         # Next.js 页面
│   │   ├── components/  # 组件
│   │   └── store/       # 状态管理
│   └── package.json
├── docker/              # Docker 配置
│   ├── docker-compose.yml
│   └── init-scripts/
└── docs/                # 文档
    ├── API.md
    ├── DEVELOPMENT.md
    └── CONTRIBUTING.md
```

---

## 📊 数据库设计

已创建 **12 个核心数据表**:

1. users - 用户
2. pets - 宠物档案
3. categories - 商品分类
4. products - 商品
5. orders - 订单
6. order_items - 订单明细
7. hospitals - 宠物医院
8. appointments - 预约
9. adoptions - 领养信息
10. health_records - 健康记录
11. posts - 社区帖子
12. comments - 评论

详见：[数据库初始化脚本](./docker/init-scripts/01-init.sql)

---

## 🔌 API 接口

### 认证模块
```bash
POST /api/auth/register    # 注册
POST /api/auth/login       # 登录
GET  /api/auth/me          # 获取当前用户
```

### 宠物模块
```bash
POST /api/pets             # 创建宠物
GET  /api/pets             # 获取宠物列表
GET  /api/pets/:id         # 宠物详情
PUT  /api/pets/:id         # 更新宠物
DELETE /api/pets/:id       # 删除宠物
```

### 商品模块
```bash
GET  /api/products         # 商品列表
GET  /api/products/search  # 搜索商品
GET  /api/products/:id     # 商品详情
```

### 订单模块
```bash
POST /api/orders          # 创建订单
GET  /api/orders          # 订单列表
POST /api/orders/:id/pay  # 支付订单
```

### 医院模块
```bash
GET  /api/hospitals       # 医院列表
GET  /api/hospitals/nearby # 附近医院
GET  /api/hospitals/:id   # 医院详情
```

### 预约模块
```bash
POST /api/appointments           # 创建预约
GET  /api/appointments           # 预约列表
POST /api/appointments/:id/cancel # 取消预约
```

### 领养模块
```bash
GET  /api/adoptions         # 领养列表
POST /api/adoptions         # 发布领养
POST /api/adoptions/:id/apply # 申请领养
```

### 社区模块
```bash
GET  /api/posts             # 帖子列表
POST /api/posts             # 发布帖子
GET  /api/posts/:id         # 帖子详情
POST /api/posts/:id/like    # 点赞
POST /api/posts/:id/comments # 评论
```

**完整 API 文档**: [docs/API.md](./docs/API.md)

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [API 文档](./docs/API.md) | 完整的接口文档 |
| [开发指南](./docs/DEVELOPMENT.md) | 环境设置、开发规范 |
| [贡献指南](./docs/CONTRIBUTING.md) | 如何贡献代码 |
| [路线图](./docs/ROADMAP.md) | 开发计划 |
| [完成报告](./DEVELOPMENT_COMPLETE.md) | 开发完成总结 |

---

## 🤝 如何贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详见 [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📝 开发计划

### 已完成 ✅
- [x] 项目基础架构
- [x] 用户认证系统
- [x] 宠物档案管理
- [x] 商品和订单系统
- [x] 医院和预约系统
- [x] 领养功能
- [x] 社区功能

### 进行中 🚧
- [ ] 前端页面开发
- [ ] 支付集成

### 计划中 📋
- [ ] 移动端应用
- [ ] AI 智能推荐
- [ ] 宠物保险
- [ ] 行为训练课程

---

## 📧 联系方式

- **项目地址**: https://github.com/KBMVPf24/pet-platform
- **问题反馈**: https://github.com/KBMVPf24/pet-platform/issues

---

## 📄 许可证

MIT License

---

**让每一只宠物都被温柔以待** 🐾
