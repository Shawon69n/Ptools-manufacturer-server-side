const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        const paymentCollection= client.db('Ptools').collection('payments')
        const userProfileCollection= client.db('Ptools').collection('profile')
        
        // products section 
        app.get('/products', async(req,res) =>{
            const query = {};
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/product' , async (req,res) =>{
            const productInfo =  req.body;
            const name = productInfo.name;
            const details = productInfo.details;
            const image = productInfo.image;
            const price = parseInt(productInfo.price)
            const minimumQuantity = parseInt(productInfo.minimumQuantity)
            const availableQuantity = parseInt(productInfo.availableQuantity)
            const newProduct = {name,details,image,minimumQuantity,availableQuantity,price}
            const result = await productsCollection.insertOne(newProduct);
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

        app.get('/manageorders',async(req,res) =>{
            const query = {};
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders)
            
          })

        app.delete('/orders/:id',async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const orderCancel = await ordersCollection.deleteOne(query);
            res.send(orderCancel);
        })

         // update order with transactionId 
         app.patch('/orders/:id',  async(req, res) =>{
            const id  = req.params.id;
            const payment = req.body;
            const filter = {_id: ObjectId(id)};
            const updatedDoc = {
              $set: {
                paid: true,
                transactionId: payment.transactionId
              }
            }
      
            const result = await paymentCollection.insertOne(payment);
            const updatedOrder = await ordersCollection.updateOne(filter, updatedDoc);
            res.send(updatedOrder);
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

         app.put('/users/:email', async (req,res) =>{
             const email = req.params.email;
             const userInfo = req.body;

             const filter = {email : email}
             const options = {upsert : true}
             const updatedDoc = {
               $set : {
                 email : email,
                 name : userInfo.name
               }
             }
             const result = await usersCollection.updateOne(filter,updatedDoc,options);
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
          

          app.post('/create-payment-intent', async(req,res) =>{
              const product = req.body;
              const price = product.totalPrice;
              const amount = price * 100;
              const paymentIntent = await stripe.paymentIntents.create({
                  amount : amount,
                  currency: 'usd',
                  payment_method_types:['card']
              });
              res.send({clientSecret : paymentIntent.client_secret})
          })

          //user profile
          app.post('/myprofile', async(req,res) =>{
            const profile = req.body;
            const result = await userProfileCollection.insertOne(profile);
            res.send(result);
          })

          app.get('/myprofile', async(req,res) =>{
              const email = req.query.email
              const query = {email : email}
              const result = await userProfileCollection.findOne(query)
              res.send(result);
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