// pages/blog-edit/blog-edit.js
//最大输入字数
const MAX_WORDS_NUM = 140
//最大图片各户
const MAX_IMAGE_NUM = 9
//初始化数据库
const db = wx.cloud.database()
//当前输入的文字内容
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //当前输入字数
    wordsNum: 0,
    footerBootom: 0,
    images: [],
    selectPhoto: true, //添加图片满了后图片选择工具隐藏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    userInfo = options
  },
  onInput(event) {
    // console.log(event.detail.value)
    let wordsNum = event.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  //获取焦点
  onFocus(event) {
    //console.log(event)
    this.setData({
      footerBootom: event.detail.height

    })

  },
  //失去焦点
  onBlur() {
    this.setData({
      footerBootom: 0
    })
  },
  onChooseImage() {
    //还能在选择max个图片
    let max = MAX_IMAGE_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        //console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        //选择后还能选max张图片
        max = MAX_IMAGE_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },
  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMAGE_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },
  onPriviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc,
    })
  },
  send() {
    //2.数据上传到云数据库，数据：所写内容，图片
    //图片存到云存储会返回 findID 云文件的唯一标识
    //1.云数据库只存 发表者的昵称、头像 和findID

    //判断文字不为空 (trim去字符串空格)  return 不执行之后内容
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入',
        content: '',
      })
      return
    }
    //等待提示
    wx.showLoading({
      title: '发布中',
    })
    let promiseArr = []

    let fileIds = []
    //图片上传
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        //拿出文件扩展名(正则表达式) \表示转义  \w表示字母数字下划线
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random * 100000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res.fileID)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(res)
            reject()
          }
        })
      })
      promiseArr.push(p)

    }
    //存入云数据库  （...表示取到每一项 userInfo存用户信息是个对象）
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate(), //取到服务器时间
        }
      }).then((res) => {
        //隐藏掉等待提示
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        //返回blog页面,并且刷新blog
        wx.navigateBack({
          
        })
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})