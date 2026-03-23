const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth');

// 公开路由
router.get('/', postController.getPosts);
router.get('/hot', postController.getHotPosts);
router.get('/pinned', postController.getPinnedPosts);
router.get('/search', postController.searchPosts);
router.get('/user/:user_id', postController.getUserPosts);
router.get('/:id', postController.getPostById);

// 需要认证的路由
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.post('/:id/like', authenticate, postController.likePost);
router.post('/:id/unlike', authenticate, postController.unlikePost);

// 评论路由
router.get('/:post_id/comments', commentController.getCommentsByPostId);
router.post('/:post_id/comments', authenticate, commentController.createComment);
router.put('/comments/:id', authenticate, commentController.updateComment);
router.delete('/comments/:id', authenticate, commentController.deleteComment);
router.post('/comments/:id/like', authenticate, commentController.likeComment);
router.post('/comments/:id/unlike', authenticate, commentController.unlikeComment);

module.exports = router;
