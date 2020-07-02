/*
 * @Author: PT
 * @Date: 2020-05-27 15:37:26
 * @LastEditors: PT
 * @LastEditTime: 2020-07-02 08:53:47
 * @Description: 仓库列表
 */ 
module.exports = [
  {
    name: 'APP',
    desc: '移动端框架，技术栈vue，UI为：vant-ui，集成了pxtorem以及多环境配置',
    git: {
      url: 'https://github.com/PT-github/test.git#master',
      type: 'github'
    },
    // 公共模块
    common: [
      {
        name: '登陆模块',
        value: 'login'
      },
      {
        name: '测试模块',
        value: 'test'
      },
    ]
  },
  {
    name: 'PC',
    desc: 'PC端框架，技术栈vue，UI为：element-ui',
    git: {
      url: 'https://github.com/PT-github/test.git#test',
      type: 'github'
    },
    // 公共模块
    common: [
      {
        name: '登陆模块',
        value: 'login'
      },
      {
        name: '系统模块',
        value: 'system'
      }
    ]
  }
]