const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 生成 JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET || 'default-secret-change-me',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // 参数验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '用户名、邮箱和密码为必填项'
      });
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: '该邮箱已被注册'
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: 'USERNAME_EXISTS',
        message: '该用户名已被使用'
      });
    }

    // 创建用户
    const user = await User.create({ username, email, password, phone });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: '注册成功'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 参数验证
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '邮箱和密码为必填项'
      });
    }

    // 查找用户
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误'
      });
    }

    // 生成 Token
    const token = generateToken(user);

    // 返回用户信息 (不含密码)
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取当前用户信息
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
  try {
    const { username, phone, avatar_url } = req.body;
    
    const user = await User.update(req.user.id, { username, phone, avatar_url });

    res.json({
      success: true,
      data: { user },
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '当前密码和新密码为必填项'
      });
    }

    // 获取当前用户
    const user = await User.findByEmail(req.user.email);
    
    // 验证当前密码
    const isValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: '当前密码错误'
      });
    }

    // 更新密码
    await User.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取用户列表 (管理员)
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await User.findAll(limit, offset);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 更新用户角色 (管理员)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin', 'vet', 'breeder'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '无效的角色类型'
      });
    }

    const user = await User.updateRole(id, role);

    res.json({
      success: true,
      data: { user },
      message: '角色更新成功'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};
