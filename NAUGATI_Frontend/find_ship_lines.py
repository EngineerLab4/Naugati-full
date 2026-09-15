import urllib.request, re

req = urllib.request.Request('https://oristime.com', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

for line in html.splitlines():
    if 'ship' in line.lower() or 'oris' in line.lower() or 'mp4' in line.lower():
        print(line[:120])
