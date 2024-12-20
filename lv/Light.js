import { Matrix4 } from 'https://unpkg.com/three/build/three.module.js'
import Mat from './Mat.js'
import Geo from './Geo.js'
import Obj3D from './Obj3D.js'
import Sphere from './Sphere.js'

export class Light {
  constructor(position, color, intensity = 1.0) {
    this.position = position
    this.color = color
    this.intensity = intensity
  }

  createVisualizer(scene) {
    if (!scene || !scene.camera) {
      console.error('Invalid scene object');
      return null;
    }

    const lightSphere = new Sphere(0.2, 16, 16)
    const { vertices, indexes } = lightSphere
    
    const lightMatrix = new Matrix4().setPosition(...this.position)
    return new Obj3D({
      geo: new Geo({
        data: {
          a_Position: {
            array: vertices,
            size: 3
          }
        },
        index: {
          array: indexes
        }
      }),
      mat: new Mat({
        program: 'Emissive',
        programName: 'Emissive',
        data: {
          u_ModelMatrix: {
            value: lightMatrix.elements,
            type: 'uniformMatrix4fv',
          },
          u_PvMatrix: {
            value: scene.camera.getPvMatrix().elements,
            type: 'uniformMatrix4fv',
          },
          u_EmissiveColor: {
            value: this.color.map(x => x/400),
            type: 'uniform3fv',
          },
          u_Intensity: {
            value: 8.0,
            type: 'uniform1f',
          }
        }
      })
    })
  }
} 