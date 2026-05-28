# -*- coding: utf-8 -*-
"""
Convertit les protocoles Markdown (docs/protocoles/*.md) en texte propre
adapte a OneNote / Note SharePoint.

Transformations :
  - Titre #          -> bloc encadre === en MAJUSCULES
  - Section ##        -> MAJUSCULES soulignees par ---
  - Sous-titre ###    -> texte tel quel
  - Gras/italique/code inline (**, *, `) -> supprimes (texte nu)
  - Tableaux |...|    -> colonnes alignees avec entete soulignee
  - Blocs de code ``` -> indentes de 6 espaces
  - Citations >       -> prefixe /!\\
  - Listes -          -> conservees (OneNote les reconnait en puces)
  - Liens [txt](url)  -> txt (url)
  - Accents preserves, sortie UTF-8 + CRLF (Windows)

Usage :
  python md2onenote.py [REPERTOIRE_SORTIE]

  - Sans argument : ecrit dans ./Protocoles_OneNote (a cote du script)
  - Avec argument : ecrit dans le repertoire fourni
    ex. python md2onenote.py "C:\\Users\\...\\Bureau\\Protocoles_OneNote"

Le repertoire source des .md est deduit automatiquement : ../protocoles
relativement a l'emplacement de ce script (docs/scripts/ -> docs/protocoles/).
"""
import os
import re
import sys
import glob

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, '..', 'protocoles'))
OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SCRIPT_DIR, 'Protocoles_OneNote')

os.makedirs(OUT_DIR, exist_ok=True)


def strip_inline(text):
    # liens [texte](url) -> texte (url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1 (\2)', text)
    # gras/italique **x** __x__ -> x
    text = text.replace('**', '').replace('__', '')
    # code inline `x` -> x
    text = text.replace('`', '')
    return text


def render_table(rows):
    """rows = lignes markdown de tableau (avec |). Retourne texte aligne."""
    parsed = []
    for r in rows:
        cells = [strip_inline(c.strip()) for c in r.strip().strip('|').split('|')]
        parsed.append(cells)
    # retirer la ligne separatrice (|---|---|)
    data = [c for c in parsed if not all(re.fullmatch(r':?-{2,}:?', x or '-') for x in c)]
    if not data:
        return []
    ncol = max(len(r) for r in data)
    for r in data:
        while len(r) < ncol:
            r.append('')
    widths = [0] * ncol
    for r in data:
        for i, c in enumerate(r):
            widths[i] = max(widths[i], len(c))
    out = []
    for idx, r in enumerate(data):
        line = '   ' + '  '.join(c.ljust(widths[i]) for i, c in enumerate(r)).rstrip()
        out.append(line)
        if idx == 0:  # souligner l'entete
            out.append('   ' + '  '.join('-' * widths[i] for i in range(ncol)).rstrip())
    return out


def convert(md):
    lines = md.split('\n')
    out = []
    i = 0
    in_code = False
    while i < len(lines):
        line = lines[i]

        # blocs de code ```
        if line.strip().startswith('```'):
            in_code = not in_code
            i += 1
            continue
        if in_code:
            out.append('      ' + line)
            i += 1
            continue

        # tableaux
        if line.strip().startswith('|') and i + 1 < len(lines) and re.search(r'\|.*-{2,}.*\|', lines[i + 1]):
            tbl = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                tbl.append(lines[i])
                i += 1
            out.extend(render_table(tbl))
            continue

        # titres
        m = re.match(r'^(#{1,6})\s+(.*)$', line)
        if m:
            level = len(m.group(1))
            txt = strip_inline(m.group(2)).strip()
            if level == 1:
                out.append('')
                out.append('========================================================================')
                out.append('  ' + txt.upper())
                out.append('========================================================================')
            elif level == 2:
                out.append('')
                out.append(txt.upper())
                out.append('-' * len(txt))
            else:
                out.append('')
                out.append(txt)
            i += 1
            continue

        # regles horizontales
        if re.fullmatch(r'\s*([-*_])\1{2,}\s*', line):
            i += 1
            continue

        # citations >
        m = re.match(r'^\s*>\s?(.*)$', line)
        if m:
            out.append('   /!\\ ' + strip_inline(m.group(1)))
            i += 1
            continue

        # listes et texte courant
        out.append(strip_inline(line))
        i += 1

    # nettoyer les lignes vides multiples
    cleaned = []
    blank = 0
    for l in out:
        if l.strip() == '':
            blank += 1
            if blank <= 1:
                cleaned.append('')
        else:
            blank = 0
            cleaned.append(l.rstrip())
    return '\n'.join(cleaned).strip() + '\n'


def main():
    count = 0
    for path in sorted(glob.glob(os.path.join(SRC_DIR, '*.md'))):
        name = os.path.splitext(os.path.basename(path))[0]
        with open(path, 'r', encoding='utf-8') as f:
            md = f.read()
        txt = convert(md)
        out_path = os.path.join(OUT_DIR, name + '.txt')
        with open(out_path, 'w', encoding='utf-8', newline='\r\n') as f:
            f.write(txt)
        count += 1
        print(f"OK  {name}.txt  ({len(txt)} o)")
    print(f"\nTotal : {count} fichiers generes dans {OUT_DIR}")


if __name__ == '__main__':
    main()
