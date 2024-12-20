import { Vector3 } from 'https://unpkg.com/three/build/three.module.js';

export default class Cylinder {
  constructor(radiusTop = 1, radiusBottom = 1, height = 1, segments = 32) {
    this.vertices = [];
    this.normals = [];
    this.indexes = [];
    
    // 创建顶部和底部的顶点圆环
    for(let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      // 顶部顶点
      const topVertex = new Vector3(
        radiusTop * cosTheta,
        height/2,
        radiusTop * sinTheta
      );
      
      // 底部顶点
      const bottomVertex = new Vector3(
        radiusBottom * cosTheta,
        -height/2,
        radiusBottom * sinTheta
      );
      
      // 添加顶点
      this.vertices.push(
        ...topVertex.toArray(),
        ...bottomVertex.toArray()
      );
      
      // 计算法线
      const normal = new Vector3(cosTheta, 0, sinTheta).normalize();
      this.normals.push(
        ...normal.toArray(),
        ...normal.toArray()
      );
      
      // 创建三角��索引
      if(i < segments) {
        const p1 = i * 2;
        const p2 = p1 + 1;
        const p3 = p1 + 2;
        const p4 = p1 + 3;
        
        // 侧面三角形
        this.indexes.push(
          p1, p2, p3,
          p2, p4, p3
        );
      }
    }
    
    // 添加顶面和底面的中心点
    const topCenter = new Vector3(0, height/2, 0);
    const bottomCenter = new Vector3(0, -height/2, 0);
    const centerIndex = this.vertices.length / 3;
    
    this.vertices.push(
      ...topCenter.toArray(),
      ...bottomCenter.toArray()
    );
    
    this.normals.push(
      0, 1, 0,  // 顶面法线
      0, -1, 0  // 底面法线
    );
    
    // 创建顶面和底面的三角形
    for(let i = 0; i < segments; i++) {
      const topVertex1 = i * 2;
      const topVertex2 = (i + 1) * 2;
      
      // 顶面三角形
      this.indexes.push(
        centerIndex,
        topVertex1,
        topVertex2
      );
      
      // 底面三角形
      this.indexes.push(
        centerIndex + 1,
        topVertex1 + 1,
        topVertex2 + 1
      );
    }
  }
} 