export const riskScenarios = {
  pass: {
    visitor_id: "GEE3-01-a8f4c2e9b170",
    risk_level: "pass",
    risk_code: [],
    risk_summary: "Trusted",
    network: {
      ip: "127.0.0.1",
      ip_type: "residential",
      is_vpn: false,
      vpn_confidence: "not_detected"
    },
    environment: {
      browser_name: "Chrome",
      browser_version: "136.0.0.0",
      os_name: "Windows",
      device_type: "Desktop",
      is_incognito: null,
      incognito_confidence: "unknown",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      platform: "Win32",
      screen_resolution: "1920x1080",
      hardware_concurrency: 8,
      device_memory: 8
    },
    signals: {
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36",
      canvas_fingerprint: null,
      webgl_vendor: null,
      webgl_renderer: null
    },
    fingerprint: null,
    meta: {
      request_time: "2026-06-11T18:00:00+08:00",
      client_report_used: false,
      client_report_status: "skipped",
      geetoken_query_used: false,
      geetoken_query_status: "skipped",
      token_source: "none"
    }
  },
  review: {
    visitor_id: "GEE3-01-r7c9d4b2e103",
    risk_level: "review",
    risk_code: [20500, "INCOGNITO_UNKNOWN"],
    risk_summary: "Needs Review",
    network: {
      ip: "103.167.135.36",
      ip_type: "hosting",
      is_vpn: true,
      vpn_confidence: "detected"
    },
    environment: {
      browser_name: "Chrome",
      browser_version: "136.0.0.0",
      os_name: "Windows",
      device_type: "Desktop",
      is_incognito: null,
      incognito_confidence: "unknown",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      platform: "Win32",
      screen_resolution: "1920x1080",
      hardware_concurrency: 8,
      device_memory: 8
    },
    signals: {
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36",
      canvas_fingerprint: null,
      webgl_vendor: null,
      webgl_renderer: null
    },
    fingerprint: {
      local_id: "mock-local-review",
      root_id: "mock-root-review",
      sign: null,
      server_ts: null,
      client_ts: null
    },
    meta: {
      request_time: "2026-06-11T18:00:00+08:00",
      client_report_used: false,
      client_report_status: "skipped",
      geetoken_query_used: false,
      geetoken_query_status: "skipped",
      token_source: "none"
    }
  },
  reject: {
    visitor_id: "GEE3-01-z2f6a0c5d441",
    risk_level: "reject",
    risk_code: [20606, "BOT_AUTOMATION", "IP_REPUTATION_HIGH_RISK"],
    risk_summary: "High Risk",
    network: {
      ip: "198.51.100.24",
      ip_type: "datacenter",
      is_vpn: true,
      vpn_confidence: "detected"
    },
    environment: {
      browser_name: "HeadlessChrome",
      browser_version: "136.0.0.0",
      os_name: "Linux",
      device_type: "Desktop",
      is_incognito: null,
      incognito_confidence: "unknown",
      language: "en-US",
      timezone: "UTC",
      platform: "Linux x86_64",
      screen_resolution: "1365x768",
      hardware_concurrency: 2,
      device_memory: 2
    },
    signals: {
      user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/136 Safari/537.36",
      canvas_fingerprint: "mock-canvas-cc9a42",
      webgl_vendor: "Google Inc.",
      webgl_renderer: "SwiftShader"
    },
    fingerprint: {
      local_id: "mock-local-reject",
      root_id: "mock-root-reject",
      sign: "mock-signature-reject",
      server_ts: 1781661600,
      client_ts: 1781661598
    },
    meta: {
      request_time: "2026-06-11T18:00:00+08:00",
      client_report_used: false,
      client_report_status: "skipped",
      geetoken_query_used: false,
      geetoken_query_status: "skipped",
      token_source: "none"
    }
  }
};

export const defaultScenario = "pass";
