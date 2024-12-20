import { Matrix4 } from 'https://unpkg.com/three/build/three.module.js'

export default class Room {
  constructor(width = 20, height = 12, depth = 20) {
    this.width = width
    this.height = height
    this.depth = depth
    
    // 生成完整的房间顶点
    this.vertices = [
      // 前墙
      -width/2, 0, -depth/2,    // 0
      width/2, 0, -depth/2,     // 1
      width/2, height, -depth/2, // 2
      -width/2, height, -depth/2,// 3
      
      // 后墙
      -width/2, 0, depth/2,     // 4
      width/2, 0, depth/2,      // 5
      width/2, height, depth/2,  // 6
      -width/2, height, depth/2, // 7
      
      // 左墙
      -width/2, 0, -depth/2,    // 8
      -width/2, height, -depth/2,// 9
      -width/2, height, depth/2, // 10
      -width/2, 0, depth/2,     // 11
      
      // 右墙
      width/2, 0, -depth/2,     // 12
      width/2, height, -depth/2, // 13
      width/2, height, depth/2,  // 14
      width/2, 0, depth/2,      // 15
      
      // 地板
      -width/2, 0, -depth/2,    // 16
      width/2, 0, -depth/2,     // 17
      width/2, 0, depth/2,      // 18
      -width/2, 0, depth/2,     // 19
      
      // 天花板
      -width/2, height, -depth/2,// 20
      width/2, height, -depth/2, // 21
      width/2, height, depth/2,  // 22
      -width/2, height, depth/2  // 23
    ]
    
    // 法线
    this.normals = [
      // 前墙
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
      // 后墙
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      // 左墙
      1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
      // 右墙
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      // 地板
      0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
      // 天花板
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
    ]
    
    // 索引
    this.indexes = [
      // 前墙
      0, 1, 2,  0, 2, 3,
      // 后墙
      4, 6, 5,  4, 7, 6,
      // 左墙
      8, 9, 10, 8, 10, 11,
      // 右墙
      12, 14, 13, 12, 15, 14,
      // 地板
      16, 17, 18, 16, 18, 19,
      // 天花板
      20, 22, 21, 20, 23, 22
    ]
    
    // 纹理坐标
    this.texCoords = new Float32Array([
      // 前墙
      0,0, 2,0, 2,2, 0,2,
      // 后墙
      0,0, 2,0, 2,2, 0,2,
      // 左墙
      0,0, 2,0, 2,2, 0,2,
      // 右墙
      0,0, 2,0, 2,2, 0,2,
      // 地板
      0,0, 4,0, 4,4, 0,4,
      // 天花板
      0,0, 2,0, 2,2, 0,2
    ])
    
    // 纹理类型标记，用于区分不同面使用的纹理
    this.textureTypes = [
      // 前墙
      1,1,1,1,
      // 后墙
      1,1,1,1,
      // 左墙
      1,1,1,1,
      // 右墙
      1,1,1,1,
      // 地板
      0,0,0,0,
      // 天花板
      1,1,1,1
    ]
  }
} 