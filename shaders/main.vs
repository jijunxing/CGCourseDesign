attribute vec3 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;
attribute float a_TextureType;

uniform mat4 u_ModelMatrix;
uniform mat4 u_PvMatrix;

varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoord;
varying float v_TextureType;

void main() {
  vec4 worldPosition = u_ModelMatrix * vec4(a_Position, 1.0);
  gl_Position = u_PvMatrix * worldPosition;
  
  v_Position = worldPosition.xyz;
  v_Normal = mat3(u_ModelMatrix) * a_Normal;
  v_TexCoord = a_TexCoord;
  v_TextureType = a_TextureType;
} 