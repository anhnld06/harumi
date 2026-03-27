#!/usr/bin/env python3
"""
Parse dokkai-n2-with-answers.md into public/data/reading-n2.json.

Schema per item:
  passage: title (inferred), level N2, wordCount, contentJp, contentVi
  footnotes: id, label, displayLine (short form)
  grammarInPassage: pattern, meaningVi (no snippetFromPassage)
  vocabulary: word, kanji, pos, hanViet, meaningVi
  questionsJp / questionsVi: order, content, options A-D, correctAnswer

JP blocks rarely have red spans; correctAnswer for questionsJp is filled from
questionsVi by index when counts match.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MD = ROOT / "dokkai-n2-with-answers.md"
DEFAULT_OUT = ROOT / "public" / "data" / "reading-n2.json"

VI_RE = re.compile(
    r"[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]",
    re.I,
)
JP_CHAR = re.compile(r"[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]")
GRAMMAR_HEADER = re.compile(r"^Ngữ pháp của bài\s*:")
VOCAB_HEADER = re.compile(r"^Xem từ vựng của bài\s*$")
TRANS_HEADER = re.compile(r"^Xem dịch và đáp án\s*$")
SPAN_RED = re.compile(
    r'<span style="color:#c00">(.+?)</span>', re.DOTALL | re.IGNORECASE
)
NUM_TO_LET = {"1": "A", "2": "B", "3": "C", "4": "D", "１": "A", "２": "B", "３": "C", "４": "D"}


def jp_moji_count(s: str) -> int:
    return len(JP_CHAR.findall(s))


# Tiêu đề hiển thị: ngắn, đọc từ đoạn JP (không dùng cả câu dài).
MAX_TITLE_CHARS = 32
MIN_TITLE_CHARS = 6


def _trim_at_pauses(s: str, max_len: int) -> str:
    """Cắt gọn tại dấu ngắt hợp lý trong giới hạn max_len (độ dài ký tự Unicode)."""
    s = s.strip()
    if len(s) <= max_len:
        return s.rstrip("。")
    window = s[: max_len + 8]
    best = -1
    for sep in ("、", "，", " ", "　"):
        p = window.rfind(sep, MIN_TITLE_CHARS, max_len + 1)
        if p > best:
            best = p
    if best >= MIN_TITLE_CHARS:
        return s[:best].rstrip("、， 　") + "…"
    return s[: max_len - 1] + "…"


def title_from_passage_body(content_jp: str) -> str:
    """Suy ra tiêu đề ngắn từ nội dung bài đọc."""
    t = content_jp.strip().replace("\r\n", "\n")
    if not t:
        return ""
    first_block = t.split("\n\n", 1)[0]
    line = first_block.replace("\n", "").strip()

    if len(line) <= MAX_TITLE_CHARS:
        return line.rstrip("。")

    if "、" in line:
        head, _, tail = line.partition("、")
        if len(head) >= MIN_TITLE_CHARS:
            if len(head) <= MAX_TITLE_CHARS:
                return head.rstrip("。")
            return _trim_at_pauses(head, MAX_TITLE_CHARS)

    if "。" in line:
        sent = line.split("。", 1)[0].strip()
        if len(sent) <= MAX_TITLE_CHARS:
            return sent
        return _trim_at_pauses(sent, MAX_TITLE_CHARS)

    return _trim_at_pauses(line, MAX_TITLE_CHARS)


def infer_title(passage_first_line: str | None, content_jp: str) -> str:
    explicit = (passage_first_line or "").strip()
    if explicit:
        if len(explicit) <= MAX_TITLE_CHARS:
            return explicit.rstrip("。")
        return _trim_at_pauses(explicit, MAX_TITLE_CHARS)
    return title_from_passage_body(content_jp)


def is_footnote_line(line: str) -> bool:
    s = line.strip()
    if not s.startswith(("(注", "（注", "(※", "（※")):
        return False
    return bool(re.match(r"^[\(（][※注][０-９0-9]+", s))


def is_question_tail_start(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    if s.startswith("<span "):
        return True
    if re.match(r"^[①②③④⑤⑥⑦⑧⑨⑩]", s):
        return True
    if re.match(r"^\(\s*[0-9０-９]+\s*\)\s*$", s):
        return True
    if re.match(r"^（\s*[0-9０-９]+\s*）\s*$", s):
        return True
    return False


def is_jp_passage_start(line: str) -> bool:
    s = line.strip()
    if not s or len(s) < 8:
        return False
    if s.startswith(("|", "♦", "<span")):
        return False
    if s.startswith("(注") or s.startswith("（注") or s.startswith("(※") or s.startswith("（※"):
        return False
    if VI_RE.search(s):
        return False
    if re.match(r"^(\d|[１-４])\s*[.．、]\s*", s):
        return False
    return jp_moji_count(s) >= 10


def split_tail(tail: list[str]) -> tuple[list[str], list[str], list[str]]:
    """Translation lines, VI question lines, next-article pre lines."""
    i = 0
    trans: list[str] = []
    while i < len(tail):
        if is_question_tail_start(tail[i]):
            break
        trans.append(tail[i])
        i += 1
    qs: list[str] = []
    blank_run = 0
    while i < len(tail):
        line = tail[i]
        if not line.strip():
            blank_run += 1
        else:
            if qs and is_jp_passage_start(line) and blank_run >= 1:
                break
            blank_run = 0
            qs.append(line)
        i += 1
    next_pre = tail[i:]
    return trans, qs, next_pre


def strip_md_row_cells(line: str) -> list[str]:
    if "|" not in line:
        return []
    parts = [p.strip() for p in line.split("|")]
    if parts and parts[0] == "":
        parts = parts[1:]
    if parts and parts[-1] == "":
        parts = parts[:-1]
    return parts


def parse_vocab_table(lines: list[str]) -> list[dict]:
    rows: list[dict] = []
    for line in lines:
        line = line.rstrip()
        if not line.startswith("|"):
            continue
        cells = strip_md_row_cells(line)
        if len(cells) < 5:
            continue
        c0 = cells[0].replace(" ", "")
        if c0 in ("Từvựng", "---") or set(cells[0]) <= {"-", " "}:
            continue
        rows.append(
            {
                "word": cells[0],
                "kanji": cells[1] or "",
                "pos": cells[2].strip("()") if cells[2] else "",
                "hanViet": cells[3] or "",
                "meaningVi": cells[4] if len(cells) > 4 else "",
            }
        )
    return rows


def parse_grammar(lines: list[str]) -> list[dict]:
    out: list[dict] = []
    for raw in lines:
        line = raw.strip()
        if not line.startswith("►"):
            continue
        body = line.lstrip("►").strip()
        if "：" in body:
            pat, mean = body.split("：", 1)
        elif ":" in body:
            pat, mean = body.split(":", 1)
        else:
            pat, mean = body, ""
        out.append({"pattern": pat.strip(), "meaningVi": mean.strip()})
    return out


def parse_footnotes(lines: list[str]) -> list[dict]:
    out: list[dict] = []
    for line in lines:
        s = line.strip()
        if not is_footnote_line(s):
            continue
        m = re.match(r"^[\(（]([※注][０-９0-9]+)\s*[\)）]?", s)
        label_raw = m.group(1) if m else "※"
        label = label_raw.replace("注", "※")
        digits = re.findall(r"[0-9０-９]+", label)
        fid = int(digits[0].translate(str.maketrans("０１２３４５６７８９", "0123456789"))) if digits else len(out) + 1
        display_line = re.sub(r"([（(])注([０-９0-9]+)", r"\1※\2", s)
        out.append({"id": fid, "label": label, "displayLine": display_line})
    return out


def _option_key_line(line: str) -> str | None:
    s = line.strip()
    if re.match(r"^[0-9０-９]{1,2}\s+[①②③④⑤⑥⑦⑧⑨⑩]", s):
        return None
    m = re.match(r"^([1-4１-４])\s*[.．、,，　\s]+", s)
    if m:
        return NUM_TO_LET.get(m.group(1))
    m = re.match(r"^([1-4１-４])\s+", s)
    if m and len(s) > 3:
        return NUM_TO_LET.get(m.group(1))
    return None


def _strip_option_prefix(line: str) -> str:
    s = line.strip()
    s = re.sub(r"^[1-4１-４]\s*[.．、,，　\s]+", "", s)
    return s.strip()


def parse_jp_questions(lines: list[str]) -> list[dict]:
    """Heuristic JP MCQ blocks."""
    expanded: list[str] = []
    for line in lines:
        if "\t" in line and re.search(r"[1-4１-４]", line):
            for seg in re.split(r"\t+", line):
                s = seg.strip()
                if s:
                    expanded.append(s)
        else:
            expanded.append(line)
    cleaned = [ln.rstrip() for ln in expanded if ln.strip()]
    questions: list[dict] = []
    cur_stem: list[str] = []
    cur_opts: dict[str, str] = {}
    order = 0

    def flush() -> None:
        nonlocal order, cur_stem, cur_opts
        if not cur_opts and not cur_stem:
            return
        if len(cur_opts) < 2 and not cur_stem:
            return
        order += 1
        stem = " ".join(s.strip() for s in cur_stem if s.strip()).strip()
        questions.append(
            {
                "order": order,
                "content": stem,
                "options": cur_opts,
                "correctAnswer": None,
            }
        )
        cur_stem = []
        cur_opts = {}

    for line in cleaned:
        key = _option_key_line(line)
        if key and key in "ABCD":
            if not cur_stem and questions:
                prev = questions[-1]
                prev["options"][key] = _strip_option_prefix(line)
                continue
            cur_opts[key] = _strip_option_prefix(line)
            continue
        if cur_opts and len(cur_opts) >= 2:
            flush()
        if re.match(r"^[0-9０-９]{1,2}\s+[①②③④⑤⑥⑦⑧⑨⑩]", line.strip()):
            if cur_stem:
                flush()
            cur_stem.append(line.strip())
            continue
        if cur_stem and not cur_opts:
            if re.match(r"^[0-9０-９]{1,2}\s+[①②③④⑤⑥⑦⑧⑨⑩]", line):
                flush()
                cur_stem.append(line.strip())
                continue
            cur_stem.append(line.strip())
            continue
        if not cur_opts:
            cur_stem.append(line.strip())
            continue
        flush()
        cur_stem.append(line.strip())

    flush()
    for q in questions:
        opts = q["options"]
        if len(opts) < 4:
            for k in "ABCD":
                opts.setdefault(k, "")
    return questions


def _extract_red_digit(text: str) -> str | None:
    m = SPAN_RED.search(text)
    if not m:
        return None
    inner = m.group(1).strip()
    m2 = re.match(r"^([1-4１-４])", inner)
    if m2:
        return NUM_TO_LET.get(m2.group(1))
    return None


def _is_vi_option_line(s: str) -> bool:
    t = s.strip()
    if not t:
        return False
    if "color:#c00" in t.lower():
        return True
    return _option_key_line(t) is not None


def _vi_new_question_start(s: str) -> bool:
    t = s.strip()
    if re.match(r"^[①②③④⑤⑥⑦⑧⑨⑩]", t):
        return True
    if re.match(r"^\(\s*[0-9０-９]+\s*\)\s*$", t):
        return True
    if re.match(r"^（\s*[0-9０-９]+\s*）\s*$", t):
        return True
    return False


def parse_vi_questions(lines: list[str]) -> list[dict]:
    L = [ln.rstrip() for ln in lines]
    i = 0
    order = 0
    out: list[dict] = []

    while i < len(L):
        while i < len(L) and (not L[i].strip() or L[i].strip().startswith("♦")):
            i += 1
        if i >= len(L):
            break

        stem: list[str] = []
        opts: dict[str, str] = {}
        cor: str | None = None
        first_stem = True

        while i < len(L):
            st = L[i].strip()
            if not st:
                i += 1
                continue
            if st.startswith("♦"):
                break
            if _is_vi_option_line(L[i]):
                break
            if not first_stem and stem and _vi_new_question_start(L[i]):
                break
            first_stem = False
            stem.append(st)
            i += 1

        while i < len(L):
            st = L[i].strip()
            if not st:
                i += 1
                continue
            if st.startswith("♦"):
                break
            if stem and _vi_new_question_start(L[i]) and len(opts) >= 2:
                break
            if not _is_vi_option_line(L[i]):
                break
            raw = L[i]
            if SPAN_RED.search(raw):
                cor = _extract_red_digit(raw) or cor
            plain = SPAN_RED.sub(r"\1", raw)
            key = _option_key_line(plain) or _option_key_line(raw)
            if key:
                opts[key] = _strip_option_prefix(plain).strip()
            i += 1

        if len(opts) >= 2:
            order += 1
            for k in "ABCD":
                opts.setdefault(k, "")
            out.append(
                {
                    "order": order,
                    "content": " ".join(stem).strip(),
                    "options": opts,
                    "correctAnswer": cor,
                }
            )
        else:
            i += 1

    return out


def merge_jp_vi_answers(jp: list[dict], vi: list[dict]) -> None:
    if len(jp) == len(vi):
        for a, b in zip(jp, vi):
            if b.get("correctAnswer") and not a.get("correctAnswer"):
                a["correctAnswer"] = b["correctAnswer"]


def is_jp_question_block_start(line: str) -> bool:
    s = line.strip()
    if re.match(r"^\(\s*[　\s]*[0-9０-９]+[　\s]*\)\s*$", s):
        return True
    if re.match(r"^（\s*[　\s]*[0-9０-９]+[　\s]*）\s*$", s):
        return True
    if re.match(r"^[0-9０-９]{1,2}\s+[①②③④⑤⑥⑦⑧⑨⑩]", s):
        return True
    return False


def split_pre_block(pre_lines: list[str]) -> tuple[str | None, str, list[str], list[str]]:
    lines = [ln.rstrip() for ln in pre_lines]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return None, "", [], []

    title_candidate = lines[0].strip()
    rest_start = 0
    k = 1
    while k < len(lines) and not lines[k].strip():
        k += 1
    if (
        len(title_candidate) <= 52
        and jp_moji_count(title_candidate) >= 2
        and jp_moji_count(title_candidate) / max(len(title_candidate), 1) >= 0.3
        and not title_candidate.startswith(
            ("(注", "（注", "(※", "（※", "１", "２", "1", "2", "(　", "（　")
        )
        and not re.match(r"^\(\s*\d", title_candidate)
    ):
        if k < len(lines):
            nxt = lines[k].strip()
            if nxt.startswith("　") or nxt.startswith("「") or jp_moji_count(nxt) > 15:
                rest_start = 1

    body_lines = lines[rest_start:]

    fn_idx: int | None = None
    for i, ln in enumerate(body_lines):
        if is_footnote_line(ln):
            fn_idx = i
            break

    qb_idx: int | None = None
    for i, ln in enumerate(body_lines):
        if is_jp_question_block_start(ln):
            qb_idx = i
            break

    explicit_title = title_candidate if rest_start == 1 else None

    if fn_idx is not None and (qb_idx is None or fn_idx < qb_idx):
        content_jp = "\n".join(body_lines[:fn_idx]).strip()
        fn_lines: list[str] = []
        j = fn_idx
        while j < len(body_lines):
            if not body_lines[j].strip():
                j += 1
                continue
            if is_footnote_line(body_lines[j]):
                fn_lines.append(body_lines[j])
                j += 1
            else:
                break
        while j < len(body_lines) and not body_lines[j].strip():
            j += 1
        q_lines = body_lines[j:]
    elif qb_idx is not None:
        content_jp = "\n".join(body_lines[:qb_idx]).strip()
        fn_lines = []
        q_lines = body_lines[qb_idx:]
    else:
        content_jp = "\n".join(body_lines).strip()
        fn_lines = []
        q_lines = []

    return explicit_title, content_jp, fn_lines, q_lines


def parse_file(md: str) -> list[dict]:
    lines = md.split("\n")
    i = 0
    articles: list[dict] = []
    pending: list[str] = []

    while i < len(lines):
        pre = pending + []
        pending = []
        while i < len(lines) and not GRAMMAR_HEADER.match(lines[i]):
            pre.append(lines[i])
            i += 1
        if i >= len(lines):
            break
        grammar_start = i
        i += 1
        grammar_lines: list[str] = []
        while i < len(lines) and not VOCAB_HEADER.match(lines[i]):
            grammar_lines.append(lines[i])
            i += 1
        if i >= len(lines):
            break
        i += 1
        vocab_lines: list[str] = []
        while i < len(lines) and not TRANS_HEADER.match(lines[i]):
            vocab_lines.append(lines[i])
            i += 1
        if i >= len(lines):
            break
        i += 1

        tail_start = i
        while i < len(lines) and not GRAMMAR_HEADER.match(lines[i]):
            i += 1
        tail = lines[tail_start:i]

        trans, vi_qs, pending = split_tail(tail)
        explicit_title, content_jp, fn_lines, q_pre = split_pre_block(pre)
        title = infer_title(explicit_title, content_jp)
        raw_vi = "\n".join(trans).strip()
        content_vi = "\n\n".join(p.strip() for p in re.split(r"\n\s*\n", raw_vi) if p.strip())

        footnotes = parse_footnotes(fn_lines)
        grammar = parse_grammar(grammar_lines)
        vocabulary = parse_vocab_table(vocab_lines)
        questions_jp = parse_jp_questions(q_pre)
        questions_vi = parse_vi_questions(vi_qs)
        merge_jp_vi_answers(questions_jp, questions_vi)

        articles.append(
            {
                "passage": {
                    "title": title,
                    "level": "N2",
                    "wordCount": jp_moji_count(content_jp),
                    "contentJp": content_jp,
                    "contentVi": content_vi,
                },
                "footnotes": footnotes,
                "grammarInPassage": grammar,
                "vocabulary": vocabulary,
                "questionsJp": questions_jp,
                "questionsVi": questions_vi,
            }
        )

    return articles


def main() -> int:
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--input", "-i", type=Path, default=DEFAULT_MD)
    ap.add_argument("--output", "-o", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args()
    md_path: Path = args.input.resolve()
    if not md_path.is_file():
        print(f"Missing: {md_path}", file=sys.stderr)
        return 1
    data = parse_file(md_path.read_text(encoding="utf-8"))
    out: Path = args.output.resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(data)} articles -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
