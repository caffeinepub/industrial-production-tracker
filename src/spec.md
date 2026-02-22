# Specification

## Summary
**Goal:** Insert historical production data for date 2026-02-21 and update master order status to reflect current manufacturing progress.

**Planned changes:**
- Create backend mutation function `batchUpdateDailyProductionReport` that accepts date and array of operation data, auto-calculates in_hand values, and performs INSERT or UPDATE based on record existence
- Execute batch insertion for date 2026-02-21 with all 17 operations using specified production data (Boxing: today=5/total=400/dispatch=344, Welding/Finishing: today=4/total=399/dispatch=344, etc.)
- Update Master_Order_Status entry with total_order_quantity=600, total_manufactured=345, total_dispatched=344
- Ensure ProductionDashboardLivePage automatically refreshes and displays updated production data for 2026-02-21
- Ensure LiveProductionTable correctly displays all 17 operations with production data when date 2026-02-21 is selected

**User-visible outcome:** Administrators can view historical production data for date 2026-02-21 in the dashboard, with all 17 operations showing correct today's production, totals, dispatch, and in-hand values. Master order progress metrics display total_manufactured=345 and total_dispatched=344 with accurate calculated metrics (remaining=255, finished_stock=1, completion=57.5%).
