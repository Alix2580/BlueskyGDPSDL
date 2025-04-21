/**
 * Numbers of decimal digits to round to
 */
const SCALE = 1;
const MAX_SCORE = 500;
const MIN_SCORE = 1;

/**
 * Calculate the score awarded for completing a list level
 * @param {Number} rank Position on the list
 * @param {Number} listLength Total number of levels in the list
 * @returns {Number}
 */
export function score(rank, listLength) {
    // If rank is beyond the list length, return 0
    if (rank > listLength) {
        return 0;
    }

    // Calculate base score for the level based on its position in the list
    // Linear distribution from MAX_SCORE to MIN_SCORE
    const baseScore = MAX_SCORE - ((rank - 1) / Math.max(1, listLength - 1)) * (MAX_SCORE - MIN_SCORE);
    
    return round(baseScore);
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
        // Use the same path calculation as in content.js
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoName = 'CP9DL'; // Your repository name
        const basePath = isGitHubPages ? `/${repoName}/data` : './data';
        
        const response = await fetch(`${basePath}/list.json`);
        
        if (!response.ok) {
            console.warn(`HTTP error ${response.status} getting list length, using default`);
            return 25; // Default fallback
        }
        
        const listData = await response.json();
        return listData.length;
    } catch (error) {
        console.error('Error loading list data:', error);
        return 25; // Default fallback
    }
}