

var mongoose = require("mongoose")


var db = mongoose.createConnection("localhost", "test")

db.on("error", function () {
    console.log("open db error!")
})


/*
db.on("open", function () {
    console.log("first open!")
})
*/


module.exports = {
    mongoose,
    Schema: mongoose.Schema,
    model: mongoose.model,
    db
}






