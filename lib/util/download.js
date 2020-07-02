/*
 * @Author: PT
 * @Date: 2020-07-01 12:33:51
 * @LastEditors: PT
 * @LastEditTime: 2020-07-01 15:15:31
 * @Description: 下载资源
 */ 
const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

module.exports = function (target, url) {
  target = path.join(process.cwd(), target)
  return new Promise((resolve, reject) => {
    const spinner = ora('正在下载资源文件....').start()
    download(
      url,
      target,
      { clone: true },
      err => {
        if (err) {
          spinner.text = '资源文件下载失败'
          spinner.fail()
          return reject(err)
        }
        spinner.text = '资源文件下载成功'
        spinner.succeed()
        // 下载的模板存放在一个临时目录，下载完成后，返回临时路径，方便后续处理
        resolve(target)
      }
    )
  })
}