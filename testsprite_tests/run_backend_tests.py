#!/usr/bin/env python3
"""
Kademe QMS - Backend (Supabase API) Test Suite
Supabase Auth ve REST API testleri.

Kullanım:
  python3 testsprite_tests/run_backend_tests.py

Gereksinimler:
  pip install requests

Ortam değişkenleri veya .env'den:
  SUPABASE_URL, SUPABASE_ANON_KEY, LOGIN_EMAIL, LOGIN_PASSWORD
"""
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ requests paketi gerekli: pip install requests")
    sys.exit(1)

# .env varsa yükle
env_path = Path(__file__).parent.parent / ".env.local"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.strip().split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL") or "https://ryvczrubujzlanvqiqlk.supabase.co"
SUPABASE_ANON_KEY = (
    os.getenv("VITE_SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ"
)
LOGIN_EMAIL = os.getenv("LOGIN_EMAIL", "atakan.battal@kademe.com.tr")
LOGIN_PASSWORD = os.getenv("LOGIN_PASSWORD", "atakan1234.")

results = []


def record(name, status, error=""):
    results.append({"title": name, "status": status, "error": error})
    icon = "✅" if status == "PASSED" else "❌"
    print(f"  {icon} {name}" + (f" — {error[:80]}" if error else ""))


def run_tests():
    if not SUPABASE_ANON_KEY:
        print("❌ SUPABASE_ANON_KEY veya VITE_SUPABASE_ANON_KEY tanımlı değil.")
        sys.exit(1)

    headers = {"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"}

    # BE001: Auth - Geçerli giriş
    print("\n🔐 BE001: Supabase Auth - Geçerli giriş...")
    try:
        r = requests.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=headers,
            json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200, f"Status {r.status_code}"
        data = r.json()
        assert "access_token" in data
        token = data["access_token"]
        record("BE001-Supabase Auth Geçerli Giriş", "PASSED")
    except Exception as e:
        record("BE001-Supabase Auth Geçerli Giriş", "FAILED", str(e))
        token = None

    # BE002: Auth - Geçersiz giriş
    print("🔐 BE002: Supabase Auth - Geçersiz giriş reddi...")
    try:
        r = requests.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=headers,
            json={"email": "wrong@example.com", "password": "wrongpass"},
            timeout=15,
        )
        assert r.status_code == 400
        record("BE002-Supabase Auth Geçersiz Giriş Reddi", "PASSED")
    except Exception as e:
        record("BE002-Supabase Auth Geçersiz Giriş Reddi", "FAILED", str(e))

    # BE003: REST - profiles (token gerekli)
    print("📋 BE003: Supabase REST - profiles tablosu...")
    if token:
        try:
            r = requests.get(
                f"{SUPABASE_URL}/rest/v1/profiles?select=id,full_name&limit=1",
                headers={**headers, "Authorization": f"Bearer {token}"},
                timeout=15,
            )
            assert r.status_code == 200
            assert isinstance(r.json(), list)
            record("BE003-Supabase REST profiles", "PASSED")
        except Exception as e:
            record("BE003-Supabase REST profiles", "FAILED", str(e))
    else:
        record("BE003-Supabase REST profiles", "FAILED", "Token alınamadı (BE001 başarısız)")

    # Rapor
    passed = sum(1 for r in results if r["status"] == "PASSED")
    failed = sum(1 for r in results if r["status"] == "FAILED")
    total = len(results)

    print(f"\n{'='*55}")
    print(f"  SONUÇ: {passed}/{total} başarılı ({passed*100//total}%)")
    print(f"  ✅ Başarılı: {passed}  |  ❌ Başarısız: {failed}")
    print(f"{'='*55}\n")

    report = {
        "date": datetime.now().isoformat(),
        "total": total,
        "passed": passed,
        "failed": failed,
        "tests": results,
    }
    report_path = Path(__file__).parent / "tmp" / "backend_test_results.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"📄 Rapor: {report_path}")

    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
