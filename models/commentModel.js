const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    comment : {type : String, required : true},
    createdAt : {
        type : Date,
        default : Date.now(),
        required : true
    },
    claps : Number,
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    blog : {
        type : mongoose.Schema.ObjectId,
        ref : 'Blog',
        required : true
    },
    comments : [{
        type : mongoose.Schema.ObjectId,
        ref : 'Comment',
        required : true
    }]
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment;