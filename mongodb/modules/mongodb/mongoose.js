const mongoose = require("mongoose")
const { dbname } = require("./../../config.js")

//防止报错:(node:7664) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise

const db = mongoose.connect(`mongodb://localhost/${dbname}`)

global.MgTypes = mongoose.Types

module.exports = mongoose