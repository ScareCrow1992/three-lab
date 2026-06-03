flat in uvec3 vVertexIds;

in vec3 vCenter;
out vec4 vColor;

vec4 colorFromVertexId(uint id){
  if(id ==0u){
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
  vColor = vec4(vCenter, 1.0);
  // vColor = colorFromVertexId(1u);
  // vColor = vec4(1.0, 1.0, 1.0, 1.0);
}