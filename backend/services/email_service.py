import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import base64
from services import yfinance_service, gemini_service, pdf_service


def send_report_email(to_email: str, ticker: str, period: str = "1y"):
    data = yfinance_service.get_history(ticker, period)
    insights = gemini_service.generate_insights(ticker, data)
    pdf = pdf_service.generate_pdf(ticker, data, insights)

    last = data[-1]
    first = data[0]
    total_return = ((last["close"] - first["open"]) / first["open"] * 100)
    currency = "₹" if ticker.endswith(".NS") or ticker.endswith(".BO") else "$"
    direction = "▲" if total_return >= 0 else "▼"

    message = Mail(
        from_email=os.getenv("FROM_EMAIL"),
        to_emails=to_email,
        subject=f"StockLens Report: {ticker} — {direction} {abs(total_return):.1f}% this period",
        html_content=f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
  <div style="background:#6c8ef5;padding:24px;border-radius:10px 10px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">StockLens</h1>
    <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">Automated Financial Report</p>
  </div>
  <div style="background:#f8faff;padding:24px;border-radius:0 0 10px 10px;border:1px solid #e5e9ff">
    <h2 style="font-size:20px;margin:0 0 4px">{ticker}</h2>
    <p style="color:#6b7280;font-size:13px;margin:0 0 20px">{first['month']} — {last['month']}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
      <div style="background:#fff;border:1px solid #e5e9ff;border-radius:8px;padding:14px">
        <p style="font-size:11px;color:#6b7280;margin:0 0 4px">LATEST CLOSE</p>
        <p style="font-size:18px;font-weight:700;margin:0">{currency}{last['close']:,.2f}</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e9ff;border-radius:8px;padding:14px">
        <p style="font-size:11px;color:#6b7280;margin:0 0 4px">TOTAL RETURN</p>
        <p style="font-size:18px;font-weight:700;margin:0;color:{'#16a34a' if total_return >= 0 else '#dc2626'}">{total_return:+.1f}%</p>
      </div>
    </div>
    <p style="font-size:13px;color:#374151;line-height:1.7">Your full report is attached as a PDF. It includes the complete monthly breakdown, key metrics, and AI-generated insights.</p>
    <p style="font-size:11px;color:#9ca3af;margin-top:20px">StockLens · This report is for informational purposes only. Not financial advice.</p>
  </div>
</div>"""
    )

    encoded = base64.b64encode(pdf).decode()
    attachment = Attachment(
        FileContent(encoded),
        FileName(f"{ticker}_report.pdf"),
        FileType("application/pdf"),
        Disposition("attachment")
    )
    message.attachment = attachment

    sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
    sg.send(message)
