/**
 * Numbers of decimal digits to round to
 */
const SCALE = 1;
const DEMON_MAX_SCORE = 350;
const DEMON_MIN_SCORE = 18.71;
const CHALLENGE_MAX_SCORE = 200;
const CHALLENGE_MIN_SCORE = 1;

/**
 * Calculate the score awarded for completing a list level
 * @param {Number} rank Position on the list
 * @param {Number} listLength Total number of levels in the list
 * @param {Boolean} isChallenge Whether this is a challenge list level
 * @returns {Number}
 */
export function score(rank, listLength, isChallenge = false) {
    // If rank is beyond the list length, return 0
    if (rank > listLength) {
        return 0;
    }

    // Select max/min score based on list type
    const maxScore = isChallenge ? CHALLENGE_MAX_SCORE : DEMON_MAX_SCORE;
    const minScore = isChallenge ? CHALLENGE_MIN_SCORE : DEMON_MIN_SCORE;

    if (!isChallenge) {
        // Exponential decay for demon scores
        // Top-ranked = maxScore, bottom-ranked = minScore
        const exponent = (rank - 1) / Math.max(1, listLength - 1); // 0 to 1
        const baseScore = minScore * Math.pow(maxScore / minScore, 1 - exponent);
        return round(baseScore);
    } else {
        // Linear for challenge lists (unchanged)
        const baseScore = maxScore - ((rank - 1) / Math.max(1, listLength - 1)) * (maxScore - minScore);
        return round(baseScore);
    }
}

/**
 * Round a number to the specified scale
 * @param {Number} num Number to round
 * @returns {Number} Rounded number
 */
export function round(num) {
    // Handle standard numbers
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + SCALE) + 'e-' + SCALE);
    }

    // Handle numbers in scientific notation
    const [coefficient, exponent] = ('' + num).split('e').map(Number);
    const adjustedExponent = exponent + SCALE;
    const sign = adjustedExponent > 0 ? '+' : '';

    return +(Math.round(coefficient + 'e' + sign + adjustedExponent) + 'e-' + SCALE);
}

/**
 * Initializes the list length from the list.json file
 * @returns {Promise<Number>} The length of the list
 */
export async function getListLength() {
    try {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoName = 'CP9DL';
        const basePath = isGitHubPages ? `/${repoName}/data` : './data';

        const response = await fetch(`${basePath}/list.json`);

        if (!response.ok) {
            console.warn(`HTTP error ${response.status} getting list length, using default`);
            return 25; 
        }

        const listData = await response.json();
        return listData.length;
    } catch (error) {
        console.error('Error loading list data:', error);
        return 25; 
    }
}

/**
 * Initializes the challenge list length from the challenge-list.json file
 * @returns {Promise<Number>} The length of the challenge list
 */
export async function getChallengeListLength() {
    try {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoName = 'CP9DL';
        const basePath = isGitHubPages ? `/${repoName}/data` : './data';

        const response = await fetch(`${basePath}/challenge-list.json`);

        if (!response.ok) {
            console.warn(`HTTP error ${response.status} getting challenge list length, using default`);
            return 10; 
        }

        const listData = await response.json();
        return listData.length;
    } catch (error) {
        console.error('Error loading challenge list data:', error);
        return 10; 
    }
}

