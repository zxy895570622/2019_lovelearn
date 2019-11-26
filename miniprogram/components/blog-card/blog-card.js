// components/blog-card/blog-card.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog:Object
  },
  //监听时间 对时间进行格式化
  observers:{
    ['blog.createTime'](val){
      if(val){
        this.setData({
          _createTime: formatTime(new Date(val))
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _createTime:''
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
