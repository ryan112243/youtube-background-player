@echo off
chcp 65001 >nul
title YouTube 背景播放器 - PWA 安裝工具

echo.
echo ========================================
echo    YouTube 背景播放器 PWA 安裝工具
echo ========================================
echo.

echo 正在啟動本地伺服器...
echo.

REM 檢查 Python 是否安裝
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未找到 Python
    echo 請先安裝 Python 3.x 版本
    echo 下載地址：https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM 檢查端口 8000 是否被占用
netstat -an | find "8000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ⚠️  警告：端口 8000 已被占用
    echo 正在嘗試使用端口 8001...
    set PORT=8001
) else (
    set PORT=8000
)

echo ✅ 正在啟動伺服器於端口 %PORT%...
echo.

REM 啟動 HTTP 伺服器
start /min python -m http.server %PORT%

REM 等待伺服器啟動
timeout /t 3 /nobreak >nul

echo ✅ 伺服器已啟動！
echo.
echo 📱 安裝選項：
echo.
echo 1. 自動開啟安裝頁面（推薦）
echo 2. 手動開啟瀏覽器
echo 3. 僅顯示網址
echo 4. 退出
echo.

:menu
set /p choice="請選擇 (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🚀 正在開啟安裝頁面...
    start http://localhost:%PORT%/pwa-install.html
    echo.
    echo ✅ 安裝頁面已開啟！
    echo 請按照頁面指示完成 PWA 安裝
    goto end
)

if "%choice%"=="2" (
    echo.
    echo 🌐 請手動開啟瀏覽器並訪問：
    echo http://localhost:%PORT%/pwa-install.html
    goto end
)

if "%choice%"=="3" (
    echo.
    echo 📋 安裝網址：
    echo http://localhost:%PORT%/pwa-install.html
    echo.
    echo 📋 主應用網址：
    echo http://localhost:%PORT%/
    goto end
)

if "%choice%"=="4" (
    echo.
    echo 正在關閉伺服器...
    taskkill /f /im python.exe >nul 2>&1
    echo 👋 再見！
    exit /b 0
)

echo ❌ 無效選擇，請重新輸入
echo.
goto menu

:end
echo.
echo ========================================
echo 📱 PWA 安裝說明：
echo ========================================
echo.
echo Chrome/Edge (桌面版)：
echo   • 點擊網址列右側的安裝圖示
echo   • 或使用 Ctrl+Shift+A 快捷鍵
echo.
echo Chrome (Android)：
echo   • 點擊選單 → "安裝應用程式"
echo   • 或點擊網址列的安裝提示
echo.
echo Safari (iOS)：
echo   • 點擊分享按鈕 → "加入主畫面"
echo.
echo ========================================
echo.
echo 💡 提示：安裝完成後可關閉此視窗
echo 🔄 要重新安裝，請重新執行此檔案
echo.
echo 按任意鍵關閉伺服器並退出...
pause >nul

echo.
echo 正在關閉伺服器...
taskkill /f /im python.exe >nul 2>&1
echo ✅ 已關閉伺服器
echo 👋 感謝使用！