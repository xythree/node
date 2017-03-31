


var router = require("./module/router")({
    port: 8081,
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

var render = require("./module/render")({
    views: "views",
    ext: "html"
})

router.get("/", function () {   
    this.body = "/"
})

router.get("/router/:id", function () {
    this.body = this.vr.id
})

router.post("/test", function () {	
    this.body = JSON.stringify(this.parame)
})

router.get("/test", function () {
	
	
	this.cookies.set({
		key: "username",
		value: "xythree"
	})

    this.body = render("index", {
        text: 123
    })

})

router.get("/404", function () {
    this.body = render("404")
})

router.post("/uploads", {
    files: "file",
    uploadDir: "uploads/"
}, function () {	
	var result = {
		status: 0,
		file: this.file
	}
	
    this.body = JSON.stringify(result)
})


















