"""Write the copyright notice into every JPEG in public/images (EXIF + XMP), without re-compressing the image.

Run after adding images:  python scripts/copyright.py   (needs: python -m pip install --user piexif)
Safe to run again: it replaces its own notice instead of adding a second one.
"""
import glob, os
import piexif

YEAR = 2026
AUTHOR = 'Shivam Parmar'
CONTACT = 'ishivamparmar@gmail.com'
# client work: the brand shares the copyright
CLIENTS = {'cocozuri': 'CocoZuri Chocolat', 'dar-distributors': 'Dar Distributors'}

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'images')


def notice(path):
    rel = os.path.relpath(path, root).replace('\\', '/').lower()
    brand = next((b for k, b in CLIENTS.items() if rel.startswith(k)), None)
    owner = f'{brand} and {AUTHOR}' if brand else AUTHOR
    return f'© {YEAR} {owner}. All rights reserved. Do not copy or reuse without written permission. {CONTACT}'


def xmp(text):
    esc = text.replace('&', '&amp;').replace('<', '&lt;')
    return ('<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>'
            '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
            '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" '
            'xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" '
            f'photoshop:Credit="{AUTHOR}" xmpRights:Marked="True">'
            f'<dc:creator><rdf:Seq><rdf:li>{AUTHOR}</rdf:li></rdf:Seq></dc:creator>'
            f'<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">{esc}</rdf:li></rdf:Alt></dc:rights>'
            f'<xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">{esc}</rdf:li></rdf:Alt></xmpRights:UsageTerms>'
            '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>').encode('utf-8')


XMP_NS = b'http://ns.adobe.com/xap/1.0/\x00'


def put_xmp(data, packet):
    """Drop any XMP APP1 segment, then insert ours right after the EXIF segment (or after SOI)."""
    out, i = bytearray(data[:2]), 2
    segs = []
    while i < len(data) and data[i] == 0xFF and data[i + 1] not in (0xDA, 0xD9):
        n = int.from_bytes(data[i + 2:i + 4], 'big')
        segs.append(data[i:i + 2 + n]); i += 2 + n
    rest = data[i:]
    segs = [s for s in segs if not (s[1] == 0xE1 and s[4:4 + len(XMP_NS)] == XMP_NS)]
    body = XMP_NS + packet
    ours = b'\xff\xe1' + (len(body) + 2).to_bytes(2, 'big') + body
    at = next((k + 1 for k, s in enumerate(segs) if s[1] == 0xE1 and s[4:10] == b'Exif\x00\x00'), 0)
    segs.insert(at, ours)
    for s in segs: out += s
    return bytes(out + rest)


files = sorted(glob.glob(os.path.join(root, '**', '*.jp*g'), recursive=True))
for f in files:
    text = notice(f)
    ex = piexif.load(f)
    ex['0th'][piexif.ImageIFD.Artist] = AUTHOR.encode()
    ex['0th'][piexif.ImageIFD.Copyright] = text.encode('utf-8')
    ex.pop('thumbnail', None); ex['1st'] = {}
    piexif.insert(piexif.dump(ex), f)
    data = open(f, 'rb').read()
    open(f, 'wb').write(put_xmp(data, xmp(text)))
print(f'{len(files)} images stamped')
