const mongoose = require("./mongoose.js")


let users = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    registerDate: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Users", users, "users")