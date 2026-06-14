from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from io import BytesIO

from agents.graph import run_strategy_pipeline
from core.models import StrategyInput

router = APIRouter()

@router.post("/strategy/batch")
async def compute_batch(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
    
    contents = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))
            
        required_cols = ['cash_reserve', 'monthly_burn', 'monthly_revenue', 'strategic_goal']
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")
                
        results = []
        # Process synchronously for simplicity as requested
        for index, row in df.iterrows():
            try:
                data = StrategyInput(
                    cash_reserve=float(row['cash_reserve']),
                    monthly_burn=float(row['monthly_burn']),
                    monthly_revenue=float(row['monthly_revenue']),
                    goal_prompt=str(row['strategic_goal'])
                )
                _, response = await run_strategy_pipeline(data)
                
                results.append({
                    "row_index": index,
                    "cash_reserve": data.cash_reserve,
                    "monthly_burn": data.monthly_burn,
                    "monthly_revenue": data.monthly_revenue,
                    "strategic_goal": data.goal_prompt,
                    "verified_runway_months": response.verified_runway_months,
                    "optimal_price_point": response.optimal_price_point,
                    "executive_summary": response.executive_summary
                })
            except Exception as e:
                results.append({
                    "row_index": index,
                    "error": str(e)
                })
                
        return {"results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
