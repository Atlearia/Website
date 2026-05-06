const BENCH_MS = 500;
const BENCH_SIZE = 512;

export async function runMicroBenchmark() {
  return new Promise((resolve) => {
    try {
      const c = document.createElement('canvas');
      c.width = BENCH_SIZE;
      c.height = BENCH_SIZE;
      const ctxOpts = { powerPreference: 'high-performance' };
      const gl = c.getContext('webgl2', ctxOpts) || c.getContext('webgl', ctxOpts);
      if (!gl) {
        resolve({ fps: 0, frameCount: 0 });
        return;
      }

      const vs = `attribute vec4 a;varying vec2 v;void main(){v=a.xy*0.5+0.5;gl_Position=a;}`;
      const fs = [
        'precision mediump float;',
        'varying vec2 v;',
        'uniform float t;',
        // hash function for pseudo-random noise
        'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
        // value noise with smooth interpolation
        'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
        'return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
        // multi-octave fbm — this is the GPU stress part
        'float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*n(p);p*=2.01;a*=0.5;}return v;}',
        'void main(){',
        '  vec2 uv=v*4.0;',
        '  float f1=fbm(uv+t*0.3);',
        '  float f2=fbm(uv*2.0-t*0.2+f1);',
        '  float f3=fbm(uv*0.5+vec2(f1,f2));',
        '  vec3 c=mix(vec3(0.1,0.2,0.4),vec3(0.9,0.6,0.2),f3);',
        '  c+=0.15*vec3(f1-f2,f2-f3,f3-f1);',
        '  gl_FragColor=vec4(c,1.0);',
        '}',
      ].join('\n');
      const prog = mkProg(gl, vs, fs);
      if (!prog) {
        resolve({ fps: 0, frameCount: 0 });
        return;
      }

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
          gl.deleteProgram(prog);
          gl.deleteBuffer(buf);
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
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      const x0 = -1 + x * s;
      const y0 = -1 + y * s;
      const x1 = x0 + s;
      const y1 = y0 + s;
      v.push(x0, y0, x1, y0, x0, y1, x1, y0, x1, y1, x0, y1);
    }
  }
  return new Float32Array(v);
}

function mkProg(gl, vSrc, fSrc) {
  const v = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(v, vSrc);
  gl.compileShader(v);
  if (!gl.getShaderParameter(v, gl.COMPILE_STATUS)) return null;
  const f = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(f, fSrc);
  gl.compileShader(f);
  if (!gl.getShaderParameter(f, gl.COMPILE_STATUS)) return null;
  const p = gl.createProgram();
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.deleteShader(v);
  gl.deleteShader(f);
  return p;
}
