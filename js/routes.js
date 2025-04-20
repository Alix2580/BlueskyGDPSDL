import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';

const baseUrl = '/CP9DL/';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
];