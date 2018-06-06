//app.js
App({
  onLaunch: function () {
  },
  globalData: {
  },
  //loading，防穿透,使用wx.hideLoading()解除
  loading: function (msg = '加载中') {
    wx.showLoading({
      title: msg,
      mask: true
    })
  },
  //底部信息错误提示
  showM: function (msg) {
    if (!msg) {
      wx.showToast({
        mask: true,
        title: '刷新重试',
        duration: 1200,
        image: '/images/error.png'
      })
    } else {
      wx.showToast({
        mask: true,
        title: msg,
        duration: 1200,
        image: '/images/error.png'
      })
    }
  },
  //底部信息成功提示
  showS: function (msg) {
    wx.showToast({
      mask: true,
      title: msg,
      duration: 1200,
      image: '/images/success.png'
    })
  },
  //只显示文字
  showW: function (msg) {
    wx.showToast({
      mask: true,
      title: msg,
      duration: 1200,
      icon: 'none'
    })
  },
})