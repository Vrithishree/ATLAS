from App.tools.scanner import run_nmap_discovery
from App.tools.openvas import run_openvas_scan
from App.tools.openscap import run_openscap_audit
from App.tools.owasp import run_owasp_zap_scan

def run_pipeline_orchestration(target: str) -> dict:
    """
    Triggers and groups vulnerability engines systematically.
    """
    results = {
        "nmap": "Executing...",
        "openvas": "Skipped",
        "openscap": "Skipped",
        "owasp_zap": "Skipped"
    }
    
    # 1. Run Nmap Discovery Scan (First step)
    nmap_results = run_nmap_discovery(target)
    results["nmap"] = nmap_results["raw_output"]
    
    # If Nmap fails completely, stop execution to prevent invalid target checks
    if not nmap_results["success"]:
        return results
        
    # 2. Run OpenVAS Network Vulnerability Scan
    results["openvas"] = run_openvas_scan(target)
    
    # 3. Run OpenSCAP Compliance Audit Scan
    results["openscap"] = run_openscap_audit(target)
    
    # 4. Run OWASP ZAP only if Nmap detected an open web port
    if nmap_results["is_web_exposed"]:
        target_web_url = f"http://{target}"
        results["owasp_zap"] = run_owasp_zap_scan(target_web_url)
    else:
        results["owasp_zap"] = "Bypassed (No web ports [80, 443, 8080] detected by Nmap)."
        
    return results