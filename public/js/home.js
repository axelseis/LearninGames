


LGamesClient.Home = (function(){
	var cameraStream, 
		videoSource, 
		detector,
		detections;

	var videoWin,
		videoBut,
		videObj,
		video,
		canvas,
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
		var base64_image = canvas.get(0).toDataURL();

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

					canvas.get(0).getContext('2d').clearRect(0,0,canvas.width(),canvas.height())
					canvas.get(0).width = rectW;
					canvas.get(0).height = rectW;
					canvas.get(0).getContext('2d').drawImage(video, rectX,rectY,rectW,rectW, 0, 0, rectW, rectW);

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
			videoBut = $('#cameraBut');
			videObj = $('video');
			video = videObj.get(0);
			canvas = $('#canvas');
			marco = $('#marco');

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
  	};
})();
