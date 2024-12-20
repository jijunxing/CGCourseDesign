// 玻璃材质着色器
export const glassShaders = {
  vs: `
    attribute vec3 a_Position;
    attribute vec3 a_Normal;
    
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_NormalMatrix;
    
    varying vec3 v_Position;
    varying vec3 v_Normal;
    
    void main() {
      vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
      gl_Position = u_PvMatrix * worldPos;
      v_Position = worldPos.xyz;
      v_Normal = normalize(mat3(u_NormalMatrix) * a_Normal);
    }
  `,
  fs: `
    precision highp float;
    
    uniform vec3 u_Eye;
    uniform vec3 u_LightPositions[4];
    uniform vec3 u_LightColors[4];
    
    varying vec3 v_Position;
    varying vec3 v_Normal;
    
    const float IOR = 1.5; // 玻璃的折射率
    const float R0 = pow((1.0 - IOR) / (1.0 + IOR), 2.0);
    const int MAX_BOUNCES = 3;
    
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
      for(int i = 0; i < 4; i++) {
        vec3 L = normalize(u_LightPositions[i] - v_Position);
        vec3 H = normalize(V + L);
        float distance = length(u_LightPositions[i] - v_Position);
        float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
        
        float spec = pow(max(dot(reflectDir, L), 0.0), 64.0);
        reflectColor += u_LightColors[i] * spec * attenuation * 2.0;
      }
      
      // 增强折射光照
      for(int i = 0; i < 4; i++) {
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
      
      gl_FragColor = vec4(finalColor, 0.5);
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

// 主场景着色器
export const mainShaders = {
  vs: `
    attribute vec3 a_Position;
    attribute vec3 a_Normal;
    attribute vec2 a_TexCoord;
    attribute float a_TextureType;
    
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_PvMatrix;
    
    varying vec3 v_Position;
    varying vec3 v_Normal;
    varying vec2 v_TexCoord;
    varying float v_TextureType;
    
    void main() {
      vec4 worldPosition = u_ModelMatrix * vec4(a_Position, 1.0);
      gl_Position = u_PvMatrix * worldPosition;
      
      v_Position = worldPosition.xyz;
      v_Normal = normalize(mat3(u_ModelMatrix) * a_Normal);
      v_TexCoord = a_TexCoord;
      v_TextureType = a_TextureType;
    }
  `,
  fs: `
    precision highp float;
    
    varying vec3 v_Position;
    varying vec3 v_Normal;
    varying vec2 v_TexCoord;
    varying float v_TextureType;
    
    uniform vec3 u_Eye;
    uniform vec3 u_LightPositions[4];
    uniform vec3 u_LightColors[4];
    uniform sampler2D u_WallTex;
    uniform sampler2D u_FloorTex;
    uniform float u_Metallic;
    uniform float u_Roughness;
    uniform vec3 u_Color;
    
    const float PI = 3.14159265359;
    
    // PBR函数
    float DistributionGGX(vec3 N, vec3 H, float roughness) {
      float a = roughness * roughness;
      float a2 = a * a;
      float NdotH = max(dot(N, H), 0.0);
      float NdotH2 = NdotH * NdotH;
      
      float nom   = a2;
      float denom = (NdotH2 * (a2 - 1.0) + 1.0);
      denom = PI * denom * denom;
      
      return nom / denom;
    }
    
    float GeometrySchlickGGX(float NdotV, float roughness) {
      float r = (roughness + 1.0);
      float k = (r * r) / 8.0;
      
      float nom   = NdotV;
      float denom = NdotV * (1.0 - k) + k;
      
      return nom / denom;
    }
    
    float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
      float NdotV = max(dot(N, V), 0.0);
      float NdotL = max(dot(N, L), 0.0);
      float ggx2 = GeometrySchlickGGX(NdotV, roughness);
      float ggx1 = GeometrySchlickGGX(NdotL, roughness);
      
      return ggx1 * ggx2;
    }
    
    vec3 fresnelSchlick(float cosTheta, vec3 F0) {
      return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
    }
    
    void main() {
      vec4 texColor;
      if(v_TextureType < 0.5) {
        texColor = texture2D(u_FloorTex, v_TexCoord);
      } else {
        texColor = texture2D(u_WallTex, v_TexCoord);
      }
      
      vec3 N = normalize(v_Normal);
      vec3 V = normalize(u_Eye - v_Position);
      
      // 基础反射率
      vec3 F0 = vec3(0.04); 
      F0 = mix(F0, u_Color, u_Metallic);
      
      // 反射方程
      vec3 Lo = vec3(0.0);
      for(int i = 0; i < 4; i++) {
        vec3 L = normalize(u_LightPositions[i] - v_Position);
        vec3 H = normalize(V + L);
        float distance = length(u_LightPositions[i] - v_Position);
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);  // 降低衰减
        vec3 radiance = u_LightColors[i] * attenuation * 1.5;  // 增强光照强度
        
        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, u_Roughness);   
        float G = GeometrySmith(N, V, L, u_Roughness);    
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
           
        vec3 numerator = NDF * G * F; 
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
        vec3 specular = numerator / denominator;
        
        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - u_Metallic;
        
        float NdotL = max(dot(N, L), 0.0);        
        Lo += (kD * u_Color / PI + specular) * radiance * NdotL;
    }
    
    // 增强环境光
    vec3 ambient = vec3(0.06) * u_Color * texColor.rgb;  // 提高环境光强度
    vec3 color = ambient + Lo;
    
    // HDR色调映射
    color = color / (color + vec3(1.0));
    // gamma校正
    color = pow(color, vec3(1.0/2.2)); 
    
    gl_FragColor = vec4(color, texColor.a);
    }
  `
}

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