def get_ip(request, pos_info):
    ip = request.META['HTTP_X_FORWARDED_FOR'] \
        if request.META.get('HTTP_X_FORWARDED_FOR') \
        else request.META['REMOTE_ADDR']
    if ip == '127.0.0.1' or ip.startswith('192'):  # Test only
        ip = 'auto_ip'
    return ip
