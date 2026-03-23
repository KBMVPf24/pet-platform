const { pool } = require('../config/database');

class Product {
  // 创建商品
  static async create(data) {
    const query = `
      INSERT INTO products (
        name, description, category_id, price, original_price, 
        stock, images, brand, specifications
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      data.name,
      data.description,
      data.category_id,
      data.price,
      data.original_price,
      data.stock || 0,
      data.images || [],
      data.brand,
      JSON.stringify(data.specifications || {})
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 获取商品列表 (支持分页、筛选、排序)
  static async findAll({ category_id, min_price, max_price, brand, search, sort = 'created_at', order = 'DESC', limit = 20, offset = 0 }) {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    
    const values = [];
    let idx = 1;

    if (category_id) {
      values.push(category_id);
      query += ` AND p.category_id = $${idx++}`;
    }

    if (min_price !== undefined) {
      values.push(min_price);
      query += ` AND p.price >= $${idx++}`;
    }

    if (max_price !== undefined) {
      values.push(max_price);
      query += ` AND p.price <= $${idx++}`;
    }

    if (brand) {
      values.push(brand);
      query += ` AND p.brand = $${idx++}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${idx++} OR p.description ILIKE $${idx++})`;
    }

    // 排序
    const validSorts = ['price', 'sales_count', 'rating', 'created_at'];
    if (!validSorts.includes(sort)) sort = 'created_at';
    
    const validOrders = ['ASC', 'DESC'];
    if (!validOrders.includes(order)) order = 'DESC';
    
    query += ` ORDER BY p.${sort} ${order}`;
    
    values.push(limit);
    values.push(offset);
    query += ` LIMIT $${idx++} OFFSET $${idx++}`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 获取商品详情
  static async findById(id) {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 更新商品
  static async update(id, data) {
    const allowedFields = ['name', 'description', 'category_id', 'price', 'original_price', 'stock', 'images', 'brand', 'specifications', 'is_active'];
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'specifications') {
          fields.push(`${key} = $${idx}::jsonb`);
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
      UPDATE products 
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 删除商品 (软删除)
  static async delete(id) {
    return await Product.update(id, { is_active: false });
  }

  // 更新库存
  static async updateStock(id, quantity) {
    const query = `
      UPDATE products 
      SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, stock
    `;
    
    const result = await pool.query(query, [quantity, id]);
    return result.rows[0];
  }

  // 增加销量
  static async incrementSales(id, quantity) {
    const query = `
      UPDATE products 
      SET sales_count = sales_count + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, sales_count
    `;
    
    const result = await pool.query(query, [quantity, id]);
    return result.rows[0];
  }

  // 商品评分
  static async addRating(id, rating) {
    const query = `
      UPDATE products 
      SET rating = ((rating * sales_count) + $1) / (sales_count + 1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, rating
    `;
    
    const result = await pool.query(query, [rating, id]);
    return result.rows[0];
  }

  // 搜索商品
  static async search(keyword, limit = 20) {
    const query = `
      SELECT p.*, c.name as category_name,
             ts_rank(to_tsvector('simple', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('simple', $1)) as rank
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
        AND (p.name ILIKE $2 OR p.description ILIKE $2)
      ORDER BY rank DESC, sales_count DESC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [keyword, `%${keyword}%`, limit]);
    return result.rows;
  }

  // 获取分类商品数量
  static async countByCategory(category_id) {
    const query = `
      SELECT COUNT(*) as count
      FROM products
      WHERE category_id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [category_id]);
    return result.rows[0].count;
  }
}

module.exports = Product;
