#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const download = require('./download')
const inquirer = require('inquirer') // 处理命令交互
// const generator = require('../lib/generator')
const rewriteJson = require('../lib/rewriteJson')
const mvdir = require('mvdir')
const rm = require('rimraf').sync
const chalk = require('chalk')
const logSymbols = require('log-symbols')
const unzip = require('../lib/unzip')
const gitRep = require('../git-rep')

// git仓库数据整理
function terminalList () {
  return gitRep.map((item, index) => Object.assign(item, {
    value: index
  }))
}

program.usage('<project-name>')

inquirer.prompt([
  {
    name: 'projectName',
    message: '项目的名称',
    validate: value => {
      var hasZh = /.*[\u4e00-\u9fa5]+.*$/.test(value)
      if (!value) {
        return '请输入项目名称'
      } else if (hasZh) {
        return '请输入英文名称'
      }

      return true
    }
  }, {
    name: 'description',
    message: '项目的简介',
  },
  {
    type: 'list',
    name: 'terminal',
    message: '选择项目运行终端',
    choices: terminalList()
  }
]).then(answers => {
  console.log(JSON.stringify(answers))
  let { projectName } = answers
  const list = glob.sync('*') // 遍历当前目录
  if (list.length) {
    // 当前目录不为空 如果该目录下包含了projectName的文件或文件夹 则抛出错误日志 退出
    if (list.filter(name => {
      return name === projectName
    }).length > 0) {
      return Promise.reject(`项目${projectName}已经存在`)
    }
  }
  go(answers)
}).catch(err => {
  console.error(err)
})

async function go ({ projectName, description, terminal }) {
  // 创建项目文件夹
  fs.mkdirSync(projectName)

  // 根据用户输入信息 创建模版文件 【TODO】
  // generator({projectName, description}, path.resolve(__dirname, '../template'), path.resolve(__dirname, '../temp'))
  try {
    // github:PT-github/test#master
    // https://github.com/PT-github/frontframe.git#master
    let url = 'github:' + gitRep[terminal].git.https.replace('https://github.com/', '')
    let target = await download(projectName, url)
    let downPath = path.join(__dirname, '../', target)
    let projectPath = path.join(__dirname, '../', projectName)
    // 重写package.json文件
    await rewriteJson(path.join(downPath, 'package.json'), { name: projectName, description })
    // 将文件从.download-temp目录下复制到项目目录下
    await mvdir(downPath, projectPath, { copy: true })
    // 删除下载临时目录
    rm(downPath)

    // 判断是否包含了node_modules 包含则解压
    let zippath = path.join(projectPath, 'node_modules.zip')
    if (fs.existsSync(zippath)) {
      await unzip(zippath, projectPath)
    }
    finish(projectName)
  } catch (error) {
    console.log(logSymbols.error, chalk.red('创建出错了'))
    console.error(error)
  }
}

function finish (dir) {
  console.log(logSymbols.success, chalk.green('创建成功:)'))
  console.log()
  console.log(chalk.green('cd ' + dir + '\nnpm run dev'))
}