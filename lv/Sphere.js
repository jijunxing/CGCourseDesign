import {Vector3,Spherical} from 'https://unpkg.com/three/build/three.module.js';

export default class Sphere{
  constructor(r=1, widthSegments=16, heightSegments=16){
    this.r=r
    this.widthSegments=widthSegments
    this.heightSegments=heightSegments
    this.vertices=[]
    this.normals=[]
    this.indexes=[]
    this.uv=[]
    this.count=0
    this.init()
  }
  init() {
    const { r, widthSegments, heightSegments } = this
    this.count = (widthSegments + 1) * (heightSegments + 1)
    const spherical = new Spherical()
    const thetaSize = Math.PI * 2 / widthSegments
    const phiSize = Math.PI / heightSegments

    // 生成顶点、法线和UV
    const vertices = []
    const normals = []
    const uv = []
    const indexes = []

    // 生成所有顶点数据（包括极点）
    for (let y = 0; y <= heightSegments; y++) {
      const phi = phiSize * y
      const v = 1 - (y / heightSegments)
      
      for (let x = 0; x <= widthSegments; x++) {
        const theta = thetaSize * x
        const u = x / widthSegments

        // 计算球面位置
        spherical.set(r, phi, theta)
        const vertex = new Vector3().setFromSpherical(spherical)
        vertices.push(vertex.x, vertex.y, vertex.z)
        
        // 法线就是顶点坐标的单位向量
        const normal = vertex.clone().normalize()
        normals.push(normal.x, normal.y, normal.z)
        
        // UV坐标
        uv.push(u, v)
      }
    }

    // 生成索引
    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        const a = y * (widthSegments + 1) + x
        const b = a + 1
        const c = a + (widthSegments + 1)
        const d = c + 1

        // 每个格子生成两个三角形
        indexes.push(a, b, d)
        indexes.push(a, d, c)
      }
    }

    this.vertices = new Float32Array(vertices)
    this.normals = new Float32Array(normals)
    this.indexes = new Uint16Array(indexes)
    this.uv = new Float32Array(uv)
  }

  getTriangles() {
    const {indexes}=this
    const vertices = []
    for (let i = 0; i < indexes.length; i += 3) {
      const p0 = this.getVertice(indexes[i])
      const p1 = this.getVertice(indexes[i + 1])
      const p2 = this.getVertice(indexes[i + 2])
      vertices.push(...p0, ...p1, ...p2)
    }
    return new Float32Array(vertices)
  }

  getVertice(ind) {
    const {vertices}=this
    const i = ind * 3
    return new Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
  }
}