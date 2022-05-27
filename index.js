const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const usersCollection = client.db('Ptools').collection('users')
        const ordersCollection = client.db('Ptools').collection('orders')
        
        // products section 
        app.get('/products', async(req,res) =>{
            const query = {};
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        //get single product detail
        app.get('/product/:id',async (req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productsCollection.findOne(query);
            res.send(product);
        })

        //oreders section
        app.post('/orders', async (req,res) =>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        app.get('/orders',async(req,res) =>{
            const email = req.query.email;
            const order = await ordersCollection.find({email:email}).toArray();
            res.send(order)
            
          })
        app.delete('/orders/:id',async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const orderCancel = await ordersCollection.deleteOne(query);
            res.send(orderCancel);
        })
        
        // get payment for that order 
        app.get('/orders/:id',async (req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const orderInfo = await ordersCollection.findOne(query);
            res.send(orderInfo);
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

         //users section ---------
         app.post('/users',async (req,res) =>{
             const user = req.body;
             const result = await usersCollection.insertOne(user);
             res.send(result);
         }) 
         
         
         app.get('/users', async (req,res) =>{
             const result = await usersCollection.find().toArray();
             res.send(result);
         })


        //  admin section 

        app.put('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
              $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
    
        })


        app.get('/admin/:email',async(req,res) =>{
            const email = req.params.email;
            const user = await usersCollection.findOne({email : email});
            const isAdmin = user.role === 'admin';
            res.send({admin : isAdmin})
            
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