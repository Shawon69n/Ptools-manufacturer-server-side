const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middletier 
app.use(cors());
app.use(express.json());



// start ------------
app.get('/' , (req,res) =>{
    res.send('siuu from ptools')
})

app.listen(port , () =>{
    console.log(`Ptools listening from ${port}`);
})