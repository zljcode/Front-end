import { defaultScenario, riskScenarios } from "../data/mockVisitor.js";
import { collectBrowserEnvironment } from "../utils/browserSignals.js";

const API_BASE_URL =
  // (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://127.0.0.1:8000/api";

export async function getVisitorProfile(options = {}) {
  const live = await collectBrowserEnvironment();
  const payload = createVisitorPayload(live, options);

  try {
    const response = await fetch(`${API_BASE_URL}/visitor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Visitor API request failed with status ${response.status}`);
    }

    const profile = await response.json();
    return attachClientState(profile, options, "api");
  } catch (error) {
    console.warn("Falling back to local visitor mock data.", error);
    const selected = riskScenarios[defaultScenario];
    return attachClientState(mergeLiveEnvironment(cloneProfile(selected), live), options, "mock");
  }
}

function createVisitorPayload(live, options) {
  const payload = {
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
      device_memory: live.environment.device_memory,
      is_incognito: live.environment.is_incognito,
      incognito_confidence: live.environment.incognito_confidence,
    },
    signals: {
      user_agent: live.signals.user_agent,
      canvas_fingerprint: live.signals.canvas_fingerprint,
      webgl_vendor: live.signals.webgl_vendor,
      webgl_renderer: live.signals.webgl_renderer
    }
  };

  const geeToken = options.geeToken?.trim();
  if (geeToken) {
    payload.gee_token = geeToken;
  }

  return payload;
}

function mergeLiveEnvironment(profile, live) {
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

function attachClientState(profile, options, mode) {
  const geeToken = options.geeToken?.trim() ?? "";

  return {
    ...profile,
    fingerprint: profile.fingerprint ?? null,
    meta: {
      geetoken_query_used: false,
      geetoken_query_status: "skipped",
      token_source: "none",
      ...profile.meta,
      client_report_used: Boolean(geeToken),
      client_report_status: geeToken ? "success" : "skipped"
    },
    __client: {
      mode,
      geeToken
    }
  };
}

function cloneProfile(profile) {
  if (typeof structuredClone === "function") {
    return structuredClone(profile);
  }

  return JSON.parse(JSON.stringify(profile));
}
