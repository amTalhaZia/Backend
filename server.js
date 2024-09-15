import express from 'express';
const app = express()

const Port = process.env.Port || 3000;



app.get('/api/jokes', (req, res) => {
      res.send("mern")
});

app.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
});
