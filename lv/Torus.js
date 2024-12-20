import { Vector3 } from 'https://unpkg.com/three/build/three.module.js';

export default class Torus {
  constructor(radius = 1, tubeRadius = 0.4, radialSegments = 32, tubularSegments = 24) {
    this.radius = radius;
    this.tubeRadius = tubeRadius;
    this.radialSegments = radialSegments;
    this.tubularSegments = tubularSegments;
    
    this.vertices = [];
    this.normals = [];
    this.indexes = [];
    
    this.init();
  }
  
  init() {
    for(let i = 0; i <= this.radialSegments; i++) {
      const u = i / this.radialSegments * Math.PI * 2;
      
      for(let j = 0; j <= this.tubularSegments; j++) {
        const v = j / this.tubularSegments * Math.PI * 2;
        
        // 计算顶点位置
        const x = (this.radius + this.tubeRadius * Math.cos(v)) * Math.cos(u);
        const y = this.tubeRadius * Math.sin(v);
        const z = (this.radius + this.tubeRadius * Math.cos(v)) * Math.sin(u);
        
        this.vertices.push(x, y, z);
        
        // 计算法线
        const center = new Vector3(
          this.radius * Math.cos(u),
          0,
          this.radius * Math.sin(u)
        );
        
        const normal = new Vector3(x, y, z).sub(center).normalize();
        this.normals.push(normal.x, normal.y, normal.z);
        
        // 创建三角形索引
        if(i < this.radialSegments && j < this.tubularSegments) {
          const a = i * (this.tubularSegments + 1) + j;
          const b = a + this.tubularSegments + 1;
          const c = a + 1;
          const d = b + 1;
          
          this.indexes.push(a, b, c);
          this.indexes.push(b, d, c);
        }
      }
    }
  }
} 