import { defaultScenario, riskScenarios } from "../data/mockVisitor.js";
import { collectBrowserEnvironment } from "../utils/browserSignals.js";

const API_BASE_URL =
  // (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://127.0.0.1:8000/api";

export async function getVisitorProfile(scenario = defaultScenario) {
  const live = collectBrowserEnvironment();
  const payload = createVisitorPayload(live);

  try {
    const response = await fetch(`${API_BASE_URL}/visitor?scenario=${encodeURIComponent(scenario)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Visitor API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Falling back to local visitor mock data.", error);
    const selected = riskScenarios[scenario] ?? riskScenarios[defaultScenario];
    return mergeLiveEnvironment(structuredClone(selected), live);

  }
}

function createVisitorPayload(live) {
  return {
    environment: {
      browser_name: live.environment.browser_name,
      browser_version: live.environment.browser_version,
      os_name: live.environment.os_name,
      device_type: live.environment.device_type,
      language: live.environment.language,
      timezone: live.environment.timezone,
      platform: live.environment.platform,
      screen_resolution: live.environment.screen_resolution,
      hardware_concurrency: live.environment.hardware_concurrency,
      device_memory: live.environment.device_memory
    },
    signals: {
      user_agent: live.signals.user_agent,
      canvas_fingerprint: live.signals.canvas_fingerprint,
      webgl_vendor: live.signals.webgl_vendor,
      webgl_renderer: live.signals.webgl_renderer
    }
  };
}

function mergeLiveEnvironment(profile, live = collectBrowserEnvironment()) {
  profile.environment = {
    ...profile.environment,
    ...live.environment
  };

  profile.signals = {
    ...profile.signals,
    ...live.signals
  };

  profile.meta = {
    ...profile.meta,
    request_time: new Date().toISOString()
  };

  return profile;
}


