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
    if request.method != 'GET':
        raise Http404()
    lng_lat = request.GET.get('location')
    location_data, key = None, lng_lat
    if not lng_lat:
        location_data = {'code': '500'}
    else:
        location_data = cache.get(key)
    if not location_data:
        position_req_params = {
            'location': WEATHER_KEY,
            'key': WEATHER_KEY,
            'range': 'cn',
            'mode': 'exact'
        }
        location_data = json.loads(requests.get(POSTION_API_URL, params=position_req_params).content)
        cache.set(key, location_data, timeout=get_timeout())
    return JsonResponse(location_data)


def he_feng_query(request, query_type, duration):
    if request.method != 'GET' or query_type not in INFO_API_URLS:
        raise Http404()
    pos_info = request.GET.get('location')
    data, key = None, '{}:{}:{}'.format(pos_info ,query_type, duration)
    if not pos_info:
        data = {'code': '500'}
    else:
        data = cache.get(key)
    if not data:
        req_params = {'location': pos_info, 'key': WEATHER_KEY}
        r = requests.get(INFO_API_URLS.get(query_type).format(duration), params=req_params)
        if r.status_code == 200:
            data = json.loads(r.content)
            if data.get('code') == '200':
                cache.set(key, data, timeout=get_timeout(
                    duration,
                    data.get('updateTime')
                ))
        else:
            data = {'code': '500'}
    return JsonResponse(data)
