import { embed } from '../util.js';
import { score, getChallengeListLength } from '../score.js';
import { fetchChallengeList } from '../content.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <div class="search-container">
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Search challenges..." 
                        class="search-input"
                    >
                    <button class="search-clear" v-if="searchQuery" @click="searchQuery = ''">
                        ×
                    </button>
                </div>
                <table class="list">
                    <tr v-for="(level, i) in filteredList" class="list__item" :class="{ 'list__item--active': selected == i }">
                        <td class="list__rank">
                            <p class="type-label-lg">#{{ list.indexOf(level) + 1 }}</p>
                        </td>
                        <td class="list__level">
                            <button @click="selected = list.indexOf(level)">
                                <span class="type-label-lg">{{ level.name }}</span>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="filteredList.length === 0" class="list__empty">
                        <td colspan="2">
                            <p class="type-label-lg">No challenges found matching "{{ searchQuery }}"</p>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe v-if="embedUrl" class="video" :src="embedUrl" frameborder="0"></iframe>
                    <p v-else class="no-video">No verification video available</p>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ calculateScore(selected + 1) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p><strong>{{ level.percentToQualify }}%</strong> or higher required</p>
                    <div class="records">
                        <template v-for="record in level.records" class="record">
                            <div class="percent">
                                <p>{{ record.percent }}%</p>
                            </div>
                            <div class="user">
                                <p>{{ record.user }}</p>
                            </div>
                            <div class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </div>
                            <div class="link">
                                <a :href="record.link">
                                    <img src="./assets/video.svg" alt="Video" style="filter: invert(1)">
                                </a>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <h3>Challenge List Editors</h3>
                    <ul class="editors">
                        <li>
                            <img src="./assets/crown.svg" alt="Owner" style="filter: invert(1)">
                            <p>NK87</p>
                        </li>
                        <li>
                            <img src="./assets/code.svg" alt="Developer" style="filter: invert(1)">
                            <p>lostsucks</p>
                        </li>
                    </ul>
                    <h3>Challenge Submission Requirements</h3>
                    <p>
                        Achieved the record without using hacks (however, FPS bypass is allowed, up to 360fps)
                    </p>
                    <p>
                        Have either source audio or clicks/taps in the video. Edited audio only does not count (Fake Clicks/Click Sounds are not allowed)
                    </p>
                    <p>
                        Your submitted challenge must be under 30 seconds in length!
                    </p>
                    <h4>Submit in our discord server!</h4>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        loading: true,
        selected: 0,
        listLength: 10, // Default value for challenge list length
        searchQuery: '',
    }),
    computed: {
        level() {
            return this.list[this.selected] || { 
                name: 'Loading...',
                author: '',
                creators: [],
                verifier: '',
                verification: '',
                id: 0,
                password: '',
                percentToQualify: 100,
                records: []
            };
        },
        filteredList() {
            if (!this.searchQuery) return this.list;
            
            const query = this.searchQuery.toLowerCase();
            return this.list.filter(level => 
                level.name.toLowerCase().includes(query) || 
                level.author.toLowerCase().includes(query) ||
                String(level.id).includes(query)
            );
        },
        embedUrl() {
            return embed(this.level.verification);
        }
    },
    async mounted() {
        try {
            this.list = await fetchChallengeList();
            this.listLength = await getChallengeListLength();
        } catch (error) {
            console.error('Error loading challenge list data:', error);
            this.list = []; // Set empty list on error
        } finally {
            this.loading = false;
        }
    },
    methods: {
        calculateScore(rank) {
            return score(rank, this.listLength, true); // true indicates it's a challenge list
        }
    },
};