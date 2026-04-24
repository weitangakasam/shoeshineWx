class AuthService {
	static instance = null;
	isLoginInProgress = false;
	get app() {
		return getApp()
	}
	constructor() {
		if (AuthService.instance) {
			return AuthService.instance;
		}
		this.isLoginInProgress = false;
		this.data = {}; // Initialize this.data to avoid undefined errors
		AuthService.instance = this;
	}
	/**
	 * 登录方法，处理用户登录逻辑。
	 * @param {boolean} shouldRegister - 是否没有登陆状态时尝试注册。
	 * @param {Function|null} callback - 登录成功后的回调函数。
	 * @param {Function|null} failCallback - 登录失败后的回调函数。
	 */
	async login(shouldRegister = false, callback = () => {}, failCallback = () => {}) {
		if (!wx.getStorageSync("lt-id") || !wx.getStorageSync("lt-token")) {
			//校验登陆状态
			if (this.isLoginInProgress) {
				return;
			}
			this.isLoginInProgress = true;

			try {
				const {
					code
				} = await new Promise((resolve, reject) => {
					wx.login({
						success: resolve,
						fail: reject,
					});
				});

				const {
					userInfo
				} = await new Promise((resolve, reject) => {
					wx.getUserInfo({
						success: resolve,
						fail: reject,
					});
				});
				if (code) {
					const params = {
						code: code,
					};
					const localId = wx.getStorageSync("lt-id");
					if (localId) return; //如果当前已经有登陆id不进行尝试

					let data;
					try {
						const response = await this.app.post("wXMiNiProgram/authorize", params);
						data = response.data;
					} catch (error) {
						console.error("Network error during authorization:", error);
						throw new Error("Authorization failed due to network issues.");
					}
					if (!data) {
						throw new Error("Invalid response received from authorization.");
					}
					if (!data.token) {
						if (shouldRegister) {
							await this.register(data, userInfo, userInfo.avatarUrl, callback);
						} else {
              //如果没有token，并且不注册，就会reject
							failCallback();
						}
					} else {
						this.app.globalData.token = data.token;
						this.app.globalData.isLogin = true;
						this.app.globalData.userInfo = data;
						wx.setStorageSync("isLogin", true);
						wx.setStorageSync("userInfo", userInfo);
						wx.setStorageSync("open_id", data);
						wx.setStorageSync("lt-id", data.user_id);
						wx.setStorageSync("lt-token", data.token);
						const pages = getCurrentPages();
						if (pages.length > 0) {
							const currPage = pages[pages.length - 1];
							if (currPage && currPage.data.iShidden != undefined) {
								currPage.setData({
									iShidden: true
								});
							}
						}
						if (typeof callback === "function") {
							//登陆成功执行回调
							callback();
						}
					}
				}
			} catch (err) {
				console.error(err);
			} finally {
				this.isLoginInProgress = false;
			}
		}
	}
	/**
	 * 使用用户的微信 OpenID 和用户信息注册用户。
	 *
	 * @async
	 * @function
	 * @param {string} open_id - 用户的微信 OpenID。
	 * @param {Object} userInfo - 用户信息。
	 * @param {string} userInfo.nickName - 用户的昵称。
	 * @param {string} avatarUrl - 用户头像图片的 URL。
	 * @param {Function} [callback=() => {}] - 可选的回调函数，在注册成功后执行。
	 * @throws {Error} 如果由于网络问题或无效响应导致注册失败，则抛出错误。
	 * @returns {void}
	 */
	async register(open_id, userInfo, avatarUrl, callback = () => {}) {
		let params = {
			open_id: open_id,
			headimgurl: avatarUrl,
			nickname: userInfo.nickName,
			mobile_code: this.app.globalData.mobileCode,
			dev_id: this.app.globalData.dev_id,
		};
		if (wx.getStorageSync("invite_mobile")) {
			params.invite_mobile = wx.getStorageSync("invite_mobile");
			if (params.invite_mobile === this.data?.phone) {
				params.invite_mobile = "";
			}
		}
		try {
			let data;
			try {
				const response = await this.app.post("wXMiNiProgram/signUpByWeiXin", params);
				data = response.data;
			} catch (error) {
				console.error("Network error during registration:", error);
				throw new Error("Registration failed due to network issues.");
			}
			if (!data) {
				throw new Error("Invalid response received from registration.");
			}
			const {
				token,
				user_id,
				open_id
			} = data;
			wx.setStorageSync("lt-token", token);
			wx.setStorageSync("lt-id", user_id);
			const userData = {
				nickName: userInfo.nickName,
				avatarUrl: avatarUrl,
				openId: open_id,
				mobile: userInfo.nickName,
				user_id,
			};
			wx.setStorageSync("userInfo", userData);
			Object.assign(this.app.globalData, {
				user_id,
				token,
				isLogin: true,
				userInfo: data,
			});
			wx.setStorageSync("isLogin", true);
			const pages = getCurrentPages();
			if (pages.length > 0) {
				const currPage = pages[pages.length - 1];
				if (currPage && currPage.data.iShidden != undefined) {
					currPage.setData({
						iShidden: true
					});
				}
			}
			if (typeof callback === "function") {
				//登陆成功执行回调
				callback();
			}
		} catch (err) {
			console.error("Error during registration:", err);
			throw new Error(`Registration failed: ${err.message}`);
		}
	}
}
export default new AuthService();