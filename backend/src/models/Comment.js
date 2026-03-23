const { pool } = require('../config/database');

class Comment {
  // 创建评论
  static async create({ post_id, user_id, content, parent_id }) {
    const query = `
      INSERT INTO comments (post_id, user_id, content, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [post_id, user_id, content, parent_id];
    const result = await pool.query(query, values);
    
    // 更新帖子的评论数
    if (result.rows[0]) {
      const Post = require('./Post');
      await Post.incrementComments(post_id);
    }
    
    return result.rows[0];
  }

  // 获取帖子的评论列表
  static async findByPostId(post_id, { limit = 50, offset = 0 }) {
    const query = `
      SELECT c.*, 
             u.username,
             u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1 AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [post_id, limit, offset]);
    
    // 获取每条评论的子评论
    const comments = result.rows;
    for (const comment of comments) {
      const replies = await Comment.findReplies(comment.id);
      comment.replies = replies;
    }
    
    return comments;
  }

  // 获取子评论
  static async findReplies(parent_id) {
    const query = `
      SELECT c.*, 
             u.username,
             u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = $1
      ORDER BY c.created_at ASC
    `;
    
    const result = await pool.query(query, [parent_id]);
    return result.rows;
  }

  // 根据 ID 获取评论
  static async findById(id) {
    const query = `
      SELECT c.*, 
             u.username,
             u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 更新评论
  static async update(id, content, user_id) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('评论不存在');
    }

    if (comment.user_id !== user_id) {
      throw new Error('无权修改此评论');
    }

    const query = `
      UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [content, id]);
    return result.rows[0];
  }

  // 删除评论
  static async delete(id, user_id) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('评论不存在');
    }

    if (comment.user_id !== user_id) {
      throw new Error('无权删除此评论');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 删除评论
      const result = await client.query(
        'DELETE FROM comments WHERE id = $1 RETURNING *',
        [id]
      );

      // 更新帖子的评论数
      await client.query(
        'UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1',
        [comment.post_id]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 点赞评论
  static async like(id) {
    const query = `
      UPDATE comments 
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
      UPDATE comments 
      SET likes_count = GREATEST(likes_count - 1, 0), updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, likes_count
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 获取用户的评论列表
  static async findByUserId(user_id, limit = 20) {
    const query = `
      SELECT c.*, 
             p.title as post_title,
             p.id as post_id
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [user_id, limit]);
    return result.rows;
  }
}

module.exports = Comment;
