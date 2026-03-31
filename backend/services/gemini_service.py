import os

from google import genai


def generate_insights(ticker: str, data: list) -> str:
    if not data:
        return "No data available for analysis."

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=api_key)

    first = data[0]
    last = data[-1]
    total_return = ((last["close"] - first["open"]) / first["open"] * 100)
    pos_months = sum(1 for i in range(1, len(data)) if data[i]["close"] > data[i - 1]["close"])
    neg_months = len(data) - 1 - pos_months
    max_high = max(d["high"] for d in data)
    min_low = min(d["low"] for d in data)
    avg_vol = sum(d["vol"] for d in data) / len(data) / 1e6

    summary = f"""
Ticker: {ticker}
Period: {data[0]["month"]} to {data[-1]["month"]}
Total return: {total_return:.1f}%
Positive months: {pos_months}, Negative months: {neg_months}
Period high: {max_high:,.2f}, Period low: {min_low:,.2f}
Average monthly volume: {avg_vol:.1f}M shares
Latest close: {last["close"]:,.2f}
Opening price: {first["open"]:,.2f}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"""You are a financial analyst. Analyze this stock data and give 4-5 concise,
insightful bullet points about the stock's performance, trend, and any notable patterns.
Be specific with numbers. Keep each point under 2 sentences. Do not use markdown headers.

{summary}""",
    )
    return response.text or "No AI insights generated."
