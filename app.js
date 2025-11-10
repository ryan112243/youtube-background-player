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
let isLoopingSingle = false;
let karaokeQueue = [];
let playerReady = false;
let pendingVideo = null;
let dragSrcIndex = null;
let lastPlayIntentTs = 0;
let verifyTimer = null;
const INTENT_WINDOW_MS = 5000;
let userGestureActive = false;

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
const loopBtn = document.getElementById('loopBtn');
const queueContainer = document.getElementById('queueContainer');
const queueList = document.getElementById('queueList');
const queueCount = document.getElementById('queueCount');
const clearQueueBtn = document.getElementById('clearQueueBtn');

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
            'rel': 0,
            'autoplay': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube Player 已準備就緒');
    playerReady = true;
    // 若之前有點過影片，播放器就緒後自動播放
    if (pendingVideo) {
        const { id, title, channel } = pendingVideo;
        pendingVideo = null;
        playVideo(id, title, channel);
    }
    updateVolumeDisplay();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        playBtn.innerHTML = '⏸️';
        startProgressUpdate();
        // 一旦開始播放，清除驗證重試計時器
        if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = null; }
        // 播放開始後解除靜音並套用音量
        try { player.unMute(); } catch (_) {}
        const volume = parseInt(volumeSlider.value);
        try { player.setVolume(volume); } catch (_) {}
        userGestureActive = false;
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        playBtn.innerHTML = '▶️';
        stopProgressUpdate();
    } else if (event.data === YT.PlayerState.ENDED) {
        if (isLoopingSingle && currentVideoId) {
            // 單曲循環：回到影片開頭並繼續播放
            player.seekTo(0, true);
            player.playVideo();
        } else {
            // 播放下一首（若有播放清單）
            playNext();
        }
    } else if (event.data === YT.PlayerState.CUED) {
        // 已載入但未播放，若在意圖時間窗內，強制播放
        if (Date.now() - lastPlayIntentTs <= INTENT_WINDOW_MS) {
            try { player.playVideo(); } catch (_) {}
        }
    }
}

function onPlayerError(event) {
    const code = event.data;
    let message = '播放錯誤';
    switch (code) {
        case 2:
            message = '請求不合法或影片 ID 錯誤';
            break;
        case 5:
            message = '播放器無法播放此格式（可能因瀏覽器）';
            break;
        case 100:
            message = '影片不存在或已被移除';
            break;
        case 101:
        case 150:
            message = '影片不允許在外部網站播放（嵌入被禁）';
            break;
        default:
            message = `未知錯誤代碼：${code}`;
    }
    showError(message);
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
                <button class="add-queue-btn">➕ 加入下一首</button>
            </div>
        `;

        // 播放此結果
        resultItem.addEventListener('click', (e) => {
            // 避免點擊加號按鈕同時觸發播放
            if (e.target && e.target.classList.contains('add-queue-btn')) return;
            userGestureActive = true;
            playVideo(result.id, result.title, result.channel);
            // 不再使用搜尋結果作為自動下一首的播放清單
            currentPlaylist = [];
            currentIndex = 0;
        });

        // 加入候播清單
        const addBtn = resultItem.querySelector('.add-queue-btn');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            enqueueKaraoke({
                id: result.id,
                title: result.title,
                channel: result.channel,
                thumbnail: result.thumbnail
            });
        });

        resultsList.appendChild(resultItem);
    });
    
    searchResultsContainer.style.display = 'block';
}

// 播放影片
function playVideo(videoId, title, channel) {
    // 記錄最近一次的使用者播放意圖（點擊）
    lastPlayIntentTs = Date.now();

    if (!player || !player.loadVideoById || !playerReady) {
        // 暫存待播影片，待播放器就緒後自動播放
        pendingVideo = { id: videoId, title, channel };
        console.warn('播放器尚未就緒，已排程自動播放');
        return;
    }
    
    currentVideoId = videoId;
    videoTitle.textContent = title;
    videoChannel.textContent = channel;
    
    // 採用靜音啟播以提高自動播放/連播相容性
    try { player.mute(); } catch (_) {}
    player.loadVideoById(videoId);
    // 顯式呼叫播放以提升相容性
    try { player.playVideo(); } catch (e) { /* ignore */ }
    playerContainer.style.display = 'block';
    
    // 設定音量
    const volume = parseInt(volumeSlider.value);
    player.setVolume(volume);

    // 啟動播放驗證與重試
    if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = null; }
    verifyTimer = setTimeout(() => verifyPlayback(0), 500);
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
    // 先使用候播清單
    if (karaokeQueue.length > 0) {
        const nextVideo = karaokeQueue.shift();
        renderKaraokeQueue();
        playVideo(nextVideo.id, nextVideo.title, nextVideo.channel);
        return;
    }
    
    // 候播清單為空：停止，不自動播放搜尋結果
    if (player && player.stopVideo) {
        player.stopVideo();
    }
    isPlaying = false;
    playBtn.innerHTML = '▶️';
    stopProgressUpdate();
}

// 播放驗證與重試機制
function verifyPlayback(attempt = 0) {
    if (!player || !currentVideoId || !player.getPlayerState) {
        if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = null; }
        return;
    }
    const state = player.getPlayerState();
    // 已播放則停止驗證
    if (state === YT.PlayerState.PLAYING) {
        if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = null; }
        return;
    }
    // 超過意圖時間窗，停止重試以避免干擾
    if (Date.now() - lastPlayIntentTs > INTENT_WINDOW_MS) {
        if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = null; }
        return;
    }
    // 限制重試次數
    if (attempt >= 3) {
        // 進行一次完整重新載入嘗試
        try { player.stopVideo(); } catch (_) {}
        player.loadVideoById(currentVideoId);
        try { player.playVideo(); } catch (_) {}
        if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = null; }
        verifyTimer = setTimeout(() => verifyPlayback(0), 700);
        return;
    }
    // 在 CUED 或 UNSTARTED 狀態下，嘗試強制播放
    try { player.playVideo(); } catch (_) {}
    if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = null; }
    verifyTimer = setTimeout(() => verifyPlayback(attempt + 1), attempt === 0 ? 900 : 1200);
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

// 循環播放切換
function toggleLoopSingle() {
    isLoopingSingle = !isLoopingSingle;
    loopBtn.classList.toggle('active', isLoopingSingle);
}

// 候播清單佇列
function enqueueKaraoke(video) {
    karaokeQueue.push(video);
    renderKaraokeQueue();
}

function renderKaraokeQueue() {
    queueCount.textContent = karaokeQueue.length;
    queueList.innerHTML = '';
    
    karaokeQueue.forEach((v, idx) => {
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.setAttribute('draggable', 'true');
        item.dataset.index = idx.toString();
        item.innerHTML = `
            <img src="${v.thumbnail}" alt="${v.title}">
            <div>
                <div class="queue-title">${v.title}</div>
                <div class="result-channel">${v.channel}</div>
            </div>
            <button class="remove-queue-btn" data-index="${idx}">✖ 刪除</button>
        `;

        // 拖曳事件
        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = Number(item.dataset.index);
            item.classList.add('dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                try { e.dataTransfer.setData('text/plain', dragSrcIndex.toString()); } catch (_) {}
            }
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            item.classList.add('drag-over');
        });
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            const targetIndex = Number(item.dataset.index);
            if (dragSrcIndex === null || isNaN(targetIndex) || dragSrcIndex === targetIndex) return;
            reorderQueue(dragSrcIndex, targetIndex);
            dragSrcIndex = null;
            renderKaraokeQueue();
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            dragSrcIndex = null;
            queueList.querySelectorAll('.queue-item').forEach(el => el.classList.remove('drag-over'));
        });

        // 刪除單首
        const removeBtn = item.querySelector('.remove-queue-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const i = Number(removeBtn.dataset.index);
            removeFromQueue(i);
        });

        queueList.appendChild(item);
    });
    
    queueContainer.style.display = karaokeQueue.length > 0 ? 'block' : 'none';
}

function clearKaraokeQueue() {
    karaokeQueue = [];
    renderKaraokeQueue();
}

function reorderQueue(from, to) {
    if (from < 0 || to < 0 || from >= karaokeQueue.length || to >= karaokeQueue.length) return;
    const [moved] = karaokeQueue.splice(from, 1);
    karaokeQueue.splice(to, 0, moved);
}

function removeFromQueue(index) {
    if (index < 0 || index >= karaokeQueue.length) return;
    karaokeQueue.splice(index, 1);
    renderKaraokeQueue();
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

playBtn.addEventListener('click', () => { userGestureActive = true; togglePlay(); });
prevBtn.addEventListener('click', playPrevious);
nextBtn.addEventListener('click', playNext);
progressBar.addEventListener('click', seekTo);
volumeSlider.addEventListener('input', updateVolume);
loopBtn.addEventListener('click', toggleLoopSingle);
clearQueueBtn.addEventListener('click', clearKaraokeQueue);

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