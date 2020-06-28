import {update} from "./functions.js";

export let map;
export let getLocation = function () {
    AMapLoader.load({
        key: '9df8e8cbb1caafdc4f6f5d9fc0357f2b', //首次调用load必须填写key
        version: '2.0',     //JSAPI 版本号
        plugins: ['AMap.Geolocation']  //同步加载的插件列表
    }).then((AMap) => {
        map = AMap;
        AMap.plugin('AMap.Geolocation', function () {
            var geolocation = new AMap.Geolocation({
                // 是否使用高精度定位，默认：true
                enableHighAccuracy: true,
                // 设置定位超时时间，默认：无穷大
                timeout: 10000,
                // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
                buttonOffset: new AMap.Pixel(10, 20),
                //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                zoomToAccuracy: true,
                //  定位按钮的排放位置,  RB表示右下
                buttonPosition: 'RB'
            })

            geolocation.getCurrentPosition(function (status, result) {
                if (status == 'complete') {
                    onComplete(result)
                } else {
                    onError(result)
                }
            });

            function onComplete(data) {
                console.log(data.position)
                update(data.position.lng + ',' + data.position.lat);
            }

            function onError(data) {
                // 定位出错
            }
        })
    }).catch((e) => {
        console.error(e);  //加载错误提示
    });
}