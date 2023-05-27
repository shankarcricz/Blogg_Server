const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    story : {
        type: String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    tag : [String],
    genre : { //memberonly etc
        type : String,
        default : 'blog'
    },
    photo : String,
    createdUser : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    claps : {
        type : Number,
        default: 0
    },
    views : {
        type : Number,
        default : 0
    },
    comments : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Comment'
        }
    ],
    likers : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'User'
        }
    ]
},
{
    toJSON : {virtuals : true},
    toObject : { virtuals : true}
})
//if we have more comments then we can scale it later
// blogSchema.virtual('comments', {
//     ref : 'Comment',
//     foreignField : 'blog',
//     localField: '_id'
// })

blogSchema.index({title: 1})




const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

