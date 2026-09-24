"""Turn a locked-camera "robot looking around" clip into a gaze-path sprite sheet.

The robot turns its whole head in 3D, so we do not blend unrelated poses. Instead:
  analyze: track the black face plate in every frame (its centre = where the robot faces),
           then pick N frames spaced evenly ALONG THE MOTION PATH (arc length in pose space).
  build:   crop + pack those frames into one WebP sprite, plus poses.json (per-frame gaze)
           and poster.jpg. At runtime the cursor picks the path point whose gaze matches it
           and the playhead eases along the clip to get there (no ghosting).

Usage:
  python mascot_pipeline.py analyze <video> <workdir> [N]
  python mascot_pipeline.py build   <video> <workdir> <outdir>
"""
import sys, os, json, glob, math, subprocess, colorsys
import numpy as np
import cv2
from PIL import Image, ImageDraw

CROP_X, CROP_W = 0.24, 0.52          # robot column of the 16:9 frame (fractions of width)
SMALL_W = 480


def extract_small(video, wd):
    d = os.path.join(wd, 'small')
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(d, '*.jpg')):
        os.remove(f)
    subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'scale={SMALL_W}:-1', '-q:v', '2',
                    os.path.join(d, 'f_%03d.jpg')], check=True)
    return sorted(glob.glob(os.path.join(d, 'f_*.jpg')))


def plate(img):
    """Convex hull of the largest very-dark blob in the head area = the face plate."""
    H, W = img.shape[:2]
    y0, y1 = int(0.03 * H), int(0.52 * H)
    x0, x1 = int(0.20 * W), int(0.80 * W)
    gray = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY)
    m = (gray < 48).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    if n < 2:
        return None
    i = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    cnts, _ = cv2.findContours((lab == i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    hull = cv2.convexHull(max(cnts, key=cv2.contourArea))
    M = cv2.moments(hull)
    if M['m00'] < 200:
        return None
    a = M['m00']
    mu20, mu02, mu11 = M['mu20'] / a, M['mu02'] / a, M['mu11'] / a
    x, y, w, h = cv2.boundingRect(hull)
    return dict(cx=M['m10'] / a + x0, cy=M['m01'] / a + y0, area=a, w=w, h=h,
                ang=0.5 * math.degrees(math.atan2(2 * mu11, mu20 - mu02)))


def analyze(video, wd, N=64):
    os.makedirs(wd, exist_ok=True)
    files = extract_small(video, wd)
    feats = [plate(cv2.imread(f)) for f in files]
    ok = [i for i, e in enumerate(feats) if e]
    print(f'frames {len(files)}, plate found in {len(ok)}')
    n0 = feats[0]
    print('neutral', {k: round(v, 1) for k, v in n0.items()})
    dx = np.array([feats[i]['cx'] - n0['cx'] for i in ok])
    dy = np.array([feats[i]['cy'] - n0['cy'] for i in ok])
    Lx = max(3.0, -float(dx.min())); Rx = max(3.0, float(dx.max()))
    Uy = max(3.0, -float(dy.min())); Dy = max(3.0, float(dy.max()))
    print(f'extents px@{SMALL_W}w  left {Lx:.1f} right {Rx:.1f} up {Uy:.1f} down {Dy:.1f}')
    # pose vector for arc length: position + width (yaw) + roll
    P = np.array([[feats[i]['cx'], feats[i]['cy'], 0.35 * feats[i]['w'], 1.5 * feats[i]['ang']] for i in ok])
    step = np.r_[0, np.linalg.norm(np.diff(P, axis=0), axis=1)]
    L = np.cumsum(step)
    print(f'path length {L[-1]:.0f} px-units over {len(ok)} frames')
    targets = np.linspace(0, L[-1], N)
    sel = sorted({ok[int(np.argmin(abs(L - t)))] for t in targets} | {0})
    print('selected', len(sel), 'frames:', sel)
    json.dump(dict(feats=feats, ok=ok, sel=sel, ext=dict(Lx=Lx, Rx=Rx, Uy=Uy, Dy=Dy), n0=n0,
                   small_w=SMALL_W, nframes=len(files)), open(os.path.join(wd, 'analysis.json'), 'w'))

    # --- gaze path scatter (time -> colour), selected frames ringed ---
    sc = Image.new('RGB', (760, 560), (18, 20, 28))
    d = ImageDraw.Draw(sc)
    cx, cy, k = 380, 280, 2.6
    d.line([(0, cy), (760, cy)], fill=(50, 55, 70)); d.line([(cx, 0), (cx, 560)], fill=(50, 55, 70))
    pts = [(cx + (feats[i]['cx'] - n0['cx']) * k, cy + (feats[i]['cy'] - n0['cy']) * k) for i in ok]
    for a, b in zip(pts, pts[1:]):
        d.line([a, b], fill=(90, 95, 120))
    for i, (x, y) in zip(ok, pts):
        r, g, b = [int(c * 255) for c in colorsys.hsv_to_rgb(i / len(files) * 0.85, 0.9, 1.0)]
        d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(r, g, b))
        if i in sel:
            d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=(255, 255, 255))
        if i % 20 == 0:
            d.text((x + 6, y - 5), str(i), fill=(255, 255, 255))
    d.text((8, 8), 'gaze path: plate centre vs neutral (px@480w). x+ = faces viewer-right, y+ = faces down', fill=(200, 200, 210))
    sc.save(os.path.join(wd, 'gaze_scatter.png'))

    # --- strip of selected frames in time order ---
    tw = 150
    def head(i):
        im = cv2.imread(files[i]); h, w = im.shape[:2]
        x0 = int(0.28 * w); crop = im[0:int(0.6 * h), x0:x0 + int(0.44 * w)]
        return cv2.cvtColor(cv2.resize(crop, (tw, round(tw * crop.shape[0] / crop.shape[1]))), cv2.COLOR_BGR2RGB)
    cols = 16; th = head(0).shape[0]; rows = math.ceil(len(sel) / cols)
    S = Image.new('RGB', (cols * tw, rows * th))
    sd = ImageDraw.Draw(S)
    for k2, i in enumerate(sel):
        S.paste(Image.fromarray(head(i)), ((k2 % cols) * tw, (k2 // cols) * th))
        sd.text(((k2 % cols) * tw + 3, (k2 // cols) * th + 3), str(i), fill=(255, 255, 0))
    S.save(os.path.join(wd, 'path_strip.jpg'), quality=85)
    print('strip', S.size)


def build(video, wd, outdir, fw=512):
    A = json.load(open(os.path.join(wd, 'analysis.json')))
    sel, feats, n0, ext = A['sel'], A['feats'], A['n0'], A['ext']
    slot = {f: k for k, f in enumerate(sel)}
    cap = cv2.VideoCapture(video)
    frames, i = {}, 0
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        if i in slot:
            frames[i] = fr
        i += 1
    cap.release()
    H, W = frames[0].shape[:2]
    cx0, cw = int(round(CROP_X * W)), int(round(CROP_W * W))
    fh = round(fw * H / cw)
    cols = 8
    rows = math.ceil(len(sel) / cols)
    sheet = Image.new('RGB', (cols * fw, rows * fh))
    for f in sel:
        k = slot[f]
        im = Image.fromarray(cv2.cvtColor(frames[f][:, cx0:cx0 + cw], cv2.COLOR_BGR2RGB)).resize((fw, fh), Image.LANCZOS)
        sheet.paste(im, ((k % cols) * fw, (k // cols) * fh))
    os.makedirs(outdir, exist_ok=True)
    sheet.save(os.path.join(outdir, 'poses.webp'), 'WEBP', quality=80, method=6)
    poster = Image.fromarray(cv2.cvtColor(frames[0][:, cx0:cx0 + cw], cv2.COLOR_BGR2RGB))
    poster.resize((1000, round(1000 * H / cw)), Image.LANCZOS).save(os.path.join(outdir, 'poster.jpg'), quality=85, optimize=True)

    def uv(f):
        dx, dy = feats[f]['cx'] - n0['cx'], feats[f]['cy'] - n0['cy']
        return [round(dx / (ext['Rx'] if dx > 0 else ext['Lx']), 3), round(dy / (ext['Dy'] if dy > 0 else ext['Uy']), 3)]
    meta = dict(frameW=fw, frameH=fh, cols=cols, rows=rows, count=len(sel), sourceFrames=sel,
                gaze=[uv(f) for f in sel], neutral=slot[0], fps=24, srcSize=[W, H],
                anchor=dict(x=round((n0['cx'] / A['small_w'] - CROP_X) / CROP_W, 4),
                            y=round(n0['cy'] / (A['small_w'] * H / W), 4)))
    json.dump(meta, open(os.path.join(outdir, 'poses.json'), 'w'), separators=(',', ':'))
    for f in ('poses.webp', 'poster.jpg', 'poses.json'):
        print(f, os.path.getsize(os.path.join(outdir, f)), 'bytes')
    print('sprite', sheet.size, 'frame', (fw, fh), 'poses', len(sel), 'anchor', meta['anchor'])


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'analyze':
        analyze(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 64)
    elif cmd == 'build':
        build(sys.argv[2], sys.argv[3], sys.argv[4])
