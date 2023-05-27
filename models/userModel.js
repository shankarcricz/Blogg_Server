const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : [true, 'Please enter a email address'],
        unique : true,
        lowercase : true, //transforms to lowercase
        validate : [validator.isEmail, 'Please enter a valid email address']
    },
    photo : {
        type: String
    },
    role : {
        type : String,
        enum : ['admin', 'user', 'premium_user']
    },
    password : {
        type : String,
        required : [true, 'Please enter a password'],
        minLength : 8,
        select : false  //it won't show the password field anywhere else
    },
    passwordConfirm : {
        type : String,
        required : [true, 'Please enter a password'],
        validate : {
            //this only works with save adn create!
            validator : function(el) {
                return el === this.password;
            },
            message : 'passwords do not match'
        }
    },
    followers : [{
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    }],
    following : [{
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    }],
    recommendations : [String], //this should be a tag
    recentInterests : [String],
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type : Boolean,
        default : true,
        select : false
    },
    //child referencing via virtual methods
    blogsWritten : [{
        type : mongoose.Schema.ObjectId,
        ref : 'Blog'
    }],
    commentsWritten : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Comment'
        }
    ]
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
})

userSchema.pre('save', function(next) {
    if(this.recentInterests.length === 4) {
        this.recentInterests.shift();
    }
    next();
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; //no use for this we can remove it
    next();
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = (Date.now() /1000 - 1000) * 1000; //13/ -> 10
    next();
})

//query middleware ..ie works when a query is made from db to client.. 
userSchema.pre(/^find/, function(next) {
    this.find({active : {$ne : false}}) //shows only the user that has active as true
    next();
})

//model instance method
userSchema.methods.passwordCheck = async function(newPasword, userPassword) {
    return await bcrypt.compare(newPasword, userPassword);
}

//instance method used for checking if password is changed after loging in
userSchema.methods.PasswordChangedAfter = function(jwt_iat) {
    if(this.passwordChangedAt) {
        const password_changed_time = this.passwordChangedAt.getTime() / 1000;
        return jwt_iat < password_changed_time;
    }
    return false;
}


//the below fn is used for resetting the password
userSchema.methods.passwordReset = function() {
    const resetToken = crypto.randomBytes(32).toString('hex'); //reset token is created
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //hashes the reset token & saves it to the database
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 //sets the expiration for the token as well
    return resetToken;
}

const User = mongoose.model('User', userSchema)
module.exports = User;
