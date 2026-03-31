import os
from datetime import datetime


def generate_html(ticker: str, data: list, insights: str) -> str:
    if not data:
        return "<p>No data available.</p>"

    first = data[0]
    last = data[-1]
    total_return = ((last["close"] - first["open"]) / first["open"] * 100)
    max_high = max(d["high"] for d in data)
    min_low = min(d["low"] for d in data)
    pos_months = sum(1 for i in range(1, len(data)) if data[i]["close"] > data[i - 1]["close"])
    currency = "₹" if ticker.endswith(".NS") or ticker.endswith(".BO") else "$"
    generated = datetime.now().strftime("%B %d, %Y at %H:%M")

    rows_html = ""
    for i, row in enumerate(data):
        ret = "" if i == 0 else f"{((row['close'] - data[i - 1]['close']) / data[i - 1]['close'] * 100):.1f}%"
        color = "#16a34a" if ret and not ret.startswith("-") else "#dc2626"
        rows_html += f"""
        <tr>
          <td>{row['month']}</td>
          <td>{currency}{row['open']:,.2f}</td>
          <td>{currency}{row['close']:,.2f}</td>
          <td>{currency}{row['high']:,.2f}</td>
          <td>{currency}{row['low']:,.2f}</td>
          <td>{row['vol'] / 1e6:.1f}M</td>
          <td style="color:{color};font-weight:600">{ret or '—'}</td>
        </tr>"""

    insight_lines = [
        l.replace("- ", "").replace("• ", "").strip()
        for l in insights.split("\n") if l.strip()
    ]
    insights_html = "".join(f"<li>{l}</li>" for l in insight_lines)

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; padding: 48px; font-size: 13px; }}
  .header {{ display: flex; justify-content: space-between; align-items: flex-start;
             border-bottom: 2px solid #6c8ef5; padding-bottom: 20px; margin-bottom: 32px; }}
  .brand {{ font-size: 22px; font-weight: 700; color: #6c8ef5; letter-spacing: -0.5px; }}
  .brand span {{ color: #1a1a2e; }}
  .meta {{ text-align: right; font-size: 11px; color: #6b7280; line-height: 1.8; }}
  .ticker-title {{ font-size: 28px; font-weight: 800; margin-bottom: 4px; }}
  .period {{ font-size: 13px; color: #6b7280; margin-bottom: 28px; }}
  .metrics {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }}
  .metric {{ background: #f8faff; border: 1px solid #e5e9ff; border-radius: 10px; padding: 16px; }}
  .metric .label {{ font-size: 11px; color: #6b7280; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }}
  .metric .value {{ font-size: 20px; font-weight: 700; }}
  .metric .change {{ font-size: 11px; margin-top: 4px; }}
  .up {{ color: #16a34a; }} .down {{ color: #dc2626; }}
  .section-title {{ font-size: 15px; font-weight: 700; margin-bottom: 14px; color: #1a1a2e;
                    border-left: 3px solid #6c8ef5; padding-left: 10px; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 12px; }}
  th {{ background: #f0f4ff; padding: 10px 12px; text-align: left; font-weight: 600;
        color: #374151; border-bottom: 1px solid #dde3f5; }}
  td {{ padding: 9px 12px; border-bottom: 1px solid #f0f0f0; }}
  tr:hover td {{ background: #fafbff; }}
  .insights {{ background: #f8faff; border: 1px solid #e5e9ff; border-radius: 10px;
               padding: 20px; margin-bottom: 32px; }}
  .insights ul {{ list-style: none; display: flex; flex-direction: column; gap: 10px; padding: 0; }}
  .insights li {{ display: flex; gap: 10px; line-height: 1.6; }}
  .insights li::before {{ content: "›"; color: #6c8ef5; font-weight: 700; flex-shrink: 0; }}
  .footer {{ border-top: 1px solid #e5e9ff; padding-top: 16px;
             font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Stock<span>Lens</span></div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px">Automated Financial Reporting</div>
    </div>
    <div class="meta">
      <div>Generated: {generated}</div>
      <div>Period: {first['month']} – {last['month']}</div>
      <div>Source: Yahoo Finance</div>
    </div>
  </div>

  <div class="ticker-title">{ticker}</div>
  <div class="period">{first['month']} — {last['month']} · {len(data)} months of data</div>

  <div class="metrics">
    <div class="metric">
      <div class="label">Latest close</div>
      <div class="value">{currency}{last['close']:,.2f}</div>
    </div>
    <div class="metric">
      <div class="label">Total return</div>
      <div class="value {'up' if total_return >= 0 else 'down'}">{total_return:+.1f}%</div>
      <div class="change">Over full period</div>
    </div>
    <div class="metric">
      <div class="label">Period high</div>
      <div class="value">{currency}{max_high:,.2f}</div>
    </div>
    <div class="metric">
      <div class="label">Positive months</div>
      <div class="value up">{pos_months} / {len(data)}</div>
    </div>
  </div>

  <div class="section-title">AI-generated insights</div>
  <div class="insights"><ul>{insights_html}</ul></div>

  <div class="section-title">Monthly breakdown</div>
  <table>
    <thead>
      <tr><th>Month</th><th>Open</th><th>Close</th><th>High</th><th>Low</th><th>Volume</th><th>Return</th></tr>
    </thead>
    <tbody>{rows_html}</tbody>
  </table>

  <div class="footer">
    <span>StockLens · Automated Financial Reporting System</span>
    <span>This report is for informational purposes only. Not financial advice.</span>
  </div>
</body>
</html>"""


def generate_pdf(ticker: str, data: list, insights: str) -> bytes:
    from weasyprint import HTML
    html = generate_html(ticker, data, insights)
    return HTML(string=html).write_pdf()
