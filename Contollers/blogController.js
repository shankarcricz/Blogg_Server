const { request } = require("express");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncCatch = require("./asyncCatch");
const { addHistory } = require("./userController");

exports.getBlogs = asyncCatch(async (req, res, next) => {
    //return blogs
    const blogs = await Blog.find().limit(25).populate({path : 'createdUser', select : 'name _id photo'});
    res.status(200).json({
        status : 'succes',
        data : {
            blogs
        }
    })
})

exports.createBlog = asyncCatch(async (req, res, next) => {
    req.body.createdUser = req.user.id;
    let photo = req.file.path.split('\\').join('/')
    if(req.file) req.body.photo = photo;
    const blog = await Blog.create(req.body);
    req.user.blogsWritten.push(blog._id)
    await req.user.save({validateBeforeSave : false})
    res.status(201).json({
        status : 'success',
        data : {
            blog
        }
    })
})

exports.getBlogsById = asyncCatch(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id).populate('createdUser');
    // const user = await User.findById(req.user.id)
    req.user.recentInterests.push(blog.tag?.[0])
    await req.user.save({validateBeforeSave: false})
    blog.views = blog.views + 1;
    blog.save({validateBeforeSave : false})
  
    res.status(200).json({
        status : 'success',
        data : 
        {
            blog
        }
    })
})

exports.getBlogsBySearchParam = asyncCatch(async(req, res, next) => {
    const term = req.body.term;
    const blogs = await Blog.find(
        { $or: [
            { title: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            {genre : { $regex : term, $options : 'i'}}
            // Add more fields to search here
          ]}
    ).populate({path : 'createdUser', select: '_id name photo'})
    res.status(200).json({
        status : 'success',
        data : {
            blogs
        }
    })
})

exports.updateBlogById = asyncCatch(async(req, res, next) => {
    if(req.body?.type === 'liked') req.body.claps = req.body.claps + 1
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body).populate({path:'createdUser', select : '_id name photo'});
    blog.likers.push(req.user.id);
    blog.save({validateBeforeSave:false})
    res.status(202).json({
        status : 'success',
        data : {
            blog
        }
    })
})
exports.deleteBlogById =asyncCatch(async (req, res, next) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({
        status : 'success',
        blog
    })
})



exports.getRecommendations = asyncCatch(async(req, res, next) => { 
    const recommendationsArr = [...req.user.recommendations, ...req.user.recentInterests];
    const blogs = await Blog.find({ tag: { $in: recommendationsArr } }).populate('createdUser')
    res.status(200).json({
        status : "success",
        data : {
            blogs
        }
    })
})

exports.getFollowingBlogs = asyncCatch(async(req, res, next) => {
    const following = [...req.user.following];
    const blogs = await Blog.find({createdUser : {$in : following}}).populate({path : 'createdUser', select:'_id name photo'})
    res.status(200).json({
        status : "success",
        data : {
            blogs
        }
    })
})
exports.updateImage = asyncCatch(async (req, res, next) => {
    const userObj = {}
    let photo = req.file.path.split('\\').join('/')
    if(req.file) userObj.photo = photo;
    console.log(userObj);
    const blog = await Blog.findById(req.user.id);
    blog.photo = req.file.path
    blog.save({validateBeforeSave: false})
    res.status(204).json({status : 'success'})
  })


