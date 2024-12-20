precision mediump float;

varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoord;
varying float v_TextureType;

uniform vec3 u_Eye;
uniform vec3 u_LightPositions[4];
uniform vec3 u_LightColors[4];
uniform sampler2D u_WallTex;
uniform sampler2D u_FloorTex;

void main() {
  vec3 normal = normalize(v_Normal);
  vec3 finalColor = vec3(0.0);
  vec3 ambient = vec3(0.2);
  
  for(int i = 0; i < 4; i++) {
    vec3 lightDir = normalize(u_LightPositions[i] - v_Position);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * u_LightColors[i];
    
    vec3 viewDir = normalize(u_Eye - v_Position);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = spec * u_LightColors[i] * 0.5;
    
    float distance = length(u_LightPositions[i] - v_Position);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
    
    finalColor += (diffuse + specular) * attenuation;
  }
  
  vec4 texColor;
  if(v_TextureType < 0.5) {
    texColor = texture2D(u_FloorTex, v_TexCoord);
  } else {
    texColor = texture2D(u_WallTex, v_TexCoord);
  }
  
  finalColor = finalColor * texColor.rgb + ambient;
  gl_FragColor = vec4(finalColor, 1.0);
} 