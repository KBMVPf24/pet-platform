const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Product = require('./Product');

class Order {
  // 创建订单
  static async create(user_id, items, shipping_address) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 生成订单号
      const order_no = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // 计算总金额
      let total_amount = 0;

      // 验证商品并计算总价
      for (const item of items) {
        const product = await client.query(
          'SELECT id, price, stock FROM products WHERE id = $1 AND is_active = true',
          [item.product_id]
        );

        if (product.rows.length === 0) {
          throw new Error(`商品 ${item.product_id} 不存在或已下架`);
        }

        if (product.rows[0].stock < item.quantity) {
          throw new Error(`商品 ${item.product_id} 库存不足`);
        }

        total_amount += product.rows[0].price * item.quantity;
      }

      // 创建订单
      const orderQuery = `
        INSERT INTO orders (order_no, user_id, total_amount, shipping_address)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const orderResult = await client.query(orderQuery, [
        order_no,
        user_id,
        total_amount,
        JSON.stringify(shipping_address)
      ]);

      const order = orderResult.rows[0];

      // 创建订单明细并更新库存
      for (const item of items) {
        // 插入订单明细
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.price || product.rows[0].price]
        );

        // 更新库存
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');

      // 返回完整订单信息
      return await Order.findById(order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 获取订单详情
  static async findById(id) {
    const query = `
      SELECT o.*, 
             jsonb_agg(
               jsonb_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product_name', p.name,
                 'product_image', p.images[1]
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 获取用户订单列表
  static async findByUserId(user_id, { status, limit = 20, offset = 0 }) {
    let query = `
      SELECT o.*, 
             jsonb_agg(
               jsonb_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
    `;

    const values = [user_id];
    let idx = 2;

    if (status) {
      values.push(status);
      query += ` AND o.status = $${idx++}`;
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 更新订单状态
  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('无效的订单状态');
    }

    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // 支付订单
  static async pay(id, payment_method) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 更新订单状态
      const order = await client.query(
        `UPDATE orders 
         SET status = 'paid', payment_method = $1, payment_time = CURRENT_TIMESTAMP
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [payment_method, id]
      );

      if (order.rows.length === 0) {
        throw new Error('订单不存在或状态不允许支付');
      }

      // 增加商品销量
      const items = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );

      for (const item of items.rows) {
        await Product.incrementSales(item.product_id, item.quantity);
      }

      await client.query('COMMIT');
      return order.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 取消订单
  static async cancel(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 获取订单状态
      const order = await client.query(
        'SELECT status FROM orders WHERE id = $1',
        [id]
      );

      if (order.rows.length === 0) {
        throw new Error('订单不存在');
      }

      if (order.rows[0].status !== 'pending') {
        throw new Error('只能取消待支付订单');
      }

      // 更新订单状态
      await client.query(
        `UPDATE orders 
         SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );

      // 恢复库存
      const items = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );

      for (const item of items.rows) {
        await Product.updateStock(item.product_id, item.quantity);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 发货
  static async ship(id, tracking_number) {
    const query = `
      UPDATE orders 
      SET status = 'shipped', tracking_number = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'paid'
      RETURNING *
    `;

    const result = await pool.query(query, [tracking_number, id]);
    return result.rows[0];
  }

  // 完成订单
  static async complete(id) {
    const query = `
      UPDATE orders 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'shipped'
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 获取订单统计
  static async getStats(user_id) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM orders
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }
}

module.exports = Order;
