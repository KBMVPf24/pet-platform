# Pet Platform - 宠物综合服务平台

一个全面的宠物周边产品销售和服务平台，涵盖宠物食品、用品、医疗、领养、交易、健康等全方位服务。

## 项目模块

### 1. 电商模块 (E-commerce)
- **宠物食品**: 主粮、零食、营养品
- **宠物用品**: 玩具、窝垫、牵引绳、清洁用品
- **智能推荐**: 根据宠物品种、年龄推荐合适产品

### 2. 服务模块 (Services)
- **宠物医院**: 在线预约、附近医院查询、健康咨询
- **宠物美容**: 预约美容服务、造型选择
- **宠物寄养**: 临时寄养服务预订

### 3. 社区模块 (Community)
- **宠物领养**: 领养信息发布、审核系统
- **宠物交易**: 正规繁育者认证、宠物买卖
- **宠物社交**: 分享宠物日常、经验交流
- **问答专区**: 养宠问题互助解答

### 4. 健康管理 (Health)
- **健康档案**: 记录疫苗、体检、病史
- **健康提醒**: 疫苗、驱虫、体检提醒
- **症状自查**: AI 辅助初步诊断建议
- **在线问诊**: 连接执业兽医

### 5. 特色功能
- **宠物身份证**: 生成宠物电子档案卡片
- **丢失寻找**: 宠物走失信息发布与匹配
- **保险服务**: 宠物医疗保险购买
- **行为训练**: 在线训练课程、专业训导师预约

## 技术栈

### 前端
- React + TypeScript
- Next.js 14 (App Router)
- Tailwind CSS
- Zustand (状态管理)

### 后端
- Node.js + Express / NestJS
- PostgreSQL (主数据库)
- Redis (缓存)
- MongoDB (日志/非结构化数据)

### 移动端
- React Native (iOS/Android)
- 或 Uni-app (跨平台)

### 基础设施
- Docker + Docker Compose
- Nginx (反向代理)
- JWT 认证
- 微信支付/支付宝

## 项目结构

```
pet-platform/
├── frontend/          # Web 前端
├── backend/           # 后端 API
├── mobile/            # 移动端应用
├── docs/              # 文档
├── scripts/           # 部署脚本
└── docker/            # Docker 配置
```

## 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/<username>/pet-platform.git
cd pet-platform

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 启动开发服务
docker-compose up -d
npm run dev
```

## 数据库设计

主要数据表:
- users (用户)
- pets (宠物档案)
- products (商品)
- orders (订单)
- hospitals (医院)
- appointments (预约)
- adoptions (领养)
- health_records (健康记录)
- community_posts (社区帖子)

## API 文档

详见 `/docs/api.md`

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

- 项目 Issues: GitHub Issues
- 邮箱：contact@petplatform.com

---

**让每一只宠物都被温柔以待** 🐾
