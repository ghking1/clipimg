
var clipimg=Clipimg(document.querySelector('.dialog_clip'));

function demo_loadFile(files)
{
    if(files.length>0)
    {
        clipimg.loadFile(files[0]);
    }
}

function demo_zoomIn()
{
    clipimg.zoomIn();
}

function demo_zoomOut()
{
    clipimg.zoomOut();
}

function demo_rotate()
{
    clipimg.rotate();
}

function demo_getDataURL()
{
    var url=clipimg.getDataURL(128);
    document.querySelector('.dialog_clipped_img').src=url;
}

function demo_good()
{
    alert('真棒！');
}