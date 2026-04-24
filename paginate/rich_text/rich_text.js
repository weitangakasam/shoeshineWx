// paginate/rich_text/rich_text.js
const app = getApp();
// 富文本插件
const wxParse = require('../../wxParse/wxParse.js');
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '',
			color: '#000',
			class: 'app_bg_title',
			navH: app.globalData.navHeight
		},
		info: '',
		id: null
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			'parameter.title': options.type
		});
		// if (options.type == '公告') {
		//   this.setData({
		//     id: options.id
		//   })
		// }
		this.getInfo(options.type);
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	async getInfo(e) {
		try {
			switch (e) {
				case '关于我们':
					const about = await app.post('user/aboutUs');
					about.data.description = wxParse.wxParse('content', 'html', about.data.description, this, 0);
					this.setData({ info: about.data });
					break;
				case '公告':
					const gonggao = await app.post('user/platformNoticeList', { id: this.data.id });
					// about.data.description = wxParse.wxParse('content', 'html', about.data.description, this, 0);
					// this.setData({ info: about.data, })
					break;
				case '使用规则':
					const guize = await app.post('user/aboutUse');
					guize.data.description = wxParse.wxParse('content', 'html', guize.data.description, this, 0);
					this.setData({ info: guize.data });
					break;
				case '联系我们':
					{
						const guize = await app.post('user/aboutJiFei');
						guize.data.description = wxParse.wxParse('content', 'html', guize.data.description, this, 0);
						this.setData({ info: guize.data });
					}
					break;
			}
		} catch (error) {
			console.log(error);
			app.showToast(error);
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
});
