const users = require("./curd.js")("users") //require的时候，需要传入要操作的数据库模块名


users.add({ username: "demo1", password: "abc" }).then(res => {
    console.log("add", res)
}).then(() => {
    //添加return 才会按照顺序从上到下执行，否则不保证顺序
    return users.update({}, { username: "demo2" }).then(res => {
        console.log("update", res)
    })
}).then(() => {
    return users.find().then(res => {
        console.log("find", res)
    })
}).then(() => {
    return users.remove().then(res => {
        console.log("remove", res)
    })
})