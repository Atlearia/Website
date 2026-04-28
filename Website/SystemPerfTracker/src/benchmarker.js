// benchmarker.js
// Quick GPU micro-benchmark. Draws triangles for ~500ms offscreen
// and counts frames. Backup signal for when GPU string is masked.

const BENCH_MS = 500;
const BENCH_SIZE = 256;

export async function runMicroBenchmark() {
  return new Promise((resolve) => {
    try {
      const c = document.createElement('canvas');
      c.width = BENCH_SIZE; c.height = BENCH_SIZE;
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) { resolve({ fps: 0, frameCount: 0 }); return; }

      const vs = `attribute vec4 a;void main(){gl_Position=a;}`;
      const fs = `precision mediump float;uniform float t;void main(){gl_FragColor=vec4(sin(t),cos(t*.7),.5,1.);}`;

      const prog = mkProg(gl, vs, fs);
      if (!prog) { resolve({ fps: 0, frameCount: 0 }); return; }
      gl.useProgram(prog);

      const verts = buildGrid(16);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      const a = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      const ut = gl.getUniformLocation(prog, 't');
      gl.viewport(0, 0, BENCH_SIZE, BENCH_SIZE);

      let frames = 0;
      const t0 = performance.now();

      function tick() {
        const dt = performance.now() - t0;
        if (dt >= BENCH_MS) {
          const fps = (frames / dt) * 1000;
          gl.deleteProgram(prog); gl.deleteBuffer(buf);
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) ext.loseContext();
          resolve({ fps: Math.round(fps), frameCount: frames, durationMs: Math.round(dt) });
          return;
        }
        gl.uniform1f(ut, dt * 0.001);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
        gl.finish();
        frames++;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    } catch (e) {
      resolve({ fps: 0, frameCount: 0, error: e.message });
    }
  });
}

function buildGrid(n) {
  const v = [];
  const s = 2 / n;
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) {
    const x0 = -1 + x * s, y0 = -1 + y * s, x1 = x0 + s, y1 = y0 + s;
    v.push(x0,y0, x1,y0, x0,y1, x1,y0, x1,y1, x0,y1);
  }
  return new Float32Array(v);
}

function mkProg(gl, vSrc, fSrc) {
  const v = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(v, vSrc); gl.compileShader(v);
  if (!gl.getShaderParameter(v, gl.COMPILE_STATUS)) return null;
  const f = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(f, fSrc); gl.compileShader(f);
  if (!gl.getShaderParameter(f, gl.COMPILE_STATUS)) return null;
  const p = gl.createProgram();
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.deleteShader(v); gl.deleteShader(f);
  return p;
}
