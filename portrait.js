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

//移动对象，存储图片的位置信息
var moveObj = {
    dragBool: false,
    strechBool: false,
    mouseXStart: 0,
    mouseYStart:0, 
    mouseXDistance: 0,
    mouseYDistance:0,
    width: 0,
    height: 0,
    picLeft: 0,
    picTop: 0,
    minWidth: 10,
    minHeight: 10,
    WHRatio: 1/2,
    initialWidth: 40,
    initialHeight:80,
    imgObj: "",
    smallPicRatio: 5
}
$(document).ready(function(){
    
    init(); // 初始化图片操作区域，绑定相应的事件
    diyPortraitWidthAndHeight(); //自定义宽高比
    
})
function init() {
    var element = document.getElementById('selectPic'), inputForImageName = document.getElementById('imgName');
    
    //点击选择文件按钮，调取相应的图片
    element.onchange = function() {
		var files = element.files, reader = new FileReader();
		if (files && files[0]) {
            inputForImageName.value = files[0].name;
            
			reader.onload = function(event) {
                $('.imgContainerInner').show();
                $('.diyPortrait').show();
                var imageURL = event.target.result;
				var IMG = new Image();
                IMG.src = imageURL;
                IMG.onload = function() {
                    //将图片放置于正方形的容器中，图片的显宽、高以及缩放比例的计算
                    reset();
                    var $imgContainerOuter = $('.imgContainerOuter');
                    var $imgContainerOuterBack = $('.imgContainerOuterBack');

                    var $imgContainer = $('.imgContainerInner');
                    var $img = $('.imgContainerInner img');                    
                    
					var initialWidth = IMG.width;
					var initialHeight = IMG.height;
					initialImgObj.initialWidth = initialWidth;
					initialImgObj.initialHeight = initialHeight;
					var scale = (initialWidth / $imgContainerOuter.width()) <= (initialHeight / $imgContainerOuter.height() ) ? initialHeight / $imgContainerOuter.height() : initialWidth / $imgContainerOuter.width();
					$img.attr({
						src: imageURL
					})
					$img.css({
						width: initialWidth / scale,
                        height: initialHeight / scale,
                        left:0,
                        top:0
                    })
                    $imgContainerOuterBack.attr({
                        src: imageURL
                    })
                    $imgContainerOuterBack.css({
						width: initialWidth / scale,
						height: initialHeight / scale,
						left: initialWidth / scale == $imgContainerOuter.width() ? 0 : (initialHeight / scale - initialWidth / scale)/2,
						top: initialWidth / scale == $imgContainerOuter.width() ? (initialWidth / scale - initialHeight / scale)/2 : 0,
                    })
                    $imgContainer.css({
                        width: initialWidth / scale,
                        height:  initialHeight / scale,
                        left: initialWidth / scale == $imgContainerOuter.width() ? 0 : (initialHeight / scale - initialWidth / scale)/2,
						top: initialWidth / scale == $imgContainerOuter.width() ? (initialWidth / scale - initialHeight / scale)/2 : 0,
                    })
                    //变换后的图片对象信息
					initialImgObj.changedWidth = initialWidth / scale;
					initialImgObj.changedHeight = initialHeight / scale;
					initialImgObj.changedX0 = parseFloat($img.css('left'));
					initialImgObj.changedY0 = parseFloat($img.css('top'));
                    initialImgObj.scale = scale; 
                    
                    //渲染拖动框
                    moveObj.width = moveObj.initialWidth;
                    moveObj.height = moveObj.initialWidth / moveObj.WHRatio;
                    moveObj.picLeft = 0;
                    moveObj.picTop = 0;
                    $(".portraitWidth").val("");
                    $(".portraitHeight").val("");

                    $('.imgContainer').css({
                        width: moveObj.width,
                        height: moveObj.height
                    })
                    moveObj.imgObj = IMG;
                    stretchPic(moveObj.width, moveObj.height);
                    movePic(moveObj.picLeft, moveObj.picTop);
                    moveFuncBind(); //触发mouse相关事件
                    
                }
            }
            reader.readAsDataURL(files[0]);
        }
    }
}
function diyPortraitWidthAndHeight() {
    
    var widthHeightRatio;
    $('.diyPortrait span').click(function(envent){
        var nowWidth, nowHeight;
        nowWidth = moveObj.width;
        nowHeight = moveObj.height;
        // console.log(nowWidth, nowHeight);
        var portraitWidth = parseFloat($(".portraitWidth").val());
        var portraitHeight = parseFloat($(".portraitHeight").val());
        if ( portraitWidth && portraitHeight) {
            widthHeightRatio = portraitWidth / portraitHeight;
            moveObj.WHRatio = widthHeightRatio;
            if (nowWidth / nowHeight >= moveObj.WHRatio) {
                moveObj.width = moveObj.WHRatio*nowHeight
            } else {
                moveObj.height = nowWidth / moveObj.WHRatio;
            }
            // console.log(moveObj.width, moveObj.height);
            changedSmallPic(moveObj.width,  moveObj.height);
            stretchPic(moveObj.width, moveObj.height);
            $(".portraitWidth").val("");
			$(".portraitHeight").val("");
        } else {
            $(".portraitWidth").val("");
			$(".portraitHeight").val("");
			alert('请填写正确的高度或宽度值');
        }
    })
    
}

function moveFuncBind() {
    $(document.body).on('mousedown', mousedownFunc);
    $(document.body).on('mousemove', mousemoveFunc);
    $(document.body).on('mouseup', mouseupFunc);
}
function mousedownFunc(event) {
    moveObj.mouseXStart = event.clientX;
    moveObj.mouseYStart = event.clientY;
    var leftBoundary = event.clientX - $('.imgContainerOuter').offset().left - parseFloat($('.imgContainerInner').css('left'));
    var topBoundary = event.clientY - $('.imgContainerOuter').offset().top - parseFloat($('.imgContainerInner').css('top'));
    if ((leftBoundary >= (moveObj.picLeft + moveObj.width)) && (leftBoundary <= (moveObj.picLeft + moveObj.width + 20)) && (topBoundary >= (moveObj.picTop + moveObj.height)) && (topBoundary <= (moveObj.picTop + moveObj.height + 20))) {
        moveObj.strechBool = true;
    } 
    if ((leftBoundary >= moveObj.picLeft) && (leftBoundary <= moveObj.picLeft + moveObj.width) && (topBoundary >= moveObj.picTop) && (topBoundary <= moveObj.picTop + moveObj.height)){
        moveObj.dragBool = true;
    }
}
function mousemoveFunc(event) {
    var xDistance , yDistance, lastLeft, lastTop, lastWidth, lastHeight;
    //按住鼠标拖动图片
    if (moveObj.dragBool) {
        moveObj.mouseXDistance = event.clientX - moveObj.mouseXStart;
        moveObj.mouseYDistance = event.clientY - moveObj.mouseYStart;
        xDistance = moveObj.mouseXDistance;
        yDistance  = moveObj.mouseYDistance;
        moveObj.picLeft  += xDistance;
        moveObj.picTop += yDistance;
        lastLeft = moveObj.picLeft;
        lastTop = moveObj.picTop;
        if (lastLeft <= 0) {
            moveObj.picLeft  = 0;
            lastLeft = 0;
        } else {
            if (lastLeft + moveObj.width >= initialImgObj.changedWidth) {
                lastLeft = initialImgObj.changedWidth - moveObj.width;
                moveObj.picLeft = lastLeft;
            }
        }
        if (lastTop <= 0) {
            lastTop = 0;
            moveObj.picTop = 0;
        } else {
            if (lastTop + moveObj.height >= initialImgObj.changedHeight) {
                lastTop = initialImgObj.changedHeight - moveObj.height;
                moveObj.picTop = lastTop;
            }
        }
        movePic(lastLeft, lastTop);
        moveObj.mouseXStart = event.clientX;
        moveObj.mouseYStart = event.clientY;
    }
    
    var leftBoundary = event.clientX - $('.imgContainerOuter').offset().left - parseFloat($('.imgContainerInner').css('left'));
    var topBoundary = event.clientY - $('.imgContainerOuter').offset().top - parseFloat($('.imgContainerInner').css('top'));
    if ((leftBoundary >= (moveObj.picLeft + moveObj.width)) && (leftBoundary <= (moveObj.picLeft + moveObj.width + 20)) && (topBoundary >= (moveObj.picTop + moveObj.height)) && (topBoundary <= (moveObj.picTop + moveObj.height + 20))) {
        document.getElementById('imgContainerOuter').style.cursor = 'se-resize';
    } else if ((leftBoundary >= moveObj.picLeft) && (leftBoundary <= moveObj.picLeft + moveObj.width) && (topBoundary >= moveObj.picTop) && (topBoundary <= moveObj.picTop + moveObj.height)){
        document.getElementById('imgContainerOuter').style.cursor = 'move';
    } else {
        document.getElementById('imgContainerOuter').style.cursor = 'default';
    }

    //拉伸小方框
    if (moveObj.strechBool) {
        moveObj.mouseXDistance = event.clientX - moveObj.mouseXStart;
        moveObj.mouseYDistance = event.clientY - moveObj.mouseYStart;
        xDistance = moveObj.mouseXDistance;
        yDistance  = moveObj.mouseYDistance;
        moveObj.width += xDistance;
        moveObj.height += yDistance;
        if (moveObj.width/moveObj.height >=moveObj.WHRatio) {
            moveObj.width = moveObj.WHRatio* moveObj.height;
        } else {
            moveObj.height = moveObj.width / moveObj.WHRatio;
        }
        lastWidth = moveObj.width;
        lastHeight = moveObj.height;
        if (lastWidth <= 10) {
            lastWidth = 10;
            moveObj.width = 10;
        } else if ((lastWidth + moveObj.picLeft) >= initialImgObj.changedWidth) {
            lastWidth = initialImgObj.changedWidth - moveObj.picLeft;
            moveObj.width = lastWidth;
        }

        if (lastHeight <= 10) {
            lastHeight = 10;
            moveObj.height = 10;
        } else if ((lastHeight + moveObj.picTop) >= initialImgObj.changedHeight) {
            lastHeight =  initialImgObj.changedHeight - moveObj.picTop;
            moveObj.height = lastHeight;
        }
        stretchPic(lastWidth, lastHeight);

        moveObj.mouseXStart = event.clientX;
        moveObj.mouseYStart = event.clientY;
    }
}
function mouseupFunc(event) {
    moveObj.dragBool = false;
    moveObj.strechBool = false;
}
function movePic (left, top) {
    var $movePicContainer = $('.imgContainer');
    var $movePic = $('.imgContainer img');
    $movePicContainer.css({
        left: left,
        top: top
    })
    $movePic.css({
        left: -left,
        top: -top
    })
    canvasToImge(left, top, moveObj.width, moveObj.height);

}
function stretchPic(width, height) {
    var $movePicContainer = $('.imgContainer');
    $movePicContainer.css({
        width: width,
        height: height
    })
    canvasToImge(moveObj.picLeft, moveObj.picTop, width, height);

} 

function canvasToImge(left, top, width, height) {
    var lastX ,lastY, lastWidth, lastHeight;
	var lastX2, lastY2, lastWidth2, lastHeight2;
    var widthSmall = parseFloat($('#smallPic').css('width'));
    var heightSmall = parseFloat($('#smallPic').css('height'));
    var canvasElement = document.getElementById('smallPic');
    var targetCtx = canvasElement.getContext('2d');
    targetCtx.clearRect(0,0,widthSmall,heightSmall);

    lastX = left * initialImgObj.scale;
    lastY = top * initialImgObj.scale;
    lastWidth = width * initialImgObj.scale;
    lastHeight = height * initialImgObj.scale;
    lastX2 = 0;
    lastY2 = 0;
    lastWidth2 = width;
    lastHeight2 = height;
    changedSmallPic(width, height);

    targetCtx.drawImage(moveObj.imgObj, lastX, lastY, lastWidth, lastHeight, lastX2, lastY2, lastWidth2, lastHeight2);
    // lastImgUrl = canvasTransToImage(targetCanvas);

}

function changedSmallPic(width, height) {
    $("#smallPic").attr({
        width:width,
        height: height 
    })
    $("#smallPic").css({
        width: width,
        height: height 
    })
    var str = parseInt(width) + "X" + parseInt(height) + "像素"
    $('.smallPicContainer .pixel').html(str);
}
function reset() {
    moveObj.dragBool = false;
    moveObj.strechBool = false;
    moveObj.mouseXStart = 0;
    moveObj.mouseYStart = 0; 
    moveObj.mouseXDistance=0;
    moveObj.mouseYDistance=0;
    moveObj.width= 0;
    moveObj.height=0;
    moveObj.picLeft=0;
    moveObj.picTop=0;
    moveObj.minWidth=10;
    moveObj.minHeight=10;
    moveObj.WHRatio=1/2;
    moveObj.initialWidth= 40;
    moveObj.initialHeight=80;
    moveObj.imgObj="";
    moveObj.smallPicRatio=5;

    initialImgObj.initialWidth = 0;
    initialImgObj.initialHeight = 0;
    initialImgObj.changedWidth =  0; 
    initialImgObj.changedHeight = 0;
    initialImgObj.changedX0 = 0;
    initialImgObj.changedY0= 0;
    initialImgObj.scale=0;
}