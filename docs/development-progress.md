# 前端开发进度记录

## 文档状态

更新时间：`2026-06-18`

当前前端 Demo 已基本完成，已经打通：

- 页面渲染
- 浏览器环境采集
- 前端到后端的 `POST /api/visitor`
- 后端到内部 `g2-service` 的 `token_query`
- 风险结果、匿名模式、VPN 状态、风险码、指纹信息回显

当前前端只保留一种 token：`gee_token`。  
当前前端也不再暴露 `pass / review / reject` 手动切换入口，风险等级完全以接口返回结果为准。
当前这一轮前端 Demo 开发已完成收口。

## 当前完成情况

### 页面与交互

- 已完成主页面渲染：
  - `src/main.js`
  - `src/components/visitorDashboard.js`
- 已保留 `Refresh` 刷新。
- 页面顶部仅保留 `GeeToken` 手动覆盖输入框。
- 页面不再展示 `pass / review / reject` 三个切换按钮。

### 浏览器信号采集

- 已完成 `environment` 采集：
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
  - `is_incognito`
  - `incognito_confidence`
- 已完成 `signals` 采集：
  - `user_agent`
  - `canvas_fingerprint`
  - `webgl_vendor`
  - `webgl_renderer`

### 前后端联调

- 已切换到以后端 `/api/visitor` 作为主数据源。
- 当前前端会优先请求后端，失败时回退到本地 mock。
- 当前页面已可展示后端返回的：
  - `risk_level`
  - `risk_code`
  - `risk_summary`
  - `network`
  - `environment`
  - `signals`
  - `fingerprint`
  - `meta`

### GeeGuard Token 接入

- 已接入前端极验 GeeGuard SDK 初始化逻辑用于获取GeeToken：
  - `src/services/geeGuardService.js`
- 页面启动时会优先尝试获取 GeeGuard token。
- 拿到 token 后只请求一次后端；如果拿不到 token，再降级请求一次无 token 结果。
- 当前前端只使用 `gee_token`：
  - SDK 成功回调后读取 `result.data.gee_token`
  - 页面刷新时复用缓存下来的 token
  - 手动输入框只允许覆盖 `gee_token`

## 当前数据流转

### 页面打开时的默认链路

1. `src/main.js` 启动页面。
2. 先调用 `initGeeToken()` 尝试获取 GeeGuard token。
3. 如果 GeeGuard SDK 成功返回 token：
   - 前端缓存该 token
   - 前端调用 `getVisitorProfile({ geeToken })`
4. 后端收到 `gee_token` 后继续调用内部 `g2-service`。
5. 后端根据 `token_query` 返回结果更新：
   - `risk_level`
   - `risk_code`
   - `risk_summary`
   - `network.is_vpn`
   - `network.vpn_confidence`
   - `network.ip_type`
   - `environment.is_incognito`
   - `environment.incognito_confidence`
   - `fingerprint`
6. 前端渲染最终页面。

### 页面启动后的降级链路

1. `src/main.js` 调用 `initGeeToken()`。
2. 如果 GeeGuard SDK 超时、异常或返回空 token：
   - 前端调用 `getVisitorProfile({})`
3. 前端发送 `environment + signals` 到 `POST http://127.0.0.1:8000/api/visitor`。
4. 后端返回基础结果，前端完成渲染。

### 页面手动刷新链路

- 如果手动输入了 `GeeToken`，`Refresh` 优先发送手动值。
- 如果没有手动输入，前端自动复用 SDK 已缓存的 `gee_token`。
- 当前前端不会再手动指定 `pass / review / reject`。

## 当前前端请求结构

前端发送给后端的请求体结构：

```json
{
  "gee_token": "optional",
  "environment": {
    "browser_name": "Chrome",
    "browser_version": "136.0.0.0",
    "os_name": "Windows",
    "device_type": "Desktop",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "platform": "Win32",
    "screen_resolution": "1920x1080",
    "hardware_concurrency": 8,
    "device_memory": 8,
    "is_incognito": null,
    "incognito_confidence": "unknown"
  },
  "signals": {
    "user_agent": "Mozilla/5.0 ...",
    "canvas_fingerprint": "xxx",
    "webgl_vendor": "Google Inc.",
    "webgl_renderer": "ANGLE ..."
  }
}
```

## 当前页面展示结果

### 访问摘要

- `Risk Level`
- `IP Address`
- `Incognito`
- `VPN / Proxy`
- `Client Report`
- `GeeToken Query`

### 技术信号区

- `User Agent`
- `Platform`
- `Canvas Fingerprint`
- `WebGL Vendor`
- `WebGL Renderer`

### 原始结果区

- `Risk Summary`
- `IP Type`
- `VPN Confidence`
- `Incognito Confidence`
- `Client Report Used`
- `Client Report Status`
- `GeeToken Used`
- `GeeToken Status`
- `Token Source`
- `Fingerprint Local ID`
- `Fingerprint Root ID`
- `Fingerprint Sign`
- `Server Timestamp`
- `Client Timestamp`
- `Request Time`

## Token 状态字段说明

- `client_report_used`
  - 当前前端常规链路不会使用这个字段，通常为 `false`
- `client_report_status`
  - 当前前端常规链路通常为 `skipped`
- `geetoken_query_used`
  - 是否成功拿到了 `gee_token` 并尝试调用 `token_query`
- `geetoken_query_status`
  - `skipped / success / failed`
- `token_source`
  - `none`
  - `gee_token`

说明：
当前主链路中，`client_report` 已由前端 GeeGuard SDK 内部完成，后端只接收 `gee_token` 并调用 `token_query`。

## 当前限制

- 前端不能独立判断公网 VPN，VPN 状态仍依赖后端调用 `g2-service` 返回结果。
- 前端匿名模式判断仍然是启发式判断，不是绝对检测。
- 如果 GeeGuard SDK 未加载、初始化超时或拿不到 token，页面仍能打开，但只能展示“前端采集 + 后端兜底”的结果。
- 当前本地联调时，`network.ip` 常见为 `127.0.0.1` 或 `::1`，这是本地请求的正常现象。
- 当前 `risk_level / risk_code` 是否最终为真实结果，取决于后端是否成功打通 `token_query`。

## 当前结论

当前项目已经不是“纯 mock 页面”，而是“前端真实采集浏览器环境 + 后端统一处理 + 内部 `g2-service` 风控增强”的结构。

页面打开后：

- 前端优先获取 GeeGuard `gee_token`
- 成功时，后端直接基于 `g2-service token_query` 返回 VPN、匿名、风险码、指纹与风险等级结果
- 失败时，再降级为“前端采集 + 后端兜底”的无 token 结果

换句话说，前端和后端的数据流已经打通，当前完成的是 Demo 主链路，而不是最终业务化 SDK 封装。

前端调用极验 SDK 服务 [static.geetest.com/g5/gd.js](https://static.geetest.com/g5/gd.js)，
SDK 内部完成 `pre_load -> client_report`，拿到整理后的 `gee_token`。随后前端把该
`gee_token` 发送给 `/api/visitor`，由后端调用 `g2-service token_query` 完成 VPN、
匿名模式、风险码、指纹和最终风险等级的查询与展示。
