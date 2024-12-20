const defAttr = () => ({
  program:null,
  data: {},
  mode: 'TRIANGLES',
  maps: {},
})

const programs = new Map()

export default class Mat{
  static registerProgram(name, program) {
    if (!program) {
      console.error(`Cannot register invalid program: ${name}`);
      return;
    }
    if (!programs.has(name)) {
      programs.set(name, program)
    }
  }

  static getProgram(name) {
    return programs.get(name)
  }

  constructor(attr){
    Object.assign(this,defAttr(),attr)
    if (typeof this.program === 'string') {
      this.programName = this.program
      const program = programs.get(this.program)
      if (!program) {
        throw new Error(`Program "${this.program}" not found`)
      }
      this.program = program
    }
  }
  init(gl) {
    Object.values(this.maps).forEach((map, ind) => {
      if (!map.texture) {
        map.texture = gl.createTexture()
      }
      this.updateMap(gl,map,ind)
    })
  }
  updateMap(gl,map,ind) {
    const {
      format = gl.RGB,
      image,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      texture
    } = map

    if (!texture) {
      map.texture=gl.createTexture()
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl[`TEXTURE${ind}`])
    gl.bindTexture(gl.TEXTURE_2D, map.texture)
    image&&gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        format,
        format,
        gl.UNSIGNED_BYTE,
        image
    )
    wrapS&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        wrapS
    )
    wrapT&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        wrapT
    )
    magFilter&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        magFilter
    )
    if (!minFilter || minFilter > 9729) {
        gl.generateMipmap(gl.TEXTURE_2D)
    }
    minFilter&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        minFilter
    )
  }

  update(gl,uniforms) {
    this.updateData(gl,uniforms)
    this.updateMaps(gl,uniforms)
  }
  updateData(gl,uniforms) {
    for (let [key,obj] of Object.entries(this.data)) {
      const { type, value } = obj
      const location=uniforms.get(key)
      if (location === null || location === undefined) {
        continue;
      }
      if (type.includes('Matrix')) {
        gl[type](location,false,value)
      } else {
        gl[type](location,value)
      }
    }
  }
  updateMaps(gl,uniforms) {
    Object.entries(this.maps).forEach((arr, ind) => {
      const [key, map] = arr
      if (map.needUpdate) {
        map.needUpdate = false
        this.updateMap(gl,map,ind)
      } else {
        gl.bindTexture(gl.TEXTURE_2D,map.texture)
      }
      gl.uniform1i(uniforms.get(key), ind)
    })
  }
  setData(key,val) {
    const obj = this.data[key]
    if(!obj){return}
    Object.assign(obj,val)
  }
  setMap(key,val) {
    const obj = this.maps[key]
    val.needUpdate = true
    if (obj) {
      Object.assign(obj,val)
    } else {
      this.maps[key]=val
    }
  }
}