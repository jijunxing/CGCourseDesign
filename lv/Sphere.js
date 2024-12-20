import {Vector3,Spherical} from 'https://unpkg.com/three/build/three.module.js';

/*
属性：
  r：半径
  widthSegments：横向段数，最小3端
  heightSegments：纵向段数，最小3端
  vertices：顶点集合
  normals：法线集合
  indexes：顶点索引集合
  count：顶点数量
*/
export default class Sphere{
  constructor(r=1, widthSegments=16, heightSegments=16){
    this.r=r
    this.widthSegments=widthSegments
    this.heightSegments=heightSegments
    this.vertices=[]
    this.normals=[]
    this.indexes = []
    this.uv = []
    this.count=0
    this.init()
  }
  init() {
    const { r, widthSegments, heightSegments } = this
    //顶点数量
    this.count = widthSegments * (heightSegments - 1) + 2
    // 球坐标系
    const spherical = new Spherical()
    // theta和phi方向的旋转弧度
    const thetaSize = Math.PI * 2 / widthSegments
    const phiSize = Math.PI / heightSegments

    // 顶点集合，北极点
    const vertices = [0, r, 0]
    // 法线集合，北极点法线
    const normals = [0, 1, 0]
    // UV坐标，北极点
    const uv = []
    // 为北极点添加多个UV坐标，以避免纹理扭曲
    for (let i = 0; i <= widthSegments; i++) {
      uv.push(i / widthSegments, 1)
    }

    // 顶点索引集合
    const indexes = []
    const lastInd = this.count-1

    // 生成球体的主体部分
    for (let y = 1; y < heightSegments; y++) {
      const phi = phiSize * y
      const v = 1 - (y / heightSegments)
      
      for (let x = 0; x <= widthSegments; x++) {
        const theta = thetaSize * x
        const u = x / widthSegments

        // 计算顶点位置
        spherical.set(r, phi, theta)
        const vertice = new Vector3().setFromSpherical(spherical)
        vertices.push(...vertice)
        normals.push(...vertice.clone().normalize())
        
        // 添加UV坐标
        uv.push(u, v)

        // 创建三角形索引
        if (x < widthSegments && y < heightSegments - 1) {
          const a = y * (widthSegments + 1) + x
          const b = a + 1
          const c = a + widthSegments + 1
          const d = c + 1

          // 添加两个三角形
          if (y === 1) {
            // 连接到北极点的三角形
            indexes.push(0, a + 1, a)
          }
          indexes.push(a, b, c)
          indexes.push(b, d, c)
        }
      }
    }

    // 南极点
    vertices.push(0, -r, 0)
    normals.push(0, -1, 0)
    
    // 为南极点添加多个UV坐标
    for (let i = 0; i <= widthSegments; i++) {
      uv.push(i / widthSegments, 0)
    }

    // 添加连接到南极点的三角形
    const baseIndex = (heightSegments - 1) * (widthSegments + 1)
    for (let x = 0; x < widthSegments; x++) {
      indexes.push(
        baseIndex + x,
        lastInd,
        baseIndex + x + 1
      )
    }

    this.vertices = new Float32Array(vertices)
    this.normals = new Float32Array(normals)
    this.indexes = new Uint16Array(indexes)
    this.uv = new Float32Array(uv)
  }

  getTriangles() {
    const {indexes}=this
    // 顶点集合
    const vertices = []
    // 通过顶点索引遍历三角形
    for (let i = 0; i < indexes.length; i += 3) {
      // 三角形的三个顶点
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