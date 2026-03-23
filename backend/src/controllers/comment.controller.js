const Comment = require('../models/Comment');

// 创建评论
exports.createComment = async (req, res) => {
  try {
    const { post_id, content, parent_id } = req.body;

    if (!post_id || !content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '帖子 ID 和评论内容为必填项'
      });
    }

    const comment = await Comment.create({
      post_id,
      user_id: req.user.id,
      content,
      parent_id
    });

    res.status(201).json({
      success: true,
      data: { comment },
      message: '评论成功'
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取帖子的评论列表
exports.getCommentsByPostId = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await Comment.findByPostId(post_id, {
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 更新评论
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '评论内容不能为空'
      });
    }

    const comment = await Comment.update(id, content, req.user.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '评论不存在'
      });
    }

    res.json({
      success: true,
      data: { comment },
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update comment error:', error);
    
    if (error.message.includes('无权')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await Comment.delete(id, req.user.id);

    res.json({
      success: true,
      message: '评论已删除'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    
    if (error.message.includes('无权')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 点赞评论
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.like(id);

    res.json({
      success: true,
      data: { comment },
      message: '点赞成功'
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 取消点赞
exports.unlikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.unlike(id);

    res.json({
      success: true,
      data: { comment },
      message: '已取消点赞'
    });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取用户的评论列表
exports.getUserComments = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 20 } = req.query;

    const comments = await Comment.findByUserId(user_id, parseInt(limit));

    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};
