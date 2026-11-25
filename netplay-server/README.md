# 局域网联机信令服务器

EmulatorJS Netplay 需要一个很小的 Node.js 信令服务器（WebRTC 打洞/房间列表）。

## 快速开始

```bash
cd netplay-server
npm install
npm start
```

默认监听 `0.0.0.0:3000`。

在同一 Wi-Fi 下：

1. 主机电脑运行本服务器
2. 打开网页模拟器，模式选「局域网联机」
3. 服务器地址填：`http://主机局域网IP:3000`
4. 双方选择**同一个 ROM**，主机开房间，客人加入

查本机局域网 IP：

- Windows: `ipconfig`
- macOS/Linux: `ifconfig` 或 `ip a`

## 说明

- 只负责房间匹配与 WebRTC 信令，不传 ROM
- 画面由主机推流，客人发送按键
- GitHub Pages 静态站无法单独完成联机，必须有人跑这个小服务
