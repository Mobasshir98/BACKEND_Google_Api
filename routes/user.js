import express from 'express';
import passport from 'passport';
import { addSheet, getFiles, getSheet, login, logout, myProfile, register } from '../controllers/user.js';
import { isAuthenticated } from '../middlewares/auth.js';
import jwt from 'jsonwebtoken'
const router = express.Router();

router.get("/googleAuth", passport.authenticate("google",{
    scope:["email","profile","https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/spreadsheets.readonly"]
}))

router.get("/googlelogin", passport.authenticate('google',{
    successRedirect:"/api/v1/success"
}))
router.get('/success',(req,res)=>{
    const token = jwt.sign({_id:req.user._id},process.env.SECRET_KEY,{expiresIn:"7d"})
    let currtoken = req.cookies["token"]
    if(!currtoken){
        res.cookie("token",token)
    }
    res.redirect(`${process.env.FRONTEND_URL}`)
})
router.post("/register",register)
router.post("/login",login)

router.get("/me", isAuthenticated, myProfile)
router.get("/logout", logout)
// router.get("/googleSheet", isAuthenticated, googleDrive)
router.post("/getFiles",isAuthenticated,getFiles)
router.post("/getSheets",isAuthenticated,getSheet)
router.post("/addSheets",isAuthenticated,addSheet)

export default router;