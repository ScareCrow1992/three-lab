

in vec3 center;
out vec3 vCenter;

in uvec3 vertexIds;
flat out uvec3 vVertexIds;


void main(){

  vVertexIds = vertexIds;
  vCenter = center;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}