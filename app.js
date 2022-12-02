import express from 'express';
import dotenv from "dotenv";
import userRoute from './routes/user.js'
import { connectPassport } from './utils/Provider.js';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from "cors"
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
export default app;

dotenv.config({
    path:"./config/config.env"
})
app.use(cors())
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,

    cookie:{
        secure:false,
        httpOnly:false,
        sameSite:false
    }
}))

app.use(cookieParser())
app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}))

connectPassport()
app.use("/api/v1",userRoute)

app.use(errorMiddleware)


