import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard">
            <div class="board-container">
                <table class="list">
                    <tr 
                        v-for="(ientry, i) in leaderboard" 
                        class="list__item" 
                        :class="{ 'list__item--active': selected == i }"
                    >
                        <td class="list__rank">
                            <p class="type-label-lg">#{{ i + 1 }}</p>
                        </td>
                        <td class="list__rank">
                            <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                        </td>
                        <td class="list__level">
                            <button @click="selected = i">
                                <img 
                                    v-if="ientry.flag" 
                                    class="player-flag" 
                                    :src="'./assets/flags/' + ientry.flag + '.svg'" 
                                    :alt="ientry.flag + ' flag'"
                                >
                                <span class="type-label-lg">{{ ientry.user }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="player-container">
                <div class="player">
                    <h1>
                        #{{ selected + 1 }} ⇢ 
                        <img 
                            v-if="entry.flag" 
                            class="player-flag-lg" 
                            :src="'./assets/flags/' + entry.flag + '.svg'" 
                            :alt="entry.flag + ' flag'"
                        >
                        {{ entry.user }}
                    </h1>
                    <h2>Verified</h2>
                    <div class="table">
                        <template v-if="entry.verified && entry.verified.length > 0">
                            <template v-for="score in entry.verified">
                                <p class="rank">#{{ score.rank }}</p>
                                <p>
                                    {{ score.level }}
                                    <span class="level-type" :class="score.type">{{ score.type }}</span>
                                </p>
                                <p class="score">+{{ localize(score.score) }}</p>
                                <a 
                                    v-if="score.link && score.link !== 'x' && score.link !== '???'" 
                                    :href="score.link"
                                >
                                    <img src="./assets/video.svg" alt="Video" style="filter: invert(1)">
                                </a>
                                <span v-else class="no-link"></span>
                            </template>
                        </template>
                        <p v-else class="no-records">No Verifications</p>
                    </div>
                    <h2>Completed</h2>
                    <div class="table">
                        <template v-if="entry.completed && entry.completed.length > 0">
                            <template v-for="score in entry.completed">
                                <p class="rank">#{{ score.rank }}</p>
                                <p>
                                    {{ score.level }}
                                    <span class="level-type" :class="score.type">{{ score.type }}</span>
                                </p>
                                <p class="score">+{{ localize(score.score) }}</p>
                                <a 
                                    v-if="score.link && score.link !== 'x' && score.link !== '???'" 
                                    :href="score.link"
                                >
                                    <img src="./assets/video.svg" alt="Video" style="filter: invert(1)">
                                </a>
                                <span v-else class="no-link"></span>
                            </template>
                        </template>
                        <p v-else class="no-records">No Records</p>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected] || {
                user: 'Loading...',
                verified: [],
                completed: [],
                flag: null
            };
        },
    },
    async mounted() {
        this.leaderboard = await fetchLeaderboard();
        this.loading = false;
    },
    methods: {
        localize
    },
};
