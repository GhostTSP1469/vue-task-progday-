import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../components/pages/MainPage.vue'
import TaskPage from '../components/pages/TaskPage.vue'
import SettingsPage from '../components/pages/SettingsPage.vue'
import CalcPage from '../components/pages/CalcPage.vue'

const routes = [
  { path: '/', redirect: '/main' },
  { path: '/main', component: MainPage },
  { path: '/task', component: TaskPage },
  { path: '/task/:id', component: TaskPage },
  { path: '/settings', component: SettingsPage },
  {path: '/calc', component: CalcPage}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})




export default router
