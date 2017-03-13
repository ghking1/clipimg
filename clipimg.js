
/*
 *   element指定图片放置对象
 *   options选项:
 *   imgSrc是初始图片地址，默认''
 *   clipSize是截图要保存的尺寸，默认256
 *   format是截图的格式，默认image/png
 *   quality是图片质量，对image/jpeg格式有效，默认0.5
 */
function Clipimg(element, options){

    var options= options==undefined ? { } : options;
    var imgSrc= options.imgSrc==undefined ? '' : options.imgSrc;
    var clipSize= options.clipSize==undefined ? 256 : options.clipSize;
    var format= options.format==undefined ?  'image/png' : options.clipSize;
    var quality= options.quality==undefined ? 0.5 : options.quality;

    var isloading=true;     //正在加载文件时不允许拖动
    var isdragging=false;   //防止触摸或拖动多次同时滚动
    var imgbox=document.createElement('div');
    var clipbox=document.createElement('div');
    var maskbox=document.createElement('div');
    var startX, startY;
    var timeStamp=0;
    var ratio=1.0;
    var rotation=0.0;
    var image=new Image();

    //加载图片完成时进行的操作
    image.onload = function() {
        maskbox.style.display = 'none';
        clipbox.style.display = 'block';
        var ratioX=imgbox.clientWidth/parseInt(image.width);
        var ratioY=imgbox.clientHeight/parseInt(image.height);
        ratio=Math.min(ratioX, ratioY);
        timeStamp=0;
        isloading=false;
        setBackground(1.0);
    };

    //旋转图片
    function rotate(deg)
    {
        rotation=(deg==undefined ? rotation+0.5 : deg/180);
        imgbox.style.transform='rotate('+(rotation*180)+'deg)';
        imgbox.style['-webkit-transform']='rotate('+(rotation*180)+'deg)';
        imgbox.style['-moz-transform']='rotate('+(rotation*180)+'deg)';
        imgbox.style['-ms-transform']='rotate('+(rotation*180)+'deg)';
        imgbox.style['-o-transform']='rotate('+(rotation*180)+'deg)';
    }

    //放大图片
    function zoomIn()
    {
        ratio*=1.1;
        setBackground(1.1);
    }

    //缩小图片
    function zoomOut()
    {
        ratio*=0.9;
        setBackground(0.9);
    }

    //加载图片文件
    function loadFile(file)
    {
        isloading=true;
        rotate(0.0);
        imgbox.style['background-image']='';
        clipbox.style.display = 'none';
        maskbox.style.display = 'block';

        var reader = new FileReader();
        reader.onload = function(event) {
            image.src =event.target.result;
        };
        reader.readAsDataURL(file);
    }

    //获取截图对应的canvas和context
    function getcancon()
    {
        var ratio_canvas_clipBox=clipSize/clipbox.clientWidth;
        var dim = imgbox.style.backgroundPosition.split(' ');
        var size= imgbox.style.backgroundSize.split(' ');
        var sx=0;
        var sy=0;
        var sw=image.width;
        var sh=image.height;
        var dx=(parseInt(dim[0])-imgbox.clientWidth*0.20)*ratio_canvas_clipBox;
        var dy=(parseInt(dim[1])-imgbox.clientHeight*0.20)*ratio_canvas_clipBox;
        var dw=parseInt(size[0])*ratio_canvas_clipBox;
        var dh=parseInt(size[1])*ratio_canvas_clipBox;

        var canvas = document.createElement("canvas");
        canvas.width = clipSize;
        canvas.height = clipSize;
        var context = canvas.getContext("2d");
        context.fillStyle='rgb(255, 255, 255)';
        context.fillRect(0, 0, clipSize, clipSize);
        context.translate(clipSize/2, clipSize/2);
        context.rotate(rotation*Math.PI);
        context.translate(-clipSize/2, -clipSize/2);
        context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

        return [canvas, context];
    }

    //获取截取的图片的原始像素级数据
    function getImageData()
    {
        var canvas=getcancon()[0];
        var context=getcancon()[1];
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        return imgData;
    }

    //获取截取的图片的URL
    function getDataURL()
    {
        var canvas=getcancon()[0];
        var context=getcancon()[1];
        var imgURL=canvas.toDataURL(format, quality);
        if(imgURL.search('data:'+format+';base64,')!=0)
        {
            imgURL=undefined;
            return null;
        }
        else
        {
            return imgURL
        }
    }

    //获取截取的图片的二进制表示
    function getBlob()
    {
        var imgURL= getDataURL();
        if(imgURL==null) return null;
        var b64=imgURL.replace('data:'+format+';base64,','');
        var binary = atob(b64);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return  new Blob([new Uint8Array(array)], {type: format});
    }

    //设置背景函数，ratio_step是相当于上一次的缩放比例
    function setBackground(ratio_step)
    {
        var background_width =  parseInt(image.width)*ratio;
        var background_height =  parseInt(image.height)*ratio;
        var offsetX, offsetY;

        if(ratio_step==1.0)
        {
            offsetX = (imgbox.clientWidth - background_width) / 2;
            offsetY = (imgbox.clientHeight - background_height) / 2;
        }
        else
        {
            var offset = imgbox.style.backgroundPosition.split(' ');
            offsetX = parseInt(offset[0]);
            offsetY = parseInt(offset[1]);

            offsetX =(offsetX-imgbox.clientWidth/2)*ratio_step+imgbox.clientWidth/2;
            offsetY =(offsetY-imgbox.clientHeight/2)*ratio_step+imgbox.clientHeight/2;

            if(offsetX>imgbox.clientWidth*0.80) {
                offsetX=imgbox.clientWidth*0.80;
            }
            else if(offsetX<-(image.width*ratio-imgbox.clientWidth*0.20)){
                offsetX=-(image.width*ratio-imgbox.clientWidth*0.20);
            }

            if(offsetY>imgbox.clientHeight*0.80){
                offsetY=imgbox.clientHeight*0.80;
            }
            else if(offsetY<-(image.height*ratio-imgbox.clientHeight*0.20)){
                offsetY=-(image.height*ratio-imgbox.clientHeight*0.20);
            }
        }

        imgbox.style['background-image']='url('+image.src+')';
        imgbox.style['background-size']=background_width+'px '+background_height+'px';
        imgbox.style['background-position']=offsetX+'px '+offsetY+'px';
    }

    //****************************
    //以下实现鼠标拖动
    //****************************
    function imgMouseDown(event)
    {
        if(isloading==false && isdragging==false)
        {
            isdragging = true;
            startX = event.clientX;
            startY = event.clientY;
            timeStamp= event.timeStamp;
            imgbox.addEventListener('mousemove', imgMouseMove);
            document.body.addEventListener('mouseup', imgMouseUp);
        }
    }

    function imgMouseMove(event)
    {
        event.preventDefault();
        event.stopPropagation();

        if(event.buttons==0)
        {
            imgMouseUp(event);
            return;
        }

        if ((event.timeStamp-timeStamp)>16)
        {
            var rotation_rad=-rotation*Math.PI;         //旋转角度的弧度表示
            var movedX_org = event.clientX - startX;    //原始的X位移，即没有经过旋转的
            var movedY_org = event.clientY - startY;    //原始的Y位移，即没有经过旋转的
            var movedX=movedX_org*Math.cos(rotation_rad)-movedY_org*Math.sin(rotation_rad); //经过旋转的X位移
            var movedY=movedX_org*Math.sin(rotation_rad)+movedY_org*Math.cos(rotation_rad); //经过旋转的Y位移

            var offset = imgbox.style.backgroundPosition.split(' ');
            var offsetX = movedX + parseInt(offset[0]);
            var offsetY = movedY + parseInt(offset[1]);

            if(offsetX>imgbox.clientWidth*0.80) {
                offsetX=imgbox.clientWidth*0.80;
            }
            else if(offsetX<-(image.width*ratio-imgbox.clientWidth*0.20)){
                offsetX=-(image.width*ratio-imgbox.clientWidth*0.20);
            }

            if(offsetY>imgbox.clientHeight*0.80){
                offsetY=imgbox.clientHeight*0.80;
            }
            else if(offsetY<-(image.height*ratio-imgbox.clientHeight*0.20)){
                offsetY=-(image.height*ratio-imgbox.clientHeight*0.20);
            }

            imgbox.style.backgroundPosition = offsetX +'px ' + offsetY + 'px';

            startX= event.clientX;
            startY= event.clientY;

            timeStamp= event.timeStamp;
        }
    }

    function imgMouseUp(event)
    {
        isdragging = false;
        imgbox.removeEventListener('mousemove', imgMouseMove);
        document.body.removeEventListener('mouseup', imgMouseUp);
    }

    //****************************
    //以下实现触摸拖动
    //****************************
    function imgTouchStart(event)
    {
        if(isloading==false && isdragging==false)
        {
            isdragging = true;
            startX= event.touches[0].clientX;
            startY= event.touches[0].clientY;
            timeStamp= event.timeStamp;
            imgbox.addEventListener('touchmove', imgTouchMove);
            document.body.addEventListener('touchend', imgTouchEnd);
        }
    }

    function imgTouchMove (event)
    {
        event.preventDefault();
        event.stopPropagation();

        if ((event.timeStamp-timeStamp)>16)
        {
            var rotation_rad=-rotation*Math.PI;         //旋转角度的弧度表示
            var movedX_org = event.changedTouches[0].clientX - startX;      //原始的X位移，即没有经过旋转的
            var movedY_org = event.changedTouches[0].clientY - startY;      //原始的Y位移，即没有经过旋转b
            var movedX=movedX_org*Math.cos(rotation_rad)-movedY_org*Math.sin(rotation_rad); //经过旋转的X位移
            var movedY=movedX_org*Math.sin(rotation_rad)+movedY_org*Math.cos(rotation_rad); //经过旋转的Y位移

            var offset = imgbox.style.backgroundPosition.split(' ');

            var offsetX = movedX + parseInt(offset[0]);
            var offsetY = movedY + parseInt(offset[1]);

            if(offsetX>imgbox.clientWidth*0.80) {
                offsetX=imgbox.clientWidth*0.80;
            }
            else if(offsetX<-(image.width*ratio-imgbox.clientWidth*0.20)){
                offsetX=-(image.width*ratio-imgbox.clientWidth*0.20);
            }

            if(offsetY>imgbox.clientHeight*0.80){
                offsetY=imgbox.clientHeight*0.80;
            }
            else if(offsetY<-(image.height*ratio-imgbox.clientHeight*0.20)){
                offsetY=-(image.height*ratio-imgbox.clientHeight*0.20);
            }

            imgbox.style.backgroundPosition = offsetX +'px ' + offsetY + 'px';

            startX = event.changedTouches[0].clientX;
            startY = event.changedTouches[0].clientY;

            timeStamp= event.timeStamp;
        }
    }

    function imgTouchEnd(event)
    {
        isdragging = false;
        imgbox.removeEventListener('touchmove', imgTouchMove);
        document.body.removeEventListener('touchend', imgTouchEnd);
    }

    //****************************
    //以下创建截图显示框架
    //****************************
    imgbox.style.width='100%';
    imgbox.style.height='100%';
    imgbox.style['background-repeat']='no-repeat';
    imgbox.style.cursor='move';

    clipbox.style.display='none';
    clipbox.style.position='absolute';
    clipbox.style.width='60%';
    clipbox.style.height='60%';
    clipbox.style.top='20%';
    clipbox.style.left='20%';
    clipbox.style.cursor='move';
    clipbox.style['box-sizing']='border-box';
    clipbox.style['box-shadow']='0 0 0 1000px rgba(0, 0, 0, 0.7)';
    clipbox.style.border='1px solid #FFD275';
    imgbox.appendChild(clipbox);

    maskbox.innerText='Loading...';
    maskbox.style.position='absolute';
    maskbox.style.width='100%';
    maskbox.style.height='100%';
    maskbox.style.padding='50% 0%';
    maskbox.style['text-align']='center';
    maskbox.style.background='rgba(0, 0, 0, 0.7)';
    imgbox.appendChild(maskbox);

    element.style.position='relative';
    element.style.overflow='hidden';
    element.style['background-color']='white';
    element.appendChild(imgbox);

    //注册事件
    imgbox.addEventListener('mousedown', imgMouseDown);
    imgbox.addEventListener('touchstart', imgTouchStart);

    //开始加载初始图片
    image.src = imgSrc;

    //创建并返回接口对象
    var obj={
        loadFile: loadFile,
        getDataURL: getDataURL,
        getBlob: getBlob,
        getImageData: getImageData,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        rotate: rotate
    };
    return obj;
}
