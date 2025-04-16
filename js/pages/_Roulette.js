import { fetchList } from '../content.js';
import { embed } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        list: [],
        loading: true,
        rouletteList: [],
        currentLevelIndex: -1,
        currentPercentage: 1,
        spinning: false,
        currentLevel: null,
        userPercent: null,
        history: [],
        completed: false,
        rouletteStarted: false
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-roulette">
            <div class="roulette-grid">
                <div class="controls-container">
                    <h1>CP9 Demon Roulette</h1>
                    
                    <div v-if="!rouletteStarted" class="roulette-controls">
                        <button 
                            class="roulette-button" 
                            @click="startRoulette" 
                            :disabled="spinning">
                            Start Roulette
                        </button>
                    </div>
                    
                    <div v-else class="roulette-controls">
                        <button 
                            class="roulette-button reset" 
                            @click="resetRoulette">
                            Reset Roulette
                        </button>
                        
                        <button 
                            class="roulette-button export" 
                            @click="exportHistory"
                            :disabled="history.length === 0">
                            Export Results
                        </button>
                    </div>
                    
                    <div v-if="currentLevel && !completed" class="current-level">
                        <h2>Current Challenge:</h2>
                        <div class="level-card">
                            <h3>{{ currentLevel.name }}</h3>
                            <p class="type-body">ID: {{ currentLevel.id }}</p>
                            <p class="type-body">Creator: {{ currentLevel.author }}</p>
                            <p class="challenge">Get <strong>{{ currentPercentage }}%</strong> or higher!</p>
                            
                            <div class="percent-input">
                                <label for="userPercent">What percent did you achieve?</label>
                                <input 
                                    type="number" 
                                    id="userPercent" 
                                    v-model.number="userPercent" 
                                    :min="currentPercentage"
                                    max="100" 
                                    placeholder="Enter your percentage">
                                <button @click="submitPercent" :disabled="!isValidPercent">Submit</button>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="completed" class="completion-message">
                        <h2>You beat the roulette!</h2>
                        <p>Stay tuned for more levels.</p>
                    </div>
                    
                    <div v-if="history.length > 0" class="history">
                        <h2>Your Progress</h2>
                        <div class="history-list">
                            <div v-for="(entry, index) in history" :key="index" class="history-item">
                                <span class="history-number">{{ index + 1 }}.</span>
                                <span class="history-level">{{ entry.level.name }}</span>
                                <span class="history-target">Target: {{ entry.targetPercent }}%</span>
                                <span class="history-achieved" 
                                      :class="entry.achievedPercent >= entry.targetPercent ? 'success' : ''">
                                    Achieved: {{ entry.achievedPercent }}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="video-container" v-if="currentLevel">
                    <iframe 
                        class="level-video" 
                        :src="currentLevel.verification ? embed(currentLevel.verification) : ''" 
                        frameborder="0"
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        </main>
    `,
    computed: {
        isValidPercent() {
            return this.userPercent !== null && 
                   this.userPercent >= this.currentPercentage && 
                   this.userPercent <= 100;
        }
    },
    async mounted() {
        await this.initializeRoulette();
    },
    methods: {
        embed,
        async initializeRoulette() {
            this.loading = true;
            try {
                this.list = await fetchList();
                this.loading = false;
            } catch (error) {
                console.error('Error initializing roulette:', error);
                this.loading = false;
            }
        },
        
        shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        },
        
        startRoulette() {
            this.rouletteList = this.shuffleArray(this.list);
            this.rouletteStarted = true;
            this.currentLevelIndex = -1;
            this.currentLevel = null;
            this.currentPercentage = 1;
            this.advanceToNextLevel();
        },
        
        advanceToNextLevel() {
            if (this.spinning || this.currentLevelIndex >= this.rouletteList.length - 1) return;
            
            this.spinning = true;
            
            setTimeout(() => {
                // Get the next level
                this.currentLevelIndex++;
                this.currentLevel = this.rouletteList[this.currentLevelIndex];
                
                // Check if we've exhausted all levels
                if (this.currentLevelIndex >= this.rouletteList.length - 1) {
                    this.completed = true;
                }
                
                this.spinning = false;
            }, 500);
        },
        
        submitPercent() {
            if (!this.isValidPercent) return;
            
            // Add to history
            this.history.push({
                level: this.currentLevel,
                targetPercent: this.currentPercentage,
                achievedPercent: this.userPercent
            });
            
            // Update the next target percentage based on what the user achieved
            this.currentPercentage = Math.min(this.userPercent + 1, 100);
            
            // Reset user input
            this.userPercent = null;
            
            // Automatically advance to next level
            this.advanceToNextLevel();
        },
        
        resetRoulette() {
            this.rouletteStarted = false;
            this.rouletteList = [];
            this.currentLevelIndex = -1;
            this.currentLevel = null;
            this.currentPercentage = 1;
            this.userPercent = null;
            this.history = [];
            this.completed = false;
        },
        
        exportHistory() {
            if (this.history.length === 0) return;
            
            let content = "CP9 Demon Roulette Results\n";
            content += "=======================\n\n";
            
            // Add section for all levels on the list
            content += "Roulette List:\n";
            this.rouletteList.forEach((level, index) => {
                content += `#${index + 1} - ${level.name}\n`;
            });
            content += "\n=======================\n\n";
            
            // Add section for completed levels
            content += "Progress:\n";
            this.history.forEach((entry, index) => {
                content += `${index + 1}. ${entry.level.name}\n`;
                content += `   Target: ${entry.targetPercent}%\n`;
                content += `   Achieved: ${entry.achievedPercent}%\n`;
                content += `   ${entry.achievedPercent >= entry.targetPercent ? 'SUCCESS' : 'FAILED'}\n\n`;
            });
            
            content += "Summary:\n";
            content += `Total levels attempted: ${this.history.length}\n`;
            content += `Successful attempts: ${this.history.filter(entry => entry.achievedPercent >= entry.targetPercent).length}\n`;
            content += `Total levels in roulette: ${this.rouletteList.length}\n`;
            content += `Progress: ${this.history.length}/${this.rouletteList.length} levels (${Math.round((this.history.length/this.rouletteList.length)*100)}%)\n`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cp9-roulette-results.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
};