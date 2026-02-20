#!/usr/bin/env python3
"""Check auth diagnostic endpoint on production."""
import json, sys, urllib.parse, urllib.request

url = "https://social.topnetworks.co/api/auth-test"
req = urllib.request.Request(url)
with urllib.request.urlopen(req, timeout=15) as resp:
    d = json.loads(resp.read())

print("=== VERIFICATION RECORDS ===")
print("Total count:", d.get("verificationCount", "N/A"))
for v in d.get("recentVerifications", []):
    print(f"  id={v.get('id','NULL')} | identifier={v.get('identifier','?')} | expires={v.get('expiresAt','?')} | created={v.get('createdAt','?')}")
    print(f"    value preview: {str(v.get('valuePreview','?'))[:80]}")

print("\n=== USERS ===")
for u in d.get("users", []):
    print(f"  {u.get('email','?')} | {u.get('name','?')} | created={u.get('createdAt','?')}")

print("\n=== SESSIONS ===")
for s in d.get("recentSessions", []):
    print(f"  userId={s.get('userId','?')} | expires={s.get('expiresAt','?')}")

print("\n=== SIGN-IN TEST ===")
si = d.get("directSignIn", {})
print("Status:", si.get("status"))
if si.get("url"):
    parsed = urllib.parse.urlparse(si["url"])
    params = urllib.parse.parse_qs(parsed.query)
    print("redirect_uri:", params.get("redirect_uri", ["N/A"])[0])
    print("code_challenge:", "present" if "code_challenge" in params else "MISSING")
if si.get("message"):
    print("Error:", si["message"][:300])

print("\n=== AUTH CONFIG ===")
ao = d.get("authOptions", {})
print("baseURL:", ao.get("baseURL"))
print("socialProviders:", ao.get("socialProvidersConfigured"))
