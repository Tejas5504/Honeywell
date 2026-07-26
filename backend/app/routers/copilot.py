"""
AI Copilot router.
Provides intelligent SOC Security Assistant responses for analysts.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.database import get_db

router = APIRouter(prefix="/api/v1/copilot", tags=["AI Copilot"])


class CopilotChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


@router.post("/chat")
async def copilot_chat(req: CopilotChatRequest, db=Depends(get_db)):
    """
    Intelligent SOC Analyst Assistant endpoint.
    Analyzes user query and live database context to generate tailored security responses.
    """
    query = req.message.lower()
    
    # Gather live context from DB
    total_alerts = await db.alerts.count_documents({})
    critical_alerts = await db.alerts.count_documents({"severity": "critical"})
    high_alerts = await db.alerts.count_documents({"severity": "high"})
    top_attacks = await db.alerts.aggregate([
        {"$group": {"_id": "$attack_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 3}
    ]).to_list(3)
    
    top_attack_str = ", ".join([f"{a['_id'].replace('_', ' ').title()} ({a['count']})" for a in top_attacks]) if top_attacks else "None"

    # Rule-based intelligent responses with rich markdown formatting
    if "summarize" in query or "overview" in query or "threat" in query or "top" in query:
        response = (
            f"### 🛡️ **Current SOC Threat Overview**\n\n"
            f"- **Total Active Alerts**: `{total_alerts}`\n"
            f"- **Critical Alerts**: `{critical_alerts}` (requires immediate action)\n"
            f"- **High Severity**: `{high_alerts}`\n"
            f"- **Top Attack Vectors**: {top_attack_str}\n\n"
            f"**Recommendation**: Focus on resolving Critical alerts using the automated **SOAR Playbooks** (Account Lock or IP Block)."
        )
    elif "brute force" in query:
        response = (
            f"### 🔨 **Brute Force Attack Containment**\n\n"
            f"**Description**: Rapid repeated failed login attempts from single or distributed IPs.\n\n"
            f"**Recommended Playbook Actions**:\n"
            f"1. **Block Attacker IP**: Add source IP to WAF/Firewall blocklist.\n"
            f"2. **Lock Target User Account**: Prevent further password guessing attempts.\n"
            f"3. **Enforce Rate-Limiting**: Enable CAPTCHA & exponential backoff on `/api/auth/login`."
        )
    elif "impossible travel" in query:
        response = (
            f"### ✈️ **Impossible Travel Analysis**\n\n"
            f"**Description**: User authenticated from two geographically distant locations in an implausible timeframe (e.g., US to Russia in 15 mins).\n\n"
            f"**Recommended Playbook Actions**:\n"
            f"1. **Revoke Active Tokens**: Terminate all active OAuth session cookies.\n"
            f"2. **Force MFA Challenge**: Prompt mandatory FIDO2 hardware token verification.\n"
            f"3. **Inspect VPN/Proxy Usage**: Verify if user is utilizing corporate egress proxy."
        )
    elif "credential stuffing" in query:
        response = (
            f"### 🔑 **Credential Stuffing Mitigation**\n\n"
            f"**Description**: Automated bots testing stolen username/password pairs across multiple entity IDs.\n\n"
            f"**Recommended Playbook Actions**:\n"
            f"1. **IP Range Block**: Block subnets associated with botnet IPs.\n"
            f"2. **Global Password Reset**: Force credentials reset for affected accounts.\n"
            f"3. **Enable Device Fingerprint Checking**."
        )
    elif "lateral movement" in query or "insider" in query:
        response = (
            f"### 🧭 **Lateral Movement & Insider Threat Response**\n\n"
            f"**Description**: A compromised account or rogue insider probing unauthorized sensitive resources (`/api/admin/secrets`, `/api/finance/payroll`).\n\n"
            f"**Recommended Playbook Actions**:\n"
            f"1. **Lock Account Immediately**.\n"
            f"2. **Isolate Host / Session**.\n"
            f"3. **Export Audit Logs for Forensic Review**."
        )
    elif "risk score" in query or "how" in query:
        response = (
            f"### 📊 **Risk Scoring Methodology**\n\n"
            f"Risk scores (**0 to 100**) are computed dynamically using:\n"
            f"1. **Isolation Forest Decision Distance** (base anomaly probability)\n"
            f"2. **Behavioral Deviation Boosts** (+5 per explanation factor)\n"
            f"3. **Attack Severity Weights** (Lateral Movement +25, Brute Force +15)\n\n"
            f"**Severities**: `CRITICAL (75-100)`, `HIGH (50-75)`, `MEDIUM (25-50)`, `LOW (0-25)`."
        )
    else:
        response = (
            f"### 🤖 **CyberShield AI Assistance**\n\n"
            f"I have analyzed your request. Based on current system state (`{total_alerts}` alerts, `{critical_alerts}` critical):\n\n"
            f"- I recommend inspecting high-risk entities on the **Alerts** tab.\n"
            f"- Use **SOAR Playbooks** on the Alert Detail page to automatically contain active threats.\n"
            f"- You can ask me specific questions about *Brute Force*, *Impossible Travel*, *Credential Stuffing*, or *Risk Scoring*!"
        )

    return {
        "response": response,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "total_alerts": total_alerts,
            "critical_alerts": critical_alerts
        }
    }
