// 玻璃材质着色器
export const glassShaders = {
  vs: `
    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    void main(){
      vec4 worldPos = u_ModelMatrix * a_Position;
      gl_Position = u_PvMatrix * worldPos;
      v_Normal = normalize(mat3(u_ModelMatrix) * a_Normal);
      v_Position = vec3(worldPos);
    }
  `,
  fs: `
    precision mediump float;
    uniform vec3 u_Eye;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    
    void main() {
      vec3 N = normalize(v_Normal);
      vec3 V = normalize(u_Eye - v_Position);
      
      float R0 = 0.02;
      float fresnel = R0 + (1.0 - R0) * pow(1.0 - dot(N, V), 5.0);
      
      vec3 glassColor = vec3(0.9, 0.9, 1.0);
      vec3 color = mix(glassColor * 0.5, vec3(1.0), fresnel);
      
      gl_FragColor = vec4(color, 0.3);
    }
  `
}

// PBR材质着色器
export const pbrShaders = {
  vs: `
    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    attribute vec2 a_TexCoord;
    
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    
    varying vec3 v_Position;
    varying vec3 v_Normal;
    varying vec2 v_TexCoord;
    
    void main() {
      vec4 worldPos = u_ModelMatrix * a_Position;
      gl_Position = u_PvMatrix * worldPos;
      v_Position = worldPos.xyz;
      v_Normal = (u_NormalMatrix * vec4(a_Normal, 0.0)).xyz;
      v_TexCoord = a_TexCoord;
    }
  `,
  fs: `
    // ... PBR片元着色器代码 ...
  `
}

// 自发光材质着色器
export const emissiveShaders = {
  vs: `
    attribute vec4 a_Position;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    void main(){
      gl_Position = u_PvMatrix * u_ModelMatrix * a_Position;
    }
  `,
  fs: `
    precision mediump float;
    uniform vec3 u_EmissiveColor;
    uniform float u_Intensity;
    void main(){
      vec3 color = u_EmissiveColor * u_Intensity;
      color = color / (color + vec3(1.0));
      gl_FragColor = vec4(color, 1.0);
    }
  `
}

// Blinn-Phong着色器
export const blinnPhongShaders = {
  vs: `
    // ... Blinn-Phong顶点着色器代码 ...
  `,
  fs: `
    // ... Blinn-Phong片元着色器代码 ...
  `
}

// 主场景着色器
export const mainShaders = {
  vs: `
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
  `,
  fs: `
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
  `
} 