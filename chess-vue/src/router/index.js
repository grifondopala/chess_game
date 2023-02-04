import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld'
import Main from '../components/Main'
import Authorization from '../components/Authorization'
import MyProfile from '../components/MyProfile'
import Top from '../components/Top'

const routes = [
    {
      path: '/',
      name: 'main',
      component: Main,
    },
    {
      path: '/game/:id',
      name: 'game',
      component: HelloWorld,
      props: true,
    },
    {
      path: '/login',
      name: 'login',
      component: Authorization,
    },
    {
      path: '/myProfile',
      name: 'myProfile',
      component: MyProfile,
    },
    {
      path: '/top',
      name: 'top',
      component: Top,
    },
  ]
  
  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router