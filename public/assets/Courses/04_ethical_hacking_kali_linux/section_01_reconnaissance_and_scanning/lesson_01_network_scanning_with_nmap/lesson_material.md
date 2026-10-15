# Lesson 1.1: Active Reconnaissance with Nmap

## 1. Nmap Core Flags
```bash
# Stealth SYN scan with version detection and default safe scripts
nmap -sS -sV -sC -T4 target_ip

# Scan all 65,535 TCP ports
nmap -p- target_ip
```
