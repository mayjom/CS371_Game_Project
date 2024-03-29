//////////////////////////  ThingSeeking class /////////////////////////////////


function ThingSeeking(program, x, y, z, degrees, bounding_cir_rad)  {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    this.thingSeekingVertices = gemMesh.vertices[0].values;

    this.thingSeekingNormals = gemMesh.vertices[1].values;

    this.thingSeekingIndices = gemMesh.connectivity[0].indices;

    this.vBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
	this.rotate = 0;
};

ThingSeeking.prototype = Object.create(GameObject.prototype);

ThingSeeking.prototype.init = function() {
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.thingSeekingVertices), gl.STATIC_DRAW );

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.thingSeekingNormals), gl.STATIC_DRAW );

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.thingSeekingIndices), gl.STATIC_DRAW);
    
};

ThingSeeking.prototype.show = function() {

    g_matrixStack.push(modelViewMatrix);
	this.rotate = this.rotate + 1.5;
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 0.0, this.z));
    modelViewMatrix = mult(modelViewMatrix, scalem(1.0,1.0,1.0));
	modelViewMatrix = mult(modelViewMatrix, rotateY(this.rotate));

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    this.vPosition = gl.getAttribLocation( program, "vPosition" );
    if (this.vPosition < 0) {
	console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( this.vPosition );    

    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    this.vNormal = gl.getAttribLocation( program, "vNormal" );
    if (this.vPosition < 0) {
	console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer( this.vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( this.vNormal );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer );

    var ambientProduct = mult(la0, red);
    var diffuseProduct = mult(ld0, red);
    var specularProduct = mult(ls0, red);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
		  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
		  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
		  flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
		  flatten(lp0) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
		 me);
		 
	gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
 		 0);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawElements( gl.TRIANGLES, this.thingSeekingIndices.length, gl.UNSIGNED_SHORT, 0 ); 
    
    modelViewMatrix = g_matrixStack.pop();
    // IMPORTANT: Disable current vertex attribute arrays so those in
    // a different object can be activated
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
};



//////////////////////////  End ThingSeeking's code /////////////////////////////////
