import redis
import json
import requests

from django.shortcuts import render
from django.http.response import JsonResponse
from django.core.cache import cache
from django.http import Http404

from weather.settings import WEATHER_KEY, POSITION_KEY, INFO_API_URLS, POSTION_API_URL, INFO_TIMEOUTS
from utils.timeout import get_timeout


def index(request):
    if request.method != 'GET':
        raise Http404
    return render(request, 'index.html')


def location(request):
    ip = request.META.get('HTTP_X_FORWARDED_FOR') if request.META.get('HTTP_X_FORWARDED_FOR') else request.META.get('REMOTE_ADDR')
    location_data = cache.get(ip)
    if not location_data:
        position_req_params = {
            'key': POSITION_KEY,
            'ip': ip,
        }
        if ip == '127.0.0.1' or ip.startswith('192'):  # Test only
            position_req_params.pop('ip')
        location_data = json.loads(requests.get(POSTION_API_URL, params=position_req_params).content)
        cache.set(ip, location_data, timeout=INFO_TIMEOUTS['ip'])
    return JsonResponse(location_data)


def he_feng_query(request, query_type, duration):
    if request.method != 'GET' or query_type not in INFO_API_URLS:
        raise Http404()
    pos_info = request.GET.get('location')
    data, key = None, '{}:{}:{}'.format(pos_info ,query_type, duration)
    if not pos_info:
        data = {'status': '缺少位置参数'}
    else:
        data = cache.get(key)
    if not data:
        req_params = {'location': pos_info, 'key': WEATHER_KEY}
        r = requests.get(INFO_API_URLS.get(query_type).format(duration), params=req_params)
        if r.status_code == 200:
            data = json.loads(r.content).get('HeWeather6')[0]
            if data.get('status') == 'ok':
                cache.set(key, data, timeout=get_timeout(
                    duration,
                    data.get('update').get('utc') if data.get('update') else None
                ))
        else:
            data = {'status': '接口请求失败'}
    return JsonResponse(data)
