"""
PDF report generation using ReportLab.
Generates professional cybersecurity incident reports with
threat summaries, attack breakdowns, risk distributions,
model performance metrics, and recommendations.
"""
import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)


# Professional color scheme
NAVY = colors.HexColor("#0a0e1a")
DARK_BLUE = colors.HexColor("#0f1425")
CYAN = colors.HexColor("#06b6d4")
LIGHT_GRAY = colors.HexColor("#e2e8f0")
MEDIUM_GRAY = colors.HexColor("#94a3b8")
RED = colors.HexColor("#ef4444")
AMBER = colors.HexColor("#f59e0b")
GREEN = colors.HexColor("#10b981")


def _get_styles():
    """Create custom paragraph styles for the report."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=NAVY,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=16,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        "BodyText2",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    ))
    return styles


async def generate_report(db, config: dict) -> bytes:
    """
    Generate a comprehensive PDF security report.

    Args:
        db: MongoDB database reference
        config: Report configuration dict with section toggles

    Returns:
        PDF file as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = _get_styles()
    story = []

    now = datetime.now(timezone.utc)

    # ========== TITLE PAGE ==========
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph("🛡️ CYBERSHIELD", styles["ReportTitle"]))
    story.append(Paragraph(
        "AI-Powered Behavioral Anomaly Detection Report",
        styles["SectionTitle"]
    ))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(
        width="100%", thickness=2, color=CYAN, spaceAfter=12
    ))
    story.append(Paragraph(
        f"Generated: {now.strftime('%Y-%m-%d %H:%M UTC')}",
        styles["BodyText2"]
    ))
    story.append(Paragraph("Classification: CONFIDENTIAL", styles["BodyText2"]))
    story.append(PageBreak())

    # ========== EXECUTIVE SUMMARY ==========
    total_logs = await db.access_logs.count_documents({})
    total_alerts = await db.alerts.count_documents({})
    critical_alerts = await db.alerts.count_documents({"severity": "critical"})
    high_alerts = await db.alerts.count_documents({"severity": "high"})

    # Average risk score
    pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}]
    avg_result = await db.alerts.aggregate(pipeline).to_list(1)
    avg_risk = round(avg_result[0]["avg"], 1) if avg_result and avg_result[0].get("avg") else 0

    story.append(Paragraph("Executive Summary", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceAfter=12))

    summary_data = [
        ["Metric", "Value"],
        ["Total Access Logs Analyzed", str(total_logs)],
        ["Total Anomalies Detected", str(total_alerts)],
        ["Critical Alerts", str(critical_alerts)],
        ["High Severity Alerts", str(high_alerts)],
        ["Average Risk Score", f"{avg_risk}%"],
        ["Report Period", "Last 30 Days"],
    ]

    summary_table = Table(summary_data, colWidths=[3 * inch, 3.5 * inch])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("GRID", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 20))

    # ========== THREAT SUMMARY ==========
    if config.get("include_threats", True):
        story.append(Paragraph("Threat Summary", styles["SectionTitle"]))
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceAfter=12))

        if critical_alerts > 0:
            story.append(Paragraph(
                f"⚠️ <b>{critical_alerts} CRITICAL</b> alerts require immediate attention. "
                f"The system detected {total_alerts} total anomalies across {total_logs} access events, "
                f"with an average risk score of {avg_risk}%.",
                styles["BodyText2"]
            ))
        else:
            story.append(Paragraph(
                f"The system analyzed {total_logs} access events and detected {total_alerts} anomalies. "
                f"No critical threats were identified. Average risk score: {avg_risk}%.",
                styles["BodyText2"]
            ))
        story.append(Spacer(1, 12))

    # ========== ATTACK DISTRIBUTION ==========
    if config.get("include_attacks", True):
        story.append(Paragraph("Detected Attack Types", styles["SectionTitle"]))
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceAfter=12))

        pipeline = [
            {"$group": {"_id": "$attack_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        attack_dist = await db.alerts.aggregate(pipeline).to_list(20)

        attack_data = [["Attack Type", "Count", "Percentage"]]
        for entry in attack_dist:
            pct = round(entry["count"] / max(total_alerts, 1) * 100, 1)
            attack_data.append([
                str(entry["_id"] or "Unknown").replace("_", " ").title(),
                str(entry["count"]),
                f"{pct}%",
            ])

        if len(attack_data) > 1:
            attack_table = Table(attack_data, colWidths=[3 * inch, 1.5 * inch, 2 * inch])
            attack_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(attack_table)
        story.append(Spacer(1, 20))

    # ========== RISK DISTRIBUTION ==========
    if config.get("include_risk_distribution", True):
        story.append(Paragraph("Risk Score Distribution", styles["SectionTitle"]))
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceAfter=12))

        buckets = [
            ("Low (0-25)", 0, 25),
            ("Medium (25-50)", 25, 50),
            ("High (50-75)", 50, 75),
            ("Critical (75-100)", 75, 101),
        ]
        risk_data = [["Risk Level", "Count"]]
        for label, min_s, max_s in buckets:
            count = await db.alerts.count_documents(
                {"risk_score": {"$gte": min_s, "$lt": max_s}}
            )
            risk_data.append([label, str(count)])

        risk_table = Table(risk_data, colWidths=[3.5 * inch, 3 * inch])
        risk_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 20))

    # ========== MODEL PERFORMANCE ==========
    if config.get("include_model_performance", True):
        story.append(Paragraph("Model Performance", styles["SectionTitle"]))
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceAfter=12))

        metrics_doc = await db.model_metrics.find_one(
            {}, sort=[("trained_at", -1)]
        )
        if metrics_doc:
            model_data = [
                ["Metric", "Value"],
                ["Model Type", metrics_doc.get("model_type", "IsolationForest")],
                ["Accuracy", f"{metrics_doc.get('accuracy', 0) * 100:.1f}%"],
                ["Precision", f"{metrics_doc.get('precision', 0) * 100:.1f}%"],
                ["Recall", f"{metrics_doc.get('recall', 0) * 100:.1f}%"],
                ["F1 Score", f"{metrics_doc.get('f1_score', 0) * 100:.1f}%"],
                ["Training Samples", str(metrics_doc.get("training_samples", 0))],
            ]
            model_table = Table(model_data, colWidths=[3.5 * inch, 3 * inch])
            model_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(model_table)
        else:
            story.append(Paragraph(
                "No model has been trained yet. Train the Isolation Forest model to see performance metrics.",
                styles["BodyText2"]
            ))
        story.append(Spacer(1, 20))

    # ========== RECOMMENDATIONS ==========
    if config.get("include_recommendations", True):
        story.append(Paragraph("Recommendations", styles["SectionTitle"]))
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceAfter=12))

        recommendations = [
            "1. <b>Investigate Critical Alerts Immediately</b> — All alerts with risk scores above 75 should be triaged by the SOC team within 1 hour.",
            "2. <b>Enable Multi-Factor Authentication</b> — Enforce MFA for all user accounts to mitigate credential stuffing and brute force attacks.",
            "3. <b>Implement Geo-IP Restrictions</b> — Block or challenge logins from countries not in the organization's operational geography.",
            "4. <b>Deploy Device Trust Framework</b> — Register and monitor device fingerprints to detect spoofing attempts.",
            "5. <b>Review Access Policies</b> — Audit user access to sensitive resources and enforce least-privilege principles.",
            "6. <b>Enhance Monitoring for Off-Hours Activity</b> — Increase alerting sensitivity for access events outside normal business hours.",
            "7. <b>Retrain Model Periodically</b> — Retrain the anomaly detection model monthly to adapt to evolving behavioral baselines.",
            "8. <b>Conduct Incident Response Drills</b> — Regular tabletop exercises ensure the team can respond effectively to detected threats.",
        ]

        for rec in recommendations:
            story.append(Paragraph(rec, styles["BodyText2"]))
            story.append(Spacer(1, 4))

    # ========== FOOTER ==========
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=1, color=CYAN, spaceAfter=8))
    story.append(Paragraph(
        "This report was generated by CyberShield AI Anomaly Detection Platform. "
        "CONFIDENTIAL — For internal security use only.",
        ParagraphStyle(
            "Footer", fontName="Helvetica-Oblique", fontSize=8,
            textColor=MEDIUM_GRAY
        ),
    ))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
