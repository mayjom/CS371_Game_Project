//////////////////////////  Villain class /////////////////////////////////


function Villain(program, x, y, z, degrees, bounding_cir_rad)  {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    // Not all of these are used, depending on whether you texture the
    // object or render it with a lighting model
    this.vBuffer = null;
    this.tBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
	this.rotate = 0.0;
	this.goingDownX = false;
	this.goingDownZ = false;
	
	this.villainVertices = mummyMesh.vertices[0].values;

    this.villainNormals = mummyMesh.vertices[1].values;

    this.villainIndices = mummyMesh.connectivity[0].indices;
	
	this.texCoord = [
	0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
	0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
	0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
	0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
	0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
 	0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0
    ];
    
};



Villain.prototype = Object.create(GameObject.prototype);


Villain.prototype.init = function() {

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.villainVertices), gl.STATIC_DRAW );

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.villainNormals), gl.STATIC_DRAW );

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.villainIndices), gl.STATIC_DRAW);

    this.tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.texCoord), gl.STATIC_DRAW );

    // WebGL guarantees at least eight texture units -- see
    // http://webglstats.com/webgl/parameter/MAX_TEXTURE_IMAGE_UNITS
    
    // Mummy bandage texture for villain object;
	// partially uses the pyramid texture for some reason
    var image0 = new Image();
    image0.crossOrigin = "anonymous";
    image0.src = "mummyTex256.png";
    image0.onload = function() { 
		var texture0 = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture( gl.TEXTURE_2D, texture0 );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				      gl.UNSIGNED_BYTE, image0);
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
				          gl.NEAREST_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    }; 
};

Villain.prototype.show = function() {

    g_matrixStack.push(modelViewMatrix);
	this.rotate = this.rotate + 1.5;
    modelViewMatrix = mult(modelViewMatrix, translate(this.x,0.0,
	                                                  this.z));
    modelViewMatrix = mult(modelViewMatrix, scalem(10.0,10.0,10.0));
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

    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
    this.vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    if (this.vTexCoord < 0) {
	console.log('Failed to get the storage location of vTexCoord');
    }
    gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vTexCoord);

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer );

    gl.enable(gl.CULL_FACE);	
    gl.cullFace(gl.BACK);
    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
 		 1);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0); 
    gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );  
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 1); 
    gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12 ); 
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);   // See from top
    gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 24 ); 
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);   // See on right
    gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 36 ); 
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0); 
    gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 48 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);   // See on left
    gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 60 );
    gl.disable(gl.CULL_FACE);
    
    modelViewMatrix = g_matrixStack.pop();
    // Disable current vertex attribute arrays so those in a different object can be activated
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
    gl.disableVertexAttribArray(this.vTexCoord);
};

//////////////////////////  End Villain's code /////////////////////////////////
