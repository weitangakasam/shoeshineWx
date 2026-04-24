import { baseUrlUpload } from "../config"
/**
 * 压缩图片
 * @param {string} path 图片地址
 * @return {Promise<string>} 压缩后图片地址
 */
function compressImages(path, next) {
	const fs = wx.getFileSystemManager();
	return new Promise((resolve, reject) => {
		fs.getFileInfo({
			filePath: path,
			success: function ({ size }) {
				if (next && next === size) {
					resolve(path);
					return;
				}
				if (size > 1048576) {
					resolve(_utilCompress(path, size));
				} else {
					resolve(path);
				}
			},
			fail: reject
		});
	});
}

/**
 * Compresses an image using the given id and path.
 *
 * @param {any} id - The identifier of the image.
 * @param {string} path - The path to the image file.
 * @return {Promise<void>} A promise that resolves when the image is compressed.
 */
async function _utilCompress(path, next) {
	return new Promise((resolve, reject) => {
		wx.compressImage({
			src: path,
			quality: 80,
			success: ({ tempFilePath }) => {
				resolve(compressImages(tempFilePath, next));
			},
			fail: (err) => {
				reject(err);
			}
		});
	});
}

function _utilSize(path) {
	return new Promise((resolve, reject) => {
		wx.getImageInfo({
			src: path,
			success: ({ width, height, type }) => {
				resolve({ width, height, type });
			},
			fail: reject
		});
	});
}
const app = getApp();
function upload(tempFiles) {
	return Promise.allSettled(
		Array.from(tempFiles).map(({ tempFilePath }) => {
			return compressImages(tempFilePath).then((p) => {
				return new Promise((resolve, reject) => {
					try {
						wx.uploadFile({
							url: baseUrlUpload, //仅为示例，非真实的接口地址
							filePath: p,
							name: 'file',
							formData: {
								'lt-id': wx.getStorageSync('lt-id'),
								'lt-token': wx.getStorageSync('lt-token')
							},
							success(res) {
								console.log(
									'%c Line:73 🍉',
									'color:#4fff4B',
									'上传成功'
								);
								const img = JSON.parse(res.data).data;
								console.log(
									'%c Line:70 🥥 img',
									'color:#f5ce50',
									img
								);
								resolve(img);
							},
							fail: (err) => {
								reject(err);
							}
						});
					} catch (error) {
						reject(error);
					}
				});
			});
		})
	);
}
export default upload;
