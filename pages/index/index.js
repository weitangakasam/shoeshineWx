// index.js
// 获取应用实例
import util, { getUrlParams, uniqueArray } from '../../utils/util2';
import auth from '../../utils/authService';
const app = getApp();

async function uploadFiles(tempFilePaths) {
	const uploadPromises = tempFilePaths.map((file) => {
		return new Promise((resolve, reject) => {
			wx.uploadFile({
				url: app.globalData.baseUrlUpload, // 上传接口地址
				filePath: file.tempFilePath,
				name: 'file',
				formData: {
					'lt-id': wx.getStorageSync('lt-id'),
					'lt-token': wx.getStorageSync('lt-token')
				},
				success(res) {
					try {
						const img = JSON.parse(res.data).data;
						resolve(img);
					} catch (error) {
						reject(error);
					}
				},
				fail(err) {
					reject(err);
				}
			});
		});
	});

	return Promise.allSettled(uploadPromises);
}

async function handleUploadAndSubmit(tempFilePaths) {
	try {
		const uploadResults = await uploadFiles(tempFilePaths);
		const images = uploadResults
			.filter((result) => result.status === 'fulfilled')
			.map((result) => result.value);

		if (images.length === 0) {
			throw new Error('所有文件上传失败');
		}

		const { data } = await app.post('userSiteOrder/backImg', {
			img: images.join(',')
		});

		app.showToast(data);
		clearInterval(app.globalData.timer);
	} catch (err) {
		console.error('上传或提交失败:', err);
		app.showToast(err.message || '操作失败');
	}
}
Page({
	data: {
		parameter: {
			return: '0',
			title: __wxConfig.accountInfo.nickname,
			color: '#fff',
			class: 'fff',
			navH: app.globalData.navHeight
		},
		iShidden: true,
		hidden: false,
		info: {},
		userInfo: {},
		timeMoney: null,
		isOrder: false,
		url: null,
		disbale: false,
		login: false,
		dan: null,
		modeWidthFn(_this, x, X) {
			console.log(this, _this);
			if (x <= X / 2) {
				//扫码借用
				_this.goPages({
					currentTarget: {
						dataset: {
							url: '/paginate/selectCabinet/selectCabinet'
						}
					}
				});
			} else {
				wx.switchTab({
					url: '/pages/order/order'
				});
			}
		},
		list: {
			data: [],
			pageNo: 1,
			size: 10,
			currentType: 'dsd',
			id: ''
		},
		swiperHeight: 0, // 当前轮播图高度
		imageHeights: [], // 保存每张图片的高度
		currentSwiperIndex: 0 // 当前轮播图索引
	},
	toOrder() {
		wx.switchTab({
			url: '/pages/order/order'
		});
	},
	// 图片加载完成时获取高度
	onSwiperImageLoad(e) {
		const { width, height } = e.detail; // 获取图片宽高

		// 使用 wx.getWindowInfo 获取屏幕宽度
		const { windowWidth: screenWidth } = wx.getWindowInfo(); // 获取屏幕宽度
		const calculatedHeight = (height / width) * screenWidth; // 按比例计算高度

		const { index } = e.currentTarget.dataset; // 获取图片索引
		const imageHeights = this.data.imageHeights;
		imageHeights[index] = calculatedHeight; // 保存对应索引的图片高度

		this.setData({
			imageHeights
		});

		// 如果是第一张图片，初始化 swiper 高度
		if (index === 0) {
			this.setData({
				swiperHeight: calculatedHeight
			});
		}
	},

	// 轮播图切换时更新高度
	onSwiperChange(e) {
		const currentIndex = e.detail.current; // 获取当前轮播图索引
		const currentHeight = this.data.imageHeights[currentIndex]; // 获取对应图片高度

		this.setData({
			currentSwiperIndex: currentIndex,
			swiperHeight: currentHeight // 更新轮播图高度
		});
	},
	uploadImage() {
		wx.chooseMedia({
			count: 9,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const tempFilePaths = res.tempFiles;
				handleUploadAndSubmit(tempFilePaths);
			}
		});
	},
	async onLoad(e) {
		try {
			this.setData({
				isLogin: !!wx.getStorageSync('lt-id')
			});
			if (e.hasOwnProperty('q')) {
				const q = decodeURIComponent(e.q);
				const { dev_id } = getUrlParams(q.split('?')[1]);
				app.globalData.dev_id = dev_id;
				if (!wx.getStorageSync('lt-id')) {
					this.setData({
						iShidden: false
					});
				} else {
					const res = await app.post('userSiteOrder/getNowOrder');
					if (res.data.status == '使用中') {
						let e = {
							currentTarget: {
								dataset: {
									url: 'stop'
								}
							}
						};
						this.goPages(e);
						return;
					} else {
						wx.navigateTo({
							url: '/paginate/selectCabinet/selectCabinet'
						});
					}
				}
			}
		} catch (error) {
			if (error == '需要登录！') {
				this.setData({
					iShidden: false
				});
			} else {
				app.showToast(error);
			}
		}
		this.getInfo();
		if (wx.getStorageSync('userInfo').is_coupon == 'y') {
			this.setData({
				hidden: true,
				userInfo: wx.getStorageSync('userInfo')
			});
		}
		// this.orderInfo()
		//获取分类
		this.getcategoryList();
		this.getList();
	},
	async getcategoryList() {
		try {
			const { data } = await app.post('things/categoryList');
			console.log('data: ', data);
			this.setData({
				categoryList: [
					{
						name: '全部',
						id: 'dsd'
					},
					...data
				]
			});
		} catch (error) {
			app.showError(error);
		}
	},
	async getList() {
		try {
			const {
				data: {
					list: { data, pageNo, size, id }
				}
			} = this;
			const {
				data: { datas }
			} = await app.post('things/thingsList', {
				pageNo,
				category_id: id === 'dsd' ? '' : id,
				size
			});
			this.setData({
				'list.data': uniqueArray([...data, ...datas], 'name'),
				'list.pageNo': 1 + pageNo
			});
		} catch (error) {}
	},
	onImageLoad({
		currentTarget: {
			dataset: { key }
		},
		detail: { width }
	}) {
		this.setData({
			[`${key}`]: width
		});
	},
	selectCate({
		currentTarget: {
			dataset: { id, index }
		}
	}) {
		this.setData({
			'list.id': id,
			'list.pageNo': 1,
			'list.data': [],
			'list.currentType': id
		});
		this.getList();
	},
	clickByimage(e) {
		const { x } = e.detail;
		const { key } = e.currentTarget.dataset;
		const modeWidth = this.data[key];

		// 获取屏幕宽度
		const screenWidth = wx.getSystemInfoSync().windowWidth;
		// 将逻辑像素转换为物理像素
		const physicalX = x * (modeWidth / screenWidth);
		this.data[`${key}Fn`].call(this, this, physicalX, modeWidth);
	},
	onLoadFun(e) {
		this.setData({
			isLogin: !!wx.getStorageSync('lt-id')
		});
		if (wx.getStorageSync('lt-id')) {
			this.setData({
				login: false
			});
		} else {
			this.setData({
				login: true
			});
		}
		if (wx.getStorageSync('userInfo').is_coupon == 'y') {
			this.setData({
				hidden: true,
				userInfo: wx.getStorageSync('userInfo')
			});
			return;
		}

		if (this.data.url) {
			let params = {
				currentTarget: {
					dataset: {
						url: this.data.url
					}
				}
			};
			this.goPages(params);
			this.setData({
				url: null
			});
			return;
		}

		if (app.globalData.dev_id) {
			app.post('userSiteOrder/getNowOrder').then((res) => {
				if (res.data.status == '使用中') {
					let e = {
						currentTarget: {
							dataset: {
								url: 'stop'
							}
						}
					};
					this.goPages(e);
					return;
				} else {
					wx.navigateTo({
						url: '/paginate/selectCabinet/selectCabinet'
					});
				}
			});
			return;
		}
	},
	onShow() {
		this.setData({
			isLogin: !!wx.getStorageSync('lt-id')
		});
		if (wx.getStorageSync('lt-id')) {
			this.setData({
				login: false
			});
		} else {
			this.setData({
				login: true
			});
		}
		// this.setData({
		//   hidden: true
		// })
		this.orderStatus();
	},

	async getInfo() {
		const res = await app.post('banner/imgList');
		const res2 = await app.post('user/platformNoticeList');
		this.setData({
			swiper: res.data.banner,
			gonggao: res2.data,
			dan: res.data.dan
		});
	},
	getPhoneNumber(e) {
		if (e.detail.hasOwnProperty('encryptedData')) {
			this.setData({
				iShidden: false
			});
			app.globalData.mobileCode = e.detail.code;
		}
	},
	async orderStatus() {
		try {
			const res = await app.post('userSiteOrder/getNowOrder');
			if (
				JSON.stringify(res.data) == '{}' ||
				res.data.status == '已取消' ||
				res.data.status == '待付款'
			) {
				this.setData({
					isOrder: false
				});
				return;
			}
			this.setData({
				isOrder: true
			});
		} catch (error) {}
	},
	bindload(e) {
		app.bindload(e, this);
	},

	async goPages(e) {
		const url = e.currentTarget.dataset.url;
		try {
			const isLogin = await this.checkLogin(url);
			if (!isLogin) {
				return;
			}
		} catch (error) {
			app.showToast(error);
		}
		// 命令集合
		const commands = {
			null: this.handleNull,
			'/paginate/selectCabinet/selectCabinet': this.handleSelectCabinet,
			stop: this.handleStop,
			'/paginate/user/apply': this.handleUserApply,
			'/paginate/rich_text/rich_text': this.handleRichText,
			def: () => {
				wx.showModal({
					content: '正在维护',
					showCancel: false
				});
			},
			default: this.handleDefault
		};

		// 执行对应的命令
		const command = commands[url] || commands['default'];
		await command.call(this, e);
	},
	async checkLogin(url = null) {
		if (!wx.getStorageSync('lt-id') || !wx.getStorageSync('lt-token')) {
			try {
				await new Promise((resolve, reject) => {
					auth.login(
						false,
						(context = this) => {
							context.onLoadFun();
							resolve(true);
						},
						reject
					);
				});
			} catch (error) {
				wx.hideLoading();
				this.setData({
					iShidden: false,
					url
				});
				return false;
			}
		} else {
			this.setData({
				isLogin: true
			});
		}
		return true;
	},
	// 处理 "null" 的逻辑
	handleNull() {
		return wx.showModal({
			title: '提示',
			content: '功能开发中敬请期待',
			showCancel: false
		});
	},
	handleLeftClick() {
		console.log('点击了图片左侧区域');
		// 示例：跳转到左侧页面
		wx.navigateTo({
			url: '/paginate/rich_text/rich_text?type=使用规则'
		});
	},

	// 右侧区域点击事件
	handleRightClick() {
		console.log('点击了图片右侧区域');
		// 示例：跳转到右侧页面
		wx.navigateTo({
			url: '/paginate/yijian/add'
		});
	},

	// 处理 "/paginate/selectCabinet/selectCabinet" 的逻辑
	async handleSelectCabinet() {
		try {
			const res = await app.post('userSiteOrder/getNowOrder');
			if (res.data.status === '使用中') {
				this.setData({
					isOrder: true
				});
				app.showToast('您有正在进行中的订单');
				return;
			}
			this.setData({
				isOrder: false
			});
			wx.scanCode({
				success: async (a) => {
					const q = decodeURIComponent(a.result);
					const { dev_id } = getUrlParams(q.split('?')[1]);
					app.globalData.dev_id = dev_id;
					wx.navigateTo({
						url: '/paginate/selectCabinet/selectCabinet'
					});
				}
			});
		} catch (error) {
			app.showToast(error);
		}
	},

	// 处理 "stop" 的逻辑
	async handleStop() {
		try {
			const that = this;
			this.setData({
				isOrder: true
			});
			wx.showModal({
				title: '提示',
				content: '你需要开门取钥匙吗？',
				success: async (modalResult) => {
					if (modalResult.confirm && !this.data.disbale) {
						this.setData({
							disbale: true
						});
						setTimeout(
							() =>
								this.setData({
									disbale: false
								}),
							1000
						);

						try {
							const { data } = await app.post('order/order_end');
							app.showToast(data);
						} catch (error) {
							console.log(error);
							app.showError(error);
						}
					}
				}
			});
		} catch (error) {
			app.showToast(error);
		}
	},

	// 处理 "/paginate/user/apply" 的逻辑
	async handleUserApply() {
		try {
			const res = await app.post('manage/applyRecord');
			if (JSON.stringify(res.data) === '{}') {
				wx.navigateTo({
					url: '/paginate/user/apply'
				});
				return;
			}
			if (res.data === '拒绝') {
				wx.showModal({
					title: '提示',
					content: '您的申请已被管理员拒绝,请您重新申请',
					showCancel: true,
					success: (a) => {
						if (a.confirm) {
							wx.navigateTo({
								url: '/paginate/user/apply'
							});
						}
					}
				});
				return;
			}
			if (res.data === '启用') {
				const targetUrl = wx.getStorageSync('agent-token')
					? '/paginate/hehuoren/hehuoren'
					: '/paginate/shezhi/login?identity=代理';
				wx.navigateTo({
					url: targetUrl
				});
				return;
			}
			wx.showModal({
				title: '提示',
				content: res.data,
				showCancel: false
			});
		} catch (error) {
			app.showToast(error);
		}
	},

	// 处理 "/paginate/rich_text/rich_text" 的逻辑
	handleRichText(e) {
		const { id } = e.currentTarget.dataset.item;
		wx.navigateTo({
			url: `/paginate/rich_text/rich_text?type=公告&id=${id}`
		});
	},

	// 默认处理逻辑
	handleDefault(e) {
		const url = e.currentTarget.dataset.url;
		wx.navigateTo({
			url
		});
	},
	async orderInfo() {
		try {
			const res = await app.post('userSiteOrder/getNowOrder');
			let begin = new Date(res.data.begin_time).getTime();
			const info = util.useTime(begin);
			res.data.time = info.time;
			let timeMoney = {
				begin,
				price: null,
				price_y: res.data.price_y,
				base_time_x: res.data.base_time_x,
				price_z: res.data.price_z,
				time: info.time
			};
			if (info.min < res.data.base_time_x) {
				timeMoney.price = res.data.price_y;
			} else {
				const t = info.min - res.data.base_time_x;
				timeMoney.price = res.data.price_y + res.data.price_z * t;
			}
			this.setData({
				timeMoney
			});
			this.timer = setInterval(() => {
				this.useTM();
			}, 1000);
		} catch (error) {}
	},
	useTM() {
		let info = util.useTime(this.data.timeMoney.begin);
		let timeMoney = {
			price: 0,
			time: info.time
		};
		if (info.min < this.data.timeMoney.base_time_x) {
			timeMoney.price = this.data.timeMoney.price_y;
		} else {
			const t = info.min - this.data.timeMoney.base_time_x;
			timeMoney.price =
				this.data.timeMoney.price_y + this.data.timeMoney.price_z * t;
		}
		this.setData({
			timeMoney: {
				...this.data.timeMoney,
				...timeMoney
			}
		});
	},
	catchTouchMove() {
		return false;
	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		clearInterval(this.timer);
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		clearInterval(this.timer);
	}
});
