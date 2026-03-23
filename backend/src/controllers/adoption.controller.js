const Adoption = require('../models/Adoption');

// 发布领养信息
exports.createAdoption = async (req, res) => {
  try {
    const { pet_name, species, breed, age_months, gender, description, photos, location, contact_phone, requirements } = req.body;

    if (!pet_name || !species || !location) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '宠物名称、物种和地点为必填项'
      });
    }

    const adoption = await Adoption.create({
      publisher_id: req.user.id,
      pet_name,
      species,
      breed,
      age_months,
      gender,
      description,
      photos,
      location,
      contact_phone,
      requirements
    });

    res.status(201).json({
      success: true,
      data: { adoption },
      message: '领养信息发布成功'
    });
  } catch (error) {
    console.error('Create adoption error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取领养列表
exports.getAdoptions = async (req, res) => {
  try {
    const { species, breed, gender, location, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const adoptions = await Adoption.findAll({
      species,
      breed,
      gender,
      location,
      status,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        adoptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get adoptions error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取领养详情
exports.getAdoptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const adoption = await Adoption.findById(id);

    if (!adoption) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '领养信息不存在'
      });
    }

    res.json({
      success: true,
      data: { adoption }
    });
  } catch (error) {
    console.error('Get adoption error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 申请领养
exports.applyAdoption = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    await Adoption.apply(id, req.user.id, message);

    res.json({
      success: true,
      message: '领养申请已提交，等待审核'
    });
  } catch (error) {
    console.error('Apply adoption error:', error);
    
    if (error.message.includes('不存在') || error.message.includes('不可领养')) {
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

// 确认领养 (发布者)
exports.confirmAdoption = async (req, res) => {
  try {
    const { id } = req.params;

    const adoption = await Adoption.findById(id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '领养信息不存在'
      });
    }

    if (adoption.publisher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权操作此领养信息'
      });
    }

    await Adoption.confirm(id);

    res.json({
      success: true,
      message: '领养已确认'
    });
  } catch (error) {
    console.error('Confirm adoption error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 取消领养申请
exports.cancelAdoption = async (req, res) => {
  try {
    const { id } = req.params;

    const adoption = await Adoption.findById(id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '领养信息不存在'
      });
    }

    if (adoption.publisher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权操作此领养信息'
      });
    }

    await Adoption.cancel(id);

    res.json({
      success: true,
      message: '领养申请已取消'
    });
  } catch (error) {
    console.error('Cancel adoption error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 删除领养信息
exports.deleteAdoption = async (req, res) => {
  try {
    const { id } = req.params;

    await Adoption.delete(id, req.user.id);

    res.json({
      success: true,
      message: '领养信息已删除'
    });
  } catch (error) {
    console.error('Delete adoption error:', error);
    
    if (error.message.includes('不存在') || error.message.includes('无权')) {
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

// 搜索领养信息
exports.searchAdoptions = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '搜索关键词不能为空'
      });
    }

    const adoptions = await Adoption.search(q, parseInt(limit));

    res.json({
      success: true,
      data: { adoptions }
    });
  } catch (error) {
    console.error('Search adoptions error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取用户的领养发布列表
exports.getMyAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.findByPublisherId(req.user.id);

    res.json({
      success: true,
      data: { adoptions }
    });
  } catch (error) {
    console.error('Get my adoptions error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取领养统计
exports.getAdoptionStats = async (req, res) => {
  try {
    const stats = await Adoption.getStats();

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
