# 🎵 YouTube 背景播放器

一個支援背景播放的 YouTube 音樂播放器。

## ✨ 功能特色

- 🎵 **背景播放**: 支援手機背景播放，切換應用程式時音樂不中斷
- 🔍 **智能搜尋**: 快速搜尋 YouTube 音樂和影片
- 🎛️ **完整控制**: 播放、暫停、音量調節、進度控制
- 📱 **響應式設計**: 完美適配手機、平板和桌面設備
- 🌙 **優雅介面**: 現代化的深色主題設計
- ⚡ **輕量快速**: 純前端實現，載入速度快

## 安裝與使用

### 1. 下載專案

```bash
git clone https://github.com/yourusername/youtube-background-player.git
cd youtube-background-player
```

### 2. 啟動本地服務器

#### 使用 Python (推薦)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 使用 Node.js
```bash
npx http-server -p 8000
```

#### 使用 PHP
```bash
php -S localhost:8000
```

### 3. 開啟瀏覽器

在瀏覽器中訪問：`http://localhost:8000`

## 🎯 使用說明

1. **搜尋音樂**: 在搜尋框中輸入歌曲名稱或藝人名稱
2. **選擇播放**: 點擊搜尋結果中的任一項目開始播放
3. **控制播放**: 使用播放器控制項調節音量、進度等
4. **背景播放**: 在手機上可以切換到其他應用程式，音樂會繼續播放

## 🛠️ 技術架構

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **API**: YouTube Data API v3
- **音頻**: YouTube Embedded Player API
- **響應式**: CSS Grid & Flexbox
- **圖標**: Unicode Emoji

## 📁 專案結構

```
youtube-background-player/
├── index.html          # 主頁面
├── app.js             # 主要應用邏輯
├── sw.js              # Service Worker
├── pwabuilder-sw.js   # PWA Builder Service Worker
├── manifest.json      # Web App Manifest
├── icon-192.png       # 應用圖標 (192x192)
├── icon-512.png       # 應用圖標 (512x512)
└── README.md          # 說明文件
```

## 🔧 配置說明

### YouTube API 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 YouTube Data API v3
4. 建立 API 金鑰
5. 在 `app.js` 中替換 `YOUR_YOUTUBE_API_KEY`

```javascript
const API_KEY = 'YOUR_YOUTUBE_API_KEY';
```

## 🌐 瀏覽器支援

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ 行動版瀏覽器

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 🙏 致謝

- YouTube API 提供音樂資源
- 所有貢獻者的支持與協助

---

**注意**: 此應用僅供個人學習和研究使用，請遵守 YouTube 的服務條款。