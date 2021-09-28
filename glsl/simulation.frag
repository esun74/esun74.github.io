uniform sampler2D positions;
uniform sampler2D sphere_positions;
uniform sampler2D cube_positions;
uniform float y_pos;
uniform float time;
varying vec2 uv_pos;
// in float time;

// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
float permute(float x) { return mod289(((x*34.0)+1.0)*x); }

vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451


float snoise(vec4 v) {
  const vec4  C = vec4(   +0.138196601125011,  // (5 - sqrt(5))/20  G4
              +0.276393202250021,  // 2 * G4
              +0.414589803375032,  // 3 * G4
              -0.447213595499958); // -1 + 4 * G4

  // First corner
  vec4 i  = floor(v + dot(v, vec4(F4)));
  vec4 x0 = v -   i + dot(i, C.xxxx);

  // Other corners

  // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);

  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0-1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0-2.0, 0.0, 1.0);

  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

  // Permutations
  i = mod289(i); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
      i.w + vec4(i1.w, i2.w, i3.w, 1.0))
    + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
    + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
    + i.x + vec4(i1.x, i2.x, i3.x, 1.0));

  // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

  // Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
          + dot(m1*m1, vec2(dot(p3, x3), dot(p4, x4))));
}


vec4 curlify(vec4 position, float time) {

  float offset_x = 100.0;
  float offset_y = 200.0;
  float offset_z = 300.0;
  float fda = 0.1;
  float speed = 0.005;
  float scale = 0.25;

  vec4 pos = position * scale;

  float d_x0_y = snoise(vec4(pos.x - fda, pos.y, pos.z, time + offset_y));
  float d_x0_z = snoise(vec4(pos.x - fda, pos.y, pos.z, time + offset_z));
  float d_x1_y = snoise(vec4(pos.x + fda, pos.y, pos.z, time + offset_y));
  float d_x1_z = snoise(vec4(pos.x + fda, pos.y, pos.z, time + offset_z));
  
  float d_y0_x = snoise(vec4(pos.x, pos.y - fda, pos.z, time + offset_x));
  float d_y0_z = snoise(vec4(pos.x, pos.y - fda, pos.z, time + offset_z));
  float d_y1_x = snoise(vec4(pos.x, pos.y + fda, pos.z, time + offset_x));
  float d_y1_z = snoise(vec4(pos.x, pos.y + fda, pos.z, time + offset_z));

  float d_z0_x = snoise(vec4(pos.x, pos.y, pos.z - fda, time + offset_x));
  float d_z0_y = snoise(vec4(pos.x, pos.y, pos.z - fda, time + offset_y));
  float d_z1_x = snoise(vec4(pos.x, pos.y, pos.z + fda, time + offset_x));
  float d_z1_y = snoise(vec4(pos.x, pos.y, pos.z + fda, time + offset_y));

  float curl_x = (d_y1_z - d_y0_z - d_z1_y + d_z0_y) / (2.0 * fda) * speed;
  float curl_y = (d_z1_x - d_z0_x - d_x1_z + d_x0_z) / (2.0 * fda) * speed;
  float curl_z = (d_x1_y - d_x0_y - d_y1_x + d_y0_x) / (2.0 * fda) * speed;
  vec3 curl_effect = vec3(curl_x, curl_y, curl_z);
  float velocity = distance(vec3(0.0), curl_effect);

  return vec4(curl_effect, velocity);
}

void main() {
 
    vec4 pos = texture2D(positions, uv_pos);

    if (y_pos > -5.0) {

      float alpha = min(1.0, max(0.0, -y_pos / 1.6));

      vec4 c_effect = curlify(pos, time);
      vec3 c_target = texture2D(cube_positions, uv_pos).xyz;
      c_target.x *= 500.0;
      c_target.y *= 6.5;
      c_target.z *= 500.0;

      vec3 s_target = texture2D(sphere_positions, uv_pos).xyz + c_effect.xyz * 25.0;
      vec3 target_pos = ((c_target * (1.0 - alpha)) + (s_target * alpha));
      target_pos.y -= y_pos;
      
      pos.xyz += (target_pos - pos.xyz) * abs((alpha - 0.5) * 1.0);
      pos.w = c_effect.w * (1.0 + (y_pos + 5.0));

    } else if (y_pos > -9.6) {

      if (pos.y > 9.6) {
        pos.y -= 6.4;
      }

      vec4 c_effect = curlify(pos, time);
      pos.xyz += c_effect.xyz;
      pos.xz *= 0.998;
      pos.y += 0.01;
      pos.w = c_effect.w;

    }

    // xyzw, rgba, stpq



    gl_FragColor = pos;
}
