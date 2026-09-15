import urllib.request, urllib.parse, json, re

query = 'Oris Maritime website'
url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote('Oris Maritime website')
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    results = re.findall(r'<a class="result__url"[^>]*href="([^"]+)"[^>]*>([^<]+)</a>', html)
    for href, title in results[:10]:
        print(href, title.strip())
except Exception as e:
    print("Error:", e)
