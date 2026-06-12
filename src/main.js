import { renderDashboard } from "./components/visitorDashboard.js";
import { getVisitorProfile } from "./services/visitorService.js";

const app = document.querySelector("#app");

async function boot() {
  app.innerHTML = '<main class="app-shell loading-state">Loading visitor intelligence...</main>';

  try {
    const profile = await getVisitorProfile();
    renderDashboard(app, profile);
  } catch (error) {
    app.innerHTML = `
      <main class="app-shell error-state">
        <p class="eyebrow">VISITOR RISK DEMO</p>
        <h1>Unable to load visitor profile</h1>
        <p>${error instanceof Error ? error.message : "Unknown error"}</p>
      </main>
    `;
  }
}

boot();
