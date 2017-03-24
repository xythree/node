

var fs = require("fs")
var path = require("path")



fs.readFile(path.join(""), (err, data) => {
	
	if (err) {
		console.log(err)
		return
	}
	console.log("data:image")
})




