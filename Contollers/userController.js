//Authentication & Authorization section

const AppError = require("../appError");
const User = require("../models/userModel");
const asyncCatch = require("./asyncCatch");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const multer = require("multer");
const sharp = require("sharp");
const storageF = require('./fireBase')
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  updateMetadata,
  getBlob,
} = require("firebase/storage");
// Import the functions you need from the SDKs you need


const signJWT = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/images')
//   },
//   filename: function (req, file, cb) {
//     console.log(file)
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     cb(null, file.fieldname + '-' + uniqueSuffix)
//   }
// })
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

exports.resizePhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${
    req.user?.id || crypto.randomUUID()
  }+${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`./public/images/${req.file.filename}`);
  next();
};

exports.uploadPhoto = upload.single("photo");

exports.signup = asyncCatch(async (req, res, next) => {

  const photoRef = ref(storageF, req.file.filename);
  const snapshot = await uploadBytes(photoRef, req.file.buffer, {contentType: req.file.mimetype});
  const url = await getDownloadURL(snapshot.ref);
  req.body.photo = url;
  const newUser = await User.create(req.body);
  //jwt token is created
  const token = signJWT(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: newUser,
  });
});

exports.login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please enter email and password", 400));
  }
  //cheks the password is matchng or not if user exists
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.passwordCheck(password, user.password))) {
    //the instance methods are only accessible through query & not by documents
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = signJWT(user._id);
  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

//middleware used to authenticate & authorize the user via token
exports.protect = asyncCatch(async (req, res, next) => {
  let token;

  //checks for the token from the front end side
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Login please!", 401));
  } else {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError("Login please!", 401));

  //usinf jwt verify method , we are verifying if the token is a valid one & using promisify inbuilt mehtod
  //to make this method a promise or else we need to do callback hell
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //decoded = {id: id here, iat: 3232}
  //using id we check if user still exists in db
  const currUser = await User.findById(decoded.id);
  if (!currUser)
    return next(new AppError("user is not there for this jwt!", 401));

  //we check if the user has changed password after login since on password change the existing jwt makes no sense
  if (currUser.PasswordChangedAfter(decoded.iat))
    return next(
      new AppError("password has been changed!. Pls login again", 401)
    );

  //used for future purpose
  req.user = currUser;
  next();
});

exports.permitTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("Forbidden!", 403));
    next();
  };
};

//if user forgets password then we do this (token resetting)
exports.forgotPassword = asyncCatch(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }); //checking if user exisits
  if (!user) return next(new AppError("unavailable", 404));

  const resetToken = user.passwordReset(); //creating a reset token and saving it in db
  await user.save({ validateBeforeSave: false }); //save
  console.log(resetToken);
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIf you didn't forget your password, please ignore this`;
  //use try catch for this alone..
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset token (valid for 10mins)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Not able to send it!"));
  }
});

exports.resetPassword = asyncCatch(async (req, res, next) => {
  const userToken = req.params.token;
  const hashedToken = crypto
    .createHash("sha256")
    .update(userToken)
    .digest("hex"); //hashing the token from user & checking if it is there in db
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }); //also checking if the password is expired or not
  if (!user) return next(new AppError("Token expired or user not found!"), 404);

  //updating the user inputs in the document and save it to db
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //now send the jwt to user with the new details
  const token = signJWT(user._id);
  res.status(201).json({
    status: "success",
    token,
  });
});

exports.updatePassword = asyncCatch(async (req, res, next) => {
  const user = await User.findOne(req.user._id).select("+password");
  if (!user.passwordCheck(req.body.passwordCurrent, user.password))
    return next(new AppError("Wrong password!"));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //since the password was changed we need to update the jwt token for the user
  const token = signJWT(user._id);
  res.status(201).json({
    status: "success",
    token,
  });
});

//the below fn returns photo variable since the original might not be updated for now
exports.updateMe = asyncCatch(async (req, res, next) => {
  const userObj = {};
  const photoRef = ref(storageF, req.file.filename);
  const snapshot = await uploadBytes(photoRef, req.file.buffer, {contentType: req.file.mimetype});
  const url = await getDownloadURL(snapshot.ref);
  let photo = url;
  if (req.file) userObj.photo = photo;
  const user = await User.findById(req.user.id);
  user.photo = url;
  user.save({ validateBeforeSave: false });
  res.status(200).json({ status: "success", data: user, photo });
});

exports.deleteMe = asyncCatch(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.active = false;
  await user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: "success",
    message: "deleted successfully",
  });
});

exports.getUsers = asyncCatch(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.addFollow = asyncCatch(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.following.push(req.body.following_id);
  user.save({ validateBeforeSave: false });
  const following_person = await User.findById(req.body.following_id);
  console.log(following_person.followers);
  following_person.followers.push(req.user.id);
  following_person.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    data: "Updated all",
  });
});
