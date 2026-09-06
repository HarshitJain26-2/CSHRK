# CSHRK Phase 4 AI Intelligence Roadmap

## 1. Objectives (Scheduled for Phase 4)
In Phase 4, Member 4 will implement real AI algorithms trained on CSHRK operational data:
1. **Intelligent Worker Matching**: Combining PostGIS geographic proximity with skill proficiency and reliability metrics to select optimal worker candidates.
2. **Labour Demand Forecasting**: Time-series models predicting trade demand per cooperative district.
3. **Workforce Allocation Optimization**: Constrained optimization assigning cooperative members to institutional bulk tenders.
4. **Regional Skill Gap Analytics**: Discovering unmet trade requests to guide cooperative apprenticeship and training programs.

## 2. Phase 0 AI Deliverables
- FastAPI service skeleton running with health checks on port 8000.
- Strict Pydantic contract definitions in `app/matching/schemas.py`, `app/forecasting/schemas.py`, etc.
- No dummy or fabricated AI algorithms.
