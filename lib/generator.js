/*
 * @Author: PT
 * @Date: 2020-05-28 09:29:19
 * @LastEditors: PT
 * @LastEditTime: 2020-05-28 17:54:14
 * @Description: 模版文件解析 TODO
 */
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
// const rm = require('rimraf').sync

module.exports = (metadata = {}, src, dest = '.') => {
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`))
  }

  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use((files, metalsmith, done) => {
        const meta = metalsmith.metadata()
        Object.keys(files).forEach(fileName => {
          const t = files[fileName].contents.toString()
          files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta))
        })
        done()
      }).build(err => {
        if (err) {
          return reject(err)
        }
        // rm(src)
        resolve()
      })
  })
}
