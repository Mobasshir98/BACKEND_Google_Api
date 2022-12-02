import ErrorHandler from "../utils/ErrorHandle.js"
import jwt from 'jsonwebtoken'

export const isAuthenticated = (req,res,next)=>{
    const token = req.headers.authorisation;
    if(!token){
        return next(new ErrorHandler("Not Logged In", 401))
    }
    else{
        jwt.verify(token,process.env.SECRET_KEY,(err,id)=>{
            req.id=id;
            next()
        })
    }
}