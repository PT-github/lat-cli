/*
 * @Author: PT
 * @Date: 2020-05-28 10:51:46
 * @LastEditors: PT
 * @LastEditTime: 2020-05-28 16:41:51
 * @Description: 修改json文件中的数据
 */ 
const fs = require('fs')
const path = require('path')

module.exports = (filepath, data) => {
  return new Promise((resolve, reject) => {
    let file = fs.statSync(filepath)

    if (file.isFile() && path.extname(filepath) === '.json') {
      var packageJson = JSON.parse(fs.readFileSync(filepath)) || {}
      var keys = Object.keys(packageJson)
      for (let prop in data) {
        keys.indexOf(prop) !== -1 && (packageJson[prop] = data[prop])
      }
      fs.writeFile(filepath, JSON.stringify(packageJson, null, 2), err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    } else {
      reject(`${filepath}不是一个json文件`)
    }
  })
}
