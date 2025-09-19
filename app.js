// YouTube API 配置
const API_KEY = 'AIzaSyDNV6xAiubSse_vejapD8aZuTQeHg_tMYE'; // 請替換為您的 YouTube API Key
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// 全域變數
let player;
let currentVideoId = null;
let isPlaying = false;
let currentPlaylist = [];
let currentIndex = 0;
let searchResults = [];

// DOM 元素
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const playerContainer = document.getElementById('playerContainer');
const searchResultsContainer = document.getElementById('searchResults');
const resultsList = document.getElementById('resultsList');
const videoTitle = document.getElementById('videoTitle');
const videoChannel = document.getElementById('videoChannel');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeSpan = document.getElementById('currentTime');
const totalTimeSpan = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

// YouTube Player API 初始化
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        height: '0',
        width: '0',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube Player 已準備就緒');
    updateVolumeDisplay();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        playBtn.innerHTML = '⏸️';
        startProgressUpdate();
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        playBtn.innerHTML = '▶️';
        stopProgressUpdate();
    } else if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

// 搜尋功能
async function searchVideos(query) {
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY') {
        // 使用模擬數據進行演示
        return getMockSearchResults(query);
    }

    try {
        const response = await fetch(`${YOUTUBE_API_URL}?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            duration: '未知'
        }));
    } catch (error) {
        console.error('搜尋錯誤:', error);
        showError('搜尋失敗，請檢查網路連線或 API 設定');
        return [];
    }
}

// 模擬搜尋結果（用於演示）
function getMockSearchResults(query) {
    const mockResults = [
        {
            id: 'dQw4w9WgXcQ',
            title: `${query} - 熱門歌曲 1`,
            channel: '音樂頻道',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
            duration: '3:32'
        },
        {
            id: 'kJQP7kiw5Fk',
            title: `${query} - 經典歌曲`,
            channel: '經典音樂',
            thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
            duration: '4:15'
        },
        {
            id: 'fJ9rUzIMcZQ',
            title: `${query} - 最新單曲`,
            channel: '流行音樂',
            thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
            duration: '3:45'
        }
    ];
    
    return mockResults;
}

// 顯示搜尋結果
function displaySearchResults(results) {
    searchResults = results;
    resultsList.innerHTML = '';
    
    if (results.length === 0) {
        resultsList.innerHTML = '<div class="loading">沒有找到相關結果</div>';
        return;
    }
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <img src="${result.thumbnail}" alt="${result.title}" class="result-thumbnail">
            <div class="result-info">
                <div class="result-title">${result.title}</div>
                <div class="result-channel">${result.channel}</div>
                <div class="result-duration">${result.duration}</div>
            </div>
        `;
        
        resultItem.addEventListener('click', () => {
            playVideo(result.id, result.title, result.channel);
            currentPlaylist = results;
            currentIndex = index;
        });
        
        resultsList.appendChild(resultItem);
    });
    
    searchResultsContainer.style.display = 'block';
}

// 播放影片
function playVideo(videoId, title, channel) {
    if (!player || !player.loadVideoById) {
        showError('播放器尚未準備就緒，請稍後再試');
        return;
    }
    
    currentVideoId = videoId;
    videoTitle.textContent = title;
    videoChannel.textContent = channel;
    
    player.loadVideoById(videoId);
    playerContainer.style.display = 'block';
    
    // 設定音量
    const volume = parseInt(volumeSlider.value);
    player.setVolume(volume);
}

// 播放控制
function togglePlay() {
    if (!player || !currentVideoId) return;
    
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function playPrevious() {
    if (currentPlaylist.length === 0) return;
    
    currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    const video = currentPlaylist[currentIndex];
    playVideo(video.id, video.title, video.channel);
}

function playNext() {
    if (currentPlaylist.length === 0) return;
    
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    const video = currentPlaylist[currentIndex];
    playVideo(video.id, video.title, video.channel);
}

// 進度條更新
let progressInterval;

function startProgressUpdate() {
    progressInterval = setInterval(updateProgress, 1000);
}

function stopProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
}

function updateProgress() {
    if (!player || !player.getCurrentTime) return;
    
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    
    if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        progressFill.style.width = progress + '%';
        
        currentTimeSpan.textContent = formatTime(currentTime);
        totalTimeSpan.textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 音量控制
function updateVolume() {
    if (!player || !player.setVolume) return;
    
    const volume = parseInt(volumeSlider.value);
    player.setVolume(volume);
    updateVolumeDisplay();
}

function updateVolumeDisplay() {
    const volume = volumeSlider.value;
    volumeValue.textContent = volume + '%';
}

// 進度條點擊
function seekTo(event) {
    if (!player || !player.getDuration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    
    const duration = player.getDuration();
    const seekTime = duration * percentage;
    
    player.seekTo(seekTime);
}

// 錯誤顯示
function showError(message) {
    const existingError = document.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// 事件監聽器
searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) return;
    
    resultsList.innerHTML = '<div class="loading">搜尋中...</div>';
    searchResultsContainer.style.display = 'block';
    
    const results = await searchVideos(query);
    displaySearchResults(results);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrevious);
nextBtn.addEventListener('click', playNext);
progressBar.addEventListener('click', seekTo);
volumeSlider.addEventListener('input', updateVolume);

// 背景播放支援
document.addEventListener('visibilitychange', () => {
    // 當頁面隱藏時，音樂繼續播放
    if (document.hidden && isPlaying) {
        console.log('頁面隱藏，音樂繼續播放');
    }
});

// 媒體會話 API（用於通知欄控制）
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
        if (player && currentVideoId) {
            player.playVideo();
        }
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
        if (player && currentVideoId) {
            player.pauseVideo();
        }
    });
    
    navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
}

// 更新媒體會話資訊
function updateMediaSession(title, artist, artwork) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            artwork: [
                { src: artwork, sizes: '96x96', type: 'image/jpeg' },
                { src: artwork, sizes: '128x128', type: 'image/jpeg' },
                { src: artwork, sizes: '192x192', type: 'image/jpeg' },
                { src: artwork, sizes: '256x256', type: 'image/jpeg' }
            ]
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('YouTube 背景播放器已載入');
    
    // 顯示 API 設定提示
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY') {
        showError('請在 app.js 中設定您的 YouTube API Key 以使用完整功能');
    }
});

// Service Worker 註冊（用於 PWA）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker 註冊成功:', registration.scope);
            
            // 等待 Service Worker 啟用
            if (registration.installing) {
                console.log('Service Worker 安裝中...');
            } else if (registration.waiting) {
                console.log('Service Worker 等待中...');
            } else if (registration.active) {
                console.log('Service Worker 已啟用');
            }
            
            // 監聽 Service Worker 更新
            registration.addEventListener('updatefound', () => {
                console.log('發現 Service Worker 更新');
            });
            
        } catch (error) {
            console.error('Service Worker 註冊失敗:', error);
        }
    });
}