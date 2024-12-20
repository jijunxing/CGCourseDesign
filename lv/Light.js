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

  createVisualizer(scene) {
    // 创建一个小球体来表示光源
    const sphere = new Sphere(0.3, 16, 16);  // 光源球体的尺寸
    
    // 创建发光材质的球体
    const lightObj = new Obj3D({
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
            value: new Matrix4().elements,  // 初始值，会在渲染循环中更新
            type: 'uniformMatrix4fv'
          },
          u_ModelMatrix: {
            value: new Matrix4().setPosition(this.position.x, this.position.y, this.position.z).elements,
            type: 'uniformMatrix4fv'
          },
          u_EmissiveColor: {
            value: this.color.map(c => c/200),  // 增加发光球体的亮度以便更容易看到
            type: 'uniform3fv'
          },
          u_Intensity: {
            value: 2.0,  // 降低整体发光强度
            type: 'uniform1f'
          }
        }
      })
    });

    return lightObj;
  }
} 