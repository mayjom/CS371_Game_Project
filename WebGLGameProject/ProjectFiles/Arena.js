//////////////////////////  Arena class /////////////////////////////////

function Arena () {

    this.vertices = [
        0.0,0.0,0.0,                        // The west wall--------
        0.0,0.0,-ARENASIZE,
        0.0,WALLHEIGHT,-ARENASIZE,
        0.0,WALLHEIGHT,0.0,
        ARENASIZE,0.0,0.0,                  // The east wall--------
        ARENASIZE,WALLHEIGHT,0.0,
        ARENASIZE,WALLHEIGHT,-ARENASIZE,
        ARENASIZE,0.0,-ARENASIZE,
        0.0,0.0,-ARENASIZE,                 // The north wall-------
        ARENASIZE,0.0,-ARENASIZE,
        ARENASIZE,WALLHEIGHT,-ARENASIZE,
        0.0,WALLHEIGHT,-ARENASIZE,
        0.0,0.0,0.0,                        // The south wall-------
        0.0,WALLHEIGHT,0.0,
        ARENASIZE,WALLHEIGHT,0.0,
        ARENASIZE,0.0,0.0,
        0.0,0.0,0.0,                        // The floor------------
        ARENASIZE,0.0,0.0,
        ARENASIZE,0.0,-ARENASIZE,
        0.0,0.0,-ARENASIZE
    ];

    this.normals = [
		1.0,0.0,0.0,      // The west wall--------
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        -1.0,0.0,0.0,     // The east wall--------
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        0.0,0.0,1.0,      // The north wall-------
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,-1.0,     // The south wall-------
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,1.0,0.0,      // The floor------------
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0
    ];
	this.texCoord = [
		0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0,    // The west wall
		0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0,    // The east wall 
		0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0,    // The north wall 
		0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0,    // The south wall 
		0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0     // The floor
	];

    this.vBuffer = null;
    this.nBuffer = null;
	this.tBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
    
    this.init = function () {

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW );

		this.nBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW );
		
		this.tBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.texCoord), gl.STATIC_DRAW );
		
		// Pyramid floor/wall texture
		var image0 = new Image();
		image0.crossOrigin = "anonymous";
		image0.src = "pyramidTex1024.png";
		image0.onload = function() { 
		var texture0 = gl.createTexture();
		gl.activeTexture( gl.TEXTURE0);
		gl.bindTexture( gl.TEXTURE_2D, texture0 );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				  gl.UNSIGNED_BYTE, image0);
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
				  gl.NEAREST_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.bindTexture(gl.TEXTURE_2D,0);
		};  
	
    };

    this.show = function () {

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
	
	gl.enable(gl.CULL_FACE);	
    gl.cullFace(gl.BACK);
    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
 		 1);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );


	var ambientProduct = mult(la0, ma);
	var diffuseProduct = mult(ld0, md);
	var specularProduct = mult(ls0, ms);
	
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
	
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);

	ambientProduct = mult(la0, blue);
	//	ambientProduct = mult(vec4(1.0,1.0,1.0,1.0), blue);
	diffuseProduct = mult(ld0, blue);
	specularProduct = mult(ls0, blue);
	
	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
		      flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
		      flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
		      flatten(specularProduct) );	
	
	gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
	
	// IMPORTANT: Disable current vertex attribute arrays so those in
	// a different object can be activated.  
	gl.disableVertexAttribArray(this.vPosition);
	gl.disableVertexAttribArray(this.vNormal);
	gl.disableVertexAttribArray(this.vTexCoord);
    };

};

//////////////////////////  End Arena object /////////////////////////////////
