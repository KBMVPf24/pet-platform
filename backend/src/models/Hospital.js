const { pool } = require('../config/database');

class Hospital {
  // 创建医院
  static async create(data) {
    const query = `
      INSERT INTO hospitals (
        name, address, phone, latitude, longitude, 
        business_hours, services, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      data.name,
      data.address,
      data.phone,
      data.latitude,
      data.longitude,
      JSON.stringify(data.business_hours || {}),
      data.services || [],
      data.is_verified || false
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 获取医院列表 (支持地理位置搜索)
  static async findAll({ latitude, longitude, radius = 10, services, limit = 20, offset = 0 }) {
    let query = `
      SELECT *, 
             CASE 
               WHEN $1 IS NOT NULL AND $2 IS NOT NULL THEN
                 ROUND((
                   6371 * acos(
                     cos(radians($1)) * cos(radians(latitude)) * 
                     cos(radians(longitude) - radians($2)) + 
                     sin(radians($1)) * sin(radians(latitude))
                   )
                 )::numeric, 2)
               ELSE NULL
             END as distance
      FROM hospitals
      WHERE 1=1
    `;

    const values = [latitude, longitude];
    let idx = 3;

    // 距离过滤
    if (latitude && longitude) {
      query += ` 
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        ) <= $${idx++}
      `;
      values.push(radius);
    }

    // 服务过滤
    if (services) {
      query += ` AND services && $${idx++}`;
      values.push(services);
    }

    query += ` ORDER BY distance ASC NULLS LAST, rating DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 根据 ID 获取医院
  static async findById(id) {
    const query = 'SELECT * FROM hospitals WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 更新医院信息
  static async update(id, data) {
    const allowedFields = ['name', 'address', 'phone', 'latitude', 'longitude', 'business_hours', 'services', 'is_verified'];
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'business_hours') {
          fields.push(`${key} = $${idx}::jsonb`);
        } else if (key === 'services') {
          fields.push(`${key} = $${idx}::text[]`);
        } else {
          fields.push(`${key} = $${idx}`);
        }
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE hospitals 
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 更新医院评分
  static async addRating(id, rating) {
    const query = `
      UPDATE hospitals 
      SET rating = ((rating * 10) + $1) / 11,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, rating
    `;
    
    const result = await pool.query(query, [rating, id]);
    return result.rows[0];
  }

  // 搜索医院
  static async search(keyword, limit = 20) {
    const query = `
      SELECT * FROM hospitals
      WHERE name ILIKE $1 OR address ILIKE $1
      ORDER BY rating DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [`%${keyword}%`, limit]);
    return result.rows;
  }

  // 获取附近医院 (简化版)
  static async findNearby(latitude, longitude, limit = 10) {
    const query = `
      SELECT *, 
        ROUND((
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        )::numeric, 2) as distance
      FROM hospitals
      ORDER BY distance ASC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [latitude, longitude, limit]);
    return result.rows;
  }
}

module.exports = Hospital;
