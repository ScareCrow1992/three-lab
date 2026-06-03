flat in uvec3 vVertexIds;

in vec3 vCenter;
out vec4 vColor;

vec4 colorFromVertexId(uint id){
  if(id == 0u){
    return vec4(1.0, 0 ,0 ,1.0);
  }
  else if(id == 1u){
    return vec4(0, 1.0 ,0 ,1.0);
  }
  else if (id == 2u){
    return vec4(0, 0, 1.0,1.0);
  }
  else{
    return vec4(0, 0, 0, 1.0);
  }

  return vec4(0.5, 1.0, 1.0, 1.0);
}


void main(){
  float c0 = vCenter.x;
  float c1 = vCenter.y;
  float c2 = vCenter.z;

  if(c0 < c1 && c0 < c2){
    if(c0 < 0.05)
      vColor = colorFromVertexId(0u);
    else
      vColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
  else if(c1 < c2 && c1 < c0){
    if(c1 < 0.05)
      vColor = colorFromVertexId(1u);
    else
      vColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
  else{
    if(c2 < 0.05)
      vColor = colorFromVertexId(2u);
    else
      vColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}