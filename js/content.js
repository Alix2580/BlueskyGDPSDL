import { round, score, getListLength } from './score.js';

const isGitHubPages = window.location.hostname.includes('github.io');
const dir = isGitHubPages ? '/CP9DL/data' : './data';

console.log(`Running on ${isGitHubPages ? 'GitHub Pages' : 'local environment'}`);
console.log(`Data directory path: ${dir}`);

export async function fetchList() {
    try {
        const listPath = `${dir}/_list.json`;
        console.log(`Fetching list from: ${listPath}`);
        
        const listResult = await fetch(listPath);
        if (!listResult.ok) {
            console.error(`Failed to fetch list: ${listResult.status} ${listResult.statusText}`);
            throw new Error(`Failed to fetch list: ${listResult.status} ${listResult.statusText}`);
        }
        
        const list = await listResult.json();
        console.log(`Successfully loaded list with ${list.length} levels`);
        
        const fetchLevel = async (path) => {
            try {
                const levelPath = `${dir}/${path}.json`;
                console.log(`Fetching level from: ${levelPath}`);
                
                const levelResult = await fetch(levelPath);
                if (!levelResult.ok) {
                    console.error(`Failed to fetch level ${path}: ${levelResult.status} ${levelResult.statusText}`);
                    throw new Error(`Failed to fetch level: ${levelResult.statusText}`);
                }
                
                const level = await levelResult.json();
                
                const filteredRecords = level.records.filter(record => record.percent === 100);
                
                return {
                    ...level,
                    path,
                    records: filteredRecords,
                    percentToQualify: 100 
                };
            } catch (error) {
                console.error(`Error fetching level ${path}:`, error);
                return {
                    name: `Error loading ${path}`,
                    path,
                    records: [],
                    percentToQualify: 100,
                    error: true
                };
            }
        };
        
        return await Promise.all(list.map(fetchLevel));
    } catch (error) {
        console.error('Error in fetchList:', error);
        return [];
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    const listLength = list.length;

    const scoreMap = {};
    list.forEach((level, rank) => {
        scoreMap[level.verifier] ??= {
            verified: [],
            completed: [],
        };
        const { verified } = scoreMap[level.verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, listLength),
            link: level.verification,
        });

        level.records.forEach((record) => {
            if (record.percent !== 100) return;
            
            scoreMap[record.user] ??= {
                verified: [],
                completed: [],
            };
            const { completed } = scoreMap[record.user];
            
            completed.push({
                rank: rank + 1,
                level: level.name,
                score: score(rank + 1, listLength),
                link: record.link,
            });
        });
    });

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed } = scores;
        const total = [verified, completed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    return res.sort((a, b) => b.total - a.total);
}