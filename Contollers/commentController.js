const Comment = require("../models/commentModel")
const asyncCatch = require('./asyncCatch')


exports.createComment = asyncCatch(async(req, res, next) => {
    const comment = await Comment.create(req.body);
    const comments = await Comment.find({blog :req.body.blog }).populate('comments').populate({path: 'user', select : '_id name photo'})
    res.status(201).json({
        status : 'succes',
        data : {
            comments
        }
    })
})

exports.getCommentsByBlogId = asyncCatch(async(req, res, next) => {
    const comments = await Comment.find({blog :req.body.blog_id }).populate('comments').populate({path: 'user', select : '_id name photo'})
    res.status(200).json({
        status : 'success',
        data : {
            comments
        }
    })
})