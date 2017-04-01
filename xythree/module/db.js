

var mg = require(__dirname + "/mongoose")
var m = require(__dirname + "/model")

var mongoose = mg.mongoose
var Schema = mg.Schema
var db = mg.db
var model = mg.model


for(var item in m) {
    db.model(item, new Schema(m[item]))
}


module.exports = {
    getModel: function (type) {
        return db.model(type)
    }
}




