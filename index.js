const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 6200;
const app = express();



// Middlewere
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send('Coffee Store Server is runn')
});




const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.3cndw30.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollecation = client.db('coffeeBD').collection('coffee');

    app.get('/coffee', async(req, res)=>{
        const cursor = coffeeCollecation.find()
        const result = await cursor.toArray()
        res.send(result || [])
    })
    // One items get from MongoDB
    app.get('/coffee/:id', async(req, res)=>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)};
        const result = await coffeeCollecation.findOne(filter)
        res.send(result)
    })

    app.post('/coffee', async(req, res)=>{
        const coffee = req.body
        const result = await coffeeCollecation.insertOne(coffee);
        res.send(result)
    })

    // Update the coffee info
    app.put('/coffee/:id', async(req, res)=>{
        const id = req.params.id;
        const coffee = req.body;
        const filter = {_id: new ObjectId(id)};
        const options = { upsert: true };
        const updateCoffee ={
            $set:{
                name: coffee.name,
                chef: coffee.chef,
                supplier: coffee.supplier,
                taste: coffee.taste,
                category: coffee.category,
                details: coffee.details,
                photo: coffee.photo,
            }
        };
        const result = await coffeeCollecation.updateOne(filter,updateCoffee,options);
        res.send(result)
    });

    // Delete the Coffee from the database MongoDB

    app.delete('/coffee/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await coffeeCollecation.deleteOne(filter);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Hi there Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.listen(port, ()=>{
    console.log(`coffee server port number ${port} `);
})