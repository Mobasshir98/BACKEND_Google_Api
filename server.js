import app from "./app.js";
import {connectDB} from './config/database.js'

connectDB();

app.get('/', (req,res)=>{
    res.send("**Backend**")
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT}`)
})