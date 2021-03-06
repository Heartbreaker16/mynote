import Vue from 'vue'
import App from './App'
import service from './utils/service'

Vue.config.productionTip = false
App.mpType = 'app'

Vue.mixin({
  data() {
    return {
      service: null,
      // rootUrl: 'http://localhost:3000/'
      rootUrl: 'http://207.148.90.74:1997/'
    }
  },
  created() {
    this.service = service
  }
})

const app = new Vue(App)
app.$mount()

wx.setEnableDebug({
  enableDebug: true
})