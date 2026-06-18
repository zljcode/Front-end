import { getVisitorProfile } from "../services/visitorService.js";
import { getCachedGeeToken } from "../services/geeGuardService.js";
import {
  emptyValue,
  formatBooleanState,
  formatDateTime,
  formatMemory,
  formatQueryStatus,
  formatTokenSource,
  formatUnixTime,
  riskTone
} from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderDashboard(root, profile) {
  root.innerHTML = createDashboardTemplate(profile);
  bindRefresh(root);
}

function createDashboardTemplate(profile) {
  const tone = riskTone[profile.risk_level] ?? riskTone.review;
  const riskCodeList = Array.isArray(profile.risk_code) ? profile.risk_code : [];
  const riskCodes = riskCodeList.length
    ? riskCodeList.map((code) => `<span class="risk-code">${escapeHtml(code)}</span>`).join("")
    : '<span class="empty-risk">NO_RISK_CODE</span>';
  const clientState = profile.__client ?? {};
  const fingerprint = profile.fingerprint ?? {};
  const isApiMode = clientState.mode === "api";

  return `
    <header class="topbar">
      <a class="brand" href="./" aria-label="Visitor Risk Intelligence">
        <span class="brand-mark"></span>
        <span>Visitor Risk</span>
      </a>
      <div class="topbar-actions">
        <span class="mode-pill">${isApiMode ? "API mode" : "Mock fallback"}</span>
        <button class="ghost-button" data-action="refresh" type="button">Refresh</button>
      </div>
    </header>

    <main class="page">
      <section class="hero">
        <p class="eyebrow">VISITOR INTELLIGENCE DEMO</p>
        <h1>Identify <span>every</span> visitor signal</h1>
        <p class="hero-copy">
          打开页面即可展示访客指纹、匿名模式、VPN/代理状态、风险码和最终风控结论。
        </p>
      </section>

      <section class="console" aria-label="Visitor risk dashboard">
        <div class="console-header">
          <div>
            <p class="eyebrow">CURRENT VISITOR</p>
            <h2>Hello, visitor ID <span>${escapeHtml(profile.visitor_id)}</span></h2>
          </div>
          <div class="control-stack">
            <div class="token-form">
              <label>
                <span>GeeToken</span>
                <input name="geeToken" autocomplete="off" value="${escapeHtml(clientState.geeToken ?? "")}">
              </label>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <section class="panel visit-panel">
            <div class="summary-strip">
              ${summaryItem("Risk Level", tone.label, tone.className)}
              ${summaryItem("IP Address", profile.network.ip)}
              ${summaryItem("Incognito", formatBooleanState(profile.environment.is_incognito, profile.environment.incognito_confidence))}
              ${summaryItem("VPN / Proxy", formatBooleanState(profile.network.is_vpn, profile.network.vpn_confidence))}
              ${summaryItem("Client Report", formatQueryStatus(profile.meta.client_report_status))}
              ${summaryItem("GeeToken Query", formatQueryStatus(profile.meta.geetoken_query_status))}
            </div>

            <div class="section-heading">
              <p class="eyebrow">VISIT SUMMARY</p>
              <h3>访问环境</h3>
            </div>

            <div class="detail-table">
              ${detailRow("Browser", `${profile.environment.browser_name} ${profile.environment.browser_version}`)}
              ${detailRow("Operating System", profile.environment.os_name)}
              ${detailRow("Device Type", profile.environment.device_type)}
              ${detailRow("Language", profile.environment.language)}
              ${detailRow("Timezone", profile.environment.timezone)}
              ${detailRow("Screen", profile.environment.screen_resolution)}
              ${detailRow("CPU Threads", profile.environment.hardware_concurrency)}
              ${detailRow("Device Memory", formatMemory(profile.environment.device_memory))}
            </div>
          </section>

          <aside class="panel risk-panel ${tone.className}">
            <p class="eyebrow">RISK DECISION</p>
            <div class="risk-orbit" aria-hidden="true">
              <span>${escapeHtml(tone.label)}</span>
            </div>
            <h3>${escapeHtml(tone.title)}</h3>
            <p>${escapeHtml(tone.message)}</p>
            <div class="risk-codes" aria-label="Matched risk codes">
              ${riskCodes}
            </div>
          </aside>
        </div>

        <div class="bottom-grid">
          <section class="panel signal-panel">
            <div class="section-heading">
              <p class="eyebrow">TECHNICAL SIGNALS</p>
              <h3>浏览器指纹信号</h3>
            </div>
            <div class="signal-list">
              ${signalRow("User Agent", profile.signals.user_agent)}
              ${signalRow("Platform", profile.environment.platform)}
              ${signalRow("Canvas Fingerprint", profile.signals.canvas_fingerprint)}
              ${signalRow("WebGL Vendor", profile.signals.webgl_vendor)}
              ${signalRow("WebGL Renderer", profile.signals.webgl_renderer)}
            </div>
          </section>

          <section class="panel raw-panel">
            <div class="section-heading">
              <p class="eyebrow">RAW RESULT</p>
              <h3>原始风控摘要</h3>
            </div>
            <div class="raw-list">
              ${detailRow("Risk Summary", profile.risk_summary)}
              ${detailRow("IP Type", profile.network.ip_type)}
              ${detailRow("VPN Confidence", profile.network.vpn_confidence)}
              ${detailRow("Incognito Confidence", profile.environment.incognito_confidence)}
              ${detailRow("Client Report Used", profile.meta.client_report_used ? "Yes" : "No")}
              ${detailRow("Client Report Status", formatQueryStatus(profile.meta.client_report_status))}
              ${detailRow("GeeToken Used", profile.meta.geetoken_query_used ? "Yes" : "No")}
              ${detailRow("GeeToken Status", formatQueryStatus(profile.meta.geetoken_query_status))}
              ${detailRow("Token Source", formatTokenSource(profile.meta.token_source))}
              ${detailRow("Fingerprint Local ID", fingerprint.local_id)}
              ${detailRow("Fingerprint Root ID", fingerprint.root_id)}
              ${detailRow("Fingerprint Sign", fingerprint.sign)}
              ${detailRow("Server Timestamp", formatUnixTime(fingerprint.server_ts))}
              ${detailRow("Client Timestamp", formatUnixTime(fingerprint.client_ts))}
              ${detailRow("Request Time", formatDateTime(profile.meta.request_time))}
            </div>
          </section>
        </div>
      </section>
    </main>
  `;
}

function summaryItem(label, value, className = "") {
  return `
    <div class="summary-item ${className}">
      <span>${label}</span>
      <strong>${escapeHtml(emptyValue(value))}</strong>
    </div>
  `;
}

function detailRow(label, value) {
  return `
    <div class="detail-row">
      <span>${label}</span>
      <strong>${escapeHtml(emptyValue(value))}</strong>
    </div>
  `;
}

function signalRow(label, value) {
  return `
    <div class="signal-row">
      <span>${label}</span>
      <code>${escapeHtml(emptyValue(value))}</code>
    </div>
  `;
}

function bindRefresh(root) {
  root.querySelector("[data-action='refresh']").addEventListener("click", async () => {
    const nextProfile = await getVisitorProfile(getCurrentRequestOptions(root));
    renderDashboard(root, nextProfile);
  });
}

function getCurrentRequestOptions(root) {
  const input = root.querySelector("[name='geeToken']");
  if (!input) {
    return {};
  }

  const manualGeeToken = String(input.value ?? "").trim();
  const autoToken = getCachedGeeToken();

  // 手动输入优先；如果没有手动输入，自动复用 SDK 获取的 token
  const geeToken = manualGeeToken || autoToken || "";

  return {
    geeToken
  };
}
