// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//载入tcb router
const TcbRouter = require('tcb-router')
//初始化数据库  
const db = cloud.database()
const blogCollection = db.collection('blog')
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  app.router('list',async(ctx,next)=>{
    let blogList= await blogCollection.skip(event.start).limit(event.count)
    .orderBy('createTime','desc').get().then((res)=>{
      return res.data
    })
    ctx.body=blogList
  })
  return app.serve()
}