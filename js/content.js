import { round, score, getListLength } from './score.js';

const dir = './data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    if (!listResult.ok) {
        throw new Error(`Failed to fetch list: ${listResult.statusText}`);
    }
    const list = await listResult.json();
    const fetchLevel = async (path) => {
        const levelResult = await fetch(`${dir}/${path}.json`);
        if (!levelResult.ok) {
            throw new Error(`Failed to fetch level: ${levelResult.statusText}`);
        }
        const level = await levelResult.json();
        
        // Filter records to only include 100% completions
        const filteredRecords = level.records.filter(record => record.percent === 100);
        
        return {
            ...level,
            path,
            records: filteredRecords,
            percentToQualify: 100 // Set all levels to require 100%
        };
    };
    return await Promise.all(list.map(fetchLevel));
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    const listLength = list.length;

    const scoreMap = {};
    list.forEach((level, rank) => {
        // Verification
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

        // Records (only 100%)
        level.records.forEach((record) => {
            // Skip non-100% records
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

    // Wrap in extra Object containing the user and total score
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

    // Sort by total score
    return res.sort((a, b) => b.total - a.total);
}