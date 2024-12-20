attribute vec3 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_PvMatrix;

void main() {
  gl_Position = u_PvMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
} 