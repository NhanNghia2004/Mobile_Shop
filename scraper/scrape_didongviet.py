#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Script cào dữ liệu sản phẩm từ didongviet.vn
Nhập trực tiếp vào MySQL database của Mobile_Shop

Cài thư viện cần thiết (chạy 1 lần):
    pip install requests beautifulsoup4 pymysql selenium webdriver-manager
"""

import time
import re
import pymysql
import bs4
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

# =============================================
# CẤU HÌNH DATABASE (khớp với .env của bạn)
# =============================================
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",           # DB_PASSWORD trong .env (đang trống)
    "database": "phone_store",
    "charset": "utf8mb4",
}

# =============================================
# CẤU HÌNH CÀO
# =============================================
BASE_URL      = "https://didongviet.vn"
LIST_URL      = "https://didongviet.vn/dien-thoai.html"
MAX_PAGES     = 5    # Số trang danh sách muốn cào
DELAY         = 2    # Giây chờ giữa mỗi request


# =============================================
# HÀM TIỆN ÍCH
# =============================================
def get_db():
    return pymysql.connect(**DB_CONFIG, cursorclass=pymysql.cursors.DictCursor)


def extract_brand(name: str) -> str:
    mapping = {
        "iphone": "Apple", "apple": "Apple",
        "samsung": "Samsung",
        "xiaomi": "Xiaomi", "redmi": "Xiaomi", "poco": "Xiaomi",
        "oppo": "Oppo",
        "vivo": "Vivo",
        "realme": "Realme",
        "honor": "Honor",
        "tecno": "TECNO",
        "infinix": "Infinix",
        "nokia": "Nokia",
        "asus": "Asus",
        "google": "Google", "pixel": "Google",
        "huawei": "Huawei",
        "oneplus": "OnePlus",
        "nothing": "Nothing",
    }
    n = name.lower()
    for key, brand in mapping.items():
        if key in n:
            return brand
    return "Unknown"


def parse_price(text: str) -> float:
    cleaned = re.sub(r"[^\d]", "", text or "")
    return float(cleaned) if cleaned else 0.0


def create_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    svc = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=svc, options=opts)


# =============================================
# CÀO TRANG DANH SÁCH
# =============================================
def scrape_list(driver, page: int) -> list:
    url = LIST_URL if page == 1 else f"{LIST_URL}?page={page}"
    print(f"  → Trang {page}: {url}")
    driver.get(url)
    time.sleep(DELAY)

    results = []

    # Wait for cards to load
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'a[class*="group/product-card"]'))
        )
    except Exception:
        pass

    cards = driver.find_elements(By.CSS_SELECTOR, 'a[class*="group/product-card"]')
    seen = set()
    for card in cards:
        try:
            href = card.get_attribute("href") or ""
            if not href or href in seen:
                continue
            seen.add(href)

            # Name
            name_el = card.find_element(By.CSS_SELECTOR, 'p[class*="text-sm"]')
            name = name_el.text.strip()

            # Price
            try:
                price_el = card.find_element(By.CSS_SELECTOR, 'p[class*="text-primary-500"]')
                price_str = price_el.text.strip()
            except Exception:
                price_str = "0"

            # Image
            try:
                img_el = card.find_element(By.CSS_SELECTOR, 'img')
                img_url = img_el.get_attribute("src") or img_el.get_attribute("data-src") or ""
            except Exception:
                img_url = ""

            results.append({
                "name": name,
                "url": href,
                "price_str": price_str,
                "img_url": img_url
            })
        except Exception:
            continue

    print(f"  ✓ {len(results)} sản phẩm")
    return results


# =============================================
# CÀO CHI TIẾT SẢN PHẨM (NÂNG CẤP)
# =============================================
def scrape_detail(driver, url: str) -> dict:
    driver.get(url)
    time.sleep(DELAY)

    d = {
        "name": "", "description": "", "image_url": "",
        "gallery": [], "base_price": 0.0, "discount_price": None,
        "screen_size": None, "battery": None, "ram": None,
        "storages": [], "variants": [], "specs": {}
    }

    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))
    except Exception:
        return d

    # Click "Xem tất cả" to load specs modal
    try:
        buttons = driver.find_elements(By.XPATH,
            "//button[contains(., 'Xem tất cả') or contains(@aria-label, 'Xem tất cả')]")
        for btn in buttons:
            txt = btn.text.strip()
            aria = btn.get_attribute("aria-label") or ""
            if 'thông số' in aria.lower() or 'thông số' in txt.lower():
                driver.execute_script("arguments[0].click();", btn)
                time.sleep(1.5)
                break
    except Exception:
        pass

    soup = bs4.BeautifulSoup(driver.page_source, 'html.parser')

    # 1. Tên
    h1 = soup.find('h1')
    if h1:
        d["name"] = h1.text.strip()

    # 2. Mô tả
    for sel in [".product-short-description", ".product-description",
                ".product-info-detail", "div[class*='description']"]:
        try:
            desc_el = soup.select_one(sel)
            if desc_el:
                d["description"] = desc_el.text.strip()[:2000]
                break
        except Exception:
            pass

    # 3. Ảnh chính
    for sel in [".product-image-main img", ".slider-main img",
                ".product-img img", "img.product-img", "img[class*='product-img']"]:
        try:
            img = soup.select_one(sel)
            if img:
                d["image_url"] = img.get('src') or img.get('data-src') or ""
                if d["image_url"]:
                    break
        except Exception:
            pass

    # 4. Gallery ảnh (Lọc sạch các ảnh phụ kiện không liên quan)
    ACCESSORY_KEYWORDS = [
        'cuong-luc', 'op-lung', 'cu-sac', 'cap-sac',
        'dan-ppf', 'dan-kinh', 'bao-da', 'op_lung',
        'cu_sac', 'cap_sac', 'dan_ppf', 'dan_cuong_luc',
        'kcl_', 'acefast', 'zagg_', 'esr_', 'mipow_',
        'zeelot', 'horizone', 'kingbull'
    ]
    seen_imgs = set()
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src') or ''
        alt = img.get('alt') or ''
        if src and ('products/' in src or 'default/' in src) and 'banner/' not in src and 'logo' not in src:
            src_lower = src.lower()
            alt_lower = alt.lower()
            # Lọc bỏ phụ kiện
            is_accessory = any(ac in src_lower or ac in alt_lower for ac in ACCESSORY_KEYWORDS)
            if not is_accessory:
                clean_src = src.split('?')[0]
                if clean_src not in seen_imgs:
                    seen_imgs.add(clean_src)
                    d["gallery"].append(src)

    if not d["gallery"] and d["image_url"]:
        d["gallery"] = [d["image_url"]]

    # 5. Giá chính
    price_active_el = soup.find('div', class_=lambda c: c and 'text-2xl' in c and 'font-bold' in c)
    if price_active_el:
        d["discount_price"] = parse_price(price_active_el.text)

    price_old_el = soup.find('span', class_=lambda c: c and 'line-through' in c)
    if price_old_el:
        d["base_price"] = parse_price(price_old_el.text)
    else:
        d["base_price"] = d["discount_price"] or 0.0

    # 6. Biến thể bộ nhớ (Phiên bản)
    storage_container = None
    for div in soup.find_all('div'):
        p_tag = div.find('p')
        if p_tag and 'Phiên bản' in p_tag.text:
            storage_container = div
            break

    if storage_container:
        for a in storage_container.find_all(['a', 'div'], class_=lambda c: c and 'border' in c):
            txt = a.text.strip()
            m = re.match(r'^(\d+)\s*(GB|TB)$', txt, re.IGNORECASE)
            if m:
                val = int(m.group(1))
                if m.group(2).upper() == "TB":
                    val *= 1024
                if val not in d["storages"]:
                    d["storages"].append(val)

    if not d["storages"]:
        m = re.search(r"(\d+)\s*GB", d["name"], re.IGNORECASE)
        d["storages"] = [int(m.group(1))] if m else [128]

    # 7. Biến thể Màu sắc
    color_container = None
    for div in soup.find_all('div'):
        p_tag = div.find('p')
        if p_tag and 'Màu sắc sản phẩm' in p_tag.text:
            color_container = div
            break

    # Danh sách từ khóa rác cần loại bỏ (text của các nút CTA, không phải màu sắc)
    COLOR_BLACKLIST = [
        'xem thêm', 'ưu đãi', 'mua ngay', 'trả góp', 'xem chi tiết',
        'xem ngay', 'đặt trước', 'thanh toán', 'thêm vào giỏ', 'so sánh',
        'đăng ký', 'tư vấn', 'liên hệ', 'hotline', 'chat', 'zalo',
        'giảm giá', 'khuyến mãi', 'flash sale', 'deal', 'voucher',
    ]

    if color_container:
        buttons = color_container.find_all('button')
        for btn in buttons:
            span_name = btn.find('span', class_=lambda c: c and 'text-gray-900' in c)
            span_price = btn.find('span', class_=lambda c: c and 'text-gray-600' in c)
            img_tag = btn.find('img')

            # Nút màu thật luôn có ảnh sản phẩm - nếu không có img thì bỏ qua
            if not img_tag:
                continue

            color_name = span_name.text.strip() if span_name else ""
            if not color_name:
                lines = [l.strip() for l in btn.text.split('\n') if l.strip()]
                if lines:
                    color_name = lines[0]

            # Lọc bỏ text rác
            if not color_name:
                continue
            color_lower = color_name.lower()
            if any(bl in color_lower for bl in COLOR_BLACKLIST):
                continue

            variant_price = parse_price(span_price.text) if span_price else d["discount_price"]
            variant_img = img_tag.get('src') or img_tag.get('data-src') or ""
            if variant_img:
                variant_img = variant_img.split('?')[0]

            d["variants"].append({
                "color": color_name,
                "price": variant_price,
                "image": variant_img
            })

    if not d["variants"]:
        d["variants"].append({
            "color": "Đen",
            "price": d["discount_price"] or d["base_price"],
            "image": d["gallery"][0] if d["gallery"] else ""
        })

    # 8. Thông số kỹ thuật từ modal (tìm class chứa z-201)
    modal = None
    for div in soup.find_all('div', class_=lambda c: c and 'z-201' in c):
        if 'Thông số kỹ thuật' in div.text:
            modal = div
            break

    if not modal:
        for div in soup.find_all('div'):
            text = div.text or ""
            if ('Thông số kỹ thuật' in text and 'Hệ điều hành' in text
                    and 1000 < len(text) < 15000):
                modal = div
                break

    if modal:
        rows = modal.find_all('div', class_=lambda c: c and 'grid-cols-' in c)
        for row in rows:
            children = row.find_all(recursive=False)
            if len(children) >= 2:
                lbl = children[0].text.strip()
                v = children[1].text.strip()
                if lbl and v:
                    d["specs"][lbl] = v

    # 9. Trích xuất thông số kỹ thuật chuẩn từ specs dict
    # RAM
    ram_str = (d["specs"].get("RAM")
               or d["specs"].get("Bộ nhớ RAM")
               or d["specs"].get("Dung lượng RAM") or "")
    ram_m = re.search(r'(\d+)\s*(?:GB|ram)', ram_str, re.IGNORECASE)
    if not ram_m:
        all_specs_text = " ".join(d["specs"].values())
        ram_m = re.search(r'(?:ram|dung lượng ram)[\s:]*(\d+)\s*gb',
                          all_specs_text + " " + d["name"], re.IGNORECASE)
    d["ram"] = int(ram_m.group(1)) if ram_m else None

    # Pin (Chỉ lấy dung lượng mAh thực tế từ 1000 đến 7000)
    pin_str = d["specs"].get("Dung lượng pin") or d["specs"].get("Pin") or ""
    pin_m = re.search(r'(\d{4,5})', pin_str)
    if pin_m and 1000 <= int(pin_m.group(1)) <= 7000:
        d["battery"] = int(pin_m.group(1))
    else:
        all_specs_text = " ".join(d["specs"].values())
        pin_m2 = re.search(r'(?:pin|battery|dung lượng pin)[\s:]*(\d{4,5})\s*mah',
                           all_specs_text + " " + d["name"], re.IGNORECASE)
        if pin_m2 and 1000 <= int(pin_m2.group(1)) <= 7000:
            d["battery"] = int(pin_m2.group(1))
        else:
            d["battery"] = None

    # Màn hình
    scr_str = (d["specs"].get("Màn hình rộng")
               or d["specs"].get("Kích thước màn hình") or "")
    scr_m = re.search(r'(\d+[.,]\d+)', scr_str)
    if not scr_m:
        all_specs_text = " ".join(d["specs"].values())
        scr_m = re.search(r'(?:màn hình|screen|kích thước màn hình)[\s:]*(\d+[.,]\d+)',
                          all_specs_text + " " + d["name"], re.IGNORECASE)
    d["screen_size"] = float(scr_m.group(1).replace(",", ".")) if scr_m else None

    # Hệ điều hành
    os_str = d["specs"].get("Hệ điều hành") or ""
    if "ios" in os_str.lower() or "iphone" in d["name"].lower():
        d["os"] = "IOS"
    elif any(kw in d["name"].lower() for kw in ["samsung", "xiaomi", "oppo",
             "vivo", "realme", "honor", "tecno", "redmi", "poco",
             "infinix", "nothing", "oneplus", "google", "pixel"]):
        d["os"] = "ANDROID"
    elif "android" in os_str.lower():
        d["os"] = "ANDROID"
    else:
        d["os"] = "ANDROID"

    return d


# =============================================
# LƯU VÀO DATABASE
# =============================================
def save_product(db, basic: dict, detail: dict):
    cur = db.cursor()
    name = detail.get("name") or basic.get("name", "")
    if not name:
        cur.close()
        return

    # Bỏ qua nếu đã tồn tại
    cur.execute("SELECT id FROM products WHERE name = %s", (name,))
    if cur.fetchone():
        print(f"    ⏭  Đã có: {name}")
        cur.close()
        return

    brand       = extract_brand(name)
    description = detail.get("description", "")
    image_url   = detail.get("image_url") or basic.get("img_url", "")
    os_type     = detail.get("os", "ANDROID")
    now         = datetime.now()

    # Insert product
    cur.execute("""
        INSERT INTO products
            (name, brand, description, image_url, category, os,
             screen_size, battery_capacity, ram,
             status, sold_count, rating, review_count,
             created_at, updated_at)
        VALUES (%s, %s, %s, %s, 'SMARTPHONE', %s, %s, %s, %s,
                'ACTIVE', 0, 0.0, 0, %s, %s)
    """, (
        name, brand, description, image_url, os_type,
        detail.get("screen_size"), detail.get("battery"), detail.get("ram"),
        now, now
    ))
    product_id = cur.lastrowid
    db.commit()

    # Các variant và gallery
    variants = detail.get("variants", [])
    storages = detail.get("storages", [128])
    gallery  = detail.get("gallery", [])

    # Nếu không có variant (sản phẩm chưa mở bán), bỏ qua việc lưu
    if not variants:
        print(f"    ⚠️ Bỏ qua {name} – không có variant (đang cập nhật)")
        cur.close()
        return

    # Insert từng variant (storage × color)
    for storage in storages:
        for v in variants:
            color = v.get("color", "Đen")
            price = v.get("price") or detail.get("base_price") or parse_price(basic.get("price_str", "0"))
            discount_price = detail.get("discount_price") if price == detail.get("base_price") else None


            cur.execute("""
                INSERT INTO product_variants
                    (product_id, storage, color, color_hex,
                     price, discount_price, stock_quantity, status)
                VALUES (%s, %s, %s, NULL, %s, %s, %s, 'ACTIVE')
            """, (product_id, storage, color, price, discount_price, 10))
            variant_id = cur.lastrowid

            # Ảnh variant: ảnh màu lên đầu, sau đó gallery sản phẩm
            variant_img = v.get("image")
            imgs = []
            if variant_img:
                imgs.append(variant_img)
            for gimg in gallery:
                if gimg not in imgs:
                    imgs.append(gimg)

            for idx, iurl in enumerate(imgs[:6]):
                cur.execute("""
                    INSERT INTO product_variant_images
                        (variant_id, image_url, display_order)
                    VALUES (%s, %s, %s)
                """, (variant_id, iurl, idx))

    db.commit()
    cur.close()
    print(f"    ✅ {name} | brand={brand} | {len(storages)} storage × {len(variants)} màu")


# =============================================
# MAIN
# =============================================
def main():
    print("=" * 60)
    print("[SCRAPER] Di Dong Viet -> MySQL phone_store")
    print("=" * 60)

    # Ket noi DB
    print("\n[*] Ket noi database...")
    try:
        db = get_db()
        print("[OK] Ket noi thanh cong!")
    except Exception as e:
        print(f"[ERROR] Loi DB: {e}")
        return

    # Khoi dong Chrome
    print("[*] Khoi dong Chrome (headless)...")
    driver = create_driver()
    print("[OK] Chrome san sang!\n")

    all_items = []
    try:
        # === Buoc 1: Thu thap danh sach ===
        print(f"[*] Cao danh sach san pham ({MAX_PAGES} trang)...")
        for pg in range(1, MAX_PAGES + 1):
            items = scrape_list(driver, pg)
            if not items:
                print(f"  [!] Trang {pg} trong, dung.")
                break
            all_items.extend(items)
            time.sleep(1)
        print(f"\n[*] Tong cong: {len(all_items)} san pham\n")

        # === Buoc 2: Cao chi tiet + Luu DB ===
        for i, item in enumerate(all_items, 1):
            name_display = item.get('name', item['url'])
            print(f"[{i}/{len(all_items)}] {name_display}")
            try:
                detail = scrape_detail(driver, item["url"])
                save_product(db, item, detail)
            except Exception as e:
                print(f"    [ERROR] {e}")
            time.sleep(DELAY)

    finally:
        driver.quit()
        db.close()
        print("\n" + "=" * 60)
        print("[DONE] Hoan thanh! Trinh duyet va DB da dong.")
        print("=" * 60)


if __name__ == "__main__":
    main()
