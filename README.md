# clipimg
一个强大的，纯js实现的，优雅的图片裁剪插件，兼容PC和移动端

## 特色
1. 功能丰富
2. 接口简洁
3. 使用方便
4. 纯js实现
5. 支持PC和移动端

## 示例展示
1. 将clipimg克隆到本地
2. 打开example/demo.html
3. 操作按钮进行截图

![image](https://github.com/ghking1/clipimg/raw/master/example/demo.jpg)


## 快速入门
1. 引入脚本\<script type="text/javascript" src="../clipimg.js"\>\</script\>
2. 设置容器\<div class="dialog_clip"\>\</div\>
3. 创建对象var clipimg=Clipimg(document.querySelector('.dialog_clip'));

    其实最核心的就上面这几步，但是光这样肯定不行的，这里只是介绍下整体流程而已，有了这个概念，再去看demo的代码应该就方便多了。

## API详解
1. 构造函数：Clipimg(element， options)

- element指定图片放置对象

    比如示例中创建了一个300×300的dialog_clip的div元素，对应这个元素我们只需要保证给它设置了合适的大小和位置就可以了，其他都有插件自己设置。

- options选项:

  imgSrc 是初始图片地址，默认为空字符串

  
2. 接口函数

- rotate([deg])

  图片在当前基础上顺时针旋转deg角度，如果不指定则默认旋转90度
  
- zoomIn()

  放大图片
  
- zoomOut()

  缩小图片
  
- loadFile(file)

  加载图片文件，这个文件名一般来自文件对话框，参加示例程序
  
- getDataURL(clipeSize, format, quality)

    clipSize是截图要保存的尺寸，默认256

    format是截图的格式，默认image/png
    
    quality是图片质量，对image/jpeg格式有效，默认0.5

  获取截取的图片的URL,这个URL其实就是base64编码后的数据文件，可以通过ajax直接上传给服务器，也可以指定给img元素显示。
  
- getBlob(clipeSize, format, quality))

    clipSize是截图要保存的尺寸，默认256

    format是截图的格式，默认image/png
    
    quality是图片质量，对image/jpeg格式有效，默认0.5
    
    获取截取的图片的二进制数据
  
- getImageData(clipSize)

    clipSize是截图要保存的尺寸，默认256,因为该函数获取的是未编码数据，使用不需要format和quality参数

  获取截取的图片的原始像素级数据,这个是未经过编码的数据，当然也是未经过压缩的，一般比较大。

## 注意事项

1. 有些低版本浏览器肯能只支持image/png格式，但是image/jpeg格式在网络上更常用，因为他的压缩率高，这是我们可以检测getDataURL或getBlob返回的数据是不是null再做后续处理。（getImageData一定可以使用，只要浏览器支持canvas就可以）

    如果想得到image/jpeg数据但浏览器又不支持怎么办呢，我们可以自己将原始数据压缩成image/jpeg格式，这需要使用一个jpeg编码插件：https://github.com/owencm/javascript-jpeg-encoder

    在html中引入脚本：\<script type="text/javascript" src="../javascript-jpeg-encoder.js"\>\</script\>
    

```
function demo_getDataURL()
{
    var url=clipimg.getDataURL();
    if(url==null)
    {
        var encoder=new JPEGEncoder(50); //JPEGEncoder的压缩质量取值范围1-100，注意区别于clipimg的0.0-1.0
        var imgData=clipimg.getImageData();
        url=encoder.encode(imgData, 50);
    }
    document.querySelector('.dialog_clipped_img').src=url;
}
```

## 声明

    本插件是基于cropbox写的，但是由于改动幅度太大，而且原仓库好久都没有更新了，所以就没有提交到那里。
