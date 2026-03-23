const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // 创建用户
  static async create({ username, email, password, phone }) {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, email, password_hash, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, phone, avatar_url, role, created_at
    `;
    
    const values = [username, email, passwordHash, phone];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // 根据用户名查找用户
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // 根据 ID 查找用户
  static async findById(id) {
    const query = `
      SELECT id, username, email, phone, avatar_url, role, created_at
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 验证密码
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 更新用户信息
  static async update(id, { username, phone, avatar_url }) {
    const query = `
      UPDATE users 
      SET username = COALESCE($1, username),
          phone = COALESCE($2, phone),
          avatar_url = COALESCE($3, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, username, email, phone, avatar_url, role, created_at
    `;
    
    const values = [username, phone, avatar_url, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 更新密码
  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;
    
    await pool.query(query, [passwordHash, id]);
  }

  // 获取用户列表 (管理员)
  static async findAll(limit = 20, offset = 0) {
    const query = `
      SELECT id, username, email, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // 更新用户角色
  static async updateRole(id, role) {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, role
    `;
    
    const result = await pool.query(query, [role, id]);
    return result.rows[0];
  }
}

module.exports = User;
