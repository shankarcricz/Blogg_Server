const express = require('express')
const { protect } = require('../Contollers/userController')
const { createComment, getCommentsByBlogId } = require('../Contollers/commentController')

const commentRouter = express.Router()

commentRouter.route('/addComment').post(protect, createComment);
commentRouter.route('/getCommentsByBlogId').post(protect, getCommentsByBlogId);

module.exports = commentRouter;