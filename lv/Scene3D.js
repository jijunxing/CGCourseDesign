import Scene from './Scene.js'
import { createProgram } from './Utils.js'
import Mat from './Mat.js'
import { mainShaders, glassShaders, emissiveShaders } from './shaders.js'

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
    try {
      // 注册主着色器程序
      this.registerProgram('Main', {
        program: createProgram(this.gl, mainShaders.vs, mainShaders.fs),
        attributeNames: ['a_Position', 'a_Normal', 'a_TexCoord', 'a_TextureType'],
        uniformNames: [
          'u_PvMatrix', 'u_ModelMatrix', 'u_Eye',
          'u_LightPositions', 'u_LightColors',
          'u_WallTex', 'u_FloorTex',
          'u_Metallic', 'u_Roughness', 'u_Color'
        ]
      })

      // 注册发光材质程序
      this.registerProgram('Emissive', {
        program: createProgram(this.gl, emissiveShaders.vs, emissiveShaders.fs),
        attributeNames: ['a_Position'],
        uniformNames: [
          'u_PvMatrix', 'u_ModelMatrix',
          'u_EmissiveColor', 'u_Intensity'
        ]
      })

      // 注册玻璃材质程序
      this.registerProgram('Glass', {
        program: createProgram(this.gl, glassShaders.vs, glassShaders.fs),
        attributeNames: ['a_Position', 'a_Normal'],
        uniformNames: [
          'u_PvMatrix', 'u_ModelMatrix', 'u_NormalMatrix',
          'u_Eye', 'u_LightPositions', 'u_LightColors'
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