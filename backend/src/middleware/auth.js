const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从 Header 获取 Token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.split(' ')[1];

    // 验证 Token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'default-secret-change-me'
    );

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: '认证令牌已过期'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '无效的认证令牌'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 角色授权中间件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未认证'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '权限不足'
      });
    }

    next();
  };
};

// 可选认证 (有 token 则验证，没有也继续)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default-secret-change-me'
      );
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Token 无效时忽略，继续执行
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
