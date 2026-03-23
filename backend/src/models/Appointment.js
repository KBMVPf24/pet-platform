const { pool } = require('../config/database');

class Appointment {
  // 创建预约
  static async create({ user_id, pet_id, hospital_id, doctor_name, appointment_time, reason, notes }) {
    const query = `
      INSERT INTO appointments (user_id, pet_id, hospital_id, doctor_name, appointment_time, reason, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [user_id, pet_id, hospital_id, doctor_name, appointment_time, reason, notes];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 获取用户的预约列表
  static async findByUserId(user_id, { status, limit = 20, offset = 0 }) {
    let query = `
      SELECT a.*, 
             p.name as pet_name,
             h.name as hospital_name,
             h.address as hospital_address,
             h.phone as hospital_phone
      FROM appointments a
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.user_id = $1
    `;

    const values = [user_id];
    let idx = 2;

    if (status) {
      values.push(status);
      query += ` AND a.status = $${idx++}`;
    }

    query += ` ORDER BY a.appointment_time DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 根据 ID 获取预约
  static async findById(id) {
    const query = `
      SELECT a.*, 
             p.name as pet_name,
             p.species as pet_species,
             h.name as hospital_name,
             h.address as hospital_address,
             h.phone as hospital_phone,
             h.latitude,
             h.longitude
      FROM appointments a
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 更新预约状态
  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('无效的预约状态');
    }

    const query = `
      UPDATE appointments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // 取消预约
  static async cancel(id) {
    return await Appointment.updateStatus(id, 'cancelled');
  }

  // 确认预约
  static async confirm(id) {
    return await Appointment.updateStatus(id, 'confirmed');
  }

  // 完成预约
  static async complete(id) {
    return await Appointment.updateStatus(id, 'completed');
  }

  // 获取医院的预约列表
  static async findByHospitalId(hospital_id, { date, limit = 20, offset = 0 }) {
    let query = `
      SELECT a.*, 
             u.username,
             u.phone as user_phone,
             p.name as pet_name,
             p.species as pet_species
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      WHERE a.hospital_id = $1
    `;

    const values = [hospital_id];
    let idx = 2;

    if (date) {
      values.push(date);
      query += ` AND DATE(a.appointment_time) = $${idx++}`;
    }

    query += ` ORDER BY a.appointment_time ASC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 检查时间段是否可预约
  static async checkAvailability(hospital_id, appointment_time) {
    const query = `
      SELECT COUNT(*) as count
      FROM appointments
      WHERE hospital_id = $1 
        AND appointment_time = $2
        AND status NOT IN ('cancelled')
    `;
    
    const result = await pool.query(query, [hospital_id, appointment_time]);
    return result.rows[0].count === 0;
  }

  // 获取预约统计
  static async getStats(user_id) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }

  // 获取即将到来的预约
  static async getUpcoming(user_id, days = 7) {
    const query = `
      SELECT a.*, 
             p.name as pet_name,
             h.name as hospital_name,
             h.address as hospital_address
      FROM appointments a
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.user_id = $1 
        AND a.appointment_time >= NOW()
        AND a.appointment_time <= NOW() + INTERVAL '${days} days'
        AND a.status IN ('pending', 'confirmed')
      ORDER BY a.appointment_time ASC
    `;
    
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }
}

module.exports = Appointment;
