import Mat from './Mat.js'
import Geo from './Geo.js'

const defAttr = () => ({
  geo:null,
  mat:null,
})
export default class Obj3D{
  constructor(attr){
    Object.assign(this,defAttr(),attr)
    if (!(this.mat instanceof Mat)) {
      this.mat = new Mat(this.mat)
    }
    if (!(this.geo instanceof Geo)) {
      this.geo = new Geo(this.geo)
    }
  }
  init(gl){
    this.mat.init(gl)
    this.geo.init(gl)
  }
  
  update(gl,attributes,uniforms) {
    this.geo.update(gl,attributes)
    this.mat.update(gl,uniforms)
  }
}