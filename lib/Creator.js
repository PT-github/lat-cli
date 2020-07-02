
const EventEmitter = require('events')
const inquirer = require('inquirer')
const gitRep = require('../git-rep') // git源配置
const fs = require('fs')
const download = require('./util/download')
const path = require('path')
const unzip = require('./util/unzip')
const execa = require('execa')
const { logWithSpinner, stopSpinner } = require('./util/spinner')
const { hasGit, hasProjectGit } = require('./util/index')
const { log } = require('./util/logger')
const logSymbols = require('log-symbols')
const chalk = require('chalk')

module.exports = class Creator extends EventEmitter {
  constructor (name, context) {
    super()
    this.context = context
    this.name = name
    this.projectObj = {} // 项目对象
    // 获取脚手架配置的项目选择交互语
    const { projectPrompt, commonPrompt, descriptionPromt } = this.resolveIntroPrompts()
    this.version = '1.0.0'
    this.descriptionPromt = descriptionPromt // 项目描述交互语
    this.projectPrompt = projectPrompt // 项目选择交互语
    this.commonPrompt = commonPrompt // 项目公共模块交互与
  }

  /**
   * @param {Object} cliOptions 选项
   */
  async create (cliOptions = {}) {
    let answers = await inquirer.prompt(this.resolveFinalPrompts())
    await this.generateProject(answers)
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      logWithSpinner('🗃', 'git仓库初始化...')
      this.emit('creation', { event: 'git-init' })
      await this.run('git init')
      stopSpinner()
    }
    console.log(logSymbols.success, chalk.green('项目创建成功'))
  }
  
  async generateProject ({ project, description, common }) {
    fs.mkdirSync(this.name) // 创建项目文件夹
    let { url } = this.projectObj[project].git
    url = 'direct:' + url
    let projectPath = await download(this.name, url)
    
    // 重写package.json
    let packageJsonPath = path.join(projectPath, 'package.json')
    fs.existsSync(packageJsonPath) && this.rewriteJson(packageJsonPath, {name: this.name, description})

    // 内网解压node_modules
    let nodeModulesPath = path.join(projectPath, 'node_modules.zip')
    fs.existsSync(nodeModulesPath) && await unzip(nodeModulesPath, projectPath)

    // TODO 对公共模块进行处理 
    console.log('需要处理的公共模块有', common)
  }

  // 重写json文件
  rewriteJson (filepath, data) {
    let file = fs.statSync(filepath)
    if (file.isFile() && path.extname(filepath) === '.json') {
      var packageJson = JSON.parse(fs.readFileSync(filepath)) || {}
      Object.assign(packageJson, data)
      fs.writeFileSync(filepath, JSON.stringify(packageJson, null, 2))
    }
  }

  // 生成 项目描述询问 项目询问 和 项目下的公共模块询问
  resolveIntroPrompts () {
    const projects = gitRep,// 项目询问
      commonPrompt = [] // 项目公共模块询问
    const projectChoices = projects.map(projectItem => {
      let { name, desc, common = [] } = projectItem
      let commonFun = {
        name: 'common',
        when: answers => answers.project === name,
        type: 'checkbox',
        message: '请选择需要的公共模块:',
        choices: [],
        pageSize: 10
      }
      common && common.length > 0 && (common.forEach(item => {
        commonFun.choices.push(item)
      }) , commonPrompt.push(commonFun))
      this.projectObj[name] = projectItem
      return {
        name: `${name} (${desc})`,
        value: name
      }
    })
    const projectPrompt = {
      name: 'project',
      type: 'list',
      message: '请选择需要下载的项目:',
      choices: [
        ...projectChoices
      ]
    }
    const descriptionPromt = {
      name: 'description',
      message: '请输入项目描述:'
    }
    return {
      descriptionPromt,
      projectPrompt,
      commonPrompt
    }
  }
  // 组合所有交互语
  resolveFinalPrompts () {
    const prompts = [
      this.descriptionPromt,
      this.projectPrompt,
      ...this.commonPrompt
    ]
    return prompts
  }

  run (command, args) {
    if (!args) { [command, ...args] = command.split(/\s+/) }
    return execa(command, args, { cwd: this.context })
  }

  shouldInitGit (cliOptions) {
    if (!hasGit()) {
      return false
    }
    // --git
    if (cliOptions.forceGit) {
      return true
    }
    // --no-git
    if (cliOptions.git === false || cliOptions.git === 'false') {
      return false
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.context)
  }








  async promptAndResolvePreset (answers = null) {
    // prompt
    if (!answers) {
      await clearConsole(true)
      answers = await inquirer.prompt(this.resolveFinalPrompts())
    }
    debug('vue-cli:answers')(answers)

    if (answers.packageManager) {
      saveOptions({
        packageManager: answers.packageManager
      })
    }

    let preset
    if (answers.preset && answers.preset !== '__manual__') {
      preset = await this.resolvePreset(answers.preset)
    } else {
      // manual
      preset = {
        useConfigFiles: answers.useConfigFiles === 'files',
        plugins: {}
      }
      answers.features = answers.features || []
      // run cb registered by prompt modules to finalize the preset
      this.promptCompleteCbs.forEach(cb => cb(answers, preset))
    }

    // validate
    validatePreset(preset)

    // save preset
    if (answers.save && answers.saveName && savePreset(answers.saveName, preset)) {
      log()
      log(`🎉  Preset ${chalk.yellow(answers.saveName)} saved in ${chalk.yellow(rcPath)}`)
    }

    debug('vue-cli:preset')(preset)
    return preset
  }

  async resolvePreset (name, clone) {
    let preset
    const savedPresets = loadOptions().presets || {}

    if (name in savedPresets) {
      preset = savedPresets[name]
    } else if (name.endsWith('.json') || /^\./.test(name) || path.isAbsolute(name)) {
      preset = await loadLocalPreset(path.resolve(name))
    } else if (name.includes('/')) {
      logWithSpinner(`Fetching remote preset ${chalk.cyan(name)}...`)
      this.emit('creation', { event: 'fetch-remote-preset' })
      try {
        preset = await loadRemotePreset(name, clone)
        stopSpinner()
      } catch (e) {
        stopSpinner()
        error(`Failed fetching remote preset ${chalk.cyan(name)}:`)
        throw e
      }
    }

    // use default preset if user has not overwritten it
    if (name === 'default' && !preset) {
      preset = defaults.presets.default
    }
    if (!preset) {
      error(`preset "${name}" not found.`)
      const presets = Object.keys(savedPresets)
      if (presets.length) {
        log()
        log(`available presets:\n${presets.join('\n')}`)
      } else {
        log('you don\'t seem to have any saved preset.')
        log('run vue-cli in manual mode to create a preset.')
      }
      exit(1)
    }
    return preset
  }

  // { id: options } => [{ id, apply, options }]
  async resolvePlugins (rawPlugins) {
    // ensure cli-service is invoked first
    rawPlugins = sortObject(rawPlugins, ['@vue/cli-service'], true)
    const plugins = []
    for (const id of Object.keys(rawPlugins)) {
      const apply = loadModule(`${id}/generator`, this.context) || (() => {})
      let options = rawPlugins[id] || {}
      if (options.prompts) {
        const prompts = loadModule(`${id}/prompts`, this.context)
        if (prompts) {
          log()
          log(`${chalk.cyan(options._isPreset ? 'Preset options:' : id)}`)
          options = await inquirer.prompt(prompts)
        }
      }
      plugins.push({ id, apply, options })
    }
    return plugins
  }

  resolveOutroPrompts () {
    const outroPrompts = [
      {
        name: 'useConfigFiles',
        when: isManualMode,
        type: 'list',
        message: 'Where do you prefer placing config for Babel, ESLint, etc.?',
        choices: [
          {
            name: 'In dedicated config files',
            value: 'files'
          },
          {
            name: 'In package.json',
            value: 'pkg'
          }
        ]
      },
      {
        name: 'save',
        when: isManualMode,
        type: 'confirm',
        message: 'Save this as a preset for future projects?',
        default: false
      },
      {
        name: 'saveName',
        when: answers => answers.save,
        type: 'input',
        message: 'Save preset as:'
      }
    ]

    // ask for packageManager once
    const savedOptions = loadOptions()
    if (!savedOptions.packageManager && (hasYarn() || hasPnpm3OrLater())) {
      const packageManagerChoices = []

      if (hasYarn()) {
        packageManagerChoices.push({
          name: 'Use Yarn',
          value: 'yarn',
          short: 'Yarn'
        })
      }

      if (hasPnpm3OrLater()) {
        packageManagerChoices.push({
          name: 'Use PNPM',
          value: 'pnpm',
          short: 'PNPM'
        })
      }

      packageManagerChoices.push({
        name: 'Use NPM',
        value: 'npm',
        short: 'NPM'
      })

      outroPrompts.push({
        name: 'packageManager',
        type: 'list',
        message: 'Pick the package manager to use when installing dependencies:',
        choices: packageManagerChoices
      })
    }

    return outroPrompts
  }

  

  
}
