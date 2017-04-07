

var http = require("http")
var url = require("url")
var fs = require("fs")
var path = require("path")
var querystring = require("querystring")
var formidable = require("formidable")

module.exports = function (conf) {
    var config = conf || {}
    var temp = []    
    var timer, extList, specialRouter

    config.timeout = conf.timeout || 8000
    if (Array.isArray(config.ext)) {
        extList = [".js", ".png", ".gif", ".jpg", ".css", ".swf", ".xml", ".html", ".mp4", ".mp3"].concat(config.ext)
    } else if (config.ext.replace) {
        extList = config.ext.ext
    }
    if (Array.isArray(config.specialRouter)) {
        specialRouter = ["404"].concat(config.specialRouter)
    } else if (config.specialRouter.replace) {
        specialRouter = config.specialRouter.specialRouter
    }
    
    function getStaticUrl(url) {
        return path.join("./", config.staticDir, url)
    }
    
    function createServer() {

        clearTimeout(timer)

        timer = setTimeout(function () {
            http.createServer((request, response) => {
                var u = url.parse(request.url)
                var method = request.method.toLowerCase()                
                var writeObj = {
                    "Content-Type": "text/html"
                }
                var cookies = {}

                if (request.headers.cookie) {
                    request.headers.cookie.split(";").forEach(ck => {
                        var ck_temp = ck.split("=")
                        cookies[ck_temp[0].trim()] = (ck_temp[1] || "").trim()
                    })
                }

                cookies.get = function (key) {
                    return cookies[key]
                }                

                cookies.set = function (key, value) {
                    var setVal = "", args = key
                    
                    if (Object.prototype.toString.call(args) == "[object Object]")  {
                        var ckStr = ""
                        
                        if (Array.isArray(args.key)) {
                            if (Array.isArray(args.value)) {
                                args.key.forEach(function (t, i) {
                                    ckStr += t + "=" +args.value[i] + "; "
                                })
                            } else {
                                args.key.forEach(function (t, i) {
                                    ckStr += t + "=" +args.value + "; "
                                })
                            }
                        } else {
                            ckStr += args.key + "=" + args.value + "; "
                        }
                        if (args.expires) {
                            var date = new Date()
                            date.setTime(date.getTime() + args.expires)
                            ckStr += "expires=" +date.toGMTString() + "; "
                        }
                        if (args.path) {
                            ckStr += "path=" + args.path + "; "
                        }
                        if (args.maxAge || args["max-age"]) {                            
                            ckStr += "max-age=" + (args.maxAge || args["max-age"]) + "; "
                        }
                        if (args.domain) {
                            ckStr += "domain=" + args.domain + "; "
                        }
                        if (args.secure) {
                            ckStr += "secure=" + args.secure + "; "
                        }
                        if (args.httponly || args.httpOnly) {
                            ckStr += "httpOnly=" + (args.httponly || args.httpOnly) + "; "
                        }
                    } else {
                        ckStr = [key, "=", value].join("")
                        if (!value) {
                            ckStr += "; max-age=-1; "
                        }
                    }                   
                    writeObj["Set-Cookie"] = ckStr
                }

                function vagueRouter(t, pathname) {
                    var reg = /^:\w+$/
                    var arr1 = t.url.split("/"), arr2 = pathname.split("/")
                    var rs1 = arr1.pop()
                    var rs2 = arr2.pop()

                    if (specialRouter.indexOf(rs2) == -1) {

                        if (!path.extname(pathname) && arr1.length == arr2.length) {                                    

                            if (arr1.join("/") == arr2.join("/")) {

                                if (reg.test(rs1)) {
                                    t.vr = {}
                                    return t.vr[rs1.replace(":", "")] = rs2
                                }
                            }
                        }
                    }
                }

                var statusCode = 200
                var promise = new Promise((resolve, reject) => {
                    for(var i = 0, len = temp.length; i < len; i++) {
                        var t = temp[i]
                        
                        t.cookies = cookies
                        
                        t.redirect = url => {
                            response.writeHead(302, { "Location": url })
                            response.end()
                        }

                        if (t.url == u.pathname || vagueRouter(t, u.pathname)) {

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

                                        fs.renameSync(files.file.path, newPath)
                                        t.parame = files
                                        t.file = {
                                            url: newPath.replace(config.staticDir + "/", "")
                                        } 
                                        
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

                        } else if (extList.indexOf(path.extname(u.pathname)) != -1) {
                            fs.readFile(getStaticUrl(u.pathname), (err, data) => {
                                var data = data

                                if (err) {
                                    reject(t)
                                    return
                                }
                                response.writeHead(200, {"Content-Type": "text/plain"})
                                response.end(data)
                            })
                        }
                    }

                    //response.on("timeout", function () { //被动
                    response.setTimeout(config.timeout, function () {  //主动
                        var _url = temp.filter(t => (t.url == "/404"))
                        if (_url.length) {
                            t.redirect("/404")
                        } else {
                            reject(t)
                        }
                    })
                })

                promise.then(t => {
                    response.send = function (str) {
                        var str = str
                        if (typeof str != "string") {
                            str = JSON.stringify(str)
                        }
                        response.writeHead(statusCode, writeObj)
                        response.end(str)
                    }
                    response.download = function (_url) {
                        var newUrl = url.parse(_url)
                        var _u = getStaticUrl(newUrl.pathname)

                        fs.stat(_u, function (err, stats) {

                            if (err) {
                                t.redirect("/404")
                                return
                            }
                            if (stats.isFile()) {
                                var _nu = _u.split("\\")
                                response.writeHead(200, {
                                    "Content-type": "application/octet-stream",
                                    "Content-Disposition": "attachment; filename=" + _nu[_nu.length - 1],
                                    "Content-Length": stats.size
                                })
                                fs.createReadStream(_u).pipe(response)
                            }
                        })
                    }
                    t.callback && t.callback(response)
                }, t => {
                    response.writeHead(404, {"Content-Type": "text/plain"})
                    response.end("404")
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
        },
        download: function (url, callback) {
            publicFn(url, callback, "download")
        }
    }

}














