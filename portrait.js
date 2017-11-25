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
    picTop: 0
}
$(document).ready(function(){
    
    init(); // 初始化图片操作区域，绑定相应的事件
    
    
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
                var imageURL = event.target.result;
				var IMG = new Image();
                IMG.src = imageURL;
                IMG.onload = function() {
                    //将图片放置于正方形的容器中，图片的显宽、高以及缩放比例的计算
                    var $imgContainer = $('.imgContainerInner');
                    var $img = $('.imgContainerInner img');
                    var $imgContainerOuter = $('.imgContainerOuterBack');
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
                    })
                    $imgContainerOuter.attr({
                        src: imageURL
                    })
                    $imgContainerOuter.css({
						width: initialWidth / scale,
						height: initialHeight / scale,
						left: initialWidth / scale == $imgContainer.width() ? 0 : (initialHeight / scale - initialWidth / scale)/2,
						top: initialWidth / scale == $imgContainer.width() ? (initialWidth / scale - initialHeight / scale)/2 : 0,
                    })
                    $imgContainer.css({
                        width: initialWidth / scale,
                        height:  initialHeight / scale,
                        left: initialWidth / scale == $imgContainer.width() ? 0 : (initialHeight / scale - initialWidth / scale)/2,
						top: initialWidth / scale == $imgContainer.width() ? (initialWidth / scale - initialHeight / scale)/2 : 0,
                    })
                    //变换后的图片对象信息
					initialImgObj.changedWidth = initialWidth / scale;
					initialImgObj.changedHeight = initialHeight / scale;
					initialImgObj.changedX0 = parseFloat($img.css('left'));
					initialImgObj.changedY0 = parseFloat($img.css('top'));
                    initialImgObj.scale = scale; 
                    
                    moveObj.width = $('.imgContainer').width();
                    moveObj.height = $('.imgContainer').height();
                    
                    moveFuncBind(); //触发mouse相关事件
                }
            }
            reader.readAsDataURL(files[0]);
        }
    }
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
    if ((leftBoundary >= parseFloat($('.imgContainer').css('left'))) && (leftBoundary <= parseFloat($('.imgContainer').css('left')) + moveObj.height) && (topBoundary >= parseFloat($('.imgContainer').css('top'))) && (topBoundary <= parseFloat($('.imgContainer').css('top')) + moveObj.height)){
        moveObj.dragBool = true;
    }
}
function mousemoveFunc(event) {
    var xDistance , yDistance, lastLeft, lastTop, lastWidth, lastHeight;
    //按住鼠标拖动图片
    if (moveObj.dragBool) {
        console.log(event.clientX , moveObj.mouseXStart)
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
    } else if ((leftBoundary >= parseFloat($('.imgContainer').css('left'))) && (leftBoundary <= parseFloat($('.imgContainer').css('left')) + moveObj.height) && (topBoundary >= parseFloat($('.imgContainer').css('top'))) && (topBoundary <= parseFloat($('.imgContainer').css('top')) + moveObj.height)){
        document.getElementById('imgContainerOuter').style.cursor = 'move';
    } else {
        document.getElementById('imgContainerOuter').style.cursor = 'default';
    }

    //拉伸小方框
    if (moveObj.strechBool) {
        // moveObj.mouseXDistance = event.clientX - moveObj.mouseXStart;
        // moveObj.mouseYDistance = event.clientY - moveObj.mouseYStart;
        // xDistance = moveObj.mouseXDistance;
        // yDistance  = moveObj.mouseYDistance;
        // lastWidth = moveObj.width + xDistance;
        // lastHeight = moveObj.height + yDistance;
        // stretchPic(lastWidth, lastHeight);
    }
}
function mouseupFunc(event) {
    moveObj.dragBool = false;
    moveObj.strechBool = false;
    // moveObj.picLeft += moveObj.mouseXDistance;
    // moveObj.picTop +=  moveObj.mouseYDistance;

    // moveObj.width +=  moveObj.mouseXDistance;
    // moveObj.height += moveObj.mouseYDistance;
}
function movePic (left, top, width, height) {
    width = width? width : moveObj.width;
    height = height? height : moveObj.height;
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
}
function stretchPic(width, height) {
    var $movePicContainer = $('.imgContainer');
    $movePicContainer.css({
        width: width,
        height: height
    })
} 