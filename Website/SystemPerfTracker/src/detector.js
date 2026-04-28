// detector.js
// Pulls hardware signals from the browser. Some of these APIs are
// inconsistent or missing depending on the browser, so everything
// has a fallback. We never throw here, just return null for missing data.

// the GPU string is the most useful signal but also the most annoying
// to get. browsers have been slowly restricting WEBGL_debug_renderer_info
// because of fingerprinting concerns. if we can't get it, we work with
// what we have.
function getGPUInfo() {
  try {
    const canvas = document.createElement('canvas');
    // request the dedicated GPU on hybrid-graphics laptops.
    // without this, a machine with both Intel iGPU and an RTX 4070
    // reports the Intel string, which throws off the whole pipeline.
    const ctxOpts = { powerPreference: 'high-performance' };
    const gl = canvas.getContext('webgl2', ctxOpts) || canvas.getContext('webgl', ctxOpts);
    if (!gl) return { renderer: null, vendor: null, webglVersion: 0 };

    const webglVersion = canvas.getContext('webgl2', ctxOpts) ? 2 : 1;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');

    let renderer = null;
    let vendor = null;
    if (ext) {
      renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
    }

    // grab capability limits while we have the context
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
    const maxFragUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    // check for float texture support, which is a decent proxy for
    // "this GPU was made after 2015 or so"
    const floatTextures = !!gl.getExtension('OES_texture_float');
    const halfFloatTextures = !!gl.getExtension('OES_texture_half_float');

    // anisotropy tells us something about texture filtering quality
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic') ||
                  gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    const maxAnisotropy = aniso
      ? gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      : 0;

    // lose the context so we don't leak it
    const loseCtx = gl.getExtension('WEBGL_lose_context');
    if (loseCtx) loseCtx.loseContext();

    return {
      renderer,
      vendor,
      webglVersion,
      maxTextureSize,
      maxRenderbufferSize,
      maxViewportDims: maxViewportDims ? Array.from(maxViewportDims) : null,
      maxVertexAttribs,
      maxVaryingVectors,
      maxFragUniforms,
      floatTextures,
      halfFloatTextures,
      maxAnisotropy,
    };
  } catch (e) {
    // if we crash here, the device probably can't run the 3D scene anyway
    return { renderer: null, vendor: null, webglVersion: 0 };
  }
}

// navigator.deviceMemory is a rough bucket (0.25, 0.5, 1, 2, 4, 8)
// only chromium browsers support it. returns null on firefox/safari.
function getDeviceMemory() {
  return navigator.deviceMemory || null;
}

// hardware concurrency = number of logical CPU cores
// this one is pretty reliable across browsers
function getCoreCount() {
  return navigator.hardwareConcurrency || null;
}

// connection info, useful because a 3G user on a fast GPU still has
// a bad time loading a 12MB model
function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return null;
  return {
    effectiveType: conn.effectiveType || null,  // '4g', '3g', etc
    downlink: conn.downlink || null,            // Mbps estimate
    rtt: conn.rtt || null,                      // round trip ms
    saveData: conn.saveData || false,            // user toggled data saver
  };
}

function getScreenInfo() {
  return {
    width: screen.width,
    height: screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: screen.colorDepth,
  };
}

// checks if the device is mobile based on user agent and touch support.
// not perfect but good enough for our purposes
function getDeviceType() {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua) ||
    (isMobile && Math.min(screen.width, screen.height) > 600);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    isMobile: isMobile || isTablet,
    hasTouch,
    platform: navigator.platform || null,
    userAgent: ua,
  };
}

// battery API is async and only available in some browsers
// a device on low battery probably shouldn't run the full scene
async function getBatteryInfo() {
  try {
    if (!navigator.getBattery) return null;
    const battery = await navigator.getBattery();
    return {
      level: battery.level,           // 0.0 to 1.0
      charging: battery.charging,
    };
  } catch {
    return null;
  }
}

// main export: runs all the detectors and returns one object
// the whole thing takes <50ms on most devices
export async function detectHardware() {
  const gpu = getGPUInfo();
  const battery = await getBatteryInfo();

  return {
    gpu,
    memory: getDeviceMemory(),
    cores: getCoreCount(),
    connection: getConnectionInfo(),
    screen: getScreenInfo(),
    device: getDeviceType(),
    battery,
    timestamp: Date.now(),
  };
}
