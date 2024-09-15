const express  =  require('express')
const app =  express()

Port = 4000;

app.get('/',(req,res)=> {
    res.send('hello  world')
})


app.listen(Port,()=> {
    console.log(`port  running  on ${Port}`);
    
})