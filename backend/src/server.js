import express from "express"
import "dotenv/config"
const app = express()
const PORT = process.env.PORT
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"
app.use(express.json())
app.use(cookieParser())


app.use("/api/auth" , authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)

app.listen(PORT , ()=>{
    console.log('server is runn8ng');
    connectDB();
})