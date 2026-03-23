const Product = require('../models/Product');

// 创建商品 (管理员/商家)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category_id, price, original_price, stock, images, brand, specifications } = req.body;

    if (!name || !category_id || !price) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '商品名称、分类和价格为必填项'
      });
    }

    const product = await Product.create({
      name,
      description,
      category_id,
      price,
      original_price,
      stock,
      images,
      brand,
      specifications
    });

    res.status(201).json({
      success: true,
      data: { product },
      message: '商品创建成功'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取商品列表
exports.getProducts = async (req, res) => {
  try {
    const { 
      category_id, 
      min_price, 
      max_price, 
      brand, 
      search, 
      sort, 
      order, 
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;

    const products = await Product.findAll({
      category_id: category_id ? parseInt(category_id) : null,
      min_price: min_price ? parseFloat(min_price) : undefined,
      max_price: max_price ? parseFloat(max_price) : undefined,
      brand,
      search,
      sort,
      order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取商品详情
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '商品不存在'
      });
    }

    if (!product.is_active) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '商品已下架'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 更新商品 (管理员/商家)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.update(id, updates);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      data: { product },
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 删除商品 (软删除)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.delete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '商品已下架'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 搜索商品
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '搜索关键词不能为空'
      });
    }

    const products = await Product.search(q, parseInt(limit));

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};
