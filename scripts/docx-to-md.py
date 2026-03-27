#!/usr/bin/env python3
"""
Convert a .docx file to Markdown for readable plain-text review.

Engines:
  mammoth (default) — fast; does not preserve font color (red answers are lost).
  ooxml + --preserve-red — no extra deps; wraps red runs as
    <span style="color:#c00">...</span> (GFM / VS Code preview render this).

Requires mammoth only when not using --preserve-red.

Usage:
  python scripts/docx-to-md.py
  python scripts/docx-to-md.py --preserve-red -o dokkai-n2.md
  python scripts/docx-to-md.py --input "D:\\harumi\\dokkai-n2.docx" --output out.md
"""
from __future__ import annotations

import argparse
import html
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def _qn(local: str) -> str:
    return f"{{{W_NS}}}{local}"


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


# Word answer highlighting in dokkai-n2.docx uses w:color w:val="ff0000"
RED_HEX = frozenset(
    {
        "ff0000",
        "c00000",
        "e60000",
        "c0504d",
        "ff0000",  # explicit
    }
)


def _run_color_hex(rpr: ET.Element | None) -> str | None:
    if rpr is None:
        return None
    c = rpr.find(_qn("color"))
    if c is None:
        return None
    val = None
    for k, v in c.attrib.items():
        if k.endswith("}val") or k == "val":
            val = v
            break
    if not val or val.lower() == "auto":
        return None
    return val.strip().lstrip("#").lower()


def _is_red_rpr(rpr: ET.Element | None) -> bool:
    h = _run_color_hex(rpr)
    return h is not None and h in RED_HEX


def _text_from_run(run: ET.Element) -> str:
    parts: list[str] = []
    for child in run:
        loc = _local(child.tag)
        if loc == "t":
            parts.append(child.text or "")
        elif loc == "tab":
            parts.append("\t")
        elif loc == "br":
            parts.append("\n")
    return "".join(parts)


def _run_to_md(run: ET.Element) -> str:
    rpr = run.find(_qn("rPr"))
    raw = _text_from_run(run)
    if not raw:
        return ""
    esc = html.escape(raw, quote=False)
    if _is_red_rpr(rpr):
        return f'<span style="color:#c00">{esc}</span>'
    return esc


def _paragraph_to_line(p: ET.Element) -> str:
    parts: list[str] = []
    for child in p:
        loc = _local(child.tag)
        if loc == "r":
            parts.append(_run_to_md(child))
        elif loc == "hyperlink":
            for sub in child:
                if _local(sub.tag) == "r":
                    parts.append(_run_to_md(sub))
    return "".join(parts)


def _table_to_md(tbl: ET.Element) -> str:
    rows: list[list[str]] = []
    for tr in tbl.findall(_qn("tr")):
        cells: list[str] = []
        for tc in tr.findall(_qn("tc")):
            cell_lines: list[str] = []
            for p in tc.findall(_qn("p")):
                line = _paragraph_to_line(p)
                if line.strip():
                    cell_lines.append(line.strip())
            cells.append(" ".join(cell_lines))
        rows.append(cells)
    return _format_md_table(rows)


def _format_md_table(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    n = max(len(r) for r in rows)

    def pad(r: list[str]) -> list[str]:
        r = list(r)
        return r + [""] * (n - len(r))

    def esc_cell(s: str) -> str:
        return s.replace("\n", " ").replace("|", "\\|")

    out: list[str] = []
    for i, row in enumerate(rows):
        rc = pad(row)
        out.append("| " + " | ".join(esc_cell(c) for c in rc) + " |")
        if i == 0:
            out.append("| " + " | ".join(["---"] * n) + " |")
    return "\n".join(out)


def docx_to_markdown_preserve_red(docx_path: Path) -> str:
    with zipfile.ZipFile(docx_path) as zf:
        xml_bytes = zf.read("word/document.xml")
    root = ET.fromstring(xml_bytes)
    body = root.find(_qn("body"))
    if body is None:
        return ""

    blocks: list[str] = []
    for child in body:
        loc = _local(child.tag)
        if loc == "p":
            blocks.append(_paragraph_to_line(child))
        elif loc == "tbl":
            t = _table_to_md(child)
            if t.strip():
                blocks.append(t)
        elif loc == "sectPr":
            continue

    return "\n\n".join(blocks)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(
        description="Convert .docx to .md (mammoth or OOXML with red answer spans)."
    )
    parser.add_argument(
        "--input",
        "-i",
        type=Path,
        default=root / "dokkai-n2.docx",
        help="Path to input .docx (default: repo root dokkai-n2.docx)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=None,
        help="Path to output .md (default: same stem as input)",
    )
    parser.add_argument(
        "--preserve-red",
        action="store_true",
        help="Use OOXML parser; mark red text (answers) with HTML <span style=\"color:#c00\">",
    )
    args = parser.parse_args()
    in_path: Path = args.input.resolve()
    if args.output is None:
        out_path = in_path.with_suffix(".md")
    else:
        out_path = args.output.resolve()

    if not in_path.is_file():
        print(f"Error: input file not found: {in_path}", file=sys.stderr)
        return 1
    if in_path.suffix.lower() != ".docx":
        print(f"Warning: expected .docx, got {in_path.suffix!r}", file=sys.stderr)

    if args.preserve_red:
        md = docx_to_markdown_preserve_red(in_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(md, encoding="utf-8")
        spans = md.count('<span style="color:#c00">')
        print(f"Wrote {out_path} ({len(md):,} chars, {spans} red spans)")
        return 0

    try:
        import mammoth
    except ImportError:
        print(
            "Missing dependency: mammoth\n"
            "Install with:  python -m pip install mammoth\n"
            "Or use:  --preserve-red  (no mammoth; keeps red answers as HTML)",
            file=sys.stderr,
        )
        return 1

    with in_path.open("rb") as f:
        result = mammoth.convert_to_markdown(f)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(result.value, encoding="utf-8")

    for msg in result.messages:
        print(f"[mammoth] {msg}", file=sys.stderr)

    print(f"Wrote {out_path} ({len(result.value):,} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
