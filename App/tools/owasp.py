import time
import requests
from zapv2 import ZAPv2

def run_owasp_zap_scan(target_url: str) -> list:
    zap_proxy_address = "http://127.0.0.1:8090"
    
    # Check if ZAP daemon is listening
    try:
        requests.get(zap_proxy_address, timeout=1.0)
    except Exception:
        print("[WARN] OWASP ZAP daemon is not running on port 8090. Skipping ZAP phase.")
        return []

    try:
        zap = ZAPv2(proxies={"http": zap_proxy_address, "https": zap_proxy_address})
        
        # Limit Spider Depth
        zap.spider.set_option_max_depth(2)
        zap.spider.set_option_max_children(10)
        
        print(f"[ZAP] Seeding target: {target_url}")
        zap.urlopen(target_url)
        time.sleep(1)

        print("[ZAP] Starting Fast Spider...")
        spider_id = zap.spider.scan(target_url)
        while int(zap.spider.status(spider_id)) < 100:
            time.sleep(1)

        time.sleep(2)

        # Disable all scanners and enable key fast rules
        zap.ascan.disable_all_scanners()
        fast_rules = "40012,40014,40018,10020,10021"
        zap.ascan.enable_scanners(fast_rules)

        print("[ZAP] Starting Fast Active Scan...")
        scan_id = zap.ascan.scan(target_url)
        while int(zap.ascan.status(scan_id)) < 100:
            time.sleep(2)

        raw_alerts = zap.core.alerts()
        severity_map = {"High": "critical", "Medium": "medium", "Low": "low", "Informational": "info"}

        findings = []
        for i, alert in enumerate(raw_alerts):
            findings.append({
                "id": f"zap-{i+1}",
                "severity": severity_map.get(alert.get("risk"), "info"),
                "vulnerability": alert.get("alert", "Web Security Issue"),
                "affectedAsset": alert.get("url", target_url),
                "cvss": 7.5 if alert.get("risk") == "High" else (5.0 if alert.get("risk") == "Medium" else 2.5),
                "status": "Confirmed",
                "discoveredAt": int(time.time() * 1000),
                "description": alert.get("description", "Identified by ZAP Fast Scan."),
                "evidence": alert.get("evidence", "") or f"Parameter: {alert.get('param', 'N/A')}"
            })

        print(f"[ZAP] Fast Scan complete. Total Findings: {len(findings)}")
        return findings

    except Exception as e:
        print(f"[ERR] ZAP Execution Error: {str(e)}")
        return []