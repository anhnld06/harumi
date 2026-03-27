"""One-off / reusable: (注1) / （注１） / label 注１ -> ※ style in reading-n2.json."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "public" / "data" / "reading-n2.json"


def main() -> None:
    text = path.read_text(encoding="utf-8")
    before = text.count("\u6ce8")  # 注
    text = re.sub(r"([（(])注([０-９0-9]+)", r"\1※\2", text)
    text = re.sub(r'"label": "注([０-９0-9]+)"', r'"label": "※\1"', text)
    for old, new in (
        ("（注）", "（※）"),
        ("(注)", "(※)"),
        ("(注）", "(※）"),
        ("（注)", "（※)"),
    ):
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")
    after = text.count("\u6ce8")
    print(path.name, "chu-mark count", before, "->", after)


if __name__ == "__main__":
    main()
