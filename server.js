import express from "express"
import dotenv from "dotenv"
import events_routes from "./routes/events_routes.js";
import photo_routes from "./routes/photo_routes.js";
import search_routes from "./routes/search_routes.js"
import cors from "cors"

dotenv.config();

const port = process.env.PORT;
const app = express();


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:[
        "http://localhost:5173",
    ]
}))
app.use("/api/events",events_routes);
app.use("/api/photos",photo_routes);
app.use("/api/search",search_routes);
app.get("/",(req,res)=>{
    res.send("PICHIVE backend is working")
})
app.listen(port,()=>{
    console.log(`server running on the ${port}`)
})
