/* Satin-ribbon hero shader.
   A slow fbm-warped silk field in brand pastels with a specular sheen,
   light enough that ink text stays readable on top of it.
   Falls back to a static CSS gradient when WebGL is unavailable
   or the visitor prefers reduced motion. */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;

// Brand pastels (pre-lightened for text contrast)
const vec3 SHELL  = vec3(0.992, 0.976, 0.965);
const vec3 ROSE   = vec3(0.914, 0.510, 0.722);
const vec3 PERI   = vec3(0.663, 0.737, 0.902);
const vec3 BUTTER = vec3(0.961, 0.851, 0.561);
const vec3 FOAM   = vec3(0.804, 0.914, 0.874);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(13.7, 7.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.055;

  // pointer adds a gentle local swirl
  vec2 m = uPointer;
  m.x *= uRes.x / uRes.y;
  float mDist = length(p - m);
  float mPush = 0.22 * exp(-mDist * 2.6);

  // domain-warped silk field
  vec2 q = vec2(fbm(p * 1.35 + t), fbm(p * 1.35 - t * 0.7 + 4.2));
  vec2 r = vec2(fbm(p + q * 1.6 + t * 0.5), fbm(p + q * 1.6 - t * 0.4 + 8.9));
  float field = fbm(p * 1.1 + r * 1.9 + mPush);

  // layered ribbon bands flowing diagonally
  float band1 = 0.5 + 0.5 * sin(6.0 * (p.x * 0.55 - p.y * 0.85) + field * 7.0 + t * 2.2);
  float band2 = 0.5 + 0.5 * sin(4.0 * (p.x * 0.8 + p.y * 0.5) - field * 6.0 - t * 1.6 + 2.1);
  float band3 = 0.5 + 0.5 * sin(9.0 * (p.y * 0.6 - p.x * 0.3) + field * 5.0 + t * 1.1 + 5.3);

  vec3 col = SHELL;
  col = mix(col, ROSE, smoothstep(0.2, 0.85, band1) * 0.95);
  col = mix(col, PERI, smoothstep(0.3, 0.9, band2) * 0.8);
  col = mix(col, BUTTER, smoothstep(0.5, 1.0, band3) * 0.55);
  col = mix(col, FOAM, smoothstep(0.55, 1.0, field) * 0.4);

  // satin sheen: sharp highlight streaks along band1 crests
  float sheen = pow(band1, 14.0) * 0.5 + pow(band2, 20.0) * 0.35;
  col += sheen * vec3(1.0, 0.98, 0.95) * 0.55;

  // lift toward shell at the very top and bottom so the page blends in
  float edge = smoothstep(0.0, 0.14, uv.y) * smoothstep(1.0, 0.9, uv.y);
  col = mix(SHELL, col, edge);

  // fine grain kills gradient banding
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.018;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function initHeroShader(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = !reduced && canvas.getContext('webgl', { antialias: false, depth: false, stencil: false });
  if (!gl) {
    canvas.style.background =
      'radial-gradient(120% 90% at 15% 20%, #f4c3dc 0%, transparent 55%),' +
      'radial-gradient(110% 80% at 85% 30%, #ccd7f2 0%, transparent 55%),' +
      'radial-gradient(100% 90% at 50% 95%, #f7e3b4 0%, transparent 60%), #fdf9f6';
    return;
  }

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uPointer = gl.getUniformLocation(prog, 'uPointer');

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0, h = 0;
  const resize = () => {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (cw === w && ch === h) return;
    w = cw; h = ch;
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  // pointer eased toward target for a liquid feel
  let px = 0.5, py = 0.55, tx = 0.5, ty = 0.55;
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX / window.innerWidth;
    ty = 1 - e.clientY / window.innerHeight;
  }, { passive: true });

  let running = true;
  let raf = 0;
  const io = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    if (running) raf = requestAnimationFrame(frame);
  });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else if (running) { raf = requestAnimationFrame(frame); }
  });

  const t0 = performance.now();
  function draw(now) {
    resize();
    px += (tx - px) * 0.04;
    py += (ty - py) * 0.04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform2f(uPointer, px, py);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    if (!running || document.hidden) return;
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  // paint one frame immediately so hidden tabs, screenshots and
  // reduced-power situations still show the silk instead of a blank
  draw(t0 + 3000);
  raf = requestAnimationFrame(frame);
}
