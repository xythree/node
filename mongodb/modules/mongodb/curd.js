module.exports = name => {
    const DB = require(`./${name}.js`)

    return {
        add(obj = {}) {
            let db = new DB(obj)

            return new Promise((resolve, reject) => {
                db.save((err, data) => {
                    if (err) return reject(err)
                    resolve(data)
                })
            })
        },
        find(obj = {}, obj2 = {}) {
            return new Promise((resolve, reject) => {
                DB.find(obj, obj2, (err, data) => {
                    if (err) return reject(err)
                    resolve(data)
                })
            })
        },
        update(obj = {}, obj2 = {}, obj3 = {}) {
            let temp = { multi: true } //操作多行

            Object.assign(temp, obj3)

            return new Promise((resolve, reject) => {
                DB.update(obj, obj2, temp, (err, data) => {
                    if (err) return reject(err)
                    resolve(data)
                })
            })
        },
        remove(obj = {}) {
            return new Promise((resolve, reject) => {
                DB.remove(obj, (err, data) => {
                    if (err) return reject(err)
                    resolve(data)
                })
            })
        }
    }
}