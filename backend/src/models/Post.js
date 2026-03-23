const { pool } = require('../config/database');

class Post {
  // 创建帖子
  static async create({ user_id, pet_id, title, content, images, tags, category }) {
    const query = `
      INSERT INTO posts (user_id, pet_id, title, content, images, tags, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      user_id,
      pet_id,
      title,
      content,
      images || [],
      tags || [],
      category || 'share'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 获取帖子列表
  static async findAll({ category, tag, user_id, search, limit = 20, offset = 0 }) {
    let query = `
      SELECT p.*, 
             u.username,
             u.avatar_url,
             pet.name as pet_name,
             pet.species as pet_species
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN pets pet ON p.pet_id = pet.id
      WHERE 1=1
    `;

    const values = [];
    let idx = 1;

    if (category) {
      values.push(category);
      query += ` AND p.category = $${idx++}`;
    }

    if (tag) {
      values.push(tag);
      query += ` AND $${idx} = ANY(p.tags)`;
      idx++;
    }

    if (user_id) {
      values.push(user_id);
      query += ` AND p.user_id = $${idx++}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${idx++} OR p.content ILIKE $${idx++})`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 根据 ID 获取帖子
  static async findById(id) {
    const query = `
      SELECT p.*, 
             u.username,
             u.avatar_url,
             pet.name as pet_name,
             pet.species as pet_species
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN pets pet ON p.pet_id = pet.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 更新帖子
  static async update(id, data, user_id) {
    // 检查权限
    const post = await Post.findById(id);
    if (!post) {
      throw new Error('帖子不存在');
    }

    if (post.user_id !== user_id) {
      throw new Error('无权修改此帖子');
    }

    const allowedFields = ['title', 'content', 'images', 'tags', 'category'];
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'images' || key === 'tags') {
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
      UPDATE posts 
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 删除帖子
  static async delete(id, user_id) {
    const post = await Post.findById(id);
    if (!post) {
      throw new Error('帖子不存在');
    }

    if (post.user_id !== user_id) {
      throw new Error('无权删除此帖子');
    }

    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 点赞帖子
  static async like(id) {
    const query = `
      UPDATE posts 
      SET likes_count = likes_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, likes_count
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 取消点赞
  static async unlike(id) {
    const query = `
      UPDATE posts 
      SET likes_count = GREATEST(likes_count - 1, 0), updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, likes_count
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 增加评论数
  static async incrementComments(id, delta = 1) {
    const query = `
      UPDATE posts 
      SET comments_count = comments_count + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, comments_count
    `;
    
    const result = await pool.query(query, [delta, id]);
    return result.rows[0];
  }

  // 增加浏览量
  static async incrementViews(id) {
    const query = `
      UPDATE posts 
      SET views_count = views_count + 1
      WHERE id = $1
      RETURNING id, views_count
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 获取热门帖子
  static async getHot(limit = 10) {
    const query = `
      SELECT p.*, 
             u.username,
             u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.created_at > NOW() - INTERVAL '7 days'
      ORDER BY (p.likes_count * 2 + p.comments_count * 3 + p.views_count) DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // 获取置顶帖子
  static async getPinned() {
    const query = `
      SELECT p.*, 
             u.username,
             u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_pinned = true
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // 搜索帖子
  static async search(keyword, limit = 20) {
    const query = `
      SELECT p.*, 
             u.username,
             ts_rank(to_tsvector('simple', p.title || ' ' || p.content), plainto_tsquery('simple', $1)) as rank
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE to_tsvector('simple', p.title || ' ' || p.content) @@ plainto_tsquery('simple', $1)
      ORDER BY rank DESC, p.created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [keyword, limit]);
    return result.rows;
  }
}

module.exports = Post;
