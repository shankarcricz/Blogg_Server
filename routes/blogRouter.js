const { getBlogs, createBlog, getBlogsById, getBlogsBySearchParam, updateBlogById, deleteBlogById, getRecommendations, getFollowingBlogs, updateImage, getBlogsForLoggedInUser } = require('../Contollers/blogController')

const express = require('express')
const { protect, uploadPhoto, resizePhoto } = require('../Contollers/userController')
const { getCommentsByBlogId } = require('../Contollers/commentController')


const blogRouter = express.Router()



blogRouter.route('/').get(getBlogs).post(protect,uploadPhoto,resizePhoto,createBlog)
blogRouter.route('/updateImage').post(protect, uploadPhoto, updateImage)
blogRouter.route('/recommendations').get(protect, getRecommendations);
blogRouter.route('/following').get(protect, getFollowingBlogs)
blogRouter.route('/searchTerm').post(getBlogsBySearchParam)
blogRouter.route('/comments').post(protect,getCommentsByBlogId)
blogRouter.route('/:id').get(protect,getBlogsById).patch(protect,updateBlogById).delete(protect,deleteBlogById)
blogRouter.route('/getMyBlogs').post(protect, getBlogsForLoggedInUser);
blogRouter.route('/deleteBlogById/:id').post(protect, deleteBlogById);

module.exports = blogRouter;