import {baseUrl} from '../config'
export default function request(api, method, data = {},) {
  // 配置请求根路径
  if (method == 'post') {
    var header = 'application/x-www-form-urlencoded'
  }
  if (wx.getStorageSync('agent-id')) {
    data['agent-id'] = wx.getStorageSync('agent-id'),
    data['agent-token'] = wx.getStorageSync('agent-token')
  }
  if (wx.getStorageSync('lt-id')) {
    data['lt-id'] = wx.getStorageSync('lt-id'),
    data['lt-token'] = wx.getStorageSync('lt-token')
  }
  return new Promise((reslove, reject) => {
    wx.request({
      url: baseUrl + api,
      method: method || 'GET',
      header: {
        'content-type': header || 'application/json',
      },
      data: data || {},
      success: (res) => {
        if (res.data.code == "000"){
          reslove(res.data, res);
        } else if (res.data.code == "999"){
          if (res.data.data == '需要登陆' || res.data.data == '需要登录！') {
            if (!wx.getStorageSync('toLogin')) {
              wx.removeStorageSync('lt-id')
              wx.removeStorageSync('lt-token')
              wx.removeStorageSync('avatarUrl')
              wx.removeStorageSync('nickName')
              wx.removeStorageSync('openid')
              wx.removeStorageSync('userInfo')
              // wx.clearStorageSync()
            }
          }
          if (res.data.data == '代理商需要登录！' || res.data.data == '账号异常！') {
            wx.removeStorageSync('agent-id')
            wx.removeStorageSync('agent-token')
            wx.removeStorageSync('agent_info')
            wx.showModal({
              title: '提示',
              content: res.data.data,
              showCancel: false,
              success: res2 => {
                if (res2.confirm) {
                  wx.switchTab({
                    url: '/pages/user/user',
                  })
                  // wx.reLaunch({
                  //   url: '/paginate/shezhi/shezhi',
                  // })
                }
              }
            })
            // wx.redirectTo({
            //   url: '/paginate/shezhi/login?identity=代理',
            // })
          }
          if (res.data.data == '商家需要登录！') {
            wx.removeStorageSync('shoper-id')
            wx.removeStorageSync('shoper-token')
            wx.removeStorageSync('shoper_info')
            wx.showModal({
              title: '提示',
              content: res.data.data,
              showCancel: false,
              success: res2 => {
                if (res2.confirm) {
                  wx.reLaunch({
                    url: '/paginate/user/user',
                  })
                }
              }
            })
          }
          reject(res.data.data)
         } else {
          reslove(res, res);
        }
      },
      fail: (msg) => {
        reject('请求失败');
      }
    })
  });
}

['options', 'get', 'post', 'put', 'head', 'delete', 'trace', 'connect'].forEach((method) => {
  request[method] = (api, data) => request(api, method, data)
});

