import io
from datetime import datetime
from typing import Any, Dict, List, Optional


def generate_clinical_report(
    patient_name: str,
    age: int,
    gender: int,
    risk_probability: float,
    risk_level: str,
    model_used: str,
    features: Dict[str, Any],
    contributions: Optional[List[Dict]] = None,
    doctor_name: Optional[str] = None,
    prediction_id: Optional[int] = None,
) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title", parent=styles["Heading1"], fontSize=18, textColor=colors.HexColor("#0d9488"))
    elements = []

    elements.append(Paragraph("CardioAI Clinical Risk Assessment Report", title_style))
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(Paragraph(f"Report ID: #{prediction_id or 'N/A'} | Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    elements.append(Spacer(1, 0.8 * cm))

    gender_label = "Female" if gender == 1 else "Male"
    patient_data = [
        ["Patient Name", patient_name],
        ["Age", str(age)],
        ["Gender", gender_label],
        ["Risk Probability", f"{risk_probability:.1f}%"],
        ["Risk Level", risk_level],
        ["Model", model_used],
        ["Physician", doctor_name or "N/A"],
    ]
    t = Table(patient_data, colWidths=[5 * cm, 10 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0fdfa")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 1 * cm))

    if features:
        elements.append(Paragraph("Clinical Markers", styles["Heading2"]))
        feat_rows = [["Marker", "Value"]] + [[k, str(v)] for k, v in features.items() if k != "patient_name"]
        ft = Table(feat_rows, colWidths=[8 * cm, 7 * cm])
        ft.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0d9488")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(ft)
        elements.append(Spacer(1, 0.8 * cm))

    if contributions:
        elements.append(Paragraph("Feature Contribution Analysis", styles["Heading2"]))
        contrib_rows = [["Feature", "Contribution %", "Direction"]] + [
            [c["label"], f"{c['contribution']:.1f}%", c["direction"].replace("_", " ").title()]
            for c in contributions[:8]
        ]
        ct = Table(contrib_rows, colWidths=[6 * cm, 4 * cm, 5 * cm])
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#134e4a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(ct)

    elements.append(Spacer(1, 1.5 * cm))
    elements.append(Paragraph(
        "<i>This report is AI-generated and must be validated by a board-certified physician. "
        "Not intended as sole basis for clinical decisions.</i>",
        styles["Normal"],
    ))

    doc.build(elements)
    return buffer.getvalue()
