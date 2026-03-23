# 贡献指南

感谢你对 Pet Platform 项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 1. 报告问题

发现 Bug 或有功能建议？请创建 Issue:

- 清晰描述问题
- 提供复现步骤
- 说明预期行为和实际行为
- 附上截图或日志 (如适用)

### 2. 提交代码

#### Fork 项目

```bash
# 在 GitHub 上 Fork 项目
# 然后克隆到本地
git clone https://github.com/<your-username>/pet-platform.git
cd pet-platform

# 添加上游仓库
git remote add upstream https://github.com/<owner>/pet-platform.git
```

#### 创建分支

```bash
# 保持与上游同步
git fetch upstream
git checkout master
git merge upstream/master

# 创建特性分支
git checkout -b feature/your-feature-name
```

分支命名规范:
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 代码重构
- `test/xxx` - 测试相关

#### 开发

```bash
# 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 启动开发环境
cd docker && docker-compose up -d

# 编写代码...
```

#### 提交

```bash
# 添加更改
git add .

# 提交 (遵循 Commit 规范)
git commit -m "feat: 添加 xxx 功能"

# 推送到远程
git push origin feature/your-feature-name
```

#### 创建 Pull Request

1. 在 GitHub 上访问你的 Fork
2. 点击 "Compare & pull request"
3. 填写 PR 描述
4. 等待 Code Review

### 3. Code Review 标准

- 代码风格一致
- 有适当的测试
- 文档已更新
- 没有破坏性变更 (或已标注)

## Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式 (不影响代码运行)
- `refactor`: 重构 (既不是新功能也不是 Bug 修复)
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具变动

### 示例

```bash
feat: 添加宠物健康记录功能

- 创建健康记录数据表
- 实现 CRUD 接口
- 添加疫苗提醒功能

Closes #123
```

```bash
fix: 修复订单金额计算错误

修复了在某些情况下订单总金额计算不正确的问题

Fixes #456
```

## 开发环境设置

详见 [DEVELOPMENT.md](./DEVELOPMENT.md)

## 代码风格

### 后端 (Node.js)

- 使用 ESLint
- 遵循 Airbnb JavaScript Style Guide
- 使用 TypeScript (推荐)

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix
```

### 前端 (React)

- 使用 ESLint + Prettier
- 遵循 React 最佳实践
- 使用 TypeScript

```bash
# 代码检查
npm run lint

# 格式化
npm run format
```

## 测试

### 后端

```bash
cd backend
npm test
npm run test:coverage
```

### 前端

```bash
cd frontend
npm test
npm run test:coverage
```

## 文档

- 代码注释清晰
- 更新相关文档
- API 变更更新 API.md
- 新功能更新 README.md

## 行为准则

- 尊重他人
- 建设性反馈
- 包容和友好
- 专注于技术讨论

## 许可证

提交代码即表示你同意将代码授权给本项目，遵循项目的 MIT 许可证。

## 疑问？

有任何问题欢迎:
- 创建 Issue
- 在 Discussion 中提问
- 联系维护者

---

感谢你的贡献！🎉
