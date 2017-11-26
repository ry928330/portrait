var canvasObj = {
	xStart:0,
	yStart:0,
	width:0,
	height:0,
	initialWidth:0,
	initialHeight:0,
	beginDraw: false
}
function resetCanvasObj() {
	return {
		xStart:0,
		yStart:0,
		width:0,
		height:0,
		initialWidth:0,
		initialHeight:0,
		beginDraw: false
	}
}
var clearCanvasObj = {
	xStart:0,
	yStart:0,
	width:180,
	height:180,
	left:0,
	top:0,
	initialWidth:0,
	initialHeight:0,
	beginDraw: false,
	isCanvasArea: false,
	isRightCorner: false,
	mouseX: 0,
	mouseY: 0,
	//color: 'rgba(211,211,216,0.5)'
	color: 'rgba(0,0,0, 0.4)',
	canvasId: 0,
	isDrag: false,
	isStretch: false,
	isTimeout: false,
	
}
function resetClearCanvasObj() {
	return {
		xStart:0,
		yStart:0,
		width:180,
		height:180,
		left:0,
		top:0,
		initialWidth:0,
		initialHeight:0,
		beginDraw: false,
		isCanvasArea: false,
		isRightCorner: false,
		mouseX: 0,
		mouseY: 0,
		//color: 'rgba(211,211,216,0.5)'
		color: 'rgba(0,0,0, 0.4)'
	}
}
var portraitGroupsArr = [
	{
		width: 60,
		height: 60,
		class: 'smallPic_60'
	},
	{
		width: 300,
		height: 300,
		class: 'smallPic_120'
	}
]

//存储原始图片相关的信息
var initialImgObj = {
	initialWidth: 0,
	initialHeight: 0,
	changedWidth: 0, //变换后图片宽度
	changedHeight: 0, //变换后图片高度
	changedX0: 0, //变换后图片左上角横坐标
	changedY0: 0,  //变换后图片左上角纵坐标
	scale: 0
}

var UrlResultsArr = []; //存储最终的小图像地址
var ry_CTX;
window.onload = function() {
	$('.diyPortrait span').click(function(event) {
		/* Act on the event */
		var portraitWidth = $(".portraitWidth").val();
		var portraitHeight = $(".portraitHeight").val();
		if (parseInt(portraitWidth, 10) && parseInt(portraitHeight, 10)) {
			if (parseInt(portraitWidth, 10) == parseInt(portraitHeight, 10)) {
				var divEle = $("<div></div>");
				portraitGroupsArr.push({
					width: parseInt(portraitWidth, 10),
					height: parseInt(portraitHeight, 10),
					class: 'smallPic_' + portraitWidth
				})
				divEle.attr({
					class: 'smallPicContainer_' + portraitWidth,
				});
				var divEleChild = $("<canvas></canvas>");
				divEleChild.attr({
					class: 'smallPic_' + portraitWidth,
					id: 'smallPic_' + portraitWidth
				});
				var divEleSpan = $("<div></div>");
				divEleSpan.attr({
					class: 'pixel',
				});
				divEleSpan.html(portraitWidth + 'x' + portraitHeight + '像素');
				divEle.append(divEleChild);
				divEle.append(divEleSpan);
				$('.smallPicGroups').append(divEle);
				var divEleChildCanvas = document.getElementById('smallPic_' + portraitWidth);
				divEleChildCanvas.width = portraitWidth;
				divEleChildCanvas.height = portraitHeight;
				divEle.css({
					float: 'left',
					textAlign: 'center',
					marginLeft: '20px',
				});
				divEleChild.css({
					margin: '0 auto',
					border: '1px solid #9baab3',
				});

				$(".portraitWidth").val("");
				$(".portraitHeight").val("");
			} else {
				$(".portraitWidth").val("");
				$(".portraitHeight").val("");
				alert('请输入相同的宽高值');
			}
		} else {
			$(".portraitWidth").val("");
			$(".portraitHeight").val("");
			alert('请填写正确的高度或宽度值');
		}
	});
	var screenCanvasDOM = document.getElementById('screenCanvas');
	if (screenCanvasDOM.getContext) {
		portraitsCreate();
	} else {
		$('.portraitContainer').remove();
		createFlash();
	}

	
	// $('#portraitConfig').click(function(){
		
	// })
}

function portraitsCreate() {
	var element = document.getElementById('selectPic'), inputForImageName = document.getElementById('imgName');
	element.onchange = function() {
		var files = element.files, reader = new FileReader();
		if (files && files[0]) {
			inputForImageName.value = files[0].name;
			reader.onload = function(event) {
				var imageURL = event.target.result;

				var IMG = new Image();
				IMG.src = imageURL;
				IMG.onload = function() {
					var $imgContainer = $('.imgContainer');
					var $img = $('.imgContainer img');
					var initialWidth = IMG.width;
					var initialHeight = IMG.height;
					initialImgObj.initialWidth = initialWidth;
					initialImgObj.initialHeight = initialHeight;
					var scale = (initialWidth / $imgContainer.width()) <= (initialHeight / $imgContainer.height() ) ? initialHeight / $imgContainer.height() : initialWidth / $imgContainer.width();
					$img.attr({
						src: imageURL
					})
					$img.css({
						width: initialWidth / scale,
						height: initialHeight / scale,
						marginLeft: initialWidth / scale == $imgContainer.width() ? 0 : (initialHeight / scale - initialWidth / scale)/2,
						marginTop: initialWidth / scale == $imgContainer.width() ? (initialWidth / scale - initialHeight / scale)/2 : 0,
					})
					initialImgObj.changedWidth = initialWidth / scale;
					initialImgObj.changedHeight = initialHeight / scale;
					initialImgObj.changedX0 = parseFloat($img.css('marginLeft'));
					initialImgObj.changedY0 = parseFloat($img.css('marginTop'));
					initialImgObj.scale = scale; 
					var imgObj = IMG;
					htmlTransToCanvas(imageURL, imgObj);
				} 
				// console.log('imageURL', imageURL);
				
				
				
			}
			reader.readAsDataURL(files[0]);
		}
	}
}

function reset(canvas) {
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//重置原始图片
	$('.imgContainer img').attr({
		src: './unload.png'
	});

	//删除新增canvas
	var isCavnasLive = document.getElementById('canvas');
	if (isCavnasLive) {
		isCavnasLive.remove();
		var canvasIDCtx = new Array();
		portraitGroupsArr.forEach(function(item, index) {
			var canvasID = document.getElementById(item.class);
			canvasIDCtx.push(canvasID.getContext('2d'));
			canvasIDCtx[index].clearRect(0, 0, item.width, item.height);
		})
		clearCanvasObj = resetClearCanvasObj();
		canvasObj = resetCanvasObj();
	}
	//重置input名字输入框
	$('#imgName').val("")
}

function htmlTransToCanvas(imageURL, imgObj) {
	html2canvas(document.getElementById('imgContainer'), {
		onrendered: function(canvas) {
			var isCavnasLive = document.getElementById('canvas');
			var isPortraitButtonGroups= document.getElementById('portraitButtonGroups');
			if (isPortraitButtonGroups) {
				isPortraitButtonGroups.remove();
			}
			if (isCavnasLive) {
				isCavnasLive.remove();
				var canvasIDCtx = new Array();
				portraitGroupsArr.forEach(function(item, index) {
					var canvasID = document.getElementById(item.class);
					canvasIDCtx.push(canvasID.getContext('2d'));
					canvasIDCtx[index].clearRect(0, 0, item.width, item.height);
				})
				clearCanvasObj = resetClearCanvasObj();
				canvasObj = resetCanvasObj();
			}
			
			createPortraitButton(); //加载成功，创建保存、取消按钮
			//var imageURL = canvasTransToImage(canvas);
			var imgContainerCanvas = createCanvasByClassName('imgContainer');

			//点击取消按钮，重置。
			var cancel = document.getElementById("portraitCancel");
			cancel.addEventListener('click', function(event){
				reset(imgContainerCanvas);
			}, false)

			//点击保存按键，发送图片地址
			var portraitConfigButton = document.getElementById('portraitConfig');
			portraitConfigButton.addEventListener('click', sendURL, false)

			ry_CTX = imgContainerCanvas.getContext('2d');
			ry_CTX.clearRect(0, 0, clearCanvasObj.width, clearCanvasObj.height);
			produceSmallPic(clearCanvasObj.xStart+clearCanvasObj.left, clearCanvasObj.yStart+clearCanvasObj.top, clearCanvasObj.width, clearCanvasObj.height, imageURL, imgObj);

			var timeId = null;
			document.body.addEventListener('mousedown', function(event){
				mousedownFunc(event);
			});
			document.body.addEventListener('mousemove', function(event) {
				// if (moveId) {
				// 	clearTimeout(moveId);
				// }
				// var moveId= setTimeout(function(){
				// 	mousemoveFunc(event);
				// }, 0.01)
				mousemoveFunc(event);
			});
			document.body.addEventListener('mouseup', function(event){
				mouseupFunc(event);
			});
			function mousedownFunc(event) {
				clearCanvasObj.beginDraw = true;
				/* Act on the event */
				clearCanvasObj.mouseX = event.clientX;
				clearCanvasObj.mouseY = event.clientY;
				var nowMouseX = event.clientX - clearCanvasObj.left;
				var nowMouseY = event.clientY - clearCanvasObj.top;
				//console.log('nowMouseX', nowMouseX);
				if ((nowMouseX >= clearCanvasObj.xStart + clearCanvasObj.width - 10) && (nowMouseX <= clearCanvasObj.xStart+ clearCanvasObj.width + 10) 
					&& (nowMouseY >= clearCanvasObj.yStart + clearCanvasObj.height - 10) && (nowMouseY <= clearCanvasObj.yStart + clearCanvasObj.height + 10)) {
					clearCanvasObj.isStretch = true;
				}
				if (nowMouseX >= clearCanvasObj.xStart && nowMouseX <= clearCanvasObj.xStart + clearCanvasObj.width && nowMouseY >= clearCanvasObj.yStart && nowMouseY <= clearCanvasObj.yStart + clearCanvasObj.height) {
					clearCanvasObj.isDrag = true;
				}
				clearCanvasObj.isTimeout = true;
			}
			function mousemoveFunc(event) {
				var nowMouseX = event.clientX - clearCanvasObj.left;
				var nowMouseY = event.clientY - clearCanvasObj.top;
				if (nowMouseX >= clearCanvasObj.xStart && nowMouseX <= clearCanvasObj.xStart + clearCanvasObj.width && nowMouseY >= clearCanvasObj.yStart && nowMouseY <= clearCanvasObj.yStart + clearCanvasObj.height) {
					imgContainerCanvas.style.cursor = 'move';
				} else if ((nowMouseX >= clearCanvasObj.xStart + clearCanvasObj.width - 10) && (nowMouseX <= clearCanvasObj.xStart+ clearCanvasObj.width + 10) 
					&& (nowMouseY >= clearCanvasObj.yStart + clearCanvasObj.height - 10) && (nowMouseY <= clearCanvasObj.yStart + clearCanvasObj.height + 10)) {
					imgContainerCanvas.style.cursor = 'se-resize';
				} 
				else {
					imgContainerCanvas.style.cursor = 'default';
				}
				var outerDomWidth = $(".imgContainer").width();
				var outerDomHeight = $(".imgContainer").height();
				var xDistance = event.clientX - clearCanvasObj.mouseX;
				var yDistance = event.clientY - clearCanvasObj.mouseY;
				//移动小方框
				if (clearCanvasObj.isDrag) {
					ry_CTX.fillStyle = clearCanvasObj.color;
					// console.log('1', clearCanvasObj.xStart, clearCanvasObj.yStart)
					ry_CTX.fillRect(clearCanvasObj.xStart, clearCanvasObj.yStart, clearCanvasObj.width, clearCanvasObj.height);
					//outerCTX.fillRect(0, 0, canvas.width, canvas.height);
					clearCanvasObj.xStart += xDistance;
					clearCanvasObj.yStart += yDistance;

					//判断方框是否达到边界
					if (clearCanvasObj.xStart <= 0) {
						clearCanvasObj.xStart = 0;
					}
					if (clearCanvasObj.yStart <= 0) {
						clearCanvasObj.yStart = 0;
					}
					if ((clearCanvasObj.xStart + clearCanvasObj.width) >= outerDomWidth) {
						clearCanvasObj.xStart = outerDomWidth - clearCanvasObj.width;
					}
					if ((clearCanvasObj.yStart + clearCanvasObj.height) >= outerDomHeight) {
						clearCanvasObj.yStart = outerDomHeight - clearCanvasObj.height;
					}
					// console.log('2', clearCanvasObj.xStart, clearCanvasObj.yStart)
					ry_CTX.clearRect(clearCanvasObj.xStart, clearCanvasObj.yStart, clearCanvasObj.width, clearCanvasObj.height);
					produceSmallPic(clearCanvasObj.xStart+clearCanvasObj.left, clearCanvasObj.yStart+clearCanvasObj.top, clearCanvasObj.width, clearCanvasObj.height, imageURL, imgObj, imgObj)
					clearCanvasObj.mouseX = event.clientX;
					clearCanvasObj.mouseY = event.clientY;
				}
				//拖拽小方框
				if (clearCanvasObj.isStretch) {
					ry_CTX.fillStyle = clearCanvasObj.color;
					ry_CTX.fillRect(clearCanvasObj.xStart, clearCanvasObj.yStart, clearCanvasObj.width, clearCanvasObj.height);
					//ry_CTX.fillRect(0, 0, 1000, 1000);
					var realDistance = Math.min(xDistance, yDistance);
					// if (xDistance/yDistance >= 2) {
					// 	yDistance = 1/2 * xDistance;
					// } else {
					// 	xDistance = 2 * yDistance;
					// }
					clearCanvasObj.width +=  realDistance;
					clearCanvasObj.height += realDistance;
					console.log('x/y', clearCanvasObj.width/clearCanvasObj.height);
					//拖动时边界条件的判断
					if (clearCanvasObj.xStart + clearCanvasObj.width >= outerDomWidth) {
						clearCanvasObj.width = outerDomWidth - clearCanvasObj.xStart;
						clearCanvasObj.height = outerDomWidth - clearCanvasObj.xStart;
					}
					if (clearCanvasObj.yStart + clearCanvasObj.height >= outerDomHeight) {
						clearCanvasObj.width = outerDomHeight - clearCanvasObj.yStart;
						clearCanvasObj.height = outerDomHeight - clearCanvasObj.yStart;
					}
					if (clearCanvasObj.width <= 10) {
						clearCanvasObj.width = 10;
					}
					if (clearCanvasObj.height <= 10) {
						clearCanvasObj.height = 10;
					}
					ry_CTX.clearRect(clearCanvasObj.xStart, clearCanvasObj.yStart, clearCanvasObj.width, clearCanvasObj.height);
					produceSmallPic(clearCanvasObj.xStart+clearCanvasObj.left, clearCanvasObj.yStart+clearCanvasObj.top, clearCanvasObj.width, clearCanvasObj.height, imageURL, imgObj);
					clearCanvasObj.mouseX = event.clientX;
					clearCanvasObj.mouseY = event.clientY;
				}	
				/* Act on the event */
										
			}
			function mouseupFunc(event) {
				/* Act on the event */
				clearCanvasObj.isDrag = false;
				clearCanvasObj.isStretch = false;
			}
		},
	});
}

function getRandom(a, b) {
	return Math.random()*(b - a) + a
}

function createPortraitButton() {
	var parentDiv = $("<div></div>");
	parentDiv.attr({
		class:'portraitButtonGroups',
		id : 'portraitButtonGroups'
	})
	$('.portraitContainer').append(parentDiv);

	var portraitCancelDiv = $("<div></div>");
	portraitCancelDiv.attr({
		class: 'portraitCancel',
		id: 'portraitCancel'
	});
	portraitCancelDiv.html("取消");
	parentDiv.append(portraitCancelDiv);

	var portraitConfigDiv = $("<div></div>");
	portraitConfigDiv.attr({
		id: 'portraitConfig',
		class: 'portraitConfig'
	});
	portraitConfigDiv.html("保存");
	parentDiv.append(portraitConfigDiv);
}

function createCanvasByClassName(tag) {
	var canvasInitialWidth = $('.' + tag).width();
	var canvasInitialHeight = $('.' + tag).height();
	var left = $('.' + tag).offset().left - $('.' + tag).parent('.portraitContainer').offset().left + 1;
	var top = $('.' + tag).offset().top - $('.' + tag).parent('.portraitContainer').offset().top + 1;
	//var left = $('.' + tag).offset().left + 1;
	//var top = $('.' + tag).offset().top + 1;
	clearCanvasObj.left = $('.' + tag).offset().left + 1;
	clearCanvasObj.top = $('.' + tag).offset().top + 1;
	// clearCanvasObj.left = left;
	// clearCanvasObj.top = top;
	var canvasElement = $('<canvas></canvas>');
	var randomNum = Math.floor(getRandom(0, 10000));
	clearCanvasObj.canvasId = randomNum;
	canvasElement.attr({
		id: 'canvas',
		width: canvasInitialWidth,
		height: canvasInitialHeight
	});
	canvasElement.css({
		position: 'absolute',
		top: top, 
		left: left
	});
	//$('body').append(canvasElement);
	var appendEle = $('.portraitContainer').append(canvasElement);
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	//ctx.fillStyle = "rgba(211,211,216,0.5)";
	ctx.clearRect(0, 0, canvasInitialWidth, canvasInitialHeight);
	ctx.fillStyle = "rgba(0,0,0, 0.4)";
	ctx.fillRect(0, 0, canvasInitialWidth, canvasInitialHeight);
	return canvas;
}

function produceSmallPic(left, top, width, height, imageURL, imgObj) {
	imageTransToCanvas(imageURL,left, top, width, height, imgObj);
}

function canvasTransToImage(canvas) {
	var imageURL = canvas.toDataURL('image/png');
	return imageURL;
}

function imageTransToCanvas(imageURL, left, top, width, height, imgObj) {
	var targetCtx = new Array();
	var lastX ,lastY, lastWidth, lastHeight;
	var lastX2, lastY2, lastWidth2, lastHeight2;
	var x1 =  left - clearCanvasObj.left;
	var y1 = top - clearCanvasObj.top;
	portraitGroupsArr.forEach(function(item, index) {
		targetCanvas = document.getElementById(item.class);
		targetCtx.push(targetCanvas.getContext('2d'));
		targetCtx[index].clearRect(0,0, item.width, item.height);
		if (initialImgObj.changedHeight >= initialImgObj.changedWidth) {
			if ((x1 + width) <= (initialImgObj.changedX0 + initialImgObj.changedWidth) && (x1 < initialImgObj.changedX0)) {
				lastX = 0;
				lastY = initialImgObj.scale * y1;
				lastWidth = initialImgObj.scale * (x1 + width - initialImgObj.changedX0);
				lastHeight = initialImgObj.scale * height;

				lastX2 = (initialImgObj.changedX0 - x1)/width * item.width;
				lastY2 = 0;
				lastWidth2 = item.width - lastX2;
				lastHeight2 = item.height;
			} else if ((x1 + width) > (initialImgObj.changedX0 + initialImgObj.changedWidth) && (x1 > initialImgObj.changedX0)) {
				lastX = initialImgObj.scale * (x1 - initialImgObj.changedX0);
				lastY = initialImgObj.scale * y1;
				lastWidth = initialImgObj.scale * (initialImgObj.changedX0 + initialImgObj.changedWidth - x1);
				lastHeight = initialImgObj.scale * height;

				lastX2 = 0;
				lastY2 = 0;
				lastWidth2 = item.width - (x1 + width - initialImgObj.changedX0 - initialImgObj.changedWidth)/width * item.width;
				lastHeight2 = item.height;
			} else {
				lastX = 0;
				lastY = initialImgObj.scale * y1;
				lastWidth = initialImgObj.initialWidth;
				lastHeight = initialImgObj.scale * height;

				lastX2 = (initialImgObj.changedX0 - x1)/width * item.width;
				lastY2 = 0;
				lastWidth2 = item.width - (x1 + width - initialImgObj.changedX0 - initialImgObj.changedWidth)/width * item.width - lastX2;
				lastHeight2 = item.height;
				// console.log('item.width', item.width, lastWidth2)
			}
		} else {
			if ((y1 + height) <= (initialImgObj.changedY0 + initialImgObj.changedHeight) && (y1 < initialImgObj.changedY0)) {
				lastX = initialImgObj.scale * x1;
				lastY = 0;
				lastWidth = initialImgObj.scale * width;
				lastHeight = initialImgObj.scale * (y1 + height - initialImgObj.changedY0);

				lastX2 = 0;
				lastY2 = (initialImgObj.changedY0 - y1)/height * item.height;
				lastWidth2 = item.width;
				lastHeight2 = item.height - lastY2;
			} else if((y1 + height) > (initialImgObj.changedY0 + initialImgObj.changedHeight) && (y1 > initialImgObj.changedY0)){
				lastX = initialImgObj.scale * x1;
				lastY = initialImgObj.scale * (y1 - initialImgObj.changedY0);
				lastWidth = initialImgObj.scale * width;
				lastHeight = initialImgObj.scale * (initialImgObj.changedY0 + initialImgObj.changedHeight - y1);

				lastX2 = 0;
				lastY2 = 0;
				lastWidth2 = item.width;
				lastHeight2 = item.height - (y1 + height - initialImgObj.changedY0 - initialImgObj.changedHeight)/height * item.height;
			} else {
				lastX = initialImgObj.scale * x1;
				lastY = 0;
				lastWidth = initialImgObj.scale * width;
				lastHeight = initialImgObj.initialHeight;

				lastX2 = 0;
				lastY2 = (initialImgObj.changedY0 - y1)/height * item.height;
				lastWidth2 = item.width;
				lastHeight2 = item.height - (y1 + height - initialImgObj.changedY0 - initialImgObj.changedHeight)/height * item.height - lastY2;
			}
		}
		targetCtx[index].drawImage(imgObj, lastX, lastY, lastWidth, lastHeight, lastX2, lastY2, lastWidth2, lastHeight2);
		lastImgUrl = canvasTransToImage(targetCanvas);
		UrlResultsArr[index] = lastImgUrl;
	})
}

function createFlash() {
	var divContainer = $("<div></div>");
	divContainer.attr({
		id: 'flashContent',
	});
	divContainer.css({
		width: '800px',
		height: '470px'
	});
	var flashObj = $("<object></object>");
	flashObj.attr({
		id: 'player',
		type: 'application/x-shockwave-flash',
		data: 'http://static.laohu.com/v2/swf/uploadPhoto.swf'
	});
	flashObj.css({
		width: '100%',
		height: '100%'
	});
	
	var param1 = $("<param>");
	param1.attr({
		name: 'quality',
		value: 'high'
	});
	flashObj.append(param1);
	var param2 = $("<param>");
	param2.attr({
		name: 'allowscriptaccess',
		value: 'always'
	});
	flashObj.append(param2);
	var param3 = $("<param>");
	param3.attr({
		name: 'allowFullScreen',
		value: 'true'
	});
	flashObj.append(param3);
	var param4 = $("<param>");
	param4.attr({
		name: 'wmode',
		value: 'transparent'
	});
	flashObj.append(param4);
	var aTag = $("<a></a>");
	aTag.attr({
		href: 'http://www.adobe.com/go/getflash',
	});
	var img = $("<img>");
	img.attr({
		alt: 'Get Adobe Flash player',
		src: 'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'
	});
	aTag.append(img);
	flashObj.append(aTag);
	divContainer.append(flashObj);

	$('body').append(divContainer);
}

function sendURL() {
	if (UrlResultsArr.length) {
		$.post(
			url,
			{
				data: UrlResultsArr
			},
			function(data) {
				if (data.code == 0) {

				} else if (data.code == 1) {
					alert('Failed，Message：' + data.message);
				}
			}
		)
	}
}


