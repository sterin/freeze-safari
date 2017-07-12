precision highp float;

uniform vec3 u_resolution;
uniform sampler2D u_tex;
uniform float u_global_time;

const float PI = 3.1415926535897932384626433832795;
const float PI_2 = PI/2.0;
const float PI_inv = 1.0/PI;
const float PI_inv_2 = 0.5/PI;

mat3 look_at(vec3 forward, vec3 up)
{
    vec3 f = normalize(forward);
    vec3 side = normalize(cross(f, up));
    vec3 up2 = cross(side, f);

    return mat3(side, up2, f);
}

vec2 ll_to_uv(vec2 ll)
{
    return ll * vec2(PI_inv_2, PI_inv) + 0.5;
}

vec2 uv_to_ll(vec2 uv)
{
    return (uv - 0.5) * vec2(2.0*PI, PI);
}

vec2 d_to_ll(vec3 d)
{
    return vec2( atan(d.x, d.z), atan(-d.y, length(d.xz)) );
}

vec3 ll_to_d(vec2 ll)
{
    float phi = ll.x;
    float theta = ll.y;

    return vec3(cos(theta)*sin(phi), -sin(theta), cos(theta)*cos(phi));
}

vec2 d_to_uv(vec3 d)
{
    return ll_to_uv( d_to_ll(d) );
}

vec3 uv_to_d(vec2 uv)
{
    return ll_to_d( uv_to_ll(uv) );
}

vec3 sample(vec3 d)
{
  return texture2D(u_tex, d_to_uv(d)).rgb;
}

const int NX = 250;
const int NY = 150;

vec3 shade(vec3 d)
{
  mat3 TBN = look_at(d, vec3(0.0, 1.0, 0.0));

  vec3 result = vec3(0.0);

  for(int i=0; i<=NX ; i++)
  {
    for(int j=0; j<=NY ; j++)
    {
      float phi = 2.0 * PI * float(i) / float(NX);
      float theta = PI_2 * float(j) / float(NY);

      vec3 v = TBN * ll_to_d(vec2(phi, theta));
      result += sample(v) * cos(theta) * sin(theta);
    }
  }
  
  return PI * result / float(NX*NY);
}

void main()
{
  vec2 uv = vec2 (gl_FragCoord.xy / u_resolution.xy);
  uv.y = 1.0 - uv.y;

  vec3 d = uv_to_d(uv);
  vec3 c = clamp(shade(d), 0.0, 1.0);

  gl_FragColor = vec4(c, 1.0);
}
