


var router = require("./module/router")({    
    port: 8081,
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
    this.body = "123"
})

router.post("/test", function () {
    this.body = "post"
})

router.get("/test", function () {

    this.body = render("index")

})

router.post("/uploads", {
	files: "file",
	uploadDir: "uploads/"
}, function () {
	this.body = "success"
})

router.get("/404", function () {
    this.body = render("404")
})



