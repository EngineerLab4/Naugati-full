import urllib.request, os

urls = {
    'public/oris_sofi.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/sofi.mp4',
    'public/viktoria_hero.mp4': 'https://www.orismaritime.com/wp-content/uploads/2026/06/viktoria-hero.mp4'
}

for local, remote in urls.items():
    print(f"Downloading {remote} -> {local}...")
    req = urllib.request.Request(remote, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp, open(local, 'wb') as f:
        f.write(resp.read())
    print(f"Saved {local} ({os.path.getsize(local)} bytes)")
