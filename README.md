# 访客风险识别前端 Demo

这是一个用于联调浏览器环境识别、GeeGuard token 获取和后端风险结果展示的前端 Demo。

当前版本已经完成：

- 浏览器环境与基础指纹信号采集
- GeeGuard SDK 加载与 `gee_token` 获取
- 调用后端 `/api/visitor`
- 展示风险等级、风险码、匿名模式、VPN 状态、指纹信息和请求元数据

## 项目结构

- `src/main.js`
  - 页面启动入口，负责无 token / 有 token 两段式请求
- `src/components/visitorDashboard.js`
  - 结果面板渲染
- `src/services/visitorService.js`
  - 前端请求后端 `/api/visitor`
- `src/services/geeGuardService.js`
  - GeeGuard SDK 等待、初始化和 token 缓存
- `src/utils/browserSignals.js`
  - 浏览器环境与技术信号采集
- `docs/development-progress.md`
  - 当前开发进度与数据流说明

## 运行方式

安装依赖：

```bash
npm install
```

启动前端静态服务：

```bash
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:5173
```

## 后端联调说明

前端默认请求：

```text
http://127.0.0.1:8000/api/visitor
```

联调前需要确保后端服务已启动，并且允许来自前端开发地址的跨域访问。

页面加载流程如下：

1. 页面启动时先尝试加载 GeeGuard SDK 并获取 `gee_token`
2. 如果成功，前端直接把 `gee_token` 连同浏览器环境信号一起发给后端
3. 如果失败，前端降级为无 token 请求，仍然展示基础环境结果
4. 点击页面右上角 `Refresh` 会重新请求一次后端

## 当前界面说明

- `Risk Level`
  - 以后端返回的最终风控结果为准
- `Incognito`
  - 优先展示后端基于 `token_query` 的结果，没有时回退到前端启发式检测
- `VPN / Proxy`
  - 依赖后端和 `g2-service` 返回
- `GeeToken`
  - 页面顶部输入框可手动覆盖自动获取到的 token，便于调试

## 检查方式

可执行的基础检查：

```bash
node --check src/main.js
node --check src/components/visitorDashboard.js
node --check src/services/visitorService.js
node --check src/services/geeGuardService.js
```

如果本地已安装依赖，也可以执行一次构建检查：

```bash
npx vite build
```

## 备注

当前前端已经不再提供 `pass / review / reject` 手动切换入口，风险状态完全由接口返回结果自动决定。
