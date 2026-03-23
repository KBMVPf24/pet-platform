const Appointment = require('../models/Appointment');

// 创建预约
exports.createAppointment = async (req, res) => {
  try {
    const { pet_id, hospital_id, doctor_name, appointment_time, reason, notes } = req.body;

    if (!pet_id || !hospital_id || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '宠物、医院和预约时间为必填项'
      });
    }

    // 检查时间段是否可预约
    const available = await Appointment.checkAvailability(hospital_id, appointment_time);
    if (!available) {
      return res.status(409).json({
        success: false,
        error: 'TIME_SLOT_UNAVAILABLE',
        message: '该时间段已被预约'
      });
    }

    const appointment = await Appointment.create({
      user_id: req.user.id,
      pet_id,
      hospital_id,
      doctor_name,
      appointment_time,
      reason,
      notes
    });

    res.status(201).json({
      success: true,
      data: { appointment },
      message: '预约创建成功'
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取用户的预约列表
exports.getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const appointments = await Appointment.findByUserId(req.user.id, {
      status,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取预约详情
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '预约不存在'
      });
    }

    // 检查权限
    if (appointment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权查看此预约'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 取消预约
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '预约不存在'
      });
    }

    if (appointment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '无权操作此预约'
      });
    }

    await Appointment.cancel(id);

    res.json({
      success: true,
      message: '预约已取消'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 确认预约 (医院端)
exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    await Appointment.confirm(id);

    res.json({
      success: true,
      message: '预约已确认'
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 完成预约 (医院端)
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    await Appointment.complete(id);

    res.json({
      success: true,
      message: '预约已完成'
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取预约统计
exports.getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.getStats(req.user.id);

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

// 获取即将到来的预约
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const appointments = await Appointment.getUpcoming(req.user.id, parseInt(days));

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};
