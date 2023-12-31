import { createApp } from 'vue'
import App from './App.vue'
import install from './install'
import './permission'
import './styles/index.scss'
import 'virtual:svg-icons-register'
import './static/iconfont/iconfont.css'
import './Mock/Mock.js'
// import './rabbitmq/websocket'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css';
import * as ECharts from 'echarts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
app.use(install).use(Antd)

app.config.globalProperties.$ECharts = ECharts

app.mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}




