export function getYoutubeIdFromUrl(url) {
    // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
    return url.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)?.[1] ?? '';
}

export function isMedalUrl(url) {
    return url.includes('medal.tv');
}

export function embed(video) {
    if (!video || video === 'x' || video === '???' || video === 'no link') {
        return '';
    }
    
    if (isMedalUrl(video)) {
        // For Medal links, use their embed format
        // Extract the clip ID if it's in the format: https://medal.tv/games/requested/clips/jKBXVMrCHMm42j2i5
        const clipId = video.match(/\/clips\/([^?&#]+)/)?.[1];
        if (clipId) {
            return `https://medal.tv/games/requested/clip/${clipId}`;
        }
        return video; // Return the original URL if we can't parse it
    }
    
    // Default to YouTube embedding
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 1 });
}