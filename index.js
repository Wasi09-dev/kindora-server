import express from "express";
 import cors from "cors";
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';
import { createRemoteJWKSet, jwtVerify } from "jose";
const PORT = 5000
 const app = express()
app.use(cors())
 app.use(express.json())
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB()
const db = mongoClient.db("kindora")
const eventCollection = db.collection("event")
const joinCollection = db.collection("joins");

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);
if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  console.log("token:", token);

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log("payload:", payload);
  req.user = payload;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).send({ message: "unauthorized access" });
  }
};
// http://localhost:5000/add-event
app.post('/add-event', async (req, res) => {
  const data = req.body
const result = await eventCollection.insertOne(data)
console.log(result)
  res.send(result)
})

app.get('/events', async (req , res)=>{
    const result = await eventCollection.find().toArray()
    res.send(result)
})

app.get('/events/:id',  async(req,res)=>{
    const {id} = req.params
    const result = await eventCollection.findOne({_id: new ObjectId(id)})
    res.send(result)
})

app.put('/events/:id',  async (req,res)=>{
const {id} = req.params
const data = req.body 
const result = await eventCollection.updateOne(
    {_id: new ObjectId(id)},
    {$set:data}
)
res.send(result)

})

app.delete('/events/:id',  async (req,res)=>{
    const {id} = req.params
    const result = await eventCollection.deleteOne({_id:new ObjectId(id)})
    res.send(result)
})

app.post("/join-event",  async (req, res) => {
  const result = await joinCollection.insertOne(req.body);
  res.send(result);
});

app.get("/joined-events", , async (req, res) => {
  const result = await joinCollection.find({ userEmail: req.query.email }).toArray();

  res.send(result);
});

//    app.listen(PORT, () => {
//      console.log(`Server running on port ${PORT}`);
//    });
export default app
 