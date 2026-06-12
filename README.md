# Visitor Risk Intelligence Demo

一个浏览器访客指纹与风险展示前端 Demo。当前版本使用 mock 数据，后续接后端时只需要替换 `src/services/visitorService.js` 中的数据来源。

## 运行

```bash
npm run dev
```

打开 `http://localhost:5173`。

## 目录

- `src/components`：页面渲染组件
- `src/data`：mock 数据
- `src/services`：前端数据服务，后续接 `/api/visitor`
- `src/styles`：页面样式
- `src/utils`：格式化与浏览器信号采集工具
