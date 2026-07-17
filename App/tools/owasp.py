from zapv2 import ZAPv2
import time

def run_owasp_zap_scan(target_url: str) -> str:
    """
    Interfaces with running OWASP ZAP proxy instance to spider and actively scan target URLs.
    """
    # Replace with local OWASP ZAP proxy port configuration details
    zap_proxy_address = "http://127.0.0.1:8080"
    
    try:
        zap = ZAPv2(proxies={"http": zap_proxy_address, "https": zap_proxy_address})
        
        # 1. Spider the web application pathways
        print(f"Triggering OWASP ZAP Spider against endpoint: {target_url}")
        spider_id = zap.spider.scan(target_url)
        while int(zap.spider.status(spider_id)) < 100:
            time.sleep(1)
            
        # 2. Launch Active Application Vulnerability Scans
        print(f"Triggering OWASP ZAP Active Scan on endpoint: {target_url}")
        scan_id = zap.ascan.scan(target_url)
        while int(zap.ascan.status(scan_id)) < 100:
            time.sleep(2)
            
        # 3. Pull generated threat findings
        alerts = zap.core.alerts(baseurl=target_url)
        findings = []
        
        for alert in alerts[:15]: # Show top 15 alerts to limit payload clutter
            findings.append(
                f"- [{alert['risk']} Risk] {alert['alert']} | Location: {alert['url']} | Parameter: {alert['param']}"
            )
            
        return "\n".join(findings) if findings else "Web Application Clean. No security alerts detected."
        
    except Exception as e:
        return f"[OWASP ZAP Bypass Output]: Web Proxy at {zap_proxy_address} unreachable. Verify ZAP is running in background. Details: {str(e)}"