function t(t, o, a) {
    return o in t ? Object.defineProperty(t, o, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : t[o] = a, t;
}

var o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
    return typeof t;
} : function(t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
}, a = getApp();

Page({
    data: {
        options: null,
        order_id: '',
        goodsList: ['1'],
        formData: [{
            image_list: []
        }],
        scoreList:[
            { 'name': '店铺','stars':0}
        ],
    },
    submitDisable: !1,
    onLoad: function(t) {
        this.setData({
            order_id: t.order_id
        })
    },
    getGoodsList: function() {
        var t = this;
        a._get("user.comment/order", {
            order_id: this.data.options.order_id
        }, function(o) {
            var a = o.data.goodsList;
            t.setData({
                goodsList: a,
                formData: t.initFormData(a)
            });
        });
    },
    stars: function (e) {
        var index = e.target.dataset.index;
        var indexw = e.target.dataset.indexw;
        this.data.scoreList[indexw].stars = index
        this.setData({
          scoreList: this.data.scoreList
        })
        this.setScore(0, index)
    },
    initFormData: function(t) {
        var o = [];
        return t.forEach(function(t) {
            o.push({
                goods_id: t.goods_id,
                order_goods_id: t.order_goods_id,
                score: 10,
                content: "",
                image_list: [],
                uploaded: []
            });
        }), o;
    },
    setScore: function(index, score) {
        this.setData(t({}, "formData[" + index + "].shop_mark", score));
    },
    contentInput: function(o) {
        var a = o.currentTarget.dataset.index;
        this.setData(t({}, "formData[" + a + "].shop_content", o.detail.value));
    },
    chooseImage: function(o) {
        var a = this, e = o.currentTarget.dataset.index, i = a.data.formData[e].image_list;
        wx.chooseImage({
            count: 6 - i.length,
            sizeType: [ "original", "compressed" ],
            sourceType: [ "album", "camera" ],
            success: function(o) {
                a.setData(t({}, "formData[" + e + "].image_list", i.concat(o.tempFilePaths)));
            }
        });
    },
    deleteImage: function(o) {
        var a = o.currentTarget.dataset, e = this.data.formData[a.index].image_list;
        e.splice(a.imageIndex, 1), this.setData(t({}, "formData[" + a.index + "].image_list", e));
    },
    submit: function() {
        var t = this, o = t.data.formData;
        if (!0 === t.submitDisable) return !1;
        t.submitDisable = !0, wx.showLoading({
            title: "正在处理...",
            mask: !0
        });
        
        var e = function(o) {
            console.log("fromPostCall"), console.log(o), a._post_form("order/addReview", {
                order_id: t.data.order_id,
                shop_content: o[0].shop_content,
                shop_images: o[0].image_list.join(','),
                shop_mark: o[0].shop_mark
            }, function(t) {
                wx.showToast({
                    title: t.data,
                    icon: 'success',
                    duration: 2000,
                    success: function(){
                      setTimeout(function(){
                        wx.navigateBack();
                      },2000)
                    }
                  })

            }, !1, function() {
                wx.hideLoading(), t.submitDisable = !1;
            });
        }, i = 0;
        o.forEach(function(t, o) {
            "" !== t.content && (i += t.image_list.length);
        }), i > 0 ? t.uploadFile(i, o, e) : e(o);
    },
    uploadFile: function(t, e, i) {
        var n = {
            'lt-id': wx.getStorageSync('lt-id'),
            'lt-token': wx.getStorageSync('lt-token')
        }, r = 0;
        console.log(e)
        e.forEach(function(s, c) {
            "" !== s.content && s.image_list.forEach(function(c, d) {
                wx.uploadFile({
                    url: a.api_root + "upload/shop_upload",
                    filePath: c,
                    name: "img",
                    formData: n,
                    success: function(t) {
                        
                        var a = "object" === o(t.data) ? t.data : JSON.parse(t.data);
                        s.image_list[d] = a.data;
                    },
                    complete: function() {
                        t === ++r && (console.log("upload complete"), i && i(e));
                    }
                });
            });
        });

    }
});