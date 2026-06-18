import { renderDashboard } from "./components/visitorDashboard.js";
import { getVisitorProfile } from "./services/visitorService.js";
import { initGeeToken } from "./services/geeGuardService.js";

const app = document.querySelector("#app");

async function boot() {
  renderLoadingState();
  await renderWithBestAvailableToken();
}

async function renderWithBestAvailableToken() {
  try {
    const geeToken = await initGeeToken();
    const profile = await getVisitorProfile({ geeToken: geeToken ?? "" });
    renderDashboard(app, profile);
  } catch (error) {
    try {
      const profile = await getVisitorProfile({});
      renderDashboard(app, profile);
    } catch (fallbackError) {
      app.innerHTML = `
        <main class="app-shell error-state">
          <p class="eyebrow">VISITOR RISK DEMO</p>
          <h1>Unable to load visitor profile</h1>
          <p>${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}</p>
        </main>
      `;
    }
  }
}

function renderLoadingState() {
  app.innerHTML = `
    <main class="app-shell loading-state">
      <p class="eyebrow">VISITOR RISK DEMO</p>
      <h1>Loading visitor profile</h1>
      <p>正在获取 GeeGuard token 并准备风险结果。</p>
    </main>
  `;
}

boot();
