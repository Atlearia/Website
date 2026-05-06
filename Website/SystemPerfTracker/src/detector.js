function getGPUInfo() {
  try {
    const canvas = document.createElement('canvas');
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

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
    const maxFragUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    const floatTextures = Boolean(gl.getExtension('OES_texture_float'));
    const halfFloatTextures = Boolean(gl.getExtension('OES_texture_half_float'));
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    const maxAnisotropy = aniso ? gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
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
  } catch {
    return { renderer: null, vendor: null, webglVersion: 0 };
  }
}

function getDeviceMemory() {
  return navigator.deviceMemory || null;
}

function getCoreCount() {
  return navigator.hardwareConcurrency || null;
}

function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return null;
  return {
    effectiveType: conn.effectiveType || null,
    downlink: conn.downlink || null,
    rtt: conn.rtt || null,
    saveData: conn.saveData || false,
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

async function getBatteryInfo() {
  try {
    if (!navigator.getBattery) return null;
    const battery = await navigator.getBattery();
    return {
      level: battery.level,
      charging: battery.charging,
    };
  } catch {
    return null;
  }
}

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
