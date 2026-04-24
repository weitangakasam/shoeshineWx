module.exports = {
    "env": "production",
    "type": "wx-alipay",
    "fromId": 1100,
    "isReport": true,
    "input": "./",
    "output": "..\\K歌机zfb\\K歌机wx"
,
    "hooks": {
        "appJson": function plugin(appJson) { return appJson }

    },
    "babel": {
        "plugins": function() { return [] }
    },
        "plugins": []
}