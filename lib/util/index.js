/*
 * @Author: PT
 * @Date: 2020-07-02 09:02:42
 * @LastEditors: PT
 * @LastEditTime: 2020-07-02 09:16:12
 * @Description: file content
 */ 
const { execSync } = require('child_process')
const LRU = require('lru-cache')

let _hasGit
const _gitProjects = new LRU({
  max: 10,
  maxAge: 1000
})

exports.hasGit = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasGit !== undefined) {
    return _hasGit
  }
  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = (cwd) => {
  if (_gitProjects.has(cwd)) {
    return _gitProjects.get(cwd)
  }

  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  _gitProjects.set(cwd, result)
  return result
}