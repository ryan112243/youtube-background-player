# YouTube 背景播放器 PWA 安裝工具 (PowerShell 版本)
# 設定控制台編碼為 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   YouTube 背景播放器 PWA 安裝工具" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在檢查系統環境..." -ForegroundColor Green

# 檢查 Python 是否安裝
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ 找到 Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 錯誤：未找到 Python" -ForegroundColor Red
    Write-Host "請先安裝 Python 3.x 版本" -ForegroundColor Yellow
    Write-Host "下載地址：https://www.python.org/downloads/" -ForegroundColor Blue
    Read-Host "按 Enter 鍵退出"
    exit 1
}

# 檢查端口可用性
$port = 8000
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  警告：端口 8000 已被占用" -ForegroundColor Yellow
    Write-Host "正在嘗試使用端口 8001..." -ForegroundColor Yellow
    $port = 8001
}

Write-Host ""
Write-Host "✅ 正在啟動伺服器於端口 $port..." -ForegroundColor Green

# 啟動 HTTP 伺服器
$serverProcess = Start-Process -FilePath "python" -ArgumentList "-m", "http.server", $port -WindowStyle Minimized -PassThru

# 等待伺服器啟動
Start-Sleep -Seconds 3

Write-Host "✅ 伺服器已啟動！" -ForegroundColor Green
Write-Host ""
Write-Host "📱 安裝選項：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 自動開啟安裝頁面（推薦）" -ForegroundColor White
Write-Host "2. 自動開啟主應用程式" -ForegroundColor White
Write-Host "3. 手動開啟瀏覽器" -ForegroundColor White
Write-Host "4. 僅顯示網址" -ForegroundColor White
Write-Host "5. 退出" -ForegroundColor White
Write-Host ""

do {
    $choice = Read-Host "請選擇 (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "🚀 正在開啟安裝頁面..." -ForegroundColor Green
            Start-Process "http://localhost:$port/pwa-install.html"
            Write-Host "✅ 安裝頁面已開啟！" -ForegroundColor Green
            Write-Host "請按照頁面指示完成 PWA 安裝" -ForegroundColor Yellow
            break
        }
        "2" {
            Write-Host ""
            Write-Host "🚀 正在開啟主應用程式..." -ForegroundColor Green
            Start-Process "http://localhost:$port/"
            Write-Host "✅ 主應用程式已開啟！" -ForegroundColor Green
            break
        }
        "3" {
            Write-Host ""
            Write-Host "🌐 請手動開啟瀏覽器並訪問：" -ForegroundColor Blue
            Write-Host "安裝頁面：http://localhost:$port/pwa-install.html" -ForegroundColor Cyan
            Write-Host "主應用：http://localhost:$port/" -ForegroundColor Cyan
            break
        }
        "4" {
            Write-Host ""
            Write-Host "📋 網址資訊：" -ForegroundColor Blue
            Write-Host "安裝頁面：http://localhost:$port/pwa-install.html" -ForegroundColor Cyan
            Write-Host "主應用：http://localhost:$port/" -ForegroundColor Cyan
            break
        }
        "5" {
            Write-Host ""
            Write-Host "正在關閉伺服器..." -ForegroundColor Yellow
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
            Write-Host "👋 再見！" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "❌ 無效選擇，請重新輸入" -ForegroundColor Red
            Write-Host ""
            continue
        }
    }
    break
} while ($true)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📱 PWA 安裝說明：" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chrome/Edge (桌面版)：" -ForegroundColor White
Write-Host "  • 點擊網址列右側的安裝圖示" -ForegroundColor Gray
Write-Host "  • 或使用 Ctrl+Shift+A 快捷鍵" -ForegroundColor Gray
Write-Host ""
Write-Host "Chrome (Android)：" -ForegroundColor White
Write-Host "  • 點擊選單 → `"安裝應用程式`"" -ForegroundColor Gray
Write-Host "  • 或點擊網址列的安裝提示" -ForegroundColor Gray
Write-Host ""
Write-Host "Safari (iOS)：" -ForegroundColor White
Write-Host "  • 點擊分享按鈕 → `"加入主畫面`"" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示：安裝完成後可關閉此視窗" -ForegroundColor Yellow
Write-Host "🔄 要重新安裝，請重新執行此檔案" -ForegroundColor Yellow
Write-Host ""
Write-Host "按任意鍵關閉伺服器並退出..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "正在關閉伺服器..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "✅ 已關閉伺服器" -ForegroundColor Green
Write-Host "👋 感謝使用！" -ForegroundColor Green