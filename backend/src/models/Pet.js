const { pool } = require('../config/database');

class Pet {
  // 创建宠物档案
  static async create({ user_id, name, species, breed, gender, birth_date, weight, color, microchip_id, photo_url, is_neutered }) {
    const query = `
      INSERT INTO pets (user_id, name, species, breed, gender, birth_date, weight, color, microchip_id, photo_url, is_neutered)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [user_id, name, species, breed, gender, birth_date, weight, color, microchip_id, photo_url, is_neutered];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 获取用户的宠物列表
  static async findByUserId(user_id) {
    const query = 'SELECT * FROM pets WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  // 根据 ID 获取宠物
  static async findById(id) {
    const query = 'SELECT * FROM pets WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 更新宠物信息
  static async update(id, updates) {
    const allowedFields = ['name', 'species', 'breed', 'gender', 'birth_date', 'weight', 'color', 'microchip_id', 'photo_url', 'is_neutered'];
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE pets 
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 删除宠物
  static async delete(id) {
    const query = 'DELETE FROM pets WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 搜索宠物 (用于领养等)
  static async search({ species, breed, gender, age_range, location }, limit = 20, offset = 0) {
    let query = 'SELECT * FROM pets WHERE 1=1';
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

    values.push(limit);
    values.push(offset);
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 获取宠物统计信息
  static async getStats(user_id) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN species = 'dog' THEN 1 END) as dogs,
        COUNT(CASE WHEN species = 'cat' THEN 1 END) as cats,
        COUNT(CASE WHEN is_neutered = true THEN 1 END) as neutered
      FROM pets
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }
}

module.exports = Pet;
