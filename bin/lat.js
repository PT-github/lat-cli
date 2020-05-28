#!/usr/bin/env node

const program = require('commander')
let package = require('../package.json')

program.version(package.version)
  .usage('<command>')
  .command('create', '创建新项目')
  .parse(process.argv)