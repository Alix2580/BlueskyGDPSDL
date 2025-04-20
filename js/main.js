import routes from './routes.js';

const app = Vue.createApp({});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory('/CP9DL/'),
    routes,
});

app.use(router);

app.mount('#app');