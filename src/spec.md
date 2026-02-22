# Specification

## Summary
**Goal:** Seed container types and sizes master data with backend initialization and fix empty dropdowns in the daily production report form.

**Planned changes:**
- Implement backend initialization logic to auto-populate Container_Types with 10 default container types (Dry/General Purpose, High Cube, Refrigerated, Flat Rack, Open Top, Open Side, Double Door/Tunnel, Tank, Half Height, Special/Modified) on first canister deployment
- Implement backend initialization logic to auto-populate Container_Sizes with 4 default sizes (20ft Standard, 40ft Standard, 40ft High Cube, 45ft High Cube) with correct dimensions on first canister deployment
- Update backend migration logic to apply default values (container_type_id=2, container_size_id=3) to existing Daily_Production_Report entries with NULL fields
- Verify DailyProductionReportForm component correctly fetches and displays container types and sizes in dropdowns with loading states and fallback messages
- Ensure both Container Type and Container Size fields are required with validation error messages
- Verify useContainerTypes and useContainerSizes hooks correctly call backend queries with proper error handling and retry logic

**User-visible outcome:** Users can select from pre-populated Container Type and Container Size dropdowns when creating daily production reports, with proper validation preventing submission of incomplete forms.
