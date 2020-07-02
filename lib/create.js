/*
 * @Author: PT
 * @Date: 2020-06-30 11:43:56
 * @LastEditors: PT
 * @LastEditTime: 2020-07-02 10:06:58
 * @Description: file content
 */
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const Creator = require('./Creator')
const chalk = require('chalk')
const validateProjectName = require('validate-npm-package-name')
const { error } = require('./util/logger')

async function create (projectName, options) {

  const cwd = options.cwd || process.cwd()
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const targetDir = path.resolve(cwd, projectName || '.')

  const result = validateProjectName(name)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    process.exit(1)
  }

  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `${chalk.cyan(targetDir)} 已经存在. 请选择是否覆盖:`,
          choices: [
            { name: '覆盖', value: 'overwrite' },
            { name: '取消', value: false }
          ]
        }
      ])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\n删除 ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
  }

  const creator = new Creator(name, targetDir)// , getPromptModules()
  await creator.create(options)
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    error(err)
    process.exit(1)
  })
}
