const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middletier 
app.use(cors());
app.use(express.json());

// db user : ptools_admin
//db pass : a8tUxHP7MKPEWa4f

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.araik.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// start ------------

async function run(){
    try{
        await client.connect();
        const productsCollection = client.db('Ptools').collection('products')
        const reviewsCollection = client.db('Ptools').collection('reviews')

        // products section 
        app.get('/products', async(req,res) =>{
            const query = {};
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        // reviews section 
        app.get('/reviews', async(req,res) =>{
            const query = {};
            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        // add new review  
        app.post('/reviews' , async (req,res) =>{
            const reviewer =  req.body;
            const result = await reviewsCollection.insertOne(reviewer);
            res.send(result)
          })



    }

    finally{

    }
}
run().catch(console.dir);







app.get('/' , (req,res) =>{
    res.send('siuu from ptools')
})

app.listen(port , () =>{
    console.log(`Ptools listening from ${port}`);
})