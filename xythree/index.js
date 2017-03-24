


var router = require("./module/router")({
	statics: "statics",
    port: 80
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

	this.body = "test"
	
	/*
	this.body = render("index", {
		text: "test"
	})
	*/
	
})








