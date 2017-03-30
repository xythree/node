

var fs = require("fs")
var path = require("path")
var _ = require("lodash")

module.exports = function (config) {
    var config = config || {}

    return function (fileName, data) {
        var views = path.join("./", (config.views || "") + "/")     
        var result = fs.readFileSync(views + fileName + "." + config.ext)
        var html = result.toString()
        
        return data ? _.template(html)(data) : html
    }
}




