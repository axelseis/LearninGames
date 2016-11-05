


LGamesClient.Home = (function(){
	var cameraStream, 
		videoSource, 
		detector,
		detections;

	var videoWin,
		iosBut,
		videoBut,
		videObj,
		video,
		canvas,
		canvasRef,
		imageError,
		marco;

	var mindetections = 15;

	function gotSources(sourceInfos) {
		for(var i = 0; i < sourceInfos.length; i++) {
			var si = sourceInfos[i];

			if(si.kind === 'videoinput') {
				videoSource = si.label || 'camera 1';
				break;
			}
		}
	};

	function startStopCamera() {
		if(videoWin.hasClass('showing')){
			stopCamera();
		}
		else{
			videoWin.addClass('showing');
			startCamera();
		}
	};

	function startCamera() {
		var constraints = {
			video: {
				optional: [{ sourceId: videoSource }]
			}
		};

		detections = 0;
		navigator.getUserMedia(constraints, successCallback, errorCallback);
	};

	function stopCamera(){
		if (cameraStream) {
			video.src = null;
			cameraStream.getTracks()[0].stop();
		}
		marco.hide();
		videoWin.removeClass('showing');
	};

	function successCallback(stream) {
		var url = window.URL;
		cameraStream = stream; 

		if (url) {
			video.src = url.createObjectURL(stream);
		} else {
			video.src = stream;
		}

		video.play();
		setTimeout(captureFace,3000);
	};

	function errorCallback(error) {
		console.log('navigator.getUserMedia error: ', error);
	};

	function sendImageToServer(){
		var base64_image = canvas.toDataURL();

		$.ajax({
			type: 'POST',
			url: '/cameraLogin',
			data: { 
				'avatar': base64_image
			},
			success: function(msg){
				window.location.href = '/games'
			}
		});
	};

	function captureIOSFace(ev){
		if(ev.target.files.length == 1 && ev.target.files[0].type.indexOf("image/") == 0) {
           	var image = new Image();
           	var size = 250;
           	var ctx = canvasRef.getContext('2d');
           	var rects,rectW;
			
			image.onload = function() {
				canvasRef.width = ~~(size * image.width / image.height);
				canvasRef.height = ~~(size);
				ctx.drawImage(image, 0, 0, canvasRef.width, canvasRef.height);
				
				detector = new objectdetect.detector(canvasRef.width, canvasRef.height, 1.1, objectdetect.frontalface_alt);
				
				rects = detector.detect(canvasRef, 1);
				if(!rects.length){
					imageError.addClass('showing');
				}
				else {
					rectW = Math.max(rects[0][2],rects[0][3]);

					canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
					canvas.width = rectW;
					canvas.height = rectW;
					canvas.getContext('2d').drawImage(canvasRef, rects[0][0],rects[0][1],rectW,rectW, 0, 0, rectW, rectW);

					sendImageToServer();
				}
			}
			
			image.src = URL.createObjectURL(ev.target.files[0]);
        }
    };

	function captureFace(){
		var terminated;

		if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
			if (!detector) {
				var width = ~~(60 * video.videoWidth / video.videoHeight);
				var height = 60;
				detector = new objectdetect.detector(width, height, 1.1, objectdetect.frontalface_alt);
			}

			var coords = detector.detect(video, 1);

			if (coords[0]) {
				var clip = coords[0];
				var scaleX = videObj.width()/video.videoWidth;
				var pos = videObj.offset();
				var aspectX = video.videoWidth / detector.canvas.width;
				var aspectY = video.videoHeight / detector.canvas.height;
				
				clip[0] *= aspectX*0.9;
				clip[1] *= aspectY*0.9;
				clip[2] *= aspectX*1.2;
				clip[3] *= aspectY*1.2;

				var rectW = Math.max(clip[2],clip[3]);
				var rectX = Math.min(video.videoWidth, Math.max(0,clip[0]));
				var rectY = Math.min(video.videoHeight, Math.max(0,clip[1]));

				var videoIncY = (videObj.height() - (video.videoHeight*scaleX))/2;
				
				marco.show();
				marco.offset({left:rectX*scaleX + pos.left,top:rectY*scaleX + pos.top + videoIncY})
				marco.width(rectW*scaleX);
				marco.height(rectW*scaleX);

				if(detections++ >= mindetections){
					terminated = true;          

					canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
					canvas.width = rectW;
					canvas.height = rectW;
					canvas.getContext('2d').drawImage(video, rectX,rectY,rectW,rectW, 0, 0, rectW, rectW);

					sendImageToServer();
				}
			}
			else{
				marco.hide();
			}
		}
		if(!terminated){
			window.requestAnimationFrame(captureFace);      
		}
	};

  	return{
		init: function(){
			videoWin = $('#videoCam');
			iosBut = $('#cameraInput');
			videoBut = $('#cameraBut');
			videObj = $('video');
			video = videObj.get(0);
			canvas = $('#canvas').get(0);
			canvasRef = $('#canvasRef').get(0);
			imageError = $('#imageError');
			marco = $('#marco');

      		if(iosBut.length){
	      		iosBut.on("change", captureIOSFace);      			
      		}
      		else{
      			videoBut.on('click', startStopCamera);
      			videoWin.on('click', stopCamera);
	
	  			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
				if (typeof navigator.mediaDevices === 'undefined' || typeof navigator.mediaDevices.enumerateDevices === 'undefined') {
					//alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
				} 
				else {
					navigator.mediaDevices.enumerateDevices(gotSources);
				}
      		}

      	}
  	};
})();
