/*
 * @Author: PT
 * @Date: 2020-05-28 15:35:31
 * @LastEditors: PT
 * @LastEditTime: 2020-05-28 16:18:32
 * @Description: zip文件解压
 */

const StreamZip = require('node-stream-zip')

/**
 * @param {String} zippath zip文件地址
 * @param {String} out zip解压目录
 * @returns {Promise} 返回一个promise
 */
module.exports = (zippath, out) => {
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({
      file: zippath,
      storeEntries: true
    })
  
    // 报错提示
    zip.on('error', err => { 
      reject(err)
    })
    zip.on('ready', () => {
      zip.extract(null, out, err => {
        zip.close()
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}



// const unzip = require('unzip') // 针对node高版本（v12+）不支持
// function unZip (zippath, out) {
//   fs.createReadStream(src).pipe(unzip.Extract({ path: out }))
// }
// unZip(path.resolve(__dirname, '../testPC/node_modules.zip'), path.resolve(__dirname, '../testPC'))