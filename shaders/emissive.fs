precision mediump float;
uniform vec3 u_EmissiveColor;
uniform float u_Intensity;

void main() {
  gl_FragColor = vec4(u_EmissiveColor * u_Intensity, 1.0);
} 