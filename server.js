import express from "express"

const app = express();

const port = 3000;

app.get('/',(req,res)=>{
    res.json({
        "name":"shivam"
    })
})

app.listen(port,()=>{
    console.log(`server running on the ${port}`)
})