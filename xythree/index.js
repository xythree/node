


var router = require("./module/router")({
    port: 8081,
    staticDir: "static",
    /*
    specialRouter: {
        replace: true,
        specialRouter: []
    },
    */
    specialRouter: [],
    /*
    ext: {
        replace: true,
        ext: []
    },
    */
    ext: []
})

var db = require("./module/db")
var md5 = require("md5")

var render = require("./module/render")({
    views: "views",
    ext: "html"
})

router.get("/", function (res) {
    res.send("/")
})

router.get("/router/:id", function (res) {
    res.send(this.vr.id)
})

router.post("/login", function (res) {
    var parame = this.parame
    var result = {
        status: 0
    }
    
    

    if (parame.username && parame.password) {
    
        db.getModel("Users").find({
            name: parame.username,
            password: md5(parame.password)
        }, function (err, data) {
            if (err) {
                result.status = -1
            }
            if (data.length) {
                var d = data[0]

                result.data = {
                    username: d.name,
                    birth: d.birth,
                    email: d.email,
                    phone: d.phone
                }
                this.cookies.set({
                    key: "username",
                    value: d.name
                })
            } else {
                result.status = -1
            }           
            res.send(result)
        }.bind(this))

    } else {
        result.status = -1
        res.send(result)
    }
})

router.get("/login", function (res) {
    
    db.getModel("Users").find(function (err, data) {       
        var val = data[0].name
        var html = render("index", {
            text: val
        })

        res.send(html)
    }.bind(this))

})

router.get("/404", function (res) {
    res.send(render("404"))
})

//<a href="http://localhost:8081/download?url=images/load.gif" target="_blank">load</a>
router.get("/download", function (res) {
    res.download(this.parame.url)
})

router.post("/uploads", {
    files: "file",
    uploadDir: "static/uploads/"
}, function (res) {
    var result = {
        status: 0,
        file: this.file
    }

    res.send(result)
})


















