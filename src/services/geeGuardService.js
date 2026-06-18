import { GEE_GUARD_CONFIG } from "../config.js";

let cachedToken = null;
const SDK_LOAD_TIMEOUT_MS = 8000;
const SDK_CALLBACK_TIMEOUT_MS = 8000;
const SDK_POLL_INTERVAL_MS = 50;

function waitForGeeGuardSdk() {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const poll = () => {
      if (typeof window.initGeeGuard === "function") {
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= SDK_LOAD_TIMEOUT_MS) {
        console.warn(`GeeTest Guard SDK (gd.js) 加载超时（${SDK_LOAD_TIMEOUT_MS}ms）`);
        resolve(false);
        return;
      }

      setTimeout(poll, SDK_POLL_INTERVAL_MS);
    };

    poll();
  });
}

/**
 * 初始化极验 Guard SDK，获取 gee_token。
 * 如果 SDK 未加载或初始化失败，返回 null（不影响主流程）。
 * 先等待 SDK 可用，再设置回调超时，防止页面进入无 token 竞态。
 */
export async function initGeeToken() {
  const sdkReady = await waitForGeeGuardSdk();
  if (!sdkReady) {
    return null;
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = (token) => {
      if (settled) return;
      settled = true;
      cachedToken = token;
      resolve(token);
    };

    // 超时保护：如果 SDK 回调长时间不触发，强制继续
    const timer = setTimeout(() => {
      if (!settled) {
        console.warn(
          `GeeGuard 初始化超时（${SDK_CALLBACK_TIMEOUT_MS}ms），降级为无 token 模式`
        );
        done(null);
      }
    }, SDK_CALLBACK_TIMEOUT_MS);

    try {
      window.initGeeGuard(GEE_GUARD_CONFIG, (result) => {
        clearTimeout(timer);
        if (result && result.status === "success" && result.data?.gee_token) {
          console.log("GeeGuard token 获取成功");
          done(result.data.gee_token);
        } else {
          const reason = result?.data?.msg || result?.status || "unknown";
          console.warn("GeeGuard 初始化失败:", reason);
          done(null);
        }
      });
    } catch (error) {
      clearTimeout(timer);
      console.warn("GeeGuard 初始化异常:", error);
      done(null);
    }
  });
}

/**
 * 返回已缓存的 token（不重新初始化）。
 * 用于 Refresh / 切换 scenario 时复用首次获取的 token。
 */
export function getCachedGeeToken() {
  return cachedToken;
}
