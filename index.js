const express = require('express');
const app = express();

const cors = require('cors');

const ObjectId = require('mongodb').ObjectId;

const { MongoClient } = require('mongodb');


require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cetyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`; 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('plant');
        const plantCollection = database.collection('bonsai');
        const orderCollection = database.collection('order');
        const usersCollection = database.collection('users');

        // post from ui to db
        app.post('/bonsai', async (req, res) => {
            const tree = req.body;
           
            const result = await plantCollection.insertOne(tree);
            res.json(result);

        })

        // post to ui from db
        app.get('/bonsai', async (req, res) => {
            const tree = plantCollection.find({});
            const result = await tree.toArray();
            res.send(result);
        })

        // get single tree
        app.get('/bonsai/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await plantCollection.findOne(query);
            res.send(result);
        })

        // delete tree
        app.delete('/bonsai/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteTree = await plantCollection.deleteOne(query);
            res.send(deleteTree);
        })

// --------------------------------------------------------------------||
        // post order from ui to db
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

     


        // display order to ui to db
        app.get('/order', async (req, res) => {
            const order = orderCollection.find({});
            const result = await order.toArray();
            res.send(result);
        })
        // finnd single order
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.json(result);
        })

            // order filter by email
            app.get('/order/:email', async (req, res) => {
                const email = req.query.email;
                const query = { email: email };
                console.log(query);
                const cursor = orderCollection.find(query);
                const order = await cursor.toArray();
                res.json(order);
            })
       
        // delete order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteOrder = await orderCollection.deleteOne(query);
            res.json(deleteOrder);
            console.log(deleteOrder);
        })
        // --------------------------------
        // user creation 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


     

        // upsert for google signin
        app.put('/users', async (req, res) => {
            const user = req.body;
            
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
         
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    }
    finally {
        // await client.close(): 
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello world, my server is running..')
})


app.listen(port, () => {
    console.log('listning to port', port);
})



