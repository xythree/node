

var http = require("http")
var url = require("url")
var fs = require("fs")
var path = require("path")
var querystring = require("querystring")
var formidable = require("formidable")

module.exports = function (config) {

    var temp = []
    var timer, extList

    if (Array.isArray(config.ext)) {
        extList = [".js", ".png", ".gif", ".jpg", ".css", ".swf", ".xml", ".html"].concat(config.ext)
    } else if (config.ext.replace) {
        extList = config.ext.ext
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
                                if (t.uploads && t.uploads.files) {
                                    var form = new formidable.IncomingForm()

                                    Object.assign(form, t.uploads)

                                    form.parse(request, function (err, fields, files) {
                                        if (err) {
                                            console.log("uploads err", err)
                                        }

                                        var filename = files.file.name
                                        var nameArray = filename.split(".")
                                        var type = nameArray.pop()
                                        var name = ""

                                        nameArray.push("_" + Date.now())
                                        name = nameArray.reduce(function (c, n) {
                                            return c + n
                                        })

                                        var rand = Math.random() * 100 + 900
                                        var num = parseInt(rand, 10)
                                        var avatarName = name + num + "." + type
                                        var newPath = form.uploadDir + avatarName

                                        t.parame = files
                                        fs.renameSync(files.file.path, newPath)
                                        resolve(t)
                                    })

                                } else {
                                    var body = []

                                    request.on("data", chunk => {
                                        body.push(chunk)
                                    })

                                    request.on("end", () => {                                       
                                        t.parame = querystring.parse(body.toString())
                                        resolve(t)
                                    })
                                }
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

    function publicFn(url, uploads, callback, method) {
        var args = arguments
        var len = args.length

        if (len == 3) {
            if (typeof args[1] == "function") {             
                temp.push({url, callback: args[1], method: args[2]})
            } else {
                temp.push({url, uploads: args[1], method: args[2]})
            }
        } else if (len == 4) {
            temp.push({url, uploads, callback, method})
        }
        createServer()
    }

    return {
        post: function (url, uploads, callback) {
            var args = arguments
            var len = args.length

            if (len == 2) {
                publicFn(url, args[1], "post")                
            } else if (len == 3) {
                publicFn(url, uploads, callback, "post")
            }
        },
        get: function (url, callback) {
            publicFn(url, callback, "get")
        }
    }

}














