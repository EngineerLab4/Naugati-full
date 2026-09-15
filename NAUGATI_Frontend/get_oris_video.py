import urllib.request, re

req = urllib.request.Request('https://orismaritime.com', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')

videos = re.findall(r'https?://[^\s"\'<>]+\.(?:mp4|webm)', html)
print("Videos found:")
for v in set(videos):
    print(v)

# Also check for video tags or src attributes
srcs = re.findall(r'<video[^>]*src=["\']([^"\']+)["\']', html)
for s in srcs:
    print("Video src:", s)

sources = re.findall(r'<source[^>]*src=["\']([^"\']+)["\']', html)
for s in sources:
    print("Source src:", s)

# Also check for webflow video assets or background video
bg_videos = re.findall(r'data-videourl=["\']([^"\']+)["\']', html)
for b in bg_videos:
    print("Data videourl:", b)
