var MongoClient = require("mongodb").MongoClient;
let instanceId = process.env.instanceId;
const Config = require('./config');

MongoClient.connect(Config.getMongoConnectionString(), {reconnectTries : Number.MAX_VALUE, autoReconnect : true, useNewUrlParser: true}, function(err, database) {
    if(!err) {
        let db = database.db(Config.getDatabase());
        db.collection("networks").updateOne({instanceId: instanceId}, { $set: {impulseStatus: "down"}}, function(err, res) {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
})
