


var router = require("./module/router")({    
    port: 8081,
    specialRouter: ["404"],
    /*
    ext: {
        replace: true,
        ext: []
    },
    */
    ext: []
})

var render = require("./module/render")({
    views: "views",
    ext: "html"
})



router.get("/", function () {
    this.body = "/"
})

router.get("/:id", function () {    
    this.body = this.vr.id
})

router.post("/test", function () {
    this.body = "post"
})

router.get("/test", function () {

    this.body = render("index")

})

router.get("/404", function () {
    this.body = render("404")
})

router.post("/uploads", {
    files: "file",
    uploadDir: "uploads/"
}, function () {
    this.body = "success"
})




