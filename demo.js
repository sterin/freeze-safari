var triangle = require('a-big-triangle')
var createShader = require('gl-shader')
var glslify = require('glslify')
var loop = require('raf-loop')
var get_pixels = require('get-pixels')

var gl = require('webgl-context')({
  width: 2048,
  height: 1024
})

document.body.appendChild(gl.canvas)

var time = 0

get_pixels("equi.jpeg", function(err, pixels)
{
  if(err)
  {
    console.log("failed to load image");
    return;
  }

  console.log("got pixels", pixels.shape.slice())

  var texture = require('gl-texture2d')(gl, pixels)
  texture.wrapS = texture.wrapT = gl.REPEAT

  var shader = createShader(gl, glslify('./demo.vert'), glslify('./demo.frag'))

  shader.bind()
  shader.uniforms.u_resolution = [gl.drawingBufferWidth, gl.drawingBufferHeight, 0]
  shader.uniforms.u_global_time = time
  shader.uniforms.u_tex = 0
  start()

  function start() {
    loop(render).start()

    function render(dt) {
      var width = gl.drawingBufferWidth
      var height = gl.drawingBufferHeight
      gl.viewport(0, 0, width, height)

      texture.bind()
      shader.bind()
      shader.uniforms.iGlobalTime = (time += dt) / 1000
      triangle(gl)
    }
  }
});
