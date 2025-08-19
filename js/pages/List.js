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
                            <p class="type-label-lg">No levels found matching "{{ searchQuery }}"</p>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
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
        </main>
    `,
    data: () => ({
        list: [],
        loading: true,
        selected: 0,
        listLength: 25, // Default value until loaded
        searchQuery: '', // New search query property
    }),
    computed: {
        level() {
            return this.list[this.selected];
        },
        filteredList() {
            if (!this.searchQuery) return this.list;
            
            const query = this.searchQuery.toLowerCase();
            return this.list.filter(level => 
                level.name.toLowerCase().includes(query) || 
                level.author.toLowerCase().includes(query) ||
                String(level.id).includes(query)
            );
        }
    },
    async mounted() {
        try {
            this.list = await fetchList();
            this.listLength = await getListLength();
        } catch (error) {
            console.error('Error loading data:', error);
            this.list = []; // Set empty list on error
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
