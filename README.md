# ChatGPT Dynamic Glass Wallpaper

A userscript that adds a local image or video wallpaper and glass-style surfaces to the ChatGPT website. Version **1.9.8**. Unofficial; not affiliated with OpenAI.

为 ChatGPT 网页版添加本地图片／视频壁纸和毛玻璃效果。适用于 Tampermonkey 等 userscript 管理器，不是桌面端皮肤或 Codex Plugin。

## 安装与使用

1. 安装可信来源的 Tampermonkey。
2. 在管理器中新建脚本，用本仓库的 `chatgpt-dynamic-glass-wallpaper.user.js` 完整替换默认内容并保存。
3. 只启用一份此脚本，打开或刷新 `https://chatgpt.com/`。
4. 点击“选择图片或视频壁纸”，选择自己的本地文件。
5. 换壁纸：macOS 按 **Option + Shift + W**；其他系统按 **Alt + Shift + W**。

亮度、模糊、透明度等参数在脚本顶部 `SETTINGS` 中调整。视频能否播放取决于浏览器支持的编码。禁用脚本后刷新即可恢复页面外观。

## Privacy / 隐私

- 本仓库仅包含代码、通用说明及校验值，不附带壁纸素材、截图、聊天记录、浏览器数据或本地配置。
- 当前脚本没有分析统计、外部依赖、远程图片地址或发送网络请求的逻辑，不读取 Cookie 或登录凭据。
- 脚本会在本地检查页面元素和部分文本，以识别需要调整的界面区域；这些检查不发送或保存聊天内容。
- 选择的文件保存在 `chatgpt.com` 的 IndexedDB（`ChatGPTWallpaperDB`），并通过本地 `blob:` URL 显示。保存的是 File 对象，可能包含原始文件名及修改时间。从视频切换到图片时会保留上一段视频。
- 该存储受网站同源规则约束，不是加密或与网站隔离的保险箱；同源页面代码及具备相应权限的扩展可能访问它。请勿选择敏感私人素材。
- 禁用／卸载脚本不会自动删除已保存的壁纸。需要删除时，可在浏览器开发者工具的 Application → IndexedDB 中只删除 `ChatGPTWallpaperDB`。清除整个站点数据还可能退出登录。
- 代码审查不能保证浏览器、其他扩展、网站或未来版本的绝对安全。

## 兼容性与限制

ChatGPT 页面结构变化后可能需要更新 CSS。本次发布保留 1.9.8 的原有行为；没有重新执行所有页面的视觉回归。部分旧注释存在字符编码乱码，不影响 JavaScript 语法。内置 `pause()` 可能被自动恢复播放机制覆盖；需要停止运行时请禁用脚本并刷新。

## 校验

`SHA256SUMS` 提供发布脚本的 SHA-256；`PRIVACY-REVIEW.md` 记录本次静态检查范围。
