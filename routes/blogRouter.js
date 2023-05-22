const { getBlogs, createBlog, getBlogsById, getBlogsBySearchParam, updateBlogById, deleteBlogById, getRecommendations, getFollowingBlogs, updateImage } = require('../Contollers/blogController')

const express = require('express')
const { protect, uploadPhoto } = require('../Contollers/userController')
const { getCommentsByBlogId } = require('../Contollers/commentController')


const blogRouter = express.Router()



blogRouter.route('/').get(getBlogs).post(protect,uploadPhoto,createBlog)
blogRouter.route('/updateImage').post(protect, uploadPhoto, updateImage)
blogRouter.route('/recommendations').get(protect, getRecommendations);
blogRouter.route('/following').get(protect, getFollowingBlogs)
blogRouter.route('/searchTerm').post(getBlogsBySearchParam)
blogRouter.route('/comments').post(protect,getCommentsByBlogId)
blogRouter.route('/:id').get(protect,getBlogsById).patch(protect,updateBlogById).delete(protect,deleteBlogById)

module.exports = blogRouter;