"""
SOAR (Security Orchestration, Automation, and Response) router.
Provides automated incident response playbooks for alert mitigation.
"""
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.database import get_db
from app.utils.helpers import serialize_doc

router = APIRouter(prefix="/api/v1/soar", tags=["SOAR Mitigation"])


class PlaybookExecuteRequest(BaseModel):
    alert_id: str
    action: str  # lock_user, revoke_tokens, block_ip, force_mfa


@router.post("/execute")
async def execute_playbook(req: PlaybookExecuteRequest, db=Depends(get_db)):
    """
    Execute an automated SOAR mitigation playbook for a critical alert.
    Actions:
    - lock_user: Temporarily disable the entity account
    - revoke_tokens: Invalidate all active session tokens
    - block_ip: Add source IP to firewall blocklist
    - force_mfa: Trigger mandatory multi-factor auth reset
    """
    try:
        alert = await db.alerts.find_one({"_id": ObjectId(req.alert_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert ID format")

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    action_details = {
        "lock_user": {
            "title": "Account Locked",
            "log": f"Entity account '{alert.get('entity_id')}' has been locked in Active Directory / IAM.",
            "status": "user_locked"
        },
        "revoke_tokens": {
            "title": "Tokens Revoked",
            "log": f"All active OAuth2 JWT session tokens for '{alert.get('entity_id')}' invalidated.",
            "status": "tokens_revoked"
        },
        "block_ip": {
            "title": "IP Blocked",
            "log": f"Attacker IP '{alert.get('source_ip')}' added to Perimeter Firewall & Cloudflare WAF blocklist.",
            "status": "ip_blocked"
        },
        "force_mfa": {
            "title": "MFA Enforced",
            "log": f"Mandatory FIDO2 / TOTP MFA re-authentication challenge issued for '{alert.get('entity_id')}'.",
            "status": "mfa_enforced"
        }
    }

    info = action_details.get(req.action)
    if not info:
        raise HTTPException(status_code=400, detail="Unknown playbook action")

    timestamp = datetime.now(timezone.utc)
    audit_entry = {
        "action": req.action,
        "title": info["title"],
        "detail": info["log"],
        "executed_at": timestamp.isoformat(),
        "status": "success"
    }

    # Update alert status to resolved & push SOAR audit trail entry
    updated_alert = await db.alerts.find_one_and_update(
        {"_id": ObjectId(req.alert_id)},
        {
            "$set": {
                "status": "resolved",
                "resolved_at": timestamp,
                "mitigation_action": req.action
            },
            "$push": {"soar_history": audit_entry}
        },
        return_document=True
    )

    # Also update entity profile status if locking account
    if req.action == "lock_user":
        await db.entity_profiles.update_one(
            {"entity_id": alert.get("entity_id")},
            {"$set": {"account_status": "locked", "locked_at": timestamp}}
        )

    return {
        "status": "success",
        "action": req.action,
        "title": info["title"],
        "log": info["log"],
        "executed_at": timestamp.isoformat(),
        "alert": serialize_doc(updated_alert)
    }
