import nmap

def run_nmap_discovery(target: str) -> dict:
    """
    Runs an active discovery scan on standard ports.
    Returns structured results and flags if web application ports are exposed.
    """
    try:
        nm = nmap.PortScanner()
        # -F scans top 100 common ports quickly and safely
        # -sV detects service versions running on open ports
        nm.scan(target, arguments="-F -sV")
        
        ports_list = []
        is_web_exposed = False
        raw_text_list = []
        
        for host in nm.all_hosts():
            host_header = f"Host: {host} ({nm[host].hostname()})"
            raw_text_list.append(host_header)
            
            for proto in nm[host].all_protocols():
                ports = nm[host][proto].keys()
                for port in ports:
                    state = nm[host][proto][port]['state']
                    service = nm[host][proto][port]['name']
                    product = nm[host][proto][port].get('product', '')
                    version = nm[host][proto][port].get('version', '')
                    
                    port_info = {
                        "port": port,
                        "protocol": proto,
                        "state": state,
                        "service": service,
                        "product": product,
                        "version": version
                    }
                    ports_list.append(port_info)
                    
                    raw_text_list.append(
                        f"  - Port {port}/{proto}: {state} (Service: {service} {product} {version})"
                    )
                    
                    # Track if standard web application protocols are discovered
                    if port in [80, 443, 8080, 8443]:
                        is_web_exposed = True
                        
        return {
            "success": True,
            "is_web_exposed": is_web_exposed,
            "raw_output": "\n".join(raw_text_list) if raw_text_list else "No active hosts or open ports discovered.",
            "structured_data": ports_list
        }
    except Exception as e:
        return {
            "success": False,
            "is_web_exposed": False,
            "raw_output": f"Nmap scanning engine execution failure: {str(e)}",
            "structured_data": []
        }