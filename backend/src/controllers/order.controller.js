const Order = require('../models/Order');

// 创建订单
exports.createOrder = async (req, res) => {
  try {
    const { items, shipping_address } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '订单商品不能为空'
      });
    }

    if (!shipping_address || !shipping_address.name || !shipping_address.phone || !shipping_address.address) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '收货地址信息不完整'
      });
    }

    const order = await Order.create(req.user.id, items, shipping_address);

    res.status(201).json({
      success: true,
      data: { order },
      message: '订单创建成功'
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.message.includes('不存在') || error.message.includes('库存不足')) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取订单列表
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await Order.findByUserId(req.user.id, {
      status,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取订单详情
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '订单不存在'
      });
    }

    // 检查权限
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权查看此订单'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 取消订单
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查订单权限
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '订单不存在'
      });
    }

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权操作此订单'
      });
    }

    await Order.cancel(id);

    res.json({
      success: true,
      message: '订单已取消'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    
    if (error.message.includes('只能取消')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 支付订单
exports.payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '支付方式不能为空'
      });
    }

    // 检查订单权限
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '订单不存在'
      });
    }

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权操作此订单'
      });
    }

    const updatedOrder = await Order.pay(id, payment_method);

    res.json({
      success: true,
      data: { order: updatedOrder },
      message: '支付成功'
    });
  } catch (error) {
    console.error('Pay order error:', error);
    
    if (error.message.includes('状态不允许')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: '订单状态不允许支付'
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 确认收货
exports.completeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '订单不存在'
      });
    }

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权操作此订单'
      });
    }

    await Order.complete(id);

    res.json({
      success: true,
      message: '订单已完成'
    });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取订单统计
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getStats(req.user.id);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};
