export default {
  getAllTags
}

function getOpenid(rootUrl) {
  return new Promise( resolve => {
    wx.login({
      success: res => {
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session',
          data: {
            js_code: res.code,
            appid: 'wxc3f2993a102df7e5',
            secret: '47a6420e1ff50a847503df05a611d460',
            grant_type: 'authorization_code'
          },
          success: e => {
            wx.setStorageSync('openid',e.data.openid)
            register(rootUrl).then(e => resolve(true))
          },
          fail: err => {
            resolve(false)
          }
        })
      },
      fail: res => {
        resolve(false)
      }
    })
  })
}
function getAllTags(rootUrl) {
  return new Promise(resolve => {
    const openid = wx.getStorageSync('openid')
    if(openid)
      wx.request({
        url: rootUrl + 'allMyTags',
        data: { openid },
        success: res => {
          resolve(res.data)
        }
      })
    else getOpenid(rootUrl).then(() => getAllTags(rootUrl).then(e => resolve(e)))
  })
}
function register(rootUrl){
  return new Promise(resolve => {
    wx.request({
      url: rootUrl + 'register',
      data:{ openid: wx.getStorageSync('openid') },
      success: res => {
        if(res.data === 'ok') resolve('ok')
      }
    })
  })
}

