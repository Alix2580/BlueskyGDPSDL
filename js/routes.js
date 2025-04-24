import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import ChallengeList from './pages/ChallengeList.js';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/challenges', component: ChallengeList },
];