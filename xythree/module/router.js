

var http = require("http")
var url = require("url")
var fs = require("fs")
var path = require("path")
var querystring = require("querystring")


module.exports = function (config) {
    
    var temp = []
    var timer, extList
    
    if (Array.isArray(config.ext)) {
        extList = [".js", ".png", ".gif", ".jpg", ".css", ".swf", ".xml", ".html"].concat(config.ext)
    } else if (config.ext.replace) {
        extList = config.ext.extList
    }

    function createServer() {

        clearTimeout(timer)

        timer = setTimeout(function () {
            http.createServer((request, response) => {
                var u = url.parse(request.url)
                var method = request.method.toLowerCase()

                var promise = new Promise((resolve, reject) => {

                    for(var i = 0, len = temp.length; i < len; i++) {

                        response.writeHead(200, {"Content-Type": "text/html"})

                        var t = temp[i]

                        t.redirect = url => {
                            response.writeHead(302, { "Location": url })
                            response.end()
                        }

                        if (t.url == u.pathname) {

                            if (t.method == "get") {
                                t.parame = querystring.parse(u.query)
                                resolve(t)                                
                            } else if (t.method == "post") {
                                var body = []

                                request.on("data", chunk => {
                                    body.push(chunk)
                                })

                                request.on("end", () => {
                                    t.parame = querystring.parse(body.toString())
                                    resolve(t)
                                })
                            }

                            if (t.method == method) break

                        } else {

                            if (extList.indexOf(path.extname(u.pathname)) != -1) {

                                fs.readFile(path.join("./", u.pathname), (err, data) => {
                                    var statusCode = 200, data = data

                                    if (err) {
                                        //statusCode = 404
                                        //data = "404"
                                        t.redirect("/404")
                                    }

                                    response.writeHead(statusCode, {"Content-Type": "text/plain"})
                                    response.end(data)
                                })
                            }
                            
                        }
                    }
                })

                promise.then(t => {                 
                    t.callback && t.callback()
                    response.end(t.body || "")
                })

            }).listen(config.port || 80)
        }, 0)
    }

    function publicFn(url, callback, method) {
        temp.push({url, callback, method})
        createServer()
    }

    return {
        post: (url, callback) => {
            publicFn(url, callback, "post")
        },
        get: (url, callback) => {
            publicFn(url, callback, "get")
        }
    }

}














