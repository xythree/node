

var fs = require("fs")
var path = require("path")


function templateEngine(tpl, options) {
    var reg = /<%([^%>]+)?%>/g
    var reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g
    var match = ""
    var cursor = 0
    var code = "var r=[];"
    function _push(c, js) {    
        js ? code += c.match(reExp) ? c + "\n" : "r.push(" + c + ");" :
        code += "r.push(\"" + c.replace(/\"/g, "\\\"") + "\");"
    }
    while (match = reg.exec(tpl)) {
        _push(tpl.slice(cursor, match.index))
        _push(match[1], true)
        cursor = match.index + match[0].length
    }
    _push(tpl.substr(cursor, tpl.length + cursor))
    code += "return r.join(\"\");"
    
    return new Function(code.replace(/[\r\n\t]/g,"")).apply(options)
}


module.exports = function (config) {
    var config = config || {}

    function render(fileName, data) {
        var views = path.join(__dirname, (config.views || "") + "/")
        var result = fs.readFileSync(views + fileName + "." + config.ext)
        var html = result.toString()
		
        return data ? templateEngine(html, data) : html
    }

    return render
}




