'use strict'
var url = 'https://weather.foreverdana.com/';
var days = ['今天', '明天', '后天'];

function makePlot(dews, hums, timeStart) {
    dews = dews.map(x => Number(x));
    hums = hums.map(x => Number(x));
    console.log(dews);
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

function nowWeather(lngLat) {
    $.getJSON(
        url + 'weather/now/',
        {
            location: lngLat
        },
        function (data) {
            if (data.status === 'ok') {
                $('#pos').html(data.basic.parent_city + '&nbsp;' + data.basic.location).text();
                $('#number').text(data.now.tmp);
                $('#nav, #tmp').animate({
                    opacity: '1.0'
                });
            } else {
                setTimeout(nowWeather, 1000, lngLat);
            }
        }
    );
}

function nowAirQuality(adcode) {
    $.getJSON(
        url + 'air_quality/now/',
        {
            location: adcode
        },
        function (data) {
            if (data.status === 'ok') {
                $('#pm25').text(data.air_now_city.pm25);
                $('#pm10').text(data.air_now_city.pm10);
                $('#aqi').text(data.air_now_city.aqi);
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
        url + 'weather/forecast/',
        {
            location: lngLat
        },
        function (data) {
            if (data.status === 'ok') {
                let forecast = $('.forecast');
                let daily = data.daily_forecast;
                for (let i = 0; i < forecast.length; i++) {
                    let ithDay = daily[i];
                    let weatherChange = ithDay.cond_txt_d + (ithDay.cond_txt_d === ithDay.cond_txt_n ? '' : '转' + ithDay.cond_txt_n);
                    $(forecast.get(i)).find('.date').text(days[i] + ' • ' + weatherChange);
                    $(forecast.get(i)).find('.tmp-range').text(
                        daily[i].tmp_min
                        + '°'
                        + '/'
                        + daily[i].tmp_max
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
        url + 'weather/hourly/',
        {
            location: lngLat
        },
        function (data) {
            if (data.status === 'ok') {
                let hourly = data.hourly;
                let dews = [], hums = [], timeStart = new Date(hourly[0].time).getTime();
                for (const detail of hourly) {
                    dews.push(detail.dew);
                    hums.push(detail.hum);
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