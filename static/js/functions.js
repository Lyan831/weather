'use strict'
// var url = 'https://weather.foreverdana.com/';
var url = 'http://localhost:8080/';
// var url = 'http://192.168.5.81:8080/';
var days = ['今天', '明天', '后天'];

function makePlot(dews, hums, timeStart) {
    dews = dews.map(x => Number(x));
    hums = hums.map(x => Number(x));
    Highcharts.setOptions({
        colors: ['#50B432'],
        credits: {
            enabled: false
        },
        exporting: {
            buttons: {
                contextButton: {
                    enabled: false
                }
            }
        }
    })
    // 绘制温度折线图
    Highcharts.chart('container-tmp', {
        chart: {
            backgroundColor: '#00000000'
        },
        title: {
            text: '温度变化'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
            }
        },
        series: [{
            name: '温度',
            data: dews,
            pointStart: timeStart,
            pointInterval: 3 * 3600 * 1000
        }],
        xAxis: {
            title: {
                text: '时间'
            },
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: '温度（℃）'
            }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    });
    // 绘制湿度折线图
    Highcharts.chart('container-hum', {
        chart: {
            backgroundColor: '#00000000'
        },
        title: {
            text: '湿度变化'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
            }
        },
        series: [{
            name: '湿度',
            data: hums,
            pointStart: timeStart,
            pointInterval: 3 * 3600 * 1000
        }],
        xAxis: {
            title: {
                text: '时间'
            },
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: '相对湿度'
            }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    });
    $('.plot').animate({
        opacity: 1.0
    });
}

function nowLocation(LngLat) {
    $.getJSON(
        url + 'location',
        {
            location: LngLat
        },
        function (data) {
            if (data.code == '200') {
                $('#pos').html(data.location[0].adm2 + '&nbsp;' + data.location[0].name).text();
            }
        }
    )
}

function nowWeather(lngLat) {
    $.getJSON(
        url + 'weather/now/',
        {
            location: lngLat
        },
        function (data) {
            if (data.code === '200') {
                $('#number').text(data.now.temp);
                $('#nav, #tmp').animate({
                    opacity: '1.0'
                });
            } else {
                setTimeout(nowWeather, 1000, lngLat);
            }
        }
    );
}

function nowAirQuality(LngLat) {
    $.getJSON(
        url + 'air_quality/now/',
        {
            location: LngLat
        },
        function (data) {
            if (data.code === '200') {
                $('#pm25').text(data.now.pm2p5);
                $('#pm10').text(data.now.pm10);
                $('#aqi').text(data.now.aqi);
                $('#air-quality').animate({
                    opacity: 1.0
                });
            } else {
                setTimeout(nowAirQuality, 1000, adcode);
            }
        }
    );
}

function forecastWeather(lngLat) {
    $.getJSON(
        url + 'weather/3d/',
        {
            location: lngLat
        },
        function (data) {
            if (data.code === '200') {
                let forecast = $('.forecast');
                let daily = data.daily;
                for (let i = 0; i < forecast.length; i++) {
                    let ithDay = daily[i];
                    let weatherChange = ithDay.textDay + (ithDay.textDay === ithDay.textNight ? '' : '转' + ithDay.textNight);
                    $(forecast.get(i)).find('.date').text(days[i] + ' • ' + weatherChange);
                    $(forecast.get(i)).find('.tmp-range').text(
                        daily[i].tempMax
                        + '°'
                        + '/'
                        + daily[i].tempMin
                        + '°'
                    );
                }
                $('#forecast').animate({
                    opacity: 1.0
                });
            } else {
                setTimeout(forecastWeather, 1000, lngLat);
            }
        }
    );
}

function hourlyWeather(lngLat) {
    $.getJSON(
        url + 'weather/24h/',
        {
            location: lngLat
        },
        function (data) {
            if (data.code === '200') {
                let hourly = data.hourly;
                let dews = [], hums = [], timeStart = new Date(hourly[0].fxTime).getTime();
                for (const detail of hourly) {
                    dews.push(detail.dew);
                    hums.push(detail.humidity);
                }
                makePlot(dews, hums, timeStart);
            } else {
                setTimeout(hourlyWeather, 1000, lngLat);
            }
        }
    );
}

function update(lngLat ,callback) {
    for (const callbackElement of callback) {
        callbackElement(lngLat);
    }
}