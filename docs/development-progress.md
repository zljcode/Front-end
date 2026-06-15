# 项目开发进度记录

## 2026-06-12 前端 Demo 第一版

### 本阶段目标

先完成一个可运行、可展示的前端界面，用 mock 数据跑通浏览器访客指纹与风险评估面板。后续再逐步接入 Python 后端和真实风控接口。

### 需求来源

- 字段说明：`最终展示字段说明及后端返回结构.md`
- 项目流程：`demo项目最大效益学习流程.md`
- 视觉参考：FingerprintJS 访客识别 Demo 页面
- 风格参考：Tavily 官网的干净、开发者工具感、白底黑字和绿色强调风格

### 已完成内容

- 创建静态前端项目结构。
- 新增页面入口：
  - `index.html`
  - `src/main.js`
- 新增主视图组件：
  - `src/components/visitorDashboard.js`
- 新增 mock 数据：
  - `src/data/mockVisitor.js`
- 新增前端数据服务层：
  - `src/services/visitorService.js`
- 新增浏览器信号采集工具：
  - `src/utils/browserSignals.js`
- 新增格式化与 HTML 转义工具：
  - `src/utils/formatters.js`
  - `src/utils/html.js`
- 新增主样式：
  - `src/styles/main.css`
- 新增项目运行说明：
  - `README.md`

### 当前页面能力

- 展示 `visitor_id`。
- 展示 `risk_level`，支持 `pass / review / reject` 三种 mock 场景切换。
- 展示 `risk_code` 命中结果。
- 展示风险摘要 `risk_summary`。
- 展示访问摘要：
  - IP
  - 浏览器名称与版本
  - 操作系统
  - 设备类型
  - 匿名模式状态
  - VPN / 代理状态
- 展示技术信号：
  - User Agent
  - Language
  - Timezone
  - Platform
  - Screen Resolution
  - Hardware Concurrency
  - Device Memory
  - WebGL Vendor
  - WebGL Renderer
- 展示原始风控摘要：
  - IP Type
  - VPN Confidence
  - Incognito Confidence
  - Request Time

### 数据策略

当前 `src/services/visitorService.js` 使用 mock 数据作为主数据源，同时会读取当前浏览器环境并覆盖部分字段：

- `user_agent`
- `browser_name`
- `browser_version`
- `os_name`
- `device_type`
- `language`
- `timezone`
- `platform`
- `screen_resolution`
- `hardware_concurrency`
- `device_memory`
- `webgl_vendor`
- `webgl_renderer`

后续接入后端时，优先替换 `getVisitorProfile()` 内部实现，保持组件使用的数据结构不变。

### 已验证内容

- `node --check` 已检查所有 JS 文件，语法通过。
- 本地静态服务已启动：
  - `http://127.0.0.1:5173`
- 已验证以下资源返回 `200 OK`：
  - `/`
  - `/src/components/visitorDashboard.js`
  - `/src/utils/html.js`
  - `/src/styles/main.css`

### 当前限制

- 目前没有接入真实后端接口。
- `risk_level` 和 `risk_code` 来自 mock 数据。
- 匿名模式检测暂未实现真实启发式判断，当前保持三态展示能力。
- VPN / 代理状态暂未接后端判断，当前来自 mock 数据。
- 当前环境未发现可用的 Playwright / Chromium，因此没有做浏览器截图级验证。

### 下一步计划

1. 新建 Python FastAPI 后端项目。
2. 提供 `GET /api/visitor` mock 接口。
3. 将前端 `visitorService` 从本地 mock 切换为请求后端接口。
4. 保持后端返回结构与当前前端 DTO 一致。
5. 后续再接入真实 `risk_query`，由后端返回权威的 `risk_level` 和 `risk_code`。
6. 再补浏览器侧真实指纹采集和匿名模式启发式判断。

### 运行方式

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:5173
```

## 2026-06-15 前后端联调与 Canvas Fingerprint 修复

### 本阶段完成内容

- 前端 `src/services/visitorService.js` 已从本地 mock 主流程切换为请求后端 `/api/visitor`。
- 浏览器环境信号会通过 `POST /api/visitor` 发送给后端。
- 后端会返回与前端 DTO 一致的结构，前端页面无需改动展示层结构。
- `Canvas Fingerprint` 已接入真实采集逻辑，并在页面技术信号区域成功显示真实值。
- `WebGL Vendor` 与 `WebGL Renderer` 也已通过真实浏览器环境返回并展示。

### 本次定位到的问题

- `Canvas Fingerprint` 最初看起来没有生效，不是代码链路没接上，而是浏览器缓存没有刷新。
- 处理方式：
  - 强制刷新页面
  - 或在 DevTools 中禁用缓存后重新加载静态资源

### 当前状态

- 前端地址：`http://127.0.0.1:5173`
- 后端地址：`http://127.0.0.1:8000`
- 当前页面已经可以展示真实浏览器信号：
  - `User Agent`
  - `Platform`
  - `Canvas Fingerprint`
  - `WebGL Vendor`
  - `WebGL Renderer`

### 下一步建议

1. 补匿名模式的启发式检测。
2. 梳理 VPN / 代理状态的后端判断来源。
3. 再逐步推进真实 `risk_query` 的接入。

## 2026-06-15 匿名模式检测说明

### 本阶段完成内容
- 判断是不是匿名模式访问 只有证据比较强时，才返回 is_incognito: true + incognito_confidence: "detected"
- 已为前端接入匿名模式启发式检测逻辑。
- 前端会将匿名模式检测结果通过 `/api/visitor` 发送给后端。
- 后端会将 `is_incognito` 和 `incognito_confidence` 返回给前端页面。
- 页面顶部摘要卡片中的 `INCOGNITO` 区域已改为展示真实检测结果，而不是固定 mock 值。

### 当前结论

- 匿名模式检测本质上属于启发式判断，不是绝对识别。
- 当前实现可以稳定跑通“前端检测 -> 后端接收 -> 页面展示”这条链路。
- 在部分浏览器或隐私模式环境下，返回 `Unknown` 是合理结果。
- `Unknown` 不表示功能失效，而表示当前浏览器没有暴露足够强的匿名模式特征。

### 当前展示语义

- `Likely Incognito`：检测到较强匿名模式信号。
- `Not Detected`：当前规则没有命中明显匿名模式特征。
- `Unknown`：当前环境下无法做出稳定判断。

### 开发说明

- 这一部分不追求 100% 准确率，更适合作为 Demo 的“启发式风险信号”。
- 对匿名模式的表达应保持谨慎，避免页面给出绝对结论。
