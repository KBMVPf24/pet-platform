# 🚀 快速测试指南

## 5 分钟快速启动项目

### 步骤 1: 克隆项目

```bash
git clone https://github.com/KBMVPf24/pet-platform.git
cd pet-platform
```

### 步骤 2: 启动 Docker 服务

```bash
cd docker
docker-compose up -d
```

### 步骤 3: 验证服务

```bash
# 检查容器状态
docker-compose ps

# 查看后端日志
docker-compose logs backend

# 测试 API
curl http://localhost:3000/api
```

预期输出:
```json
{
  "name": "Pet Platform API",
  "version": "1.0.0",
  "description": "宠物综合服务平台后端 API",
  "endpoints": {
    "health": "/api/health",
    "users": "/api/users",
    "pets": "/api/pets",
    "products": "/api/products",
    "orders": "/api/orders",
    "hospitals": "/api/hospitals",
    "appointments": "/api/appointments",
    "adoptions": "/api/adoptions",
    "community": "/api/community",
    "health": "/api/health-records"
  }
}
```

---

## 🧪 API 测试示例

### 1. 用户注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

响应:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功"
}
```

### 2. 用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. 创建宠物档案

```bash
export TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "旺财",
    "species": "dog",
    "breed": "金毛",
    "gender": "male",
    "birth_date": "2022-01-01",
    "color": "金色"
  }'
```

### 4. 获取商品列表

```bash
curl http://localhost:3000/api/products
```

### 5. 搜索商品

```bash
curl "http://localhost:3000/api/products/search?q=猫粮"
```

### 6. 创建订单

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ],
    "shipping_address": {
      "name": "张三",
      "phone": "13800138000",
      "address": "北京市朝阳区 xxx 街道",
      "city": "北京",
      "district": "朝阳区"
    }
  }'
```

### 7. 获取附近医院

```bash
curl "http://localhost:3000/api/hospitals/nearby?latitude=39.9042&longitude=116.4074&limit=5"
```

### 8. 创建医院预约

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pet_id": 1,
    "hospital_id": 1,
    "doctor_name": "李医生",
    "appointment_time": "2024-01-15 10:00:00",
    "reason": "疫苗接种"
  }'
```

### 9. 发布领养信息

```bash
curl -X POST http://localhost:3000/api/adoptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pet_name": "小花",
    "species": "cat",
    "breed": "中华田园猫",
    "age_months": 6,
    "gender": "female",
    "description": "很可爱的小猫，已驱虫",
    "location": "北京市海淀区",
    "requirements": "有稳定工作，科学喂养"
  }'
```

### 10. 发布社区帖子

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "第一次发帖",
    "content": "分享一下我家宠物的日常",
    "category": "share",
    "tags": ["宠物", "日常"]
  }'
```

---

## 🛠️ 常用命令

### Docker 相关

```bash
# 查看所有容器
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

### 数据库相关

```bash
# 连接 PostgreSQL
docker-compose exec postgres psql -U postgres -d pet_platform

# 查看表
\dt

# 查看数据
SELECT * FROM users;

# 退出
\q
```

---

## 📱 前端测试

启动前端开发服务器:

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3001

---

## ❓ 常见问题

### 1. 端口被占用

修改 `docker/docker-compose.yml` 中的端口映射:
```yaml
ports:
  - "3002:3000"  # 修改前面的端口号
```

### 2. Docker 启动失败

```bash
# 查看日志
docker-compose logs

# 重新构建
docker-compose down
docker-compose up -d --build
```

### 3. 数据库连接失败

```bash
# 等待数据库启动
docker-compose logs postgres

# 检查数据库是否就绪
docker-compose exec postgres pg_isready
```

### 4. Node 模块问题

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 下一步

完成快速测试后，可以:

1. 阅读 [API 文档](./docs/API.md) 了解更多接口
2. 查看 [开发指南](./docs/DEVELOPMENT.md) 开始开发
3. 浏览 [示例代码](./backend/src/) 学习实现

---

**祝你使用愉快！** 🐾
