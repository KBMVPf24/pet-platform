# API 文档

## 基础信息

- Base URL: `http://localhost:3000/api`
- 认证方式：JWT Bearer Token
- 数据格式：JSON

## 模块概览

- **认证模块** `/api/auth` - 用户注册、登录、个人信息管理
- **宠物模块** `/api/pets` - 宠物档案管理
- **商品模块** `/api/products` - 商品浏览、搜索、管理
- **订单模块** `/api/orders` - 订单创建、支付、管理
- **医院模块** `/api/hospitals` - 医院查询、地理位置搜索
- **预约模块** `/api/appointments` - 医院预约管理
- **领养模块** `/api/adoptions` - 领养信息发布、申请
- **社区模块** `/api/posts` - 帖子发布、评论、互动

## 认证接口

### 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string" (optional)
}
```

响应:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "string",
      "email": "string"
    },
    "token": "jwt_token"
  }
}
```

### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### 获取当前用户

```http
GET /api/auth/me
Authorization: Bearer <token>
```

## 宠物管理

### 创建宠物档案

```http
POST /api/pets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "species": "dog|cat|bird|etc",
  "breed": "string",
  "gender": "male|female",
  "birthDate": "YYYY-MM-DD",
  "weight": 0,
  "color": "string"
}
```

### 获取宠物列表

```http
GET /api/pets
Authorization: Bearer <token>
```

### 获取宠物详情

```http
GET /api/pets/:id
Authorization: Bearer <token>
```

### 更新宠物信息

```http
PUT /api/pets/:id
Authorization: Bearer <token>
```

### 删除宠物

```http
DELETE /api/pets/:id
Authorization: Bearer <token>
```

## 商品管理

### 获取商品列表

```http
GET /api/products
Query Parameters:
  - category: 分类 ID
  - page: 页码 (default: 1)
  - limit: 每页数量 (default: 20)
  - sort: 排序 (price_asc|price_desc|sales|newest)
```

### 获取商品详情

```http
GET /api/products/:id
```

### 创建商品 (管理员)

```http
POST /api/products
Authorization: Bearer <token>
```

### 更新商品 (管理员)

```http
PUT /api/products/:id
Authorization: Bearer <token>
```

## 订单管理

### 创建订单

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "district": "string"
  }
}
```

### 获取订单列表

```http
GET /api/orders
Authorization: Bearer <token>
```

### 获取订单详情

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### 取消订单

```http
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

## 医院服务

### 获取医院列表

```http
GET /api/hospitals
Query Parameters:
  - latitude: 纬度
  - longitude: 经度
  - radius: 搜索半径 (km)
```

### 创建预约

```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "petId": 1,
  "hospitalId": 1,
  "doctorName": "string",
  "appointmentTime": "YYYY-MM-DD HH:mm",
  "reason": "string"
}
```

### 获取预约列表

```http
GET /api/appointments
Authorization: Bearer <token>
```

### 取消预约

```http
POST /api/appointments/:id/cancel
Authorization: Bearer <token>
```

## 领养服务

### 发布领养信息

```http
POST /api/adoptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "petName": "string",
  "species": "dog|cat",
  "breed": "string",
  "ageMonths": 12,
  "gender": "male|female",
  "description": "string",
  "location": "string",
  "requirements": "string"
}
```

### 获取领养列表

```http
GET /api/adoptions
Query Parameters:
  - species: 物种
  - status: available|pending|adopted
  - location: 地区
```

### 申请领养

```http
POST /api/adoptions/:id/apply
Authorization: Bearer <token>
```

## 健康记录

### 创建健康记录

```http
POST /api/health-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "petId": 1,
  "recordType": "vaccine|checkup|treatment|deworming",
  "title": "string",
  "description": "string",
  "recordDate": "YYYY-MM-DD",
  "nextDate": "YYYY-MM-DD"
}
```

### 获取健康记录

```http
GET /api/health-records
Authorization: Bearer <token>
Query Parameters:
  - petId: 宠物 ID
```

## 社区功能

### 发布帖子

```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "category": "share|question|adoption_lost",
  "tags": ["string"]
}
```

### 获取帖子列表

```http
GET /api/posts
Query Parameters:
  - category: 分类
  - page: 页码
  - limit: 每页数量
```

### 点赞帖子

```http
POST /api/posts/:id/like
Authorization: Bearer <token>
```

### 发表评论

```http
POST /api/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string",
  "parentId": null (可选，回复评论时使用)
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

## 限流

- 普通接口：100 次/分钟
- 认证接口：10 次/分钟
- 上传接口：20 次/分钟
