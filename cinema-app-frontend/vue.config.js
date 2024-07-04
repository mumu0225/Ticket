const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  devServer: {
    historyApiFallback: true,
    allowedHosts: "all",
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot服务的URL
        changeOrigin: true
      }
    }
  }
};