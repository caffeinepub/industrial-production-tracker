# Specification

## Summary
**Goal:** Implement a historical opening balance feature to track pre-system production baseline (344 units manufactured and dispatched before system go-live on 20.02.2026).

**Planned changes:**
- Add HistoricalOpeningBalance data type with fixed values: opening date (20.02.2026), manufactured before system (344), dispatched before system (344), manufacturing start date (25.08.2025), system go-live date (22.02.2026)
- Create backend mutation for admin-only creation of the single immutable opening balance entry
- Update dashboard totals (Master Order Status) to include opening balance manufactured and dispatched counts
- Exclude opening balance from monthly target calculations and daily average production metrics
- Add HistoricalOpeningBalancePage with admin form (when entry doesn't exist) and read-only display (when entry exists)
- Update ProductionTrendChart to show opening balance as the starting baseline point on the trend line
- Add navigation link "Opening Balance" in sidebar between Production History and Monthly Target
- Display informational baseline badge on ProductionDashboardLivePage showing opening balance context

**User-visible outcome:** Admins can create a one-time historical opening balance entry that establishes the production baseline before system implementation. Dashboard totals and trend charts automatically include this baseline, while monthly targets remain unaffected. The entry is locked and cannot be edited after creation.
