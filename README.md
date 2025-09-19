# YouTube 背景播放器

一個支援背景播放的 YouTube 音樂播放器，可以安裝為手機應用程式（PWA）。

## 功能特色

- 🎵 **背景播放**: 即使切換到其他應用或鎖定螢幕，音樂依然繼續播放
- 📱 **手機友好**: 響應式設計，完美適配手機螢幕
- 🔍 **智能搜尋**: 快速搜尋 YouTube 上的音樂和影片
- 📋 **播放列表**: 自動建立播放列表，支援上一首/下一首
- 🎛️ **完整控制**: 播放/暫停、進度控制、音量調節
- 📲 **可安裝**: 支援 PWA，可安裝到手機桌面
- 🎨 **美觀界面**: 現代化設計，漸層背景，流暢動畫

## 安裝與使用

### 1. 設定 YouTube API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 YouTube Data API v3
4. 建立 API 金鑰
5. 在 `app.js` 檔案中替換 `YOUR_YOUTUBE_API_KEY` 為您的實際 API Key

```javascript
const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### 2. 本地運行

1. 將所有檔案放在同一個資料夾中
2. 使用本地伺服器運行（不能直接開啟 HTML 檔案）

**使用 Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**使用 Node.js:**
```bash
npx http-server
```

**使用 PHP:**
```bash
php -S localhost:8000
```

3. 在瀏覽器中開啟 `http://localhost:8000`

### 3. 安裝為手機應用

1. 在手機瀏覽器中開啟應用
2. 點擊瀏覽器選單中的「加入主畫面」或「安裝應用程式」
3. 應用將會安裝到您的手機桌面

## 檔案結構

```
youtube背景撥放/
├── index.html          # 主頁面
├── app.js             # 主要 JavaScript 邏輯
├── manifest.json      # PWA 配置檔案
├── sw.js             # Service Worker（離線支援）
├── icon-192.png      # 應用圖示
└── README.md         # 說明文件
```

## 使用說明

1. **搜尋音樂**: 在搜尋框中輸入歌曲名稱、藝人或關鍵字
2. **選擇歌曲**: 點擊搜尋結果中的任一項目開始播放
3. **控制播放**: 使用播放/暫停、上一首、下一首按鈕
4. **調整進度**: 點擊進度條跳轉到指定位置
5. **音量控制**: 使用音量滑桿調整音量
6. **背景播放**: 切換到其他應用或鎖定螢幕，音樂繼續播放

## 技術特點

- **YouTube IFrame API**: 整合 YouTube 播放器
- **Media Session API**: 支援通知欄媒體控制
- **Service Worker**: 提供離線功能和背景播放
- **Progressive Web App**: 可安裝的網頁應用
- **響應式設計**: 適配各種螢幕尺寸

## 瀏覽器支援

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- 行動版瀏覽器

## 注意事項

1. **API 限制**: YouTube API 有每日請求限制，請合理使用
2. **HTTPS 要求**: 某些功能需要在 HTTPS 環境下運行
3. **背景播放**: 在某些瀏覽器中可能需要用戶互動才能啟用
4. **版權**: 請遵守 YouTube 的使用條款和版權規定

## 故障排除

### 搜尋不工作
- 檢查 API Key 是否正確設定
- 確認網路連線正常
- 檢查瀏覽器控制台是否有錯誤訊息

### 無法播放
- 確認影片在您的地區可用
- 檢查影片是否允許嵌入播放
- 嘗試重新整理頁面

### 背景播放不工作
- 確保在 HTTPS 環境下運行
- 檢查瀏覽器是否支援 Media Session API
- 嘗試與頁面互動後再切換到背景

## 開發者資訊

這是一個開源專案，歡迎貢獻代碼和提出建議。

### 本地開發

1. Clone 專案
2. 設定 API Key
3. 啟動本地伺服器
4. 開始開發

### 貢獻指南

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 發起 Pull Request

## 授權

MIT License - 詳見 LICENSE 檔案

## 更新日誌

### v1.0.0
- 初始版本發布
- 基本播放功能
- 搜尋功能
- PWA 支援
- 背景播放