const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool, connectMongoDB } = require('./config/database');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// 健康检查接口
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// 根路由
app.get('/api', (req, res) => {
  res.json({
    name: 'Pet Platform API',
    version: '1.0.0',
    description: '宠物综合服务平台后端 API',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      pets: '/api/pets',
      products: '/api/products',
      orders: '/api/orders',
      hospitals: '/api/hospitals',
      appointments: '/api/appointments',
      adoptions: '/api/adoptions',
      community: '/api/community',
      health: '/api/health-records'
    }
  });
});

// 导入路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/adoptions', require('./routes/adoptions'));
app.use('/api/posts', require('./routes/posts'));

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '接口不存在',
    path: req.path
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log('🚀 Pet Platform Backend');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`📅 ${new Date().toISOString()}`);
  
  // 连接 MongoDB
  await connectMongoDB();
});

module.exports = app;
