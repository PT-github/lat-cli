/*
 * @Author: PT
 * @Date: 2020-07-01 15:52:21
 * @LastEditors: PT
 * @LastEditTime: 2020-07-01 15:58:13
 * @Description: file content
 */ 
const path = require('path')
const fs = require('fs')

// let file = fs.statSync(path.join(process.cwd(), 'demo01/package0name/node_modules.zip'))

console.log(path.basename(path.join(process.cwd(), 'demo01/package0name/node_modules.zip')))