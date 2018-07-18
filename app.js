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

/*
const express = require("express")
const app = express()

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
*/

let exec = require("child_process").exec;
var Wallet = require("ethereumjs-wallet");
let EthCrypto = require("eth-crypto");

let alice_wallet = Wallet.generate();
let alice_private_key_hex = alice_wallet.getPrivateKey().toString("hex");
let alice_private_key_base64 = alice_wallet.getPrivateKey().toString("base64");
let alice_compressed_public_key_hex = EthCrypto.publicKey.compress(alice_wallet.getPublicKey().toString("hex"))
let alice_compressed_public_key_base64 = Buffer.from(EthCrypto.publicKey.compress(alice_wallet.getPublicKey().toString("hex")), 'hex').toString("base64")

//cipher text may have quotes. So make sure to escape them
exec(`python3.6 ./crypto-operations/encrypt.py ${alice_compressed_public_key_base64} 'Hello World!!!'`, (error, stdout, stderr) => {
    if(!error) {
        stdout = stdout.split(" ")
        let ciphertext = stdout[0].substr(2).slice(0, -1)
        let capsule = stdout[1].substr(2).slice(0, -2)

        exec('python3.6 ./crypto-operations/decrypt.py ' + alice_private_key_base64 + " " + alice_compressed_public_key_base64 + " " + capsule + " " + ciphertext, (error, stdout, stderr) => {
            if(!error) {
                console.log(stdout)
            } else {
                console.log(error)
            }
        })

    } else {
        console.log(error)
    }
})
