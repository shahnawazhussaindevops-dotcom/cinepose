export const LUT_VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_uv;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = a_texCoord;
  }
`;

export const LUT_FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D u_frame;
  uniform vec3 u_shadows;
  uniform vec3 u_mids;
  uniform vec3 u_highlights;
  uniform float u_saturation;
  uniform float u_contrast;
  uniform float u_temperature;
  uniform float u_tint;
  uniform float u_intensity;
  uniform float u_liftR;
  uniform float u_liftG;
  uniform float u_liftB;
  uniform float u_gammaR;
  uniform float u_gammaG;
  uniform float u_gammaB;
  uniform float u_gainR;
  uniform float u_gainG;
  uniform float u_gainB;
  uniform float u_exposure;
  uniform float u_vignette;
  uniform vec2 u_resolution;
  varying vec2 v_uv;

  vec3 colorTemperature(float temp) {
    float r = temp <= 6500.0 ? 1.0 : clamp(1.0 - (temp - 6500.0) / 3500.0, 0.4, 1.0);
    float g = 1.0;
    float b = temp >= 6500.0 ? 1.0 : clamp((temp - 2000.0) / 4500.0, 0.4, 1.0);
    return vec3(r, g, b);
  }

  vec3 liftGammaGain(vec3 color, vec3 lift, vec3 gamma, vec3 gain) {
    return gain * pow(max(color + lift - 1.0, 0.0), 1.0 / max(gamma, 0.001));
  }

  float vignetteEffect(vec2 uv, float strength) {
    vec2 center = uv - 0.5;
    float dist = length(center);
    return 1.0 - smoothstep(0.2, 0.8, dist) * strength;
  }

  void main() {
    vec2 uv = v_uv;
    vec4 original = texture2D(u_frame, uv);
    vec3 color = original.rgb;

    color *= pow(2.0, u_exposure);

    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, u_saturation);

    color = (color - 0.5) * u_contrast + 0.5;

    vec3 tempOffset = colorTemperature(u_temperature);
    color.r *= tempOffset.r;
    color.g *= tempOffset.g;
    color.b *= tempOffset.b;

    float tintFactor = u_tint / 100.0;
    color.g *= (1.0 - tintFactor * 0.3);
    color.b *= (1.0 + tintFactor * 0.1);

    vec3 lift = vec3(u_liftR, u_liftG, u_liftB);
    vec3 gamma = vec3(max(u_gammaR, 0.001), max(u_gammaG, 0.001), max(u_gammaB, 0.001));
    vec3 gain = vec3(u_gainR, u_gainG, u_gainB);
    color = liftGammaGain(color, lift, gamma, gain);

    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 graded = vec3(0.0);
    graded += u_shadows * max(1.0 - lum * 3.0, 0.0);
    graded += u_mids * (1.0 - abs(lum - 0.5) * 2.0);
    graded += u_highlights * max((lum - 0.666) * 3.0, 0.0);
    color += graded;

    color = clamp(color, 0.0, 1.0);

    float vignette = vignetteEffect(uv, u_vignette);
    color *= vignette;

    color = mix(original.rgb, color, u_intensity);

    gl_FragColor = vec4(color, original.a);
  }
`;

export function createLUTProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, LUT_VERTEX_SHADER);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragmentShader, LUT_FRAGMENT_SHADER);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('LUT shader link error:', gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

export function setupLUTGeometry(gl: WebGL2RenderingContext): {
  positionBuffer: WebGLBuffer;
  texCoordBuffer: WebGLBuffer;
} {
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);

  const texCoords = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
  ]);

  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

  return { positionBuffer, texCoordBuffer };
}

export function applyLUT(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  frameTexture: WebGLTexture,
  params: Record<string, any>,
  width: number,
  height: number
): void {
  gl.useProgram(program);
  gl.viewport(0, 0, width, height);

  Object.entries(params).forEach(([key, value]) => {
    const loc = gl.getUniformLocation(program, key);
    if (!loc) return;

    if (Array.isArray(value)) {
      if (value.length === 3) {
        gl.uniform3f(loc, value[0], value[1], value[2]);
      } else if (value.length === 2) {
        gl.uniform2f(loc, value[0], value[1]);
      } else if (value.length === 4) {
        gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
      }
    } else if (typeof value === 'number') {
      gl.uniform1f(loc, value);
    }
  });

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, frameTexture);
  gl.uniform1i(gl.getUniformLocation(program, 'u_frame'), 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
