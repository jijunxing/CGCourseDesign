import {
      Matrix4, Vector2, Vector3,Spherical
} from 'https://unpkg.com/three/build/three.module.js';
    
const pi2 = Math.PI * 2
const pvMatrix=new Matrix4()

const defAttr = () => ({
  camera: null,
  dom: null,
  target: new Vector3(),
  mouseButtons:new Map([
      [0, 'rotate'],
      [2, 'pan'],
  ]),
  state: 'none',
  dragStart: new Vector2(),
  dragEnd: new Vector2(),
  panOffset: new Vector3(),
  screenSpacePanning: true,
  zoomScale: 0.95,
  spherical:new Spherical(),
  rotateDir: 'xy',
  enablePan: true,
  enableZoom: true,
  minZoom: 0.1,
  maxZoom: 10,
  zoomSpeed: 1.0
})

export default class OrbitControls{
  constructor(attr){
    Object.assign(this, defAttr(), attr)
    // 初始化欧拉角
    this._euler = { x: 0, y: 0 };
    this.updateCamera()
  }

  pointerdown({ clientX, clientY, button }) {
    const {dragStart, mouseButtons} = this
    dragStart.set(clientX, clientY)
    this.state = mouseButtons.get(button)
  }

  pointermove({ clientX, clientY }) {
    const { dragStart, dragEnd, state, enablePan, camera: { type } } = this
    dragEnd.set(clientX, clientY)
    switch (state) {
      case 'pan':
        enablePan && this[`pan${type}`](dragEnd.clone().sub(dragStart))
        break
      case 'rotate':
        this.rotate(dragEnd.clone().sub(dragStart))
        break
    }
    dragStart.copy(dragEnd)
  }

  pointerup() {
    this.state = 'none'
  }

  wheel({ deltaY }) {
    // 禁用滚轮功能
    return;
  }

  rotate({ x, y }) {
    const sensitivity = 0.002;
    
    // 更新欧拉角
    this._euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this._euler.x - y * sensitivity));
    this._euler.y -= x * sensitivity;
    
    // 计算新的朝向
    const direction = new Vector3();
    direction.x = Math.sin(this._euler.y) * Math.cos(this._euler.x);
    direction.y = Math.sin(this._euler.x);
    direction.z = Math.cos(this._euler.y) * Math.cos(this._euler.x);
    
    // 更新目标点位置（在相机前方固定距离处）
    const { camera, target } = this;
    target.copy(camera.position).add(direction);
    
    this.updateCamera();
  }

  update() {
    const { camera, target, panOffset } = this;
    
    // 处理平移
    if (panOffset.lengthSq() > 0) {
      camera.position.add(panOffset);
      target.add(panOffset);
      panOffset.set(0, 0, 0);
    }

    this.updateCamera();
  }

  // 更新相机
  updateCamera() {
    const { camera, target } = this;
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
  }

  getPvMatrix() {
    const { camera: { projectionMatrix, matrixWorldInverse } } = this;
    return pvMatrix.multiplyMatrices(
      projectionMatrix,
      matrixWorldInverse
    );
  }
}