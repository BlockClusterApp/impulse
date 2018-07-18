/*
1. Write to data base

{
    encryptedData: "r23ur32rx0293ir023rx",
    matadata: {},
    owner: publicKey
}

2. Before giving encrypted data, check permissions from smart contract

{
    pk1: "0x00000",
    pk2: "0x00000",
    hash: "0x0000000000",
    access: true
}

3. Fetch the re-encrypt key and re-encrypt data and send it to client.

{
    pk1: "0x00000",
    pk2: "0x00000",
    reEncKey: "0x00000"
}
*/

const express = require("express")
const app = express()

//fetch mongodb URL, blockchain node URL and permissions smart contract address
let mongoURL = process.env.mongoURL;
let nodeInstanceID = process.env.nodeInstanceID;
let instanceId = process.env.instanceId;

let db = null;

MongoClient.connect("mongodb://mongo.default.svc.cluster.local:27017", {reconnectTries : Number.MAX_VALUE, autoReconnect : true}, function(err, database) {
    if(!err) {
        db = database.db("admin");
    }
})

app.post("/write", function (req, res) {
    
})

app.listen(7558, () => console.log("Hydron is running!!!"))
