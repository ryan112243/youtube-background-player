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

// PWA 安裝相關變數
let deferredPrompt;
let installPromptShown = false;

// PWA 安裝功能
function initializePWAInstall() {
    // 監聽 beforeinstallprompt 事件
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt event fired');
        e.preventDefault();
        deferredPrompt = e;
        
        // 立即顯示安裝提示
        if (!installPromptShown && !localStorage.getItem('installPromptDismissed')) {
            showInstallPrompt();
        }
    });

    // 監聽應用安裝事件
    window.addEventListener('appinstalled', (evt) => {
        console.log('PWA was installed');
        hideInstallPrompt();
        localStorage.setItem('pwaInstalled', 'true');
    });

    // 檢查是否已經安裝
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        console.log('PWA is running in standalone mode');
        return;
    }

    // 檢查瀏覽器支援
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('PWA features supported');
    }

    // 如果用戶之前沒有拒絕，且沒有安裝，顯示手動安裝指南
    if (!localStorage.getItem('installPromptDismissed') && 
        !localStorage.getItem('pwaInstalled')) {
        setTimeout(() => {
            if (!installPromptShown) {
                showManualInstallGuide();
            }
        }, 5000); // 5秒後顯示手動指南
    }
}

function showInstallPrompt() {
    if (installPromptShown) return;
    
    installPromptShown = true;
    const promptHTML = `
        <div id="installPrompt" class="install-prompt">
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h3>安裝到手機桌面</h3>
                    <p>將 YouTube 背景播放器添加到您的主畫面，享受更好的體驗！</p>
                </div>
                <div class="install-buttons">
                    <button class="install-btn" onclick="installPWA()">立即安裝</button>
                    <button class="dismiss-btn" onclick="dismissInstallPrompt()">稍後再說</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', promptHTML);
}

function showManualInstallGuide() {
    if (installPromptShown || document.getElementById('installPrompt')) return;
    
    installPromptShown = true;
    const guideHTML = `
        <div id="installPrompt" class="install-prompt">
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h3>添加到主畫面</h3>
                    <p>將此應用添加到您的手機桌面，隨時享受背景播放！</p>
                </div>
                <div class="install-buttons">
                    <button class="dismiss-btn" onclick="toggleInstallGuide()">查看安裝步驟</button>
                    <button class="dismiss-btn" onclick="dismissInstallPrompt()">稍後再說</button>
                </div>
            </div>
            <div id="installGuideContent" class="install-guide hidden">
                <div class="guide-header" onclick="toggleInstallGuide()">
                    <span class="guide-icon">📖</span>
                    <span>安裝指南</span>
                    <button class="guide-toggle">▼</button>
                </div>
                <div class="guide-content hidden">
                    <div class="guide-steps">
                        <div class="guide-step">
                            <div class="step-number">1</div>
                            <div class="step-text">
                                <strong>Android Chrome：</strong><br>
                                點擊瀏覽器右上角的 <strong>⋮</strong> 選單 → 選擇 <strong>"加到主畫面"</strong> → 點擊 <strong>"新增"</strong>
                            </div>
                        </div>
                        <div class="guide-step">
                            <div class="step-number">2</div>
                            <div class="step-text">
                                <strong>iPhone Safari：</strong><br>
                                點擊底部的 <strong>分享按鈕 📤</strong> → 向下滑動找到 <strong>"加入主畫面"</strong> → 點擊 <strong>"新增"</strong>
                            </div>
                        </div>
                        <div class="guide-step">
                            <div class="step-number">3</div>
                            <div class="step-text">
                                <strong>桌面瀏覽器：</strong><br>
                                在網址列右側找到 <strong>安裝圖示 ⬇️</strong> 或使用 <strong>Ctrl+Shift+A</strong> (Chrome)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', guideHTML);
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            hideInstallPrompt();
        });
    }
}

function dismissInstallPrompt() {
    hideInstallPrompt();
    localStorage.setItem('installPromptDismissed', 'true');
    // 7天後再次顯示
    setTimeout(() => {
        localStorage.removeItem('installPromptDismissed');
    }, 7 * 24 * 60 * 60 * 1000);
}

function hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.style.animation = 'slideDown 0.3s ease-out forwards';
        setTimeout(() => {
            prompt.remove();
            installPromptShown = false;
        }, 300);
    }
}

function toggleInstallGuide() {
    const guideContent = document.getElementById('installGuideContent');
    const guideDetails = guideContent.querySelector('.guide-content');
    const toggleBtn = guideContent.querySelector('.guide-toggle');
    
    if (guideContent.classList.contains('hidden')) {
        guideContent.classList.remove('hidden');
        guideDetails.classList.remove('hidden');
        toggleBtn.classList.add('expanded');
    } else {
        guideDetails.classList.add('hidden');
        toggleBtn.classList.remove('expanded');
        setTimeout(() => {
            if (guideDetails.classList.contains('hidden')) {
                guideContent.classList.add('hidden');
            }
        }, 300);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('YouTube 背景播放器已載入');
    initializePWAInstall();
    
    // 顯示 API 設定提示
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY') {
        showError('請在 app.js 中設定您的 YouTube API Key 以使用完整功能');
    }
});

// Service Worker 註冊（用於 PWA）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('Service Worker 註冊成功:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker 註冊失敗:', error);
            });
    });
}