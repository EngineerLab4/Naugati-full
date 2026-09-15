import urllib.request
import re

req = urllib.request.Request(
    'https://oristime.com', 
    headers={'User-Agent': 'Mozilla/5.0'}
)
try:
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    matches = re.findall(r'https?://[^\s"\'<>]+\.(?:mp4|webm|glb|gltf)', html, re.IGNORECASE)
    print("Found media links:")
    for m in set(matches):
        print(m)
    
    # Also search for canvas, threejs, lottie, splat, spline, model-viewer or webgl
    print("\nKeywords:")
    for kw in ['three', 'canvas', 'model', 'spline', 'webgl', 'babylon', 'tanker', 'vessel', 'ship']:
        count = len(re.findall(kw, html, re.IGNORECASE))
        print(f"{kw}: {count}")
except Exception as e:
    print("Error:", e)
