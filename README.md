# Web GBA Emulator 🎮

一个可以在浏览器中直接运行的 **Game Boy Advance (GBA)** 模拟器。

支持：
- ✅ 键盘操作
- ✅ 手机 / 平板触控操作
- ✅ 手柄支持
- ✅ 本地加载 ROM（不会上传任何文件）
- ✅ 存档 / 即时存档（EmulatorJS 内置）
- ✅ 全屏模式

在线演示：部署到 GitHub Pages 后访问 `https://henry6666666.github.io/web-gba-emulator/`

## 使用方法

1. 打开网页
2. 点击「选择 GBA ROM 文件」
3. 选择你自己的 `.gba` 或 `.zip` 文件
4. 开始游戏！

### 默认键盘映射

| GBA 按键 | 键盘 |
|---------|------|
| 十字键   | 方向键 或 WASD |
| A        | Z 或 A |
| B        | X 或 S |
| Start    | Enter |
| Select   | Shift |
| L        | Q |
| R        | W |

手机上会自动显示虚拟按键。也可以连接物理手柄。

## 技术说明

本项目使用 [EmulatorJS](https://emulatorjs.org)（基于 mGBA 核心），通过 CDN 加载，无需自己托管模拟器文件。

所有 ROM 都在你的浏览器本地运行，不会上传到任何服务器。

## 重要声明

**请只使用你合法拥有的游戏 ROM。**  
本仓库不包含、也不提供任何游戏 ROM 文件。

## 部署到自己的 GitHub Pages

1. Fork 本仓库 或 直接使用
2. 进入仓库 Settings → Pages
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，文件夹选择 `/ (root)`
5. 保存后等待几分钟即可访问

## License

本项目前端代码使用 MIT License。  
EmulatorJS 和 mGBA 核心遵循其各自的开源协议。
