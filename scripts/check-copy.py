"""Check published copy against the owner's pre-refresh wording (5bcf83b)."""
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = json.loads((ROOT / 'design/copy-baseline.json').read_text())['copy']


class CopyCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.seen = set()
        self.errors = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        key = attrs.get('data-copy')
        if not key:
            return
        self.seen.add(key)
        if key not in BASELINE:
            self.errors.append(f'Unknown source field: {key}')
            return
        for language in ('zh', 'en'):
            actual = next((attrs[name] for name in (
                f'data-{language}', f'data-{language}-alt',
                f'data-{language}-label') if name in attrs), None)
            if actual != BASELINE[key][language]:
                self.errors.append(f'Changed original copy: {key} ({language})')


parser = CopyCheck()
parser.feed((ROOT / 'index.html').read_text())
for missing in BASELINE.keys() - parser.seen:
    parser.errors.append(f'Missing original copy: {missing}')
if parser.errors:
    raise SystemExit('\n'.join(parser.errors))
print(f'PASS: {len(parser.seen)} original bilingual fields preserved.')
