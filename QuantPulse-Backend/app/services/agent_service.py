import os
import yfinance as yf
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from textwrap import dedent
from typing import Dict, Any, List
import logging
import json

# Configure logging
logger = logging.getLogger(__name__)

# Define Custom Tools
class StockAnalysisTools:
    @tool("Fetch Stock Financials")
    def fetch_financials(ticker_symbol: str):
        """Fetches latest financial data, earnings, and news for a given NSE ticker symbol."""
        try:
            # Append .NS for NSE stocks if not present
            if not ticker_symbol.endswith(".NS"):
                ticker_symbol = f"{ticker_symbol}.NS"
            
            stock = yf.Ticker(ticker_symbol)
            info = stock.info
            news = stock.news[:5] if stock.news else []
            financials = stock.quarterly_financials
            balance_sheet = stock.quarterly_balance_sheet
            
            # Extract relevant metrics
            data = {
                "symbol": ticker_symbol,
                "current_price": info.get("currentPrice"),
                "market_cap": info.get("marketCap"),
                "pe_ratio": info.get("trailingPE"),
                "debt_to_equity": info.get("debtToEquity"),
                "revenue_growth": info.get("revenueGrowth"),
                "news": [n.get("title") for n in news],
                "financial_summary": financials.to_string() if not financials.empty else "No financial data available",
                "balance_sheet_summary": balance_sheet.to_string() if not balance_sheet.empty else "No balance sheet data available"
            }
            return json.dumps(data, indent=2)
        except Exception as e:
            return f"Error fetching data for {ticker_symbol}: {str(e)}"

class SentimentAgentService:
    def __init__(self):
        # Ensure OpenAI API Key is available - implied requirement for CrewAI default
        # If using another model, configuration would need to be adjusted here
        if not os.getenv("OPENAI_API_KEY"):
            logger.warning("OPENAI_API_KEY is not set. CrewAI agents may fail if not configured with another LLM.")

    def run_sentiment_analysis(self, ticker: str) -> Dict[str, Any]:
        """
        Runs the agentic sentiment analysis for a given ticker.
        """
        logger.info(f"Starting agentic sentiment analysis for {ticker}")

        # 1. Define Agents
        researcher = Agent(
            role='Financial Researcher',
            goal='Fetch and verify the latest official financial data and news.',
            backstory=dedent("""
                You are a meticulous data gatherer giving the most accurate and up-to-date
                information. You do not interpret, you only provide verifiable facts.
            """),
            tools=[StockAnalysisTools.fetch_financials],
            verbose=True,
            allow_delegation=False
        )

        bear = Agent(
            role='Market Skeptic (The Bear)',
            goal='Analyze data to find risks, debt concerns, and bearish signals.',
            backstory=dedent("""
                You are a pessimistic analyst who always looks for the downside. 
                You analyze balance sheets for debt, look for slowing growth, and 
                highlight negative news sentiment. Your job is to warn investors.
            """),
            verbose=True,
            allow_delegation=False
        )

        bull = Agent(
            role='Growth Strategist (The Bull)',
            goal='Identify bullish catalysts, growth potential, and positive sentiment.',
            backstory=dedent("""
                You are an optimistic strategist who looks for value and growth.
                You highlight strong earnings, market expansion, and positive news.
                Your job is to find reasons to buy.
            """),
            verbose=True,
            allow_delegation=False
        )

        aggregator = Agent(
            role='Chief Investment Officer',
            goal='Synthesize the Bull and Bear arguments into a final recommendation.',
            backstory=dedent("""
                You are the decision maker. You review the conflicting reports from
                your analysts and provide a balanced, data-driven investment thesis.
                You are not swayed by emotion, only by weight of evidence.
            """),
            verbose=True,
            allow_delegation=False
        )

        # 2. Define Tasks
        task_research = Task(
            description=f"""
                Fetch the latest financial data, news, and earnings reports for {ticker}.
                Focus on the last 7 days of news and the most recent quarterly data.
                Use the 'Fetch Stock Financials' tool.
            """,
            expected_output="A comprehensive summary of financial metrics and recent news.",
            agent=researcher
        )

        task_bear_analysis = Task(
            description="""
                Review the research data. Identify at least 3 critical risks or bearish signals.
                Provide raw data points (e.g., High P/E, High Debt) to support your claims.
                Format as a list of 3 bullet points with reasoning.
            """,
            expected_output="3 bullet points tailored to risk analysis.",
            agent=bear,
            context=[task_research]
        )

        task_bull_analysis = Task(
            description="""
                Review the research data. Identify at least 3 growth catalysts or bullish signals.
                Provide raw data points (e.g., Revenue Growth, Market Dominance) to support your claims.
                Format as a list of 3 bullet points with reasoning.
            """,
            expected_output="3 bullet points tailored to opportunity analysis.",
            agent=bull,
            context=[task_research]
        )

        task_synthesis = Task(
            description="""
                Analyze the reports from the Bear and the Bull.
                Determine a final sentiment: 'Bullish', 'Bearish', or 'Neutral'.
                Provide a confidence score (0-100%).
                Construct the final JSON output.
            """,
            expected_output=dedent("""
                A valid JSON object (NO markdown formatting) with the following structure:
                {
                    "bull_view": ["point 1", "point 2", "point 3"],
                    "bear_view": ["point 1", "point 2", "point 3"],
                    "sentiment": "Bullish/Bearish/Neutral",
                    "confidence_score": 85,
                    "reasoning": "Brief explanation of the decision."
                }
            """),
            agent=aggregator,
            context=[task_bear_analysis, task_bull_analysis]
        )

        # 3. Create and Run Crew
        crew = Crew(
            agents=[researcher, bear, bull, aggregator],
            tasks=[task_research, task_bear_analysis, task_bull_analysis, task_synthesis],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        
        # Parse result to ensure it's JSON
        try:
            # Sometimes agents wrap JSON in markdown blocks
            clean_result = str(result).replace("```json", "").replace("```", "").strip()
            return json.loads(clean_result)
        except json.JSONDecodeError:
            logger.error("Failed to parse agent output as JSON.")
            return {
                "error": "Agent generation failed to produce valid JSON",
                "raw_output": str(result)
            }

agent_service = SentimentAgentService()
