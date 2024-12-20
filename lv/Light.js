import { Vector3, Matrix4 } from 'https://unpkg.com/three/build/three.module.js'
import Sphere from './Sphere.js'
import Obj3D from './Obj3D.js'
import Geo from './Geo.js'
import Mat from './Mat.js'

export class Light {
  constructor(position, color) {
    this.position = position instanceof Vector3 ? position : new Vector3(...position)
    this.color = color
    this.visible = false  // 默认不可见
  }

  createVisualizer(scene) {
    if (!scene || !scene.gl) return null

    // 减小光源球体的尺寸
    const sphere = new Sphere(0.1, 12, 12)
    const visualizer = new Obj3D({
      geo: new Geo({
        data: {
          a_Position: {
            array: new Float32Array(sphere.vertices),
            size: 3
          }
        },
        index: {
          array: new Uint16Array(sphere.indexes)
        }
      }),
      mat: new Mat({
        program: 'Emissive',
        programName: 'Emissive',
        data: {
          u_PvMatrix: {
            value: new Matrix4().elements,
            type: 'uniformMatrix4fv'
          },
          u_ModelMatrix: {
            value: new Matrix4()
              .setPosition(this.position.x, this.position.y, this.position.z)
              .elements,
            type: 'uniformMatrix4fv'
          },
          u_EmissiveColor: {
            value: this.color.map(c => c/1600),  // 降低发光强度
            type: 'uniform3fv'
          },
          u_Intensity: {
            value: 1.0,  // 降低整体强度
            type: 'uniform1f'
          }
        }
      })
    })

    // 设置初始可见性
    visualizer.visible = this.visible
    return visualizer
  }

  setVisible(visible) {
    this.visible = visible
  }
} 