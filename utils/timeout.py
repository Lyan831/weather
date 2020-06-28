import json
from datetime import datetime, timedelta
from weather.settings import CACHES_TIMEOUT



def get_timeout(duration, update_time, format='%Y-%m-%d %H:%M'):
    timeout = 0
    if duration != 'forecast':
        timeout = CACHES_TIMEOUT[duration]
    else:
        next = datetime.strptime(update_time, format) + timedelta(hours=1, minutes=2)
        timeout = int(next.timestamp() - datetime.utcnow().timestamp())
    return timeout
