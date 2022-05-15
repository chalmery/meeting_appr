import Vue from 'vue'
import App from './App.vue'
// 引入router
import router from './router'
// 引入vuetify
import vuetify from './plugins/vuetify';


Vue.config.productionTip = false
// 引入axios
import axios from './config/axios'
//引入vuex
import store from "@/vuex/vuex";
Vue.prototype.$axios=axios
// 全局消息
import Message from './components/message/index.js'
Vue.prototype.$message = Message
new Vue({
  router,
  vuetify,
  render: h => h(App),
  store,
}).$mount('#app')





