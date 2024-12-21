import { Vector3, Matrix4 } from 'https://unpkg.com/three/build/three.module.js'
import Sphere from './Sphere.js'
import Obj3D from './Obj3D.js'
import Geo from './Geo.js'
import Mat from './Mat.js'

export class Light {
  constructor(position, color) {
    this.position = position instanceof Vector3 ? position : new Vector3(...position)
    this.color = color
  }

  createVisualizer() {
    // 创建一个小球体来表示光源
    const sphere = new Sphere(0.2, 16, 16);
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
          u_ModelMatrix: {
            value: new Matrix4().setPosition(...this.position).elements,
            type: 'uniformMatrix4fv'
          },
          u_EmissiveColor: {
            value: this.color.map(c => c/200),
            type: 'uniform3fv'
          },
          u_Intensity: {
            value: 2.0,
            type: 'uniform1f'
          }
        }
      })
    });
    
    // 添加标记以识别这是光源可视化对象
    visualizer.isLightVisualizer = true;
    
    return visualizer;
  }
} 