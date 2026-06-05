import express from "express"
import dotenv from "dotenv"
import events_routes from "./routes/events_routes.js";

dotenv.config();

const port = process.env.PORT;
const app = express();


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/events",events_routes)
app.listen(port,()=>{
    console.log(`server running on the ${port}`)
})