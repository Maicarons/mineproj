#!/usr/bin/env python3
"""Check that text files are valid UTF-8 with LF line endings.

Usage:
    python scripts/check-encoding.py <file> [<file> ...]

Why this exists:
    On Windows, authoring tools may silently write CJK text as GBK bytes.
    GBK byte sequences are not valid UTF-8, so a successful `decode('utf-8')`
    is a sufficient proof that no GBK mojibake slipped in.

Note:
    CJK literals inside this file are written as \\u escapes on purpose --
    passing non-ASCII literals through a shell is unreliable on Windows.
"""

import sys

# Key CJK sample expected in mineproj docs: "\u9879\u76ee\u5e93" (project library).
SAMPLE = "\u9879\u76ee\u5e93"

# Files that must keep CRLF on Windows and therefore skip the LF assertion.
CRLF_ALLOWED_SUFFIXES = (".bat", ".cmd")


def check(path: str) -> list[str]:
    problems: list[str] = []
    with open(path, "rb") as fh:
        raw = fh.read()

    try:
        raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        problems.append(f"{path}: not valid UTF-8 ({exc})")
        return problems

    if not raw.endswith(b"\n"):
        problems.append(f"{path}: missing trailing newline")

    if not path.endswith(CRLF_ALLOWED_SUFFIXES) and b"\r\n" in raw:
        problems.append(f"{path}: contains CRLF, expected LF only")

    return problems


def main(argv: list[str]) -> int:
    files = argv[1:]
    if not files:
        print(__doc__.strip())
        return 2

    problems: list[str] = []
    for path in files:
        problems.extend(check(path))
        print("OK", path)

    if problems:
        print("\nFAILED:")
        for problem in problems:
            print("  -", problem)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
