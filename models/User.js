import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import Joi from 'joi'
import passwordComplexity from 'joi-password-complexity'

const otherAccounts = new mongoose.Schema({
    userId:String,
    name:String,
    email:String,
    accessToken:String,
})


const schema = new mongoose.Schema({
    name:String,
    email:{
        type:String,required:true
    },
    password:{
        type:String,required:false
    },
    photo:String,
    googleId:{
        type:String,
        required:false,
        unique:true,
    },
    accessToken:{
        type:String,
        required:false
    },
    otherAccounts:[otherAccounts],
    spreadSheets:[Object],
    createdAt:{
        type:Date,
        default: Date.now()
    }
})

schema.methods.generateAuthToken = function(_){
    const token = jwt.sign({_id:this._id},process.env.SECRET_KEY,{expiresIn:"7d"})
    return token
}


export const validate = (data)=>{
    const validateSchema = Joi.object({
        name:Joi.string().required().label("Name"),
        email:Joi.string().email().required().label("Email"),
        password:passwordComplexity().required().label("Password")
    })
    
    return validateSchema.validate(data)
}
export const passValidate=(data)=>{
    const validateSchema = Joi.object({
        email:Joi.string().email().required().label("Email"),
        password:passwordComplexity().required().label("Password")
    })
    return validateSchema.validate(data)
}
export const User = mongoose.model("User", schema)