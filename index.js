const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParse = require('cookie-parser');
const errorHandler = require('./middlewares/error');
const db = require('./config/db');

const app = express();
//connect to db
db.connect();

// To remove data using these defaults:
app.use(mongoSanitize());

//set security headers
app.use(helmet());
// prevent xss attack
app.use(xss());
//rate limit
// const limiter = rateLimit({
//     windowMs: 10*60*1000,
//     max:1,
// });
// app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Body parser
app.use(express.json());

//cookie parser
app.use(cookieParse());

//Enable cors
app.use(cors());

app.use(fileupload());
//Set static file
app.use(express.static(path.join(__dirname,'public')));

//Load env vars
dotenv.config({path:'./config/config.env'});

//Route files

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user.route');
const questionRouter = require('./routes/question.route');




app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/questions',questionRouter);




app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Sever running on port ${PORT}`.yellow.bold));

//handle unhandle promise rejections
// process.on('unhandledRejection',(err,promise)=>{
//     console.log(`Error: ${err.message}`);
//     //close sever and exit process
//     server.close(()=>process.exit(1));
// });