var app = getApp();
let items = []; //当前显示的图片列表
let index = 0; //所点击的图片的索引
let cacheList = []; //点击过的图片缓存
let itemsPath = []; //点击保存时生成的图片临时路径
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth:0,  //屏幕宽度
    windowHeight:0, //屏幕高度
    bgImage:'http://upload.mnw.cn/2018/0115/1516008979301.jpg', //背景图
    imgPath: '', //canvas背景图临时路径
    canvasImgUrl: '', //canvas生成的图片临时路径
    bgWidth:0,  //画布宽度
    bgHeight:0, //画布高度
    showCanvas:0, //canvas显隐
    itemList: [
    //   {
    //   id: 1,
    //   image: 'http://upload.mnw.cn/2018/0115/1516008979301.jpg',//图片地址  
    //   top: 100,//初始图片的位置   
    //   left: 100,
    //   x: 150, //初始圆心位置，可再downImg之后又宽高和初始的图片位置得出  
    //   y: 150,
    //   scale: 1,//缩放比例  1为不缩放  
    //   angle: 0,//旋转角度  
    //   rotate: 0,
    //   active: false, //判定点击状态  
    //   width: 100,
    //   height: 100
    // }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //保存到全局变量，以后每次移动或者旋转缩放都先保存到该变量，结束时再setData
    items = this.data.itemList;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    //获取屏幕宽高
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          bgWidth:res.windowWidth*0.8,
          bgHeight:res.windowHeight*0.8
        })
      },
    })
  },
  //读取图片操作
  loadImg: function (e) {

  },
  //图片开始点击时，记录图片的点击时的坐标值
  WraptouchStart: function (e) {
    console.log(e)
    console.log(items)
    for (let i = 0; i < items.length; i++) {  //旋转数据找到点击的  
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        index = i;   //记录下标  
        items[index].active = true;  //开启点击属性  
      }
    }
    items[index].lx = e.touches[0].clientX;  // 记录点击时的坐标值  
    items[index].ly = e.touches[0].clientY;
    this.setData({   //赋值   
      itemList: items
    })
  },
  //图片拖动时，记录拖动的坐标到页面全局变量中
  WraptouchMove: function (e) {
    //移动时的坐标值也写图片的属性里  
    items[index]._lx = e.touches[0].clientX;
    items[index]._ly = e.touches[0].clientY;

    //追加改动值  
    items[index].left += items[index]._lx - items[index].lx;  // x方向  
    items[index].top += items[index]._ly - items[index].ly;    // y方向  
    items[index].x += items[index]._lx - items[index].lx;
    items[index].y += items[index]._ly - items[index].ly;

    //把新的值赋给老的值  
    items[index].lx = e.touches[0].clientX;
    items[index].ly = e.touches[0].clientY;
    this.setData({//赋值就移动了  
      itemList: items
    })
  },
  WraptouchEnd: function (e) {
    //console.log('end',items)
  },

  // 触摸开始事件  items是this.data.itemList的全局变量，便于赋值  所有的值都应给到对应的对象里  
  touchStart: function (e) {
    //console.log(e);return;
    //找到点击的那个图片对象，并记录  
    for (let i = 0; i < items.length; i++) {
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        console.log('e.currentTarget.dataset.id', e.currentTarget.dataset.id)
        index = i;
        console.log(items[index])
        items[index].active = true;
      }
    }
    //获取作为移动前角度的坐标  
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    //移动前的角度  
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
    //获取图片半径  
    items[index].r = this.getDistancs(items[index].x, items[index].y, items[index].left, items[index].top)
  },
  // 触摸移动事件    
  touchMove: function (e) {
    //记录移动后的位置  
    items[index]._tx = e.touches[0].clientX;
    items[index]._ty = e.touches[0].clientY;
    //移动的点到圆心的距离  
    items[index].disPtoO = this.getDistancs(items[index].x, items[index].y, items[index]._tx - this.data.windowWidth * 0.125, items[index]._ty - 10)

    items[index].scale = items[index].disPtoO / items[index].r; //手指滑动的点到圆心的距离与半径的比值作为图片的放大比例  
    if (Math.abs(items[index].scale) > 2) { //设置最大缩放为2倍
      items[index].scale = 2;
    }
    if (Math.abs(items[index].scale) < 0.5) { //设置最小缩放为0.5倍
      items[index].scale = 0.5;
    }
    items[index].oScale = 1 / items[index].scale;//图片放大响应的右下角按钮同比缩小  

    //移动后位置的角度  
    items[index].angleNext = this.countDeg(items[index].x, items[index].y, items[index]._tx, items[index]._ty)
    //角度差  
    items[index].new_rotate = items[index].angleNext - items[index].anglePre;

    //叠加的角度差  
    items[index].rotate += items[index].new_rotate;
    items[index].angle = items[index].rotate; //赋值  

    //用过移动后的坐标赋值为移动前坐标  
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)

    //赋值setData渲染  
    this.setData({
      itemList: items
    })
  },
  touchEnd: function (e) {},
  /*  
     *参数1和2为图片圆心坐标  
     *参数3和4为手点击的坐标  
     *返回值为手点击的坐标到圆心的角度  
     */
  countDeg: function (cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    var to = Math.abs(ox / oy);
    var angle = Math.atan(to) / (2 * Math.PI) * 360;//鼠标相对于旋转中心的角度  
    //console.log("ox.oy:", ox, oy, angle)
    if (ox < 0 && oy < 0)//相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系    
    {
      angle = -angle;
    } else if (ox <= 0 && oy >= 0)//左下角,3象限    
    {
      angle = -(180 - angle)
    } else if (ox > 0 && oy < 0)//右上角，1象限    
    {
      angle = angle;
    } else if (ox > 0 && oy > 0)//右下角，2象限    
    {
      angle = 180 - angle;
    }

    return angle;
  },
  //计算触摸点到圆心的距离
  getDistancs(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    return Math.sqrt(
      ox * ox + oy * oy
    );
  },
  //生成图片
  createImg: function (e) {
    let index = items.length;
    let divLeft = (this.data.windowWidth - this.data.bgWidth) / 2; //屏幕与画布的X轴距离
    items.push(
      {
        id: index+1,
        image: 'http://upload.mnw.cn/2018/0115/1516008979301.jpg',//图片地址  
        top: this.data.bgHeight/2-50,//初始图片Y坐标，根据画布高/2-图片高/2   
        left: divLeft + (this.data.bgWidth / 2) - 50 - divLeft,//初始图片X坐标,因为div是相对定位，所以计算是要多减一次移动的距离
        x: divLeft + (this.data.bgWidth / 2) - divLeft , //初始圆心位置，可再downImg之后又宽高和初始的图片位置得出  
        y: this.data.bgHeight / 2,
        scale: 1,//缩放比例  1为不缩放  
        angle: 0,//旋转角度 
        rotate: 0, //旋转值
        active: false, //判定点击状态  
        width: 100, //预设生成图片的宽度
        height: 100 //预设生成图片的高度
      }
    )
    this.setData({ itemList: items })
  },
  //删除图片
  deleteItem: function (e) {
    let index = e.currentTarget.dataset.id;
    for (let i = 0; i < items.length; i++) {
      if (items[i].id == index) {
        items.splice(i, 1)
      }
    }
    this.setData({ itemList: items })
  },
  //点击画布区域取消聚焦
  closeMask:function(e){
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        items[i].active = false;
      }
      this.setData({
        itemList: items,
      })
    }
  },
  //显隐canvas
  toggleCanvas:function(e){
    this.setData({showCanvas:!this.data.showCanvas})
  },
  //生成canvas按钮事件
  createCanvas: function (e) {
    app.loading();
    let that = this;
    wx.downloadFile({
      url: this.data.bgImage,
      success: function (res) {
        that.setData({ imgPath: res.tempFilePath, showCanvas: 1 }) //下载背景图
        itemsPath = [];
        that.downItems(); //下载其他图片
      },
      fail: function (res) {
        console.log('下载背景图失败', res)
        wx.hideLoading();
        app.showM('保存失败')
      }
    })
  },
  //下载其他canvas图片到缓存
  downItems: function () {
    let that = this;
    if (items.length > 0) { //如果有商品就执行保存
      let count = 0;
      for (let i = 0; i < items.length; i++) { //循环下载每张图片
        wx.downloadFile({
          url: items[i].image,
          success: function (res) {
            //console.log('download成功',res)
            itemsPath[i] = res.tempFilePath;
            if (count == items.length - 1) { //下载完后开始绘制图片
              that.saveCanvas();
            } else { count = count + 1; }
          },
          fail: function (res) {
            console.log('下载背景图失败', res)
            wx.hideLoading();
            app.showW('第' + (count + 1) + '张商品载入保存失败');
          }
        })
      }
    } else {
      wx.hideLoading();
      that.saveCanvas();
    }
  },
  //把图片临时路径用于绘制图片
  saveCanvas: function () {
    let that = this;
    //console.log(that.data.imgPath)
    const ctx = wx.createCanvasContext('firstCanvas');
    ctx.drawImage(that.data.imgPath, 0, 0, that.data.bgWidth*0.75, that.data.bgHeight*0.75)
    ctx.save()
    for (let i = 0; i < items.length; i++) { //循环绘图
      ctx.translate(items[i].left * 0.75 + items[i].width * 0.75 / 2, items[i].top * 0.75 + items[i].height * 0.75 / 2)
      ctx.rotate(items[i].angle * Math.PI / 180)
      ctx.scale(items[i].scale, items[i].scale);
      ctx.drawImage(itemsPath[i], -(items[i].width * 0.75 / 2), -(items[i].height * 0.75 / 2), items[i].width * 0.75, items[i].height * 0.75)
      ctx.restore()
      ctx.save()
    }
    ctx.draw(true, this.newCanvasImg); //绘制完成,保存为临时图片路径
  },
  //画布转化为图片
  newCanvasImg: function () {
    let that = this;
    wx.canvasToTempFilePath({ //把整个canvas画布转化为图片
      x: 0,
      y: 0,
      width: that.data.bgWidth,
      height: that.data.bgHeight,
      destWidth: that.data.bgWidth,
      destHeight: that.data.bgHeight,
      canvasId: 'firstCanvas',
      success: function (res) {
        that.setData({ canvasImgUrl: res.tempFilePath, })
        wx.hideLoading()
        //console.log('pic', that.data.canvasImgUrl)
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        app.showM('保存失败');
      }
    })
  },
  //保存图片到相册
  saveBtn: function (e) {
    let that = this;
    app.loading();
    wx.saveImageToPhotosAlbum({ //保存到相册
      filePath: that.data.canvasImgUrl,
      success: function (res) {
        console.log('res2', res)
        app.showS('保存成功')
      },
      fail: function (res) {
        console.log(res)
        app.showM('保存失败')
      }
    })
  },
})