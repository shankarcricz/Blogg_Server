const express = require('express')
const {addFollow, login, signup, forgotPassword, resetPassword, updatePassword, getUsers, protect, permitTo, deleteMe, uploadPhoto, updateMe, resizePhoto } = require('../Contollers/userController')

const userRouter = express.Router();

userRouter.post('/signup',uploadPhoto,resizePhoto, signup)
userRouter.post('/login', login)
userRouter.post('/forgotpassword',forgotPassword)
userRouter.patch('/resetpassword/:token',resetPassword)
userRouter.patch('/updatepassword', protect, permitTo('admin'), updatePassword)
userRouter.post('/deleteMe', protect, deleteMe)
userRouter.get('/', getUsers)
userRouter.post('/updateMe', protect,uploadPhoto,resizePhoto, updateMe)
userRouter.post('/addFollower', protect, addFollow)


module.exports = userRouter