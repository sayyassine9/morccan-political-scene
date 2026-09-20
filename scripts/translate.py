#!/usr/bin/env python3
"""Translate the data bank's prose into French and Darija via the Gemini API.

The data bank's prose (founding contexts, timeline entries, achievement claims and
their verifications, event descriptions, policy notes, programme claims) is written
in English. The site's i18n layer only ever covered interface chrome, so a reader on
the Darija setting got an Arabic shell around English content. This script closes
that gap.

Design notes
------------
* **Content-addressed and incremental.** Every translatable string is keyed by a hash
  of its own text (see `key_of`). A re-run only sends strings whose key is absent from
  the existing catalogue, so editing one party costs one string, not the whole bank.
* **Nothing is invented.** The model is instructed to preserve proper nouns, every
  digit, and the neutral register the research brief imposes on the source. A string
  that comes back suspicious (digits changed, wildly different length) is rejected
  and left untranslated rather than silently shipped.
* **Untranslated is a state, not a silence.** Missing entries stay missing; the
  front-end labels them with their source language instead of pretending.
* **Review is a first-class output.** The incumbent Darija dictionary shipped with a
  header admitting it had never been read by a native speaker. `--review` emits a CSV
  so that can stop being true.

Usage
-----
    export GEMINI_API_KEY=...
    python3 scripts/translate.py                 # translate missing strings, all langs
    python3 scripts/translate.py --lang ary      # one language
    python3 scripts/translate.py --dry-run       # report what would be sent, send nothing
    python3 scripts/translate.py --review        # write review CSVs from the catalogue
    python3 scripts/translate.py --retranslate KEY [KEY ...]
    python3 scripts/translate.py --ui           # interface chrome -> site/assets/i18n/*.js
"""
import argparse
import csv

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
I18N = os.path.join(DATA, 'i18n')

LANGS = {
    'fr': 'French',
    'ary': 'Moroccan Arabic (Darija)',
}

DEFAULT_MODEL = 'gemini-2.0-flash'
ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
BATCH = 20
MAX_RETRIES = 4

# Which fields carry prose a reader actually reads. Anything not listed here stays
# untouched: ids, dates, urls, numbers, enum values and source registries are not prose.
SPEC = {
    'parties.json': {
        'list': True,
        'fields': ['founding_context'],
        'nested': {
            'timeline': ['title', 'description'],
            'achievements': ['claim', 'verification'],
            'leaders': ['note'],
            'metrics': ['note'],
        },
    },
    'events.json': {
        'list': True,
        'fields': ['title', 'description'],
        'nested': {
            'positions': ['summary'],
        },
    },
    'elections.json': {'list': True, 'fields': ['notes']},
    'governments.json': {'list': True, 'fields': ['notes']},
    'policy-positions.json': {
        'list': False,
        'subtrees': {
            'dimensions': {'fields': ['label', 'description']},
            'positions': {'fields': ['note']},
        },
    },
    'programmes.json': {
        'list': False,
        'subtrees': {
            'documents': {'fields': ['title']},
            'claims': {'fields': ['topic', 'claim', 'note']},
            'legislation': {'fields': ['title', 'note']},
            'employment_outcomes': {'fields': ['note']},
        },
    },
}

SYSTEM_PROMPT = """You are translating a neutral, factual political data bank about \
Moroccan political parties into {language}. It is read by voters deciding how to vote.

Absolute rules:
1. Preserve meaning exactly. Never add, remove, soften or sharpen a claim. This text \
is held to a strict editorial-neutrality standard; a translation that editorialises is \
a defect.
2. Preserve every number, date, percentage and seat count exactly as written.
3. Preserve proper nouns: party names, person names, place names, institution names. \
Where a well-established {language} form of a Moroccan institution or party exists, use \
it; otherwise keep the original.
4. Keep the register neutral and factual. The source never editorialises and neither \
may you. Do not make the prose livelier.
5. Translate only. No commentary, no notes, no explanation.
{extra}

You will receive a JSON array of strings. Return ONLY a JSON array of translated \
strings, the same length, in the same order. No markdown fence, no prose around it."""

DARIJA_EXTRA = """6. Write Moroccan Darija as it is actually written in Moroccan press \
and on Moroccan websites: Arabic script, and political/institutional vocabulary leaning \
on standard written Arabic, which is the normal register for formal Moroccan text. Do \
not transliterate into Latin script. Do not write Gulf or Egyptian dialect."""

FRENCH_EXTRA = """6. Use the French of Moroccan institutional and press usage \
(e.g. "Chambre des représentants", "Parti de la justice et du développement")."""


# Interface chrome. The phrase dictionaries in site/assets/i18n/*.js are keyed by the
# literal English string (that is how site/assets/i18n.js looks them up), so these do not
# go through the content-addressed catalogue. They are translated by the same model with
# the same neutrality rules rather than hand-written.
UI_STRINGS = [
    # nav + chrome
    "Compare", "The record", "How we know", "Theme", "Language",
    "Skip to content", "Data snapshot:",
    "Cross-sourced data bank of Moroccan political parties. Every figure keeps its sources; see",
    # compare page
    "Compare the parties",
    "Put two or three parties beside each other and see what actually separates them \u2014 their record, where they stand, and what they are promising for 2026. Every figure carries its sources.",
    "Add a party", "Pick two parties to begin",
    "Search a party by name or initials",
    "positions on file", "record only", "selected",
    "Record only \u2014 no policy positions on file",
    "Identity", "Record", "Where they stand", "2026 programme",
    "Founded", "Current leader", "Ideology", "Seats", "In government", "Governments led",
    "Leads it", "Yes", "No", "since 1955", "the government sitting now",
    "of the vote", "no seats won", "last 5 elections", "Commitments",
    "What this does not mean",
    "Colours identify parties and are fixed per party; they are not any party's own colours and carry no ranking. Positions are editorial codings of dated statements and programmes, scored \u22122 to +2.",
    # evidence vocabulary
    "corroborated", "single source", "disputed", "no evidence recorded", "Sources",
    # party page
    "Origin", "2026 commitments", "Claims and what supports them",
    "Independent verification", "No independent source on file for this claim.",
    "Leadership", "Timeline", "Positions on major events",
    "party claims, paired with what independent sources support",
    "No such party", "That party id is not in the data bank.",
    "Go to the comparison",
    # record page
    "Elections", "Governments", "Events",
    "Seats won at each general election", "Turnout",
    "Search events since 1944", "Election", "Type", "Largest party",
    "no results on file", "Government", "Prime minister's party", "Coalition",
    "General election", "Seats in the House of Representatives",
    "Turnout (% of registered voters)", "positions",
    "Every general election, every government since 1955, and where each party stood on the major events since 1944.",
    "How every figure here was gathered, how confident we are in it, and what this data bank does not cover.",
]


def write_ui(lang, pairs):
    """Merge into site/assets/i18n/<lang>.js, preserving entries already there."""
    path = os.path.join(ROOT, 'site', 'assets', 'i18n', f'{lang}.js')
    existing = {}
    if os.path.exists(path):
        raw = open(path, encoding='utf-8').read()
        m = re.search(r'=\s*(\{.*\})\s*;\s*$', raw, re.S)
        if m:
            try:
                existing = json.loads(m.group(1))
            except json.JSONDecodeError:
                existing = {}
    existing.update(pairs)
    header = (
        '/* %s phrase dictionary for site/assets/i18n.js, keyed by the English source\n'
        '   string. Generated by scripts/translate.py --ui; edit there, not here.\n'
        '   Machine-translated and NOT reviewed by a native speaker -- run\n'
        '   `python3 scripts/translate.py --review` to produce a reviewer CSV. */\n'
    ) % LANGS[lang]
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(header)
        fh.write('window.I18N = window.I18N || {};\n')
        fh.write('window.I18N.%s = %s;\n' % (lang, json.dumps(existing, ensure_ascii=False, indent=1, sort_keys=True)))
    return path, len(existing)


# ---------------------------------------------------------------- extraction

def key_of(text):
    """FNV-1a32 || djb2-32 over the UTF-8 bytes, as 16 hex chars.

    Deliberately not sha256: the front-end has to recompute this key for every string
    it renders, and SubtleCrypto is async-only. These two 32-bit hashes are a few lines
    of integer maths in both Python and JS, and a 64-bit space makes a collision across
    ~1k strings vanishingly unlikely. The JS twin lives in site/assets/app.js (proseKey).
    """
    data = text.strip().encode('utf-8')
    h1 = 2166136261
    h2 = 5381
    for b in data:
        h1 = ((h1 ^ b) * 16777619) & 0xFFFFFFFF
        h2 = (((h2 * 33) & 0xFFFFFFFF) ^ b) & 0xFFFFFFFF
    return f'{h1:08x}{h2:08x}'


def translatable(v):
    """Prose worth sending: a non-empty string with at least a few words of letters."""
    if not isinstance(v, str):
        return False
    s = v.strip()
    if len(s) < 12:
        return False
    if not re.search(r'[A-Za-z]', s):
        return False
    if re.match(r'^https?://', s):
        return False
    return len(s.split()) >= 3


def collect_from(obj, fields, out, origin):
    for f in fields:
        v = obj.get(f)
        if translatable(v):
            out.setdefault(key_of(v), {'text': v.strip(), 'origins': []})
            out[key_of(v)]['origins'].append(origin + '.' + f)


def extract():
    """Walk data/*.json per SPEC and return {key: {text, origins}}."""
    found = {}
    for filename, spec in SPEC.items():
        path = os.path.join(DATA, filename)
        if not os.path.exists(path):
            continue
        with open(path, encoding='utf-8') as fh:
            doc = json.load(fh)
        stem = filename.replace('.json', '')

        if spec.get('list'):
            for i, item in enumerate(doc):
                origin = f"{stem}[{item.get('id', i)}]"
                collect_from(item, spec.get('fields', []), found, origin)
                for sub, subfields in (spec.get('nested') or {}).items():
                    entries = item.get(sub) or []
                    if isinstance(entries, dict):
                        entries = [entries]
                    for j, entry in enumerate(entries):
                        if isinstance(entry, dict):
                            collect_from(entry, subfields, found, f'{origin}.{sub}[{j}]')
        else:
            for sub, subspec in (spec.get('subtrees') or {}).items():
                entries = doc.get(sub) or []
                if isinstance(entries, dict):
                    entries = list(entries.values())
                for j, entry in enumerate(entries):
                    if isinstance(entry, dict):
                        collect_from(entry, subspec['fields'], found, f'{stem}.{sub}[{j}]')
    return found


# ---------------------------------------------------------------- validation

def suspicious(src, out):
    """Reject a translation rather than ship a silently corrupted one."""
    if not isinstance(out, str) or not out.strip():
        return 'empty'
    src_nums = re.findall(r'\d[\d.,]*', src)
    out_nums = re.findall(r'[\d٠-٩][\d٠-٩.,]*', out)
    if len(src_nums) != len(out_nums):
        return f'digit count {len(src_nums)} -> {len(out_nums)}'
    ratio = len(out) / max(len(src), 1)
    if ratio < 0.35 or ratio > 3.0:
        return f'length ratio {ratio:.2f}'
    if re.search(r'^\s*(note|translation|here is)\b', out, re.I):
        return 'model commentary'
    return None


# ---------------------------------------------------------------- gemini call

def call_gemini(texts, lang, model, api_key):
    extra = DARIJA_EXTRA if lang == 'ary' else FRENCH_EXTRA
    prompt = SYSTEM_PROMPT.format(language=LANGS[lang], extra=extra)
    body = {
        'systemInstruction': {'parts': [{'text': prompt}]},
        'contents': [{'role': 'user', 'parts': [{'text': json.dumps(texts, ensure_ascii=False)}]}],
        'generationConfig': {'temperature': 0.2, 'responseMimeType': 'application/json'},
    }
    url = ENDPOINT.format(model=model)
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'x-goog-api-key': api_key},
    )
    delay = 2.0
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                payload = json.load(resp)
            raw = payload['candidates'][0]['content']['parts'][0]['text']
            out = json.loads(raw)
            if not isinstance(out, list):
                raise ValueError('model did not return a list')
            return out
        except (urllib.error.HTTPError, urllib.error.URLError, KeyError, ValueError, json.JSONDecodeError) as exc:
            code = getattr(exc, 'code', None)
            if code in (400, 401, 403):
                detail = ''
                try:
                    detail = exc.read().decode('utf-8', 'replace')[:300]
                except Exception:
                    pass
                print(f'  FATAL {code}: {detail or exc}', file=sys.stderr)
                sys.exit(2)
            if attempt == MAX_RETRIES - 1:
                print(f'  giving up on batch: {exc}', file=sys.stderr)
                return None
            print(f'  retry {attempt + 1} after {exc}', file=sys.stderr)
            time.sleep(delay)
            delay *= 2
    return None


# ---------------------------------------------------------------- catalogue io

def load_catalogue(lang):
    path = os.path.join(I18N, f'{lang}.json')
    if not os.path.exists(path):
        return {}
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)


def save_catalogue(lang, cat):
    os.makedirs(I18N, exist_ok=True)
    path = os.path.join(I18N, f'{lang}.json')
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(cat, fh, ensure_ascii=False, indent=1, sort_keys=True)
        fh.write('\n')
    return path


def write_review(lang, found, cat):
    path = os.path.join(I18N, f'{lang}-review.csv')
    with open(path, 'w', encoding='utf-8', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(['key', 'reviewed', 'source_en', f'machine_{lang}', 'corrected', 'where'])
        for k, entry in sorted(found.items(), key=lambda kv: kv[1]['origins'][0]):
            w.writerow([k, 'no', entry['text'], cat.get(k, ''), '', '; '.join(entry['origins'][:3])])
    return path


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--lang', choices=sorted(LANGS), action='append', help='limit to one language (repeatable)')
    ap.add_argument('--model', default=os.environ.get('GEMINI_MODEL', DEFAULT_MODEL))
    ap.add_argument('--dry-run', action='store_true', help='report what would be sent; send nothing')
    ap.add_argument('--review', action='store_true', help='write review CSVs and exit')
    ap.add_argument('--ui', action='store_true', help='translate interface chrome into site/assets/i18n/*.js')
    ap.add_argument('--retranslate', nargs='+', metavar='KEY', help='force these keys to be re-sent')
    ap.add_argument('--batch', type=int, default=BATCH)
    args = ap.parse_args()

    langs = args.lang or sorted(LANGS)

    if args.ui:
        api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            print('GEMINI_API_KEY is not set.', file=sys.stderr)
            sys.exit(2)
        for lang in langs:
            pairs = {}
            for start in range(0, len(UI_STRINGS), args.batch):
                chunk = UI_STRINGS[start:start + args.batch]
                print(f'[{lang}] ui batch {start // args.batch + 1} ({len(chunk)})', flush=True)
                out = call_gemini(chunk, lang, args.model, api_key)
                if out and len(out) == len(chunk):
                    for src, dst in zip(chunk, out):
                        if isinstance(dst, str) and dst.strip():
                            pairs[src] = dst.strip()
            path, total = write_ui(lang, pairs)
            print(f'[{lang}] {len(pairs)} ui strings -> {path} ({total} total)')
        return

    found = extract()
    words = sum(len(e['text'].split()) for e in found.values())
    print(f'{len(found)} unique translatable strings, ~{words:,} words')

    if args.review:
        for lang in langs:
            print('wrote', write_review(lang, found, load_catalogue(lang)))
        return

    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key and not args.dry_run:
        print('GEMINI_API_KEY is not set. Export it, or re-run with --dry-run.', file=sys.stderr)
        sys.exit(2)

    for lang in langs:
        cat = load_catalogue(lang)
        if args.retranslate:
            for k in args.retranslate:
                cat.pop(k, None)
        todo = [(k, e['text']) for k, e in found.items() if k not in cat]
        stale = [k for k in cat if k not in found]
        print(f'\n[{lang}] have {len(cat)}, need {len(todo)}, orphaned {len(stale)}')

        if args.dry_run:
            cost_words = sum(len(t.split()) for _, t in todo)
            print(f'[{lang}] would send {len(todo)} strings (~{cost_words:,} words) '
                  f'in {(len(todo) + args.batch - 1) // args.batch} batches to {args.model}')
            continue

        done = rejected = 0
        for start in range(0, len(todo), args.batch):
            chunk = todo[start:start + args.batch]
            print(f'[{lang}] batch {start // args.batch + 1}/{(len(todo) + args.batch - 1) // args.batch}'
                  f' ({len(chunk)} strings)', flush=True)
            out = call_gemini([t for _, t in chunk], lang, args.model, api_key)
            if out is None or len(out) != len(chunk):
                print(f'  batch failed or length mismatch; skipping', file=sys.stderr)
                continue
            for (k, src), translated in zip(chunk, out):
                why = suspicious(src, translated)
                if why:
                    print(f'  rejected {k}: {why}', file=sys.stderr)
                    rejected += 1
                    continue
                cat[k] = translated.strip()
                done += 1
            save_catalogue(lang, cat)

        # Orphans are kept: a string may return when data is edited back, and a stale
        # entry costs bytes while a deleted one costs another API call.
        path = save_catalogue(lang, cat)
        coverage = 100.0 * sum(1 for k in found if k in cat) / max(len(found), 1)
        print(f'[{lang}] +{done} translated, {rejected} rejected, {coverage:.1f}% coverage -> {path}')

    print('\nNext: python3 scripts/build.py   (bundles data/i18n/*.json into site/data.js)')


if __name__ == '__main__':
    main()
