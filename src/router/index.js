import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../components/pages/MainPage.vue'
import TaskPage from '../components/pages/TaskPage.vue'
import SettingsPage from '../components/pages/SettingsPage.vue'
const routes = [
  { path: '/', redirect: '/main' },
  { path: '/main', component: MainPage },
  { path: '/task', component: TaskPage },
  { path: '/task/:id', component: TaskPage },
  { path: '/settings', component: SettingsPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})




export default router
