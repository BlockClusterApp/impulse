const express = require("express")
const app = express()
var bodyParser = require('body-parser')
var MongoClient = require("mongodb").MongoClient;
let sha3 = require('js-sha3');
let elliptic = require('elliptic');
let ec = new elliptic.ec('secp256k1');

let mongoURL = "mongodb://localhost:27017";
let instanceId = process.env.instanceId;
let remoteMongoURL = process.env.MONGO_URL || "mongo.default.svc.cluster.local:27017";

let db = null;

MongoClient.connect(mongoURL, {reconnectTries : Number.MAX_VALUE, autoReconnect : true}, function(err, database) {
    if(!err) {
        db = database.db("admin");
    }
})

MongoClient.connect(remoteMongoURL, {reconnectTries : Number.MAX_VALUE, autoReconnect : true}, function(err, database) {
    if(!err) {
        let tempDB = database.db("admin");
        function reRun() {
            tempDB.collection("networks").findOne({instanceId: instanceId}, function(err, node) {
                if(!err && node) {
                    if(node.impulseStatus == "initializing" || node.impulseStatus == "running") {
                        tempDB.collection("networks").updateOne({instanceId: instanceId}, { $set: {impulseStatus: "running"}}, function(err, res) {});
                    } else {
                        setTimeout(reRun, 1000)
                    }
                }
            })
        }

        reRun();
    }
})

app.use(bodyParser.json())

app.post("/writeObject", function (req, res) {
    let encryptedData = req.body.encryptedData;
    let publicKey = req.body.publicKey;
    let signature = req.body.signature;
    let metadata = req.body.metadata;
    let capsule = req.body.capsule;

    let ciphertext_hash = sha3.keccak256(encryptedData);
    let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
    let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(ciphertext_hash), signature, signature.recoveryParam, "hex").encodeCompressed("hex");

    let obj = {};

    obj.encryptedData = encryptedData;
    obj.encryptedDataHash = ciphertext_hash;
    obj.publicKey = publicKey;
    obj.metadata = metadata;
    obj.timestamp = Date.now();
    obj.instanceId = instanceId;
    obj.capsule = capsule;

    if(pubKeyRecovered === publicKey) {
        db.collection("encryptedObjects").insertOne(obj, function(err) {
            if(!err) {
                res.send(JSON.stringify({"message": "Object written successfully"}))
            } else {
                res.send(JSON.stringify({"error": "An Unknown Error Occured"}))
            }
        });
    } else {
        res.send(JSON.stringify({"error": "Invalid Signature"}))
    }
})

app.post("/writeKey", function (req, res) {
    let ownerPublicKey = req.body.ownerPublicKey;
    let reEncryptionKey = req.body.reEncryptionKey;
    let receiverPublicKey = req.body.receiverPublicKey;
    let signature = req.body.signature;

    let ownerPublicKey_hash = sha3.keccak256(ownerPublicKey);
    let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
    let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(ownerPublicKey_hash), signature, signature.recoveryParam, "hex").encodeCompressed("hex");

    let obj = {};
    obj.ownerPublicKey = ownerPublicKey;
    obj.reEncryptionKey = reEncryptionKey;
    obj.receiverPublicKey = receiverPublicKey;
    obj.timestamp = Date.now();
    obj.instanceId = instanceId;

    if(ownerPublicKey === pubKeyRecovered) {
        db.collection("derivationKeys").insertOne(obj, function(err) {
            if(!err) {
                res.send(JSON.stringify({"message": "Key written successfully"}))
            } else {
                res.send(JSON.stringify({"error": "An Unknown Error Occured"}))
            }
        });
    } else {
        res.send(JSON.stringify({"error": "Invalid Signature"}))
    }
})

app.post("/deleteKey", function (req, res) {
    let ownerPublicKey = req.body.ownerPublicKey;
    let receiverPublicKey = req.body.receiverPublicKey;
    let signature = req.body.signature;

    let ownerPublicKey_hash = sha3.keccak256(ownerPublicKey);
    let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
    let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(ownerPublicKey_hash), signature, signature.recoveryParam, "hex").encodeCompressed("hex");

    let obj = {};
    obj.ownerPublicKey = ownerPublicKey;
    obj.receiverPublicKey = receiverPublicKey;
    obj.instanceId = instanceId;

    if(ownerPublicKey === pubKeyRecovered) {
        db.collection("derivationKeys").deleteMany(obj, function(err) {
            if(!err) {
                res.send(JSON.stringify({"message": "Key deleted successfully"}))
            } else {
                res.send(JSON.stringify({"error": "An Unknown Error Occured"}))
            }
        });
    } else {
        res.send(JSON.stringify({"error": "Invalid Signature"}))
    }
})

app.post("/query", function(req, res) {
    let query = req.body.query;
    let signature = req.body.signature;
    let publicKey = req.body.publicKey;
    let ownerPublicKey = req.body.ownerPublicKey;

    let query_hash = sha3.keccak256(JSON.stringify(query));
    let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
    let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(query_hash), signature, signature.recoveryParam, "hex").encodeCompressed("hex");

    if(publicKey === pubKeyRecovered) {
        query.instanceId = instanceId;

        if(ownerPublicKey === publicKey) {
            query.publicKey = ownerPublicKey;
            db.collection("encryptedObjects").find(query, {instanceId: 0}).sort({timestamp: 1}).toArray(function(err, result) {
                if(!err) {
                    res.send(JSON.stringify({queryResult: result}))
                } else {
                    res.send(JSON.stringify({"error": "An Unknown Error Occured"}))
                }
            })
        } else {
            db.collection("derivationKeys").findOne({instanceId: instanceId, ownerPublicKey: ownerPublicKey, receiverPublicKey: pubKeyRecovered}, function(err, result) {
                if(!err && result) {
                    let derivationKey = result.reEncryptionKey;
                    query.publicKey = ownerPublicKey;
                    db.collection("encryptedObjects").find(query, {instanceId: 0}).sort({timestamp: 1}).toArray(function(err, result) {
                        if(!err) {
                            res.send(JSON.stringify({derivationKey: derivationKey, queryResult: result}))
                        } else {
                            res.send(JSON.stringify({"error": "An Unknown Error Occured"}))
                        }
                    })
                } else {
                    res.send(JSON.stringify({"error": "An Unknown Error Occured"}))
                }
            })
        }


    } else {
        res.send(JSON.stringify({"error": "Invalid Signature"}))
    }
})

app.listen(7558, () => console.log("Impulse is running!!!"))
