const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

// 获取医院列表
exports.getHospitals = async (req, res) => {
  try {
    const { latitude, longitude, radius, services, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const hospitals = await Hospital.findAll({
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      radius: radius ? parseFloat(radius) : 10,
      services: services ? services.split(',') : null,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        hospitals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取医院详情
exports.getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '医院不存在'
      });
    }

    res.json({
      success: true,
      data: { hospital }
    });
  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 创建医院 (管理员)
exports.createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      success: true,
      data: { hospital },
      message: '医院创建成功'
    });
  } catch (error) {
    console.error('Create hospital error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 更新医院 (管理员)
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.update(id, req.body);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '医院不存在'
      });
    }

    res.json({
      success: true,
      data: { hospital },
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update hospital error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 搜索医院
exports.searchHospitals = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '搜索关键词不能为空'
      });
    }

    const hospitals = await Hospital.search(q, parseInt(limit));

    res.json({
      success: true,
      data: { hospitals }
    });
  } catch (error) {
    console.error('Search hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取附近医院
exports.getNearbyHospitals = async (req, res) => {
  try {
    const { latitude, longitude, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '需要提供经纬度坐标'
      });
    }

    const hospitals = await Hospital.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: { hospitals }
    });
  } catch (error) {
    console.error('Get nearby hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};
