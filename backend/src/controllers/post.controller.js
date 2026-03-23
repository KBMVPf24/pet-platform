const Post = require('../models/Post');
const Comment = require('../models/Comment');

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    const { pet_id, title, content, images, tags, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '标题和内容为必填项'
      });
    }

    const post = await Post.create({
      user_id: req.user.id,
      pet_id,
      title,
      content,
      images,
      tags,
      category
    });

    res.status(201).json({
      success: true,
      data: { post },
      message: '帖子发布成功'
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取帖子列表
exports.getPosts = async (req, res) => {
  try {
    const { category, tag, user_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
      category,
      tag,
      user_id: user_id ? parseInt(user_id) : null,
      search,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取帖子详情
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '帖子不存在'
      });
    }

    // 增加浏览量
    await Post.incrementViews(id);

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 更新帖子
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await Post.update(id, updates, req.user.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '帖子不存在'
      });
    }

    res.json({
      success: true,
      data: { post },
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update post error:', error);
    
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

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    await Post.delete(id, req.user.id);

    res.json({
      success: true,
      message: '帖子已删除'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    
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

// 点赞帖子
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.like(id);

    res.json({
      success: true,
      data: { post },
      message: '点赞成功'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 取消点赞
exports.unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.unlike(id);

    res.json({
      success: true,
      data: { post },
      message: '已取消点赞'
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取热门帖子
exports.getHotPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const posts = await Post.getHot(parseInt(limit));

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get hot posts error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取置顶帖子
exports.getPinnedPosts = async (req, res) => {
  try {
    const posts = await Post.getPinned();

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get pinned posts error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 搜索帖子
exports.searchPosts = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '搜索关键词不能为空'
      });
    }

    const posts = await Post.search(q, parseInt(limit));

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};

// 获取用户的帖子
exports.getUserPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
      user_id: parseInt(user_id),
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
};
