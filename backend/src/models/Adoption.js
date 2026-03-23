const { pool } = require('../config/database');

class Adoption {
  // 发布领养信息
  static async create({ publisher_id, pet_name, species, breed, age_months, gender, description, photos, location, contact_phone, requirements }) {
    const query = `
      INSERT INTO adoptions (
        publisher_id, pet_name, species, breed, age_months, gender, 
        description, photos, location, contact_phone, requirements
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      publisher_id,
      pet_name,
      species,
      breed,
      age_months,
      gender,
      description,
      photos || [],
      location,
      contact_phone,
      requirements
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 获取领养列表
  static async findAll({ species, breed, gender, location, status, limit = 20, offset = 0 }) {
    let query = 'SELECT * FROM adoptions WHERE 1=1';
    const values = [];
    let idx = 1;

    if (species) {
      values.push(species);
      query += ` AND species = $${idx++}`;
    }

    if (breed) {
      values.push(`%${breed}%`);
      query += ` AND breed ILIKE $${idx++}`;
    }

    if (gender) {
      values.push(gender);
      query += ` AND gender = $${idx++}`;
    }

    if (location) {
      values.push(`%${location}%`);
      query += ` AND location ILIKE $${idx++}`;
    }

    if (status) {
      values.push(status);
      query += ` AND status = $${idx++}`;
    } else {
      // 默认只显示可领养的
      values.push('available');
      query += ` AND status = $${idx++}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 根据 ID 获取领养信息
  static async findById(id) {
    const query = `
      SELECT a.*, 
             u.username as publisher_name,
             u.phone as publisher_phone
      FROM adoptions a
      LEFT JOIN users u ON a.publisher_id = u.id
      WHERE a.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 更新领养状态
  static async updateStatus(id, status) {
    const validStatuses = ['available', 'pending', 'adopted'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('无效的领养状态');
    }

    const query = `
      UPDATE adoptions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // 申请领养
  static async apply(id, user_id, message) {
    // 检查领养信息是否存在
    const adoption = await Adoption.findById(id);
    if (!adoption) {
      throw new Error('领养信息不存在');
    }

    if (adoption.status !== 'available') {
      throw new Error('该宠物当前不可领养');
    }

    // 更新状态为 pending
    return await Adoption.updateStatus(id, 'pending');
  }

  // 确认领养
  static async confirm(id) {
    return await Adoption.updateStatus(id, 'adopted');
  }

  // 取消领养申请
  static async cancel(id) {
    return await Adoption.updateStatus(id, 'available');
  }

  // 删除领养信息
  static async delete(id, user_id) {
    // 检查权限
    const adoption = await Adoption.findById(id);
    if (!adoption) {
      throw new Error('领养信息不存在');
    }

    if (adoption.publisher_id !== user_id) {
      throw new Error('无权删除此领养信息');
    }

    const query = 'DELETE FROM adoptions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 搜索领养信息
  static async search(keyword, limit = 20) {
    const query = `
      SELECT * FROM adoptions
      WHERE pet_name ILIKE $1 
         OR species ILIKE $1 
         OR breed ILIKE $1
         OR description ILIKE $1
      AND status = 'available'
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [`%${keyword}%`, limit]);
    return result.rows;
  }

  // 获取用户的领养发布列表
  static async findByPublisherId(publisher_id) {
    const query = `
      SELECT * FROM adoptions
      WHERE publisher_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [publisher_id]);
    return result.rows;
  }

  // 获取领养统计
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'adopted' THEN 1 END) as adopted,
        COUNT(CASE WHEN species = 'dog' THEN 1 END) as dogs,
        COUNT(CASE WHEN species = 'cat' THEN 1 END) as cats
      FROM adoptions
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Adoption;
