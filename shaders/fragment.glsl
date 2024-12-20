#ifdef GL_ES
precision mediump float;
#endif

varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoord;
varying float v_TextureType;

uniform vec3 u_Eye;
uniform vec3 u_LightPos[4];  // 支持多个光源
uniform vec3 u_LightColor[4]; // 每个光源的颜色
uniform float u_Shininess;    // 高光系数
uniform sampler2D u_WallTex;  // 墙面纹理
uniform sampler2D u_FloorTex; // 地板纹理

void main() {
    vec3 normal = normalize(v_Normal);
    vec3 finalColor = vec3(0.0);
    
    // 环境光
    vec3 ambient = vec3(0.2);
    
    for(int i = 0; i < 4; i++) {
        vec3 lightDir = normalize(u_LightPos[i] - v_Position);
        
        // 漫反射
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * u_LightColor[i];
        
        // 高光反射
        vec3 viewDir = normalize(u_Eye - v_Position);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Shininess);
        vec3 specular = spec * u_LightColor[i] * 0.5;
        
        // 距离衰减
        float distance = length(u_LightPos[i] - v_Position);
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
        
        finalColor += (diffuse + specular) * attenuation;
    }
    
    // 纹理采样
    vec4 texColor;
    if(v_TextureType < 0.5) {
        texColor = texture2D(u_FloorTex, v_TexCoord);
    } else {
        texColor = texture2D(u_WallTex, v_TexCoord);
    }
    
    finalColor = finalColor * texColor.rgb + ambient;
    
    gl_FragColor = vec4(finalColor, 1.0);
} 