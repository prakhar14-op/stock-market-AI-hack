from fastapi import APIRouter, HTTPException, Body
from app.services.ensemble_service import ensemble_service
from typing import Dict, Any

router = APIRouter(
    prefix="/api/v1/ensemble-predict",
    tags=["Ensemble Prediction"]
)

@router.post("/", response_model=Dict[str, Any])
async def generate_ensemble_prediction(
    payload: Dict[str, Any] = Body(..., example={"ticker": "RELIANCE", "current_price": 2450.50})
):
    """
    Generate an agentic ensemble prediction fusing Quant, Topology, and Sentiment signals.
    """
    try:
        ticker = payload.get("ticker")
        current_price = payload.get("current_price")
        simulate_shock = payload.get("simulate_shock", False)
        
        if not ticker or current_price is None:
            raise HTTPException(status_code=400, detail="Ticker and current_price are required")
            
        result = await ensemble_service.get_ensemble_prediction(ticker, float(current_price), simulate_shock)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
