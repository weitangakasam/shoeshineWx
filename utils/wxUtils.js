// import { TOKENNAME } from './../config.js';

// 微信小程序获取手机号 加密参数 encryptedData
const getPhoneNumber = encryptedData => {
  if (e.detail.hasOwnProperty('encryptedData')) {
    this.setData({
      iShidden: false
    })
    app.globalData.mobileCode = e.detail.code
  }
  return
}

module.exports = {
  getPhoneNumber,
}
