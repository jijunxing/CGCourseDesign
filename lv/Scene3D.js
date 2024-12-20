import Scene from './Scene.js'
import { createProgram } from './Utils.js'
import Mat from './Mat.js'

export default class Scene3D extends Scene {
  constructor(options) {
    super(options)
    this.ready = false
    this.init().catch(error => {
      console.error('Scene3D initialization failed:', error)
    })
  }

  async init() {
    await this.initShaders()
    // 注册程序到 Mat 类
    for (let [name, {program}] of this.programs.entries()) {
      if (!program) {
        console.error(`Failed to create program: ${name}`);
        continue;
      }
      Mat.registerProgram(name, program)
    }
    this.ready = true
  }

  async initShaders() {
    // 加载着色器文件
    const loadShader = async (url) => {
      const response = await fetch(url);
      return await response.text();
    };

    try {
      // 加载所有着色器
      const [mainVS, mainFS, emissiveVS, emissiveFS] = await Promise.all([
        loadShader('./shaders/main.vs'),
        loadShader('./shaders/main.fs'),
        loadShader('./shaders/emissive.vs'),
        loadShader('./shaders/emissive.fs')
      ]);

      // 注册所有着色器程序
      this.registerProgram('Main', {
        program: createProgram(this.gl, mainVS, mainFS),
        attributeNames: ['a_Position', 'a_Normal', 'a_TexCoord', 'a_TextureType'],
        uniformNames: [
          'u_PvMatrix', 'u_ModelMatrix', 'u_Eye',
          'u_LightPositions', 'u_LightColors',
          'u_WallTex', 'u_FloorTex'
        ]
      })

      // 注册发光材质程序
      this.registerProgram('Emissive', {
        program: createProgram(this.gl, emissiveVS, emissiveFS),
        attributeNames: ['a_Position'],
        uniformNames: [
          'u_PvMatrix', 'u_ModelMatrix',
          'u_EmissiveColor', 'u_Intensity'
        ]
      })
    } catch (error) {
      console.error('Failed to load shaders:', error);
      throw error;
    }
  }

  draw(uniforms) {
    if (!this.ready || !this.programs.size) {
      console.warn('Scene not ready or no programs registered')
      return;
    }
    super.draw(uniforms);
  }
} 