// 玻璃材质着色器
export const glassShaders = {
  vs: `#version 300 es
    in vec3 a_Position;
    in vec3 a_Normal;
    
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_NormalMatrix;
    
    out vec3 v_Position;
    out vec3 v_Normal;
    
    void main() {
      vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
      gl_Position = u_PvMatrix * worldPos;
      v_Position = worldPos.xyz;
      v_Normal = normalize(mat3(u_NormalMatrix) * a_Normal);
    }
  `,
  fs: `#version 300 es
    precision highp float;
    
    uniform vec3 u_Eye;
    uniform vec3 u_LightPositions[1];
    uniform vec3 u_LightColors[1];
    
    in vec3 v_Position;
    in vec3 v_Normal;
    
    out vec4 fragColor;
    
    const float IOR = 1.5; // 玻璃的折射率
    const float R0 = pow((1.0 - IOR) / (1.0 + IOR), 2.0);
    const float TRANSPARENCY = 0.3; // 透明度
    
    // 菲涅尔方程
    float fresnel(float cosTheta) {
      return R0 + (1.0 - R0) * pow(1.0 - cosTheta, 5.0);
    }
    
    void main() {
      vec3 N = normalize(v_Normal);
      vec3 V = normalize(u_Eye - v_Position);
      float NdotV = max(dot(N, V), 0.0);
      
      // 计算反射和折射
      vec3 reflectDir = reflect(-V, N);
      vec3 refractDir = refract(-V, N, 1.0/IOR);
      
      // 计算菲涅尔系数
      float F = fresnel(NdotV);
      
      vec3 reflectColor = vec3(0.0);
      vec3 refractColor = vec3(0.0);
      
      // 增强反射光照
      for(int i = 0; i < 1; i++) {
        vec3 L = normalize(u_LightPositions[i] - v_Position);
        vec3 H = normalize(V + L);
        float distance = length(u_LightPositions[i] - v_Position);
        float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
        
        float spec = pow(max(dot(reflectDir, L), 0.0), 64.0);
        reflectColor += u_LightColors[i] * spec * attenuation * 2.0;
      }
      
      // 增强折射光照
      for(int i = 0; i < 1; i++) {
        vec3 L = normalize(u_LightPositions[i] - v_Position);
        float distance = length(u_LightPositions[i] - v_Position);
        float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
        
        float spec = pow(max(dot(refractDir, L), 0.0), 32.0);
        refractColor += u_LightColors[i] * spec * attenuation;
      }
      
      // 混合反射和折射
      vec3 finalColor = mix(refractColor, reflectColor, F);
      
      // 添加玻璃的基础颜色和环境光
      vec3 glassColor = vec3(0.95, 0.95, 1.0);
      finalColor = finalColor * glassColor + glassColor * 0.2;
      
      // 应用透明度
      fragColor = vec4(finalColor, TRANSPARENCY);
    }
  `
};

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
      // 增强发光颜色
      vec3 color = u_EmissiveColor * u_Intensity * 2.0;
      
      // 添加发光中心的亮度
      float brightness = 1.2;
      color *= brightness;
      
      // HDR色调映射
      color = color / (color + vec3(1.0));
      
      // 提高最小亮度以确保始终可见
      color = max(color, vec3(0.6));
      
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

// 阴影映射的顶点着色器
const shadowVS = `
  attribute vec3 a_Position;
  uniform mat4 u_LightMVP;
  
  void main() {
    gl_Position = u_LightMVP * vec4(a_Position, 1.0);
  }
`;

// 阴影映射的片元着色器
const shadowFS = `
  precision mediump float;
  
  void main() {
    gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0);
  }
`;

// 阴影贴图生成着色器
export const shadowShaders = {
  vs: `#version 300 es
    in vec3 a_Position;
    
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_LightSpaceMatrix;
    
    void main() {
      gl_Position = u_LightSpaceMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
    }
  `,
  fs: `#version 300 es
    precision highp float;
    
    out vec4 fragColor;
    
    void main() {
      // 深度值已经自动写入深度缓冲区
      fragColor = vec4(gl_FragCoord.z, gl_FragCoord.z, gl_FragCoord.z, 1.0);
    }
  `
};

// 主要着色器
export const mainShaders = {
  vs: `#version 300 es
    in vec3 a_Position;
    in vec3 a_Normal;
    in vec2 a_TexCoord;
    in float a_TextureType;
    
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_LightSpaceMatrix;
    
    out vec3 v_Position;
    out vec3 v_Normal;
    out vec2 v_TexCoord;
    out float v_TextureType;
    out vec4 v_LightSpacePos;
    
    void main() {
      vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
      gl_Position = u_PvMatrix * worldPos;
      
      v_Position = worldPos.xyz;
      v_Normal = mat3(u_ModelMatrix) * a_Normal;
      v_TexCoord = a_TexCoord;
      v_TextureType = a_TextureType;
      v_LightSpacePos = u_LightSpaceMatrix * worldPos;
    }
  `,
  fs: `#version 300 es
    precision highp float;
    
    in vec3 v_Position;
    in vec3 v_Normal;
    in vec2 v_TexCoord;
    in float v_TextureType;
    in vec4 v_LightSpacePos;
    
    uniform vec3 u_Eye;
    uniform vec3 u_LightPositions[1];
    uniform vec3 u_LightColors[1];
    uniform sampler2D u_WallTex;
    uniform sampler2D u_FloorTex;
    uniform sampler2D u_ShadowMap;
    uniform vec3 u_Color;
    uniform float u_Metallic;
    uniform float u_Roughness;
    
    out vec4 fragColor;
    
    float getShadow() {
      // 执行透视除法
      vec3 projCoords = v_LightSpacePos.xyz / v_LightSpacePos.w;
      // 变换到[0,1]范围
      projCoords = projCoords * 0.5 + 0.5;
      
      // 获取当前片段在光源视角下的深度
      float currentDepth = projCoords.z;
      
      // 阴影偏移值，避免阴影失真
      float bias = max(0.005 * (1.0 - dot(normalize(v_Normal), normalize(u_LightPositions[0] - v_Position))), 0.0005);
      
      // PCF软阴影
      float shadow = 0.0;
      vec2 texelSize = 1.0 / vec2(2048.0);
      for(int x = -2; x <= 2; x++) {
        for(int y = -2; y <= 2; y++) {
          float pcfDepth = texture(u_ShadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
          shadow += currentDepth - bias > pcfDepth ? 0.6 : 0.0;  // 降低阴影强度
        }
      }
      shadow /= 25.0;
      
      // 处理超出阴影贴图范围的情况
      if(projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || 
         projCoords.y < 0.0 || projCoords.y > 1.0) {
        shadow = 0.0;
      }
      
      return shadow;
    }
    
    void main() {
      vec3 normal = normalize(v_Normal);
      vec3 viewDir = normalize(u_Eye - v_Position);
      
      // 获取材质颜色
      vec3 materialColor;
      if(v_TextureType == 0.0) {
        materialColor = texture(u_WallTex, v_TexCoord).rgb;
      } else if(v_TextureType == 1.0) {
        materialColor = texture(u_FloorTex, v_TexCoord).rgb;
      } else {
        materialColor = u_Color;
      }
      
      // 环境光
      vec3 ambient = 0.2 * materialColor;  // 增加环境光强度
      
      vec3 finalColor = ambient;
      
      // 计算阴影
      float shadow = getShadow();
      
      // 对每个光源计算光照
      for(int i = 0; i < 1; i++) {
        vec3 lightDir = normalize(u_LightPositions[i] - v_Position);
        float distance = length(u_LightPositions[i] - v_Position);
        float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
        
        // 漫反射
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * u_LightColors[i] * materialColor;
        
        // 镜面反射
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
        vec3 specular = spec * u_LightColors[i] * mix(vec3(0.04), materialColor, u_Metallic);
        
        // 应用阴影和衰减
        finalColor += (1.0 - shadow) * (diffuse + specular) * attenuation;
      }
      
      fragColor = vec4(finalColor, 1.0);
    }
  `
};

// 添加FXAA抗锯齿着色器
export const fxaaShaders = {
  vs: `
    attribute vec2 a_Position;
    varying vec2 v_TexCoord;
    void main() {
      gl_Position = vec4(a_Position, 0.0, 1.0);
      v_TexCoord = (a_Position + 1.0) * 0.5;
    }
  `,
  fs: `
    precision highp float;
    uniform sampler2D u_Texture;
    uniform vec2 u_Resolution;
    varying vec2 v_TexCoord;
    
    void main() {
      float FXAA_SPAN_MAX = 8.0;
      float FXAA_REDUCE_MUL = 1.0/8.0;
      float FXAA_REDUCE_MIN = 1.0/128.0;
      
      vec2 texCoordOffset = vec2(1.0/u_Resolution.x, 1.0/u_Resolution.y);
      
      vec3 rgbNW = texture2D(u_Texture, v_TexCoord + vec2(-1.0, -1.0) * texCoordOffset).xyz;
      vec3 rgbNE = texture2D(u_Texture, v_TexCoord + vec2(1.0, -1.0) * texCoordOffset).xyz;
      vec3 rgbSW = texture2D(u_Texture, v_TexCoord + vec2(-1.0, 1.0) * texCoordOffset).xyz;
      vec3 rgbSE = texture2D(u_Texture, v_TexCoord + vec2(1.0, 1.0) * texCoordOffset).xyz;
      vec3 rgbM  = texture2D(u_Texture, v_TexCoord).xyz;
      
      vec3 luma = vec3(0.299, 0.587, 0.114);
      float lumaNW = dot(rgbNW, luma);
      float lumaNE = dot(rgbNE, luma);
      float lumaSW = dot(rgbSW, luma);
      float lumaSE = dot(rgbSE, luma);
      float lumaM  = dot(rgbM,  luma);
      
      float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
      float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
      
      vec2 dir;
      dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
      dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
      
      float dirReduce = max(
          (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
          FXAA_REDUCE_MIN);
      
      float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
      dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
                max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                dir * rcpDirMin)) * texCoordOffset;
      
      vec3 rgbA = 0.5 * (
          texture2D(u_Texture, v_TexCoord + dir * (1.0/3.0 - 0.5)).xyz +
          texture2D(u_Texture, v_TexCoord + dir * (2.0/3.0 - 0.5)).xyz);
      vec3 rgbB = rgbA * 0.5 + 0.25 * (
          texture2D(u_Texture, v_TexCoord + dir * -0.5).xyz +
          texture2D(u_Texture, v_TexCoord + dir * 0.5).xyz);
      
      float lumaB = dot(rgbB, luma);
      
      if(lumaB < lumaMin || lumaB > lumaMax)
          gl_FragColor = vec4(rgbA, 1.0);
      else
          gl_FragColor = vec4(rgbB, 1.0);
    }
  `
} 