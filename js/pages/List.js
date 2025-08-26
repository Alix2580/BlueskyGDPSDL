import { embed } from '../util.js';
import { score, getListLength } from '../score.js';
import { fetchList } from '../content.js';

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
                        placeholder="Search levels..." 
                        class="search-input"
                    >
                    <button class="search-clear" v-if="searchQuery" @click="searchQuery = ''">
                        ×
                    </button>
                </div>
                <table class="list">
                    <tr 
                        v-for="(level, i) in filteredList" 
                        class="list__item" 
                        :class="[
                            { 'list__item--active': selected == i },
                            level.rank === 1 ? 'rank-1' : '',
                            level.rank === 2 ? 'rank-2' : '',
                            level.rank === 3 ? 'rank-3' : '',
                            level.isBenchmark ? 'benchmark' : ''
                        ]"
                    >
                        <td class="list__rank">
                            <p class="type-label-lg">
                                <span v-if="level.isBenchmark">★</span>
                                <span v-else>#{{ level.rank }}</span>
                            </p>
                        </td>
                        <td class="list__level">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level.displayName }}</span>
                                <span v-if="level.isBenchmark" class="benchmark-tag">Benchmark</span>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="filteredList.length === 0" class="list__empty">
                        <td colspan="2">
                            <p class="type-label-lg">No levels found matching "{{ searchQuery }}"</p>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container" v-if="level">
                <div class="level">
                    <h1>{{ level.displayName }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li v-if="!level.isBenchmark">
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ calculateScore(level.rank) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Difficulty</div>
                            <p>{{ level.password || 'Demon' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p><strong>100%</strong> completion required</p>
                    <div class="records">
                        <template v-for="record in level.records" class="record">
                            <div class="percent">
                                <p>100%</p>
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
                    <h3>List Editors</h3>
                    <ul class="editors">
                        <li>
                            <img src="./assets/crown.svg" alt="Owner" style="filter: invert(1)">
                            <p>DubbyBall</p>
                        </li>
                        <li>
                            <img src="./assets/user-gear.svg" alt="Helper" style="filter: invert(1)">
                            <p>shib</p>
                        </li>
                        <li>
                            <img src="./assets/user-gear.svg" alt="Helper" style="filter: invert(1)">
                            <p>Kubix</p>
                        </li>
                        <li>
                            <img src="./assets/user-gear.svg" alt="Helper" style="filter: invert(1)">
                            <p>Firelia</p>
                        </li>
                          <li>
                            <img src="./assets/user-gear.svg" alt="Helper" style="filter: invert(1)">
                            <p>Hexy</p>
                        </li>
                        <li>
                            <img src="./assets/code.svg" alt="Developer" style="filter: invert(1)">
                            <p>Luna</p>
                        </li>
                    </ul>
                    <h3>Submission Requirements</h3>
                    <p>
                        Achieved the record without using hacks (however, FPS bypass is allowed, up to 480fps)
                    </p>
                    <p>
                        Achieved <strong>100% Completion</strong> on the level that is listed on the site - please check the level ID before you submit a record
                    </p>
                    <p>
                        Have either source audio or clicks/taps in the video. Edited audio only does not count
                    </p>
                    <p>
                        The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this
                    </p>
                     <p>
                        Click Between Frames is allowed
                    </p>
                      <p>
                        If you beat a level from 0% while in practice mode, your record will still be taken under consideration and not denied instantly
                    </p>
                    <p>
                        Do not use secret routes or bug routes. If you find one, report it to the level's creator
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        loading: true,
        selected: 0,
        listLength: 150,
        searchQuery: '',
    }),
    computed: {
        level() {
            return this.list[this.selected];
        },
        filteredList() {
            if (!this.searchQuery) return this.list;
            
            const query = this.searchQuery.toLowerCase();
            return this.list.filter(level => 
                level.displayName.toLowerCase().includes(query) || 
                (level.author && level.author.toLowerCase().includes(query)) ||
                (level.id && String(level.id).includes(query))
            );
        }
    },
    async mounted() {
        try {
            const rawList = await fetchList();
            let rankCounter = 1;

            this.list = rawList.map(raw => {
                const isBenchmark = raw.startsWith('_');
                const displayName = isBenchmark ? raw.substring(1) : raw;
                const levelObj = {
                    name: raw,
                    displayName,
                    isBenchmark,
                    rank: isBenchmark ? null : rankCounter++,
                    author: "Unknown", // placeholder if fetchList doesn't fill this
                    creators: [],
                    verifier: "",
                    id: "",
                    password: "",
                    verification: "",
                    records: []
                };
                return levelObj;
            });

            this.listLength = await getListLength();
        } catch (error) {
            console.error('Error loading data:', error);
            this.list = [];
        } finally {
            this.loading = false;
        }
    },
    methods: {
        embed,
        calculateScore(rank) {
            return score(rank, this.listLength);
        }
    },
};
