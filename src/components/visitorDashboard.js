import { riskScenarios } from "../data/mockVisitor.js";
import { getVisitorProfile } from "../services/visitorService.js";
import {
  emptyValue,
  formatBooleanState,
  formatDateTime,
  formatMemory,
  riskTone
} from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderDashboard(root, profile) {
  root.innerHTML = createDashboardTemplate(profile);
  bindScenarioControls(root);
  bindRefresh(root);
}

function createDashboardTemplate(profile) {
  const tone = riskTone[profile.risk_level] ?? riskTone.review;
  const riskCodes = profile.risk_code.length
    ? profile.risk_code.map((code) => `<span class="risk-code">${escapeHtml(code)}</span>`).join("")
    : '<span class="empty-risk">NO_RISK_CODE</span>';

  return `
    <header class="topbar">
      <a class="brand" href="./" aria-label="Visitor Risk Intelligence">
        <span class="brand-mark"></span>
        <span>Visitor Risk</span>
      </a>
      <div class="topbar-actions">
        <span class="mode-pill">Mock mode</span>
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
          <div class="scenario-switcher" aria-label="Mock scenario switcher">
            ${Object.keys(riskScenarios)
              .map(
                (scenario) => `
                  <button
                    class="${scenario === profile.risk_level ? "active" : ""}"
                    data-scenario="${scenario}"
                    type="button"
                  >
                    ${escapeHtml(scenario)}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="dashboard-grid">
          <section class="panel visit-panel">
            <div class="summary-strip">
              ${summaryItem("Risk Level", tone.label, tone.className)}
              ${summaryItem("IP Address", profile.network.ip)}
              ${summaryItem("Incognito", formatBooleanState(profile.environment.is_incognito, profile.environment.incognito_confidence))}
              ${summaryItem("VPN / Proxy", formatBooleanState(profile.network.is_vpn, profile.network.vpn_confidence))}
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

function bindScenarioControls(root) {
  root.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", async () => {
      const scenario = button.dataset.scenario;
      button.closest(".scenario-switcher").classList.add("is-loading");
      const nextProfile = await getVisitorProfile(scenario);
      renderDashboard(root, nextProfile);
    });
  });
}

function bindRefresh(root) {
  root.querySelector("[data-action='refresh']").addEventListener("click", async () => {
    const activeScenario = root.querySelector("[data-scenario].active")?.dataset.scenario ?? "pass";
    const nextProfile = await getVisitorProfile(activeScenario);
    renderDashboard(root, nextProfile);
  });
}
