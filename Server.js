const express = require('express')
const dotenv = require('dotenv');
const blogRouter = require('./routes/blogRouter');
const AppError = require('./appError');
const errorController = require('./Contollers/errorController');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./routes/userRouter');
const commentRouter = require('./routes/commentRouter');
const path = require('path')
const bodyParser = require('body-parser');
const multer = require('multer');

app.use(express.json())
// Parse JSON bodies
app.use(bodyParser.json());

dotenv.config({path : './config.env'})
app.use(express.urlencoded({extended : true}))

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });
app.use(cors())

mongoose.connect(process.env.DATABASE_STRING, {useNewUrlParser : true}) //connection will be created
.then(con => console.log('Connected to the db!'))

app.use('/public/images', express.static(path.join('public', 'images')))
app.use('/blogs', blogRouter)
app.use('/users', userRouter)
app.use('/comments', commentRouter)


app.all('*', (req, res, next) => {
    next(new AppError(`can't find this route`, 404))
})
app.use(errorController)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('Server started')
})

//the below code is used for handling rejections across the whole application(eg - db connection failure) & shuts down the server gracefully
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
})
