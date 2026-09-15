import urllib.request, os

urls = {
    'public/di.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/di.mp4',
    'public/hero_3d.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/07/10f0cf8a-27a8-4012-9030-ef3f92b64f3c-1.mp4',
    'public/marine.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/marine.mp4',
    'public/synergy.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/synergy.mp4',
    'public/trinity.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/trinity.mp4',
    'public/michelle.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/michelle-1.mp4',
    'public/helga.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/helga-2.mp4'
}

for local, remote in urls.items():
    try:
        req = urllib.request.Request(remote, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(local, 'wb') as f:
            f.write(resp.read())
        print(f"Saved {local} ({os.path.getsize(local)} bytes)")
    except Exception as e:
        print(f"Error {remote}: {e}")
