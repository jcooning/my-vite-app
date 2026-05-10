"""
숨고 견적서 PDF → Notion 마이그레이션 스크립트
2022~2025년 4개 파일, 약 244건 처리
"""
import pdfplumber
import re
import json
import time
import urllib.request

NOTION_API_KEY = "your_notion_api_key_here"  # .env 파일에서 불러오거나 직접 입력
DATABASE_ID    = "302d17afaf13803f997bd60ee632e16a"
NOTION_VERSION = "2022-06-28"

PDF_FILES = [
    "/Users/junghoon/Desktop/2022 숨고견적서.pdf",
    "/Users/junghoon/Desktop/2023 숨고견적서 .pdf",
    "/Users/junghoon/Desktop/2024년 숨고견적서.pdf",
    "/Users/junghoon/Desktop/2025년 숨고견적서 .pdf",
]

PHOTOGRAPHER_PHONE = "010-3073-1369"
SKIP_NAME_WORDS = {"본식촬영", "촬영", "스페셜리스트", "숨고", "Tel", "Email", "구분"}

# ── 파싱 유틸 ─────────────────────────────────────────

def parse_phone(text):
    m = re.search(r'010[\s\-.]?(\d{4})[\s\-.]?(\d{4})', text)
    if m:
        return f"010-{m.group(1)}-{m.group(2)}"
    return ""

def parse_time_str(text):
    """'오전/오후 N시 M분' → 'HH:MM'"""
    m = re.search(r'(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})?\s*분?', text)
    if not m:
        return ""
    ampm, h, mi = m.groups()
    h  = int(h)
    mi = int(mi) if mi else 0
    if ampm == "오후" and h != 12:
        h += 12
    elif not ampm and 1 <= h <= 7:
        h += 12
    return f"{h:02d}:{mi:02d}"

def find_max_price(text):
    prices = [int(p.replace(",","")) for p in re.findall(r'([\d,]+)원', text)]
    return max(prices) if prices else 0

def clean_name(s):
    """이름에서 불필요 단어 제거"""
    for w in SKIP_NAME_WORDS:
        if s == w:
            return ""
    return s if re.match(r'^[가-힣A-Za-z]+$', s) else ""

# ── 통합 파서 ─────────────────────────────────────────

def parse_page(text):
    if not text:
        return None
    text = text.replace('\x00', ' ')
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # 커버 페이지 스킵 (내용 없는 페이지)
    if len(lines) < 5:
        return None

    groom_name = bride_name = ""
    groom_phone = bride_phone = ""
    location = address = ""

    # ── 이름 / 전화번호 ──────────────────────────────
    for line in lines:
        ph = parse_phone(line)
        if ph == PHOTOGRAPHER_PHONE:
            ph = ""

        if line.startswith("신랑"):
            parts = line.split()
            if len(parts) >= 2:
                groom_name = clean_name(parts[1])
            if ph:
                groom_phone = ph

        elif line.startswith("신부"):
            parts = line.split()
            if len(parts) >= 2:
                bride_name = clean_name(parts[1])
            if ph:
                bride_phone = ph

    if not groom_name and not bride_name:
        return None

    # ── 날짜 (전체 텍스트에서 탐색) ──────────────────
    date_str = ""
    date_m = re.search(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일', text)
    if date_m:
        y, mo, dy = date_m.groups()
        date_str = f"{y}-{int(mo):02d}-{int(dy):02d}"

    # ── 시간 (날짜 이후 200자 내에서 탐색) ───────────
    time_str = ""
    if date_m:
        after = text[date_m.start():date_m.start()+300]
        time_str = parse_time_str(after)

    # ── 장소 / 주소 ───────────────────────────────────
    # 패턴 A (신형 2024+): "신랑 [name] [venue]\nTel 장소\n신부 [name] [phone] [address]"
    new_venue = re.search(r'신랑\s+\S+\s+(.+)\nTel\s+장소', text)
    if new_venue:
        location = new_venue.group(1).strip()

    # 패턴 B (신형): 신부 라인 뒤 주소 (전화번호 이후)
    if not address:
        bride_addr = re.search(r'신부\s+\S+\s+010[\d\s\-]+\s+(.+)', text)
        if bride_addr:
            addr_cand = bride_addr.group(1).strip()
            if re.search(r'[구시로길]', addr_cand):
                address = addr_cand

    # 패턴 C (구형 2022): "장소 [venue명](주소)" 같은 줄
    if not location:
        same_line = re.search(r'장소\s+([^\n]+)', text)
        if same_line:
            loc_cand = same_line.group(1).strip()
            loc_cand = re.sub(r'(촬영날짜|견적일|구분|본식|숨고|Tel|Email).*', '', loc_cand).strip()
            loc_name = re.split(r'\(', loc_cand)[0].strip()
            if loc_name:
                location = loc_name
            addr_in = re.search(r'\(([^)]+)\)', loc_cand)
            if addr_in and not address:
                address = addr_in.group(1).strip()

    # 패턴 D (구형 2023): "2023년 X월 Y일 요일 [장소명]\n예식날짜/시간 장소"
    if not location:
        loc_m = re.search(r'\d{4}년\s*\d{1,2}월\s*\d{1,2}일\s*\S+요일\s+([^\n(]+)', text)
        if loc_m:
            candidate = loc_m.group(1).strip()
            candidate = re.sub(r'(오전|오후)?\d{1,2}시.*', '', candidate).strip()
            if candidate:
                location = candidate

    # 패턴 E: "장소\n[venue]" 별도 라인
    if not location:
        for i, line in enumerate(lines):
            if line == "장소" and i+1 < len(lines):
                nxt = lines[i+1].strip()
                if nxt and "견적일" not in nxt and "Tel" not in nxt:
                    location = nxt
                    break

    # 괄호 안 주소: 아직 못 잡은 경우
    if not address:
        addr_m = re.search(r'\(([가-힣\d\w\s]+[구군시도로길]\s*[\d\w\s\-]+)\)', text)
        if addr_m:
            address = addr_m.group(1).strip()

    # "주소 [addr]" 라인
    if not address:
        for line in lines:
            if line.startswith("주소"):
                address = re.sub(r'^주소\s*', '', line).strip()
                break

    # ── 총액 ──────────────────────────────────────────
    total = 0
    # "= X,XXX원" 우선 (합산 표현)
    eq_m = re.search(r'=\s*([\d,]+)원', text)
    if eq_m:
        total = int(eq_m.group(1).replace(",",""))

    # "총액: X원" or "견적\nX원"
    if not total:
        tot_m = re.search(r'총액[:\s]*([\d,]+)원', text)
        if tot_m:
            total = int(tot_m.group(1).replace(",",""))

    # 단독 금액 라인 (신형 포맷: "485,000원" 단독)
    if not total:
        for line in reversed(lines):
            if re.match(r'^[\d,]+원$', line):
                total = int(line.replace(",","").replace("원",""))
                break

    if not total:
        total = find_max_price(text)

    # ── 옵션 메모 ─────────────────────────────────────
    opt_kw = ["폐백", "2부피로연", "식전원판", "교회예식", "피로연인사", "시외출장",
              "야외웨딩", "추가촬영", "1시간"]
    memo_parts = []
    for line in lines:
        if any(kw in line for kw in opt_kw):
            if "안내" not in line and "•" not in line and "촬영안내" not in line:
                clean = re.sub(r'^기타\s*', '', line).strip()
                if clean:
                    memo_parts.append(clean)

    return {
        "groomName":  groom_name,
        "brideName":  bride_name,
        "groomPhone": groom_phone,
        "bridePhone": bride_phone,
        "date":       date_str,
        "time":       time_str,
        "location":   location,
        "address":    address,
        "totalPrice": total,
        "memo":       " / ".join(memo_parts),
    }

# ── Notion API ────────────────────────────────────────

def notion_create(record):
    name = f"{record['groomName']} & {record['brideName']}"
    location_full = record['location']
    if record['address']:
        location_full += f" ({record['address']})"

    props = {
        "예약자명": {"title": [{"text": {"content": name}}]},
        "총 금액":  {"number": record["totalPrice"]},
    }
    if record["date"]:
        props["예식 날짜"] = {"date": {"start": record["date"]}}
    if record["time"]:
        props["예식 시간"] = {"rich_text": [{"text": {"content": record["time"]}}]}
    if location_full:
        props["예식 장소"] = {"rich_text": [{"text": {"content": location_full}}]}
    if record["groomPhone"]:
        props["신랑 연락처"] = {"rich_text": [{"text": {"content": record["groomPhone"]}}]}
    if record["bridePhone"]:
        props["신부 연락처"] = {"rich_text": [{"text": {"content": record["bridePhone"]}}]}
    if record["memo"]:
        props["상담메모"] = {"rich_text": [{"text": {"content": record["memo"]}}]}

    payload = json.dumps({
        "parent": {"database_id": DATABASE_ID},
        "properties": props
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.notion.com/v1/pages",
        data=payload,
        headers={
            "Authorization": f"Bearer {NOTION_API_KEY}",
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

# ── 메인 ─────────────────────────────────────────────

def main():
    all_records = []
    skipped = []

    for pdf_path in PDF_FILES:
        year = pdf_path.split('/')[-1][:4]
        with pdfplumber.open(pdf_path) as pdf:
            year_ok = 0
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                r = parse_page(text)
                if r and r["groomName"] and r["date"]:
                    all_records.append(r)
                    year_ok += 1
                elif r and r["groomName"]:
                    skipped.append((year, i+1, r))
            print(f"📄 {year}: {year_ok}건 파싱 성공")

    print(f"\n총 {len(all_records)}건 / 미완성 {len(skipped)}건")

    if skipped:
        print(f"\n날짜 누락 {len(skipped)}건 (샘플):")
        for yr, pg, r in skipped[:5]:
            print(f"  {yr} p{pg}: {r['groomName']} & {r['brideName']} | 날짜:{r['date']} | 장소:{r['location']}")

    print(f"\n── 샘플 5건 ──")
    for r in all_records[:5]:
        print(f"  {r['groomName']} & {r['brideName']} | {r['date']} {r['time']} | {r['location']} | ₩{r['totalPrice']:,}")

    print(f"\nNotion에 {len(all_records)}건 업로드하시겠습니까? (y/n): ", end="")
    ans = input().strip().lower()
    if ans != "y":
        print("취소됨.")
        return

    ok = fail = 0
    for i, r in enumerate(all_records):
        try:
            notion_create(r)
            print(f"  ✅ [{i+1}/{len(all_records)}] {r['groomName']} & {r['brideName']} {r['date']}")
            ok += 1
            time.sleep(0.35)
        except Exception as e:
            print(f"  ❌ [{i+1}] {r['groomName']} & {r['brideName']} → {e}")
            fail += 1

    print(f"\n완료: 성공 {ok}건 / 실패 {fail}건")

if __name__ == "__main__":
    main()
