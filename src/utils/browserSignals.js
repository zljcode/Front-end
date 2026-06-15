export function collectBrowserEnvironment() {
  const nav = window.navigator;
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const userAgent = nav.userAgent || "Unknown";
  const browser = parseBrowser(userAgent);
  const osName = parseOS(userAgent, nav.platform);
  const webgl = getWebGLInfo();

  return {
    environment: {
      browser_name: browser.name,
      browser_version: browser.version,
      os_name: osName,
      device_type: getDeviceType(),
      language: nav.language || "unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
      platform: nav.platform || "unknown",
      screen_resolution: screenSize,
      hardware_concurrency: nav.hardwareConcurrency || "unknown",
      device_memory: nav.deviceMemory || "unknown"
    },
    signals: {
      user_agent: userAgent,
      webgl_vendor: webgl.vendor,
      webgl_renderer: webgl.renderer,
      canvas_fingerprint: getCanvasFingerprint(),
    }
  };
}

function parseBrowser(userAgent) {
  const rules = [
    ["Edge", /Edg\/([\d.]+)/],
    ["Chrome", /Chrome\/([\d.]+)/],
    ["Firefox", /Firefox\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/]
  ];

  for (const [name, pattern] of rules) {
    const match = userAgent.match(pattern);
    if (match) {
      return { name, version: match[1] };
    }
  }

  return { name: "Unknown", version: "unknown" };
}

function parseOS(userAgent, platform = "") {
  if (/Windows/i.test(userAgent) || /Win/i.test(platform)) return "Windows";
  if (/Mac OS|Macintosh/i.test(userAgent) || /Mac/i.test(platform)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Linux/i.test(userAgent) || /Linux/i.test(platform)) return "Linux";
  return "Unknown";
}

function getDeviceType() {
  const width = window.innerWidth;
  const hasTouch = navigator.maxTouchPoints > 0;

  if (width < 768 && hasTouch) return "Mobile";
  if (width < 1100 && hasTouch) return "Tablet";
  return "Desktop";
}

function getWebGLInfo() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    return { vendor: null, renderer: null };
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (!debugInfo) {
    return { vendor: null, renderer: null };
  }

  return {
    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
  };
}



function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'Not available';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser Fingerprint', 4, 17);

    //转成 hash
    const data = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  } catch (e) {
    return "Not available"
  }
}