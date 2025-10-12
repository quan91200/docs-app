import {
  createRouter,
  createWebHistory,
} from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/pages/Home.vue'),
    meta: { layout: 'DefaultLayout' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
