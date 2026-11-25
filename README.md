# Web GBA Emulator

浏览器里玩 GBA，支持键盘、触控，以及**本机双人 / 局域网联机**。

在线页面：打开本仓库的 GitHub Pages。

## 功能

- 本地加载 `.gba` / `.zip`（不上传服务器）
- 键盘 + 手机触控
iPad 外接键盘需点「启用外接键盘」
- **本机双人**：`mgbadual` 核心，同一页面两个 GBA 通信缆联机
- **局域网联机**：EmulatorJS Netplay（需运行 `netplay-server`）

## 本机双人（最稳）

1. 模式选「本机双人」
2. 加载支持通信缆的游戏（宝可梦、马里奥赛车等）
3. 玩家1 用键盘默认键，玩家2 在 EmulatorJS 控制设置里映射第二套键或手柄

## 局域网双人

1. 一台电脑：
   ```bash
   cd netplay-server
   npm install
   npm start
   ```
2. 两人手机/电脑连同一 Wi-Fi
3. 打开模拟器网页 → 选「局域网联机」
4. 服务器填 `http://主机IP:3000`
5. 双方加载**同一 ROM** → 主机创建房间 → 客人加入

> 官方 EmulatorJS stable 的 Netplay 仍在完善中，若图标不出现可换夜间版 CDN（页面里已做切换逻辑）。

## 免责

请只使用你合法拥有的 ROM。本项目不提供任何游戏文件。
