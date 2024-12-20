import { Vector3 } from 'https://unpkg.com/three/build/three.module.js';

export default class HemiSphere {
  constructor(radius = 1, widthSegments = 32, heightSegments = 16) {
    this.vertices = [];
    this.normals = [];
    this.indexes = [];
    
    for(let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;
      const phi = v * Math.PI / 2;
      
      for(let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const theta = u * Math.PI * 2;
        
        // 计算顶点位置
        const vertex = new Vector3(
          -radius * Math.cos(phi) * Math.cos(theta),
          radius * Math.sin(phi),
          radius * Math.cos(phi) * Math.sin(theta)
        );
        
        this.vertices.push(...vertex.toArray());
        
        // 法线就是顶点位置的归一化
        const normal = vertex.clone().normalize();
        this.normals.push(...normal.toArray());
        
        // 创建三角形索引
        if(x < widthSegments && y < heightSegments) {
          const a = y * (widthSegments + 1) + x;
          const b = a + widthSegments + 1;
          const c = a + 1;
          const d = b + 1;
          
          this.indexes.push(a, b, c);
          this.indexes.push(b, d, c);
        }
      }
    }
  }
} 