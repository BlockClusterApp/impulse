var MongoClient = require("mongodb").MongoClient;
let instanceId = process.env.instanceId;
let mongoURL = process.env.MONGO_URL || "mongo.default.svc.cluster.local:27017";

MongoClient.connect(mongoURL, {reconnectTries : Number.MAX_VALUE, autoReconnect : true, useNewUrlParser: true}, function(err, database) {
    if(!err) {
        let db = database.db("admin");
        db.collection("networks").updateOne({instanceId: instanceId}, { $set: {impulseStatus: "down"}}, function(err, res) {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
})
