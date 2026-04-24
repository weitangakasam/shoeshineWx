/** @format */

// paginate/alarmMessage/alarmMessage.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '柜子列表',
			color: '#000',
			class: 'app_bg_title',
			navH: app.globalData.navHeight
		},
		postdata: [],
		statuslist: [],
		ishowdata: false,
		totalPage: 1,
		isHuoDong: false,
		statusdata: '',
		net_site_id: ''
		// windowHeight:'100vh'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		// wx.getSystemInfo({
		//   success:function(res){
		//     that.setData({
		//       windowHeight:res.windowHeight
		//     })
		//   }
		// })
		this.setData({
			net_site_id: options.net_site_id
		});
		const { box_gwid } = options;
		this.setData({
			box_gwid
		});
		this.edit();
		// if(options.vmdevice_id){
		//   this.getdata()
		// }else{
		//   wx.showToast({
		//     title: '加载失败',
		//   })
		//    wx.navigateBack({
		//       delta: 1,
		//   })
		// }
		// this.getdata();
	},
	async lock_status_query({
		currentTarget: {
			dataset: { box_gwid }
		}
	}) {
		const url = 'manageBox/getLockStatus';
		try {
			wx.showLoading({
				mask: true,
				title: '查询中...'
			});
			const { data } = await app.post(url, {
				box_gwid
			});
			wx.hideLoading();

			const locks = Object.entries(data).map(([key, value], index) => [
				key,
				value,
				index + 1,
				box_gwid
			]);
			this.setData({
				isHuoDong: true,
				statusdata: locks,
				huo_dong_title: '4G锁状态列表'
			});
		} catch (error) {
			wx.hideLoading();
			this.setData({
				isHuoDong: false
			});
			app.showToast(error, 'error');
		}
	},
	async opendoor(e) {
		let agent_id = wx.getStorageSync('agent-id');
		let agent_token = wx.getStorageSync('agent-token');
		let data = {
			agent_id,
			agent_token,
			box_gwid: e.currentTarget.dataset.item.box_gwid
		};

		try {
			wx.showLoading({
				mask: true,
				title: '开门中...'
			});
			const res = await app.post('manageBox/openUsedDoor', data);
			wx.hideLoading();
			if (res.data === '一键开启使用过的柜门成功') {
				this.show();
				wx.showToast({
					title: '开门成功',
					icon: 'success',
					duration: 500
				});
			} else {
				this.show();
				wx.showToast({
					title: '更新失败，重新打开此界面',
					icon: 'error',
					duration: 1000
				});
			}
		} catch (error) {
			wx.hideLoading();
			app.showToast(error, 'error');
		}
	},
	getdata() {
		let agent_id = wx.getStorageSync('agent-id');
		let lt_id = wx.getStorageSync('lt-id');
		let data = {
			agent_id,
			lt_id,
			net_site_id: this.data.net_site_id
		};
		let that = this;
		app.post('manageBox/list', data).then((res) => {
			that.setData({
				postdata: res.data
			});

			return;
		});
	},
	async edit() {
		const agent_id = wx.getStorageSync('agent-id');
		const agent_token = wx.getStorageSync('agent-token');
		const data = {
			agent_id,
			agent_token,
			box_gwid: this.data.box_gwid
		};

		try {
			const res = await app.post('manageNetSite/getLockStatus', data);
			const datas = res.data;
			const cabinetString = Object.entries(datas).map(([key, value]) => [
				key,
				value
			]);

			this.setData({
				isHuoDong: true,
				statusdata: cabinetString,
				huo_dong_title: '柜门状态列表'
			});
		} catch (error) {
			this.setData({
				isHuoDong: false
			});
			app.showToast(error);
			return;
		}
	},
	banbu() {
		this.setData({
			isHuoDong: false
		});
	},

	async initializationDoorStatus(e) {
		const agent_id = wx.getStorageSync('agent-id');
		const agent_token = wx.getStorageSync('agent-token');
		const box_gwid = e.currentTarget.dataset.item.box_gwid;
		const data = { agent_id, agent_token, box_gwid };

		try {
			const res = await app.post(
				'manageBox/initializationDoorStatus',
				data
			);
			if (res.data === '初始化柜门使用状态成功') {
				setTimeout(() => {
					this.show();
					wx.showToast({
						title: '初始化成功',
						icon: 'success',
						duration: 500
					});
				}, 500);
			} else {
				this.show();
				wx.showToast({
					title: '更新失败，重新打开此界面',
					icon: 'error',
					duration: 1000
				});
			}
		} catch (error) {
			app.showToast(error);
		}
	},
	async del(e) {
		const agent_id = wx.getStorageSync('agent-id');
		const agent_token = wx.getStorageSync('agent-token');
		const box_gwid = e.currentTarget.dataset.item.box_gwid;

		const data = {
			agent_id,
			agent_token,
			box_gwid
		};

		try {
			const res = await app.post('manageBox/del', data);

			if (res.data === '柜子撤机成功') {
				setTimeout(() => {
					this.show();
					wx.showToast({
						title: '柜子撤机成功',
						icon: 'success',
						duration: 500
					});
				}, 500);
			} else {
				this.show();
				wx.showToast({
					title: '更新失败，重新打开此界面',
					icon: 'error',
					duration: 1000
				});
			}
		} catch (error) {
			app.showToast(error);
		}
	},
	show() {
		// this.getdata();
	},
	async unlock({
		currentTarget: {
			dataset: { box_gwid, index }
		}
	}) {
		const url = 'manageBox/openLock';
		try {
			wx.showLoading({
				mask: true,
				title: '开锁中...'
			});
			const { data } = await app.post(url, {
				box_gwid,
				lock_flag: index
			});
			wx.hideLoading();
			app.showToast(data);
			this.setData({
				[`statusdata[${index - 1}][1]`]: '开启'
			});
		} catch (error) {
			wx.hideLoading();
			app.showToast(error);
		}
	},
	linkTo(e) {
		if (this.data.postdata.length === 0) app.linkTo(e);
	},
	goPages(e) {
		let url = e.currentTarget.dataset.url;
		if (url == '/paginate/hehuoren/shebeiAdd') {
			wx.scanCode({
				success: (res) => {
					let arr = [];
					if (
						res.result.indexOf('type') != '-1' &&
						res.result.indexOf('%26') != '-1'
					) {
						arr = res.result
							.split('%3F')[1]
							.split('%26')
							.map((item) => {
								return item.split('%3D')[1];
							});
					} else if (
						res.result.indexOf('type') != '-1' &&
						res.result.indexOf('&') != '-1'
					) {
						arr = res.result
							.split('?')[1]
							.split('&')
							.map((item) => {
								return item.split('=')[1];
							});
					}
					if (arr[1] != '1' && arr[1] != '2') {
						wx.showModal({
							title: '提示',
							content: '二维码错误',
							showCancel: false
						});
						return;
					}
					//
					wx.navigateTo({
						url:
							url +
							'?dev_id=' +
							arr[0] +
							'&addr_id=' +
							this.data.addr_id +
							'&type=' +
							arr[1]
					});
				}
			});
		} else {
			if (this.data.addr_id) {
				wx.navigateTo({
					url: url + '?addr_id=' + this.data.addr_id
				});
			} else {
				wx.navigateTo({
					url: url
				});
			}
		}
	},
	// loadMore(){
	//
	// },
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},
	// bindscrolltolower() {
	//   if (this.data.params.pageNo < this.data.totalPage) {
	//     this.setData({
	//       'params.pageNo': this.data.params.pageNo + 1
	//     })
	//     this.getdata()

	//   }
	// },
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		//检查是否有新添的柜子列表
		// this.getdata();
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {
		// this.getdata()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {
		// this.data.params.pageNo++
		// this.getdata()
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {}
});
