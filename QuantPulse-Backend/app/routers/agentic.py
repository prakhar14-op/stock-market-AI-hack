from fastapi import APIRouter, HTTPException, Query
from app.services.agent_service import agent_service
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/agentic-sentiment",
    tags=["Agentic Analysis"]
)

@router.get("/", response_model=Dict[str, Any])
async def get_agentic_sentiment(
    ticker: str = Query(..., description="Stock Ticker Symbol (e.g., RELIANCE, TCS)")
):
    """
    Run an agentic sentiment analysis debate between a Bull and a Bear.
    
    - **Researcher**: Fetches real-time financial data.
    - **Bear**: Analyzes risks and downsides.
    - **Bull**: Analyzes opportunities and growth.
    - **Thesis Aggregator**: Concludes with a sentiment verdict.
    
    Returns a unified investment thesis.
    """
    try:
        if not ticker:
            raise HTTPException(status_code=400, detail="Ticker symbol is required")
            
        result = agent_service.run_sentiment_analysis(ticker)
        
        if "error" in result:
             # If it's a JSON parsing error but we have raw output, we still return 200 but with error field, 
             # or 500. Let's return the result as is if it has content, but maybe status 500 if critical.
             if result["error"] == "Agent generation failed to produce valid JSON":
                 # We return the raw output for debugging
                 return result
        
        return result
        
    except Exception as e:
        logger.error(f"Error in agentic sentiment analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
