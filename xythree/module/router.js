

var http = require("http")
var url = require("url")
var fs = require("fs")
var path = require("path")
var querystring = require("querystring")


module.exports = function (config) {

    var temp = []
    var timer

    function createServer() {

        clearTimeout(timer)

        timer = setTimeout(function () {
            http.createServer((request, response) => {
				var u = url.parse(request.url)
                var method = request.method.toUpperCase()
				
				response.writeHead(200, {"Content-Type": "text/html"})
				
				var promise = new Promise((resolve, reject) => {
					
					for(var i = 0, len = temp.length; i < len; i++) {
						var t = temp[i]
						
						if (t.url == u.pathname) {

							if (t.method == "get") {
								t.parame = querystring.parse(u.query)
								resolve(t)
								break
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
						}
					}
				})
				
				promise.then( t => {
					t.callback && t.callback()
					response.end(t.body || "")
				})
				
				return ;
				
                temp.forEach(function (t) {                    

                    console.log(u.pathname, t.url)
                    if (u.pathname == t.url) {
						response.writeHead(200, {"Content-Type": "text/html"})
                        var promise = new Promise((resolve, reject) => {

                            if (method == "get") {
                                t.parame = querystring.parse(u.query)
                                resolve()
                            } else if (method == "post") {                              
                                var body = []

                                request.on("data", chunk => {
                                    body.push(chunk)
                                })

                                request.on("end", () => {
                                    t.parame = querystring.parse(body.toString())                                   
                                    resolve()
                                })
                            }
                        })
                        
                        promise.then(() => {
                            t.callback && t.callback()							
							response.end(t.body || "")							
                        })
						
                    } else {

						if (config.statics) {

							try {
								var newFileUrl = u.pathname.replace(config.statics, "")
								var fileUrl = path.join(__dirname, newFileUrl)								
								var file = fs.readFileSync(fileUrl)

								response.writeHead(200, {"Content-Type": "text/plain"})
								response.end(file.toString())							
							} catch (e) {

								response.writeHead(404, {"Content-Type": "text/plain"})
								response.end("404")
							}
						}
					}           
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














