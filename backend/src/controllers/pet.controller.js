const Pet = require('../models/Pet');

// 创建宠物档案
exports.createPet = async (req, res) => {
  try {
    const { name, species, breed, gender, birth_date, weight, color, microchip_id, photo_url, is_neutered } = req.body;

    // 参数验证
    if (!name || !species) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '宠物名称和物种为必填项'
      });
    }

    const pet = await Pet.create({
      user_id: req.user.id,
      name,
      species,
      breed,
      gender,
      birth_date,
      weight,
      color,
      microchip_id,
      photo_url,
      is_neutered
    });

    res.status(201).json({
      success: true,
      data: { pet },
      message: '宠物档案创建成功'
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取用户的宠物列表
exports.getUserPets = async (req, res) => {
  try {
    const pets = await Pet.findByUserId(req.user.id);

    res.json({
      success: true,
      data: { pets }
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取宠物详情
exports.getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '宠物不存在'
      });
    }

    // 检查权限：只能查看自己的宠物
    if (pet.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权查看此宠物信息'
      });
    }

    res.json({
      success: true,
      data: { pet }
    });
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 更新宠物信息
exports.updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 检查宠物是否存在且属于当前用户
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '宠物不存在'
      });
    }

    if (pet.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权修改此宠物信息'
      });
    }

    const updatedPet = await Pet.update(id, updates);

    res.json({
      success: true,
      data: { pet: updatedPet },
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 删除宠物
exports.deletePet = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查宠物是否存在且属于当前用户
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '宠物不存在'
      });
    }

    if (pet.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权删除此宠物'
      });
    }

    await Pet.delete(id);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取宠物统计
exports.getPetStats = async (req, res) => {
  try {
    const stats = await Pet.getStats(req.user.id);

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
