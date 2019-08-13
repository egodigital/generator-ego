module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `@import "~@/styles/main.scss"`,
      },
    },
  },
  chainWebpack: config => {
    ["vue-modules", "vue", "normal-modules", "normal"].forEach((match) => {
      config.module.rule('scss').oneOf(match).use('sass-loader')
        .tap(opt => Object.assign(opt, {
          data: `@import '~@/styles/main.scss';`
        }))
    })
  }
}