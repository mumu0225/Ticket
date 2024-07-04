import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import CinemaList from './components/CinemaList.vue'
import SessionSelection from './components/SessionSelection.vue'
import SeatSelection from './components/SeatSelection.vue'
import PaymentPage from './components/Payment.vue'
import Login from './components/LoginComponent.vue';
import { createPinia } from 'pinia'//
import Antd from 'ant-design-vue';//
import 'ant-design-vue/dist/reset.css'; // 引入 Ant Design Vue 的样式
  

const router = createRouter({
  history: createWebHistory(),
  routes: [

    { path: '/', component: CinemaList },
    { path: '/login', name:'Login', component: Login },
    { path: '/session-selection/:cinemaId', name: 'session-selection', component: SessionSelection },
    { path: '/seat-selection/:sessionId', name: 'seat-selection', component: SeatSelection },
    { path: '/payment', name: 'payment', component: PaymentPage, props: true } // 添加支付订单页面的路由配置
  
  ]
})

createApp(App)
  .use(createPinia())
  .use(router)
  .use(Antd)
  .mount('#app')