import json
from datetime import datetime, timedelta
from weather.settings import CACHES_TIMEOUT


def get_timeout(duration=None, update_time=None, format='%Y-%m-%dT%H:%M%z'):
    timeout = 0
    if not (duration or update_time):
        timeout = CACHES_TIMEOUT['location']
    elif duration == '24h' or duration == '3d':
        last_update = datetime.strptime(update_time[:19] + update_time[20:], format)
        last_update += last_update.tzinfo.utcoffset(last_update)
        if duration == '3d':
            next_update = (last_update + timedelta(hours=1)).replace(minute=0)
            timeout = int(next_update.timestamp() - datetime.utcnow().timestamp())
        else:
            next_update = (last_update + timedelta(hours=1, minutes=5))
            timeout = int(next_update.timestamp() - datetime.utcnow().timestamp())
    else:
        timeout = CACHES_TIMEOUT[duration]
        return timeout
