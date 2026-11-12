from pathlib import Path

lines = [
    "ImpactPulse",
    "Verified impact investing for Gen Z.",
    "",
    "Problem: greenwashing, jargon, and invisible impact.",
    "1. Shield classifies a claim as verified, misleading, or false.",
    "2. Eight-question quiz becomes a values vector.",
    "3. Cosine similarity ranks funds. A decision tree sets risk.",
    "4. Random forest scores impact per 1,000 pounds.",
    "5. SHA-256 links each audit row to the previous hash.",
    "",
    "Demo: alex@impactpulse.app / demo1234",
    "Frontend http://localhost:3000   API http://localhost:8000/docs",
]


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


commands = ["BT", "/F1 20 Tf", "48 760 Td", f"({pdf_escape(lines[0])}) Tj", "/F1 12 Tf"]
for line in lines[1:]:
    commands.append("0 -22 Td")
    commands.append(f"({pdf_escape(line)}) Tj")
commands.append("ET")
stream = "\n".join(commands).encode("latin-1")

objects = []
objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
objects.append(b"<< /Type /Pages /Count 1 /Kids [3 0 R] >>")
objects.append(b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>")
objects.append(b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream")
objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

out = bytearray(b"%PDF-1.4\n")
offsets = [0]
for index, obj in enumerate(objects, start=1):
    offsets.append(len(out))
    out += f"{index} 0 obj\n".encode() + obj + b"\nendobj\n"
xref = len(out)
out += f"xref\n0 {len(objects)+1}\n".encode()
out += b"0000000000 65535 f \n"
for offset in offsets[1:]:
    out += f"{offset:010d} 00000 n \n".encode()
out += f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode()
Path(__file__).with_name("pitch_deck.pdf").write_bytes(out)
print("wrote", Path(__file__).with_name("pitch_deck.pdf"))
