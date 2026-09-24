"""Rebuild index.html and landing.html in the mascot design, keeping every word of content."""
import re, subprocess, sys, html as H
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent  # repo root
RAW = "https://raw.githubusercontent.com/Jefrey11/jepris-p-ai/mascot-hero/mascot/"
WA = "https://wa.me/919789035749?text=Hi%2C%20I%20saw%20your%20{w}%20and%20wanted%20to%20talk%20about%20a%20project."

# mascot.js = template + pose data
tpl = (SITE / "tools" / "mascot.js.tpl").read_text(encoding="utf-8")
(SITE / "mascot.js").write_text(tpl.replace("__POSES__", (SITE / "tools" / "poses.min.json").read_text()), encoding="utf-8")

def original(name):
    return subprocess.run(["git", "-C", str(SITE), "show", f"main:{name}"], capture_output=True, text=True, encoding="utf-8", check=True).stdout

HEAD_EXTRA = ('<meta name="theme-color" content="#0D1017">\n'
              '<link rel="preload" as="image" href="' + RAW + 'poster.jpg">\n'
              '<link rel="stylesheet" href="/site.css">\n'
              '<script src="/mascot.js" defer></script>')

BOT = ('<div class="hero-bot" data-sprite="' + RAW + 'poses.webp" aria-hidden="true">\n'
       '      <div class="bot-stage"><img src="' + RAW + 'poster.jpg" alt="" width="512" height="554"><canvas></canvas></div>\n'
       '      <div class="bot-ring"></div>\n'
       '      <span class="bot-hint">move your cursor</span>\n'
       '    </div>')

def nav(links, wa_word):
    a = "".join(f'<a href="{h}">{t}</a>' for h, t in links)
    return ('<header class="nav"><div class="wrap nav-in">'
            '<a class="brand" href="/">JEPRIS-P AI</a>'
            f'<nav class="nav-links" aria-label="Sections">{a}</nav>'
            f'<a class="nav-cta" href="{WA.format(w=wa_word)}" target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>'
            '</div></header>\n\n')

def restyle(src, hero_class, nav_html, hero_extra_split=None):
    src = re.sub(r"<link rel=\"stylesheet\" href=\"https://fonts[^>]*>\n<style>.*?</style>",
                 lambda m: m.group(0).split("\n<style>")[0] + "\n" + HEAD_EXTRA, src, flags=re.S)
    # hero: <section class="band HERO"> <div class="wrap"> INNER </div> </section>
    m = re.search(r'<section class="band ' + hero_class + r'">\s*<div class="wrap">(.*?)\n  </div>\n</section>', src, re.S)
    inner = m.group(1)
    tail = ""
    if hero_extra_split and hero_extra_split in inner:
        i = inner.index(hero_extra_split)
        inner, tail = inner[:i].rstrip(), "\n    " + inner[i:].strip()
    hero = (f'<section class="hero">\n  <div class="wrap hero-grid">\n    <div class="hero-copy">{inner}\n    </div>\n    '
            + BOT + tail + '\n  </div>\n</section>')
    return src[:m.start()] + nav_html + hero + src[m.end():]

# ---------- index ----------
s = original("index.html")
s = restyle(s, "band-hero", nav([("#services", "What we build"), ("#work", "Recent builds"), ("/landing", "Explore our services"), ("#contact", "Let's talk")], "portfolio"))
s = s.replace('<section class="section-services">', '<section class="section-services" id="services">')
s = s.replace('<footer class="band">', '<footer class="band" id="contact">')
(SITE / "index.html").write_text(s, encoding="utf-8")

# ---------- landing ----------
s = original("landing.html")
s = restyle(s, "hero", nav([("#services", "Core services"), ("#process", "How we work"), ("#why", "Why JEPRIS-P AI"), ("/", "See our work")], "page"),
            hero_extra_split='<div class="preview-strip">')
s = s.replace('<section>\n  <div class="wrap">\n    <div class="quickfacts">', '<section class="quick">\n  <div class="wrap">\n    <div class="quickfacts">')
s = s.replace('<section class="tint">\n  <div class="wrap">\n    <div class="section-head">\n      <div class="eyebrow">Core services',
              '<section class="tint" id="services">\n  <div class="wrap">\n    <div class="section-head">\n      <div class="eyebrow">Core services')
s = s.replace('<section>\n  <div class="wrap">\n    <div class="section-head">\n      <div class="eyebrow">How we work',
              '<section id="process">\n  <div class="wrap">\n    <div class="section-head">\n      <div class="eyebrow">How we work')
s = s.replace('<section class="tint">\n  <div class="wrap">\n    <div class="section-head">\n      <div class="eyebrow">Why JEPRIS-P AI',
              '<section class="tint" id="why">\n  <div class="wrap">\n    <div class="section-head">\n      <div class="eyebrow">Why JEPRIS-P AI')
s = s.replace('<h2 style="font-size:clamp(25px,4vw,36px); line-height:1.08; max-width:24ch;">', '<h2 class="about-title">')
s = s.replace('<p class="about-lede" style="margin-top:16px;">', '<p class="about-lede" style="margin-top:16px;">')
(SITE / "landing.html").write_text(s, encoding="utf-8")

# ---------- content check: every text node / link / alt of the original must survive ----------
def texts(doc):
    body = doc.split("<body>", 1)[1]
    body = re.sub(r"<script.*?</script>", "", body, flags=re.S)
    parts = [H.unescape(t).strip() for t in re.split(r"<[^>]+>", body)]
    parts += re.findall(r'href="([^"]+)"', body) + re.findall(r'alt="([^"]*)"', body) + re.findall(r'src="([^"]+)"', body)
    return [p for p in parts if p]

ok = True
for name in ("index.html", "landing.html"):
    old, new = texts(original(name)), (SITE / name).read_text(encoding="utf-8")
    newt = set(texts(new))
    missing = [t for t in old if t not in newt]
    print(name, "original items:", len(old), "missing:", missing or "none", "| hero ok:", 'class="hero-bot"' in new, "| <style> left:", "<style>" in new)
    ok &= not missing
sys.exit(0 if ok else 1)
