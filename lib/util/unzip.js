/*
 * @Author: PT
 * @Date: 2020-05-28 15:35:31
 * @LastEditors: PT
 * @LastEditTime: 2020-07-01 16:04:15
 * @Description: zip文件解压
 */

const StreamZip = require('node-stream-zip')
const ora = require('ora')
const path = require('path')

/**
 * @param {String} zippath zip文件地址
 * @param {String} out zip解压目录
 * @returns {Promise} 返回一个promise
 */
module.exports = (zippath, out) => {
  let filename = path.basename(zippath)
  const spinner = ora(`正在解压${filename}文件....`).start()
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({
      file: zippath,
      storeEntries: true
    })
    // 报错提示
    zip.on('error', err => {
      spinner.text = `${filename}解压失败`
      spinner.fail()
      reject(err)
    })
    zip.on('ready', () => {
      zip.extract(null, out, err => {
        zip.close()
        if (err) {
          spinner.text = `${filename}解压失败`
          spinner.fail()
          return reject(err)
        }
        spinner.text = `${filename}解压完成`
        spinner.succeed()
        resolve()
      })
    })
  }).catch(err => {
    spinner.text = `${filename}解压失败`
    spinner.fail()
    console.log(err)
  })
}



// const unzip = require('unzip') // 针对node高版本（v12+）不支持
// function unZip (zippath, out) {
//   fs.createReadStream(src).pipe(unzip.Extract({ path: out }))
// }
// unZip(path.resolve(__dirname, '../testPC/node_modules.zip'), path.resolve(__dirname, '../testPC'))