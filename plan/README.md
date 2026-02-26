# Plans Directory

This directory contains detailed implementation plans for project features.

## Available Plans

### [shopping-list/](./shopping-list/plan.md)
**Status:** In Progress (Core implemented, integration/testing pending)
**Created:** 2026-02-26

Complete implementation plan for the Shopping List feature including:
- Data model and database schema
- API layer design with Supabase integration
- TanStack Query hooks for optimistic updates
- Component structure and user flows
- Routing and navigation updates
- Implementation checklist with timeline

**Key Features:**
- [x] Add items to shopping list manually
- [ ] Quick-add from inventory
- [x] Mark items as checked (in cart)
- [x] Move purchased items to inventory
- [x] Persist list to Supabase / local mock
- [ ] Complete test/storybook/mobile verification

---

## Plan Template

When creating a new feature plan, include:

1. **Overview** - Problem statement and success metrics
2. **Data Model** - TypeScript types and database schema
3. **API Layer** - Interface design and implementation patterns
4. **Query Hooks** - TanStack Query hooks with optimistic updates
5. **UI State** - Zustand store design
6. **Components** - Component structure and props
7. **User Flows** - Step-by-step user journeys
8. **Database** - SQL migration scripts
9. **Routing** - Route and navigation updates
10. **Checklist** - Implementation tasks
11. **Considerations** - Technical decisions and trade-offs
12. **Timeline** - Effort estimation

---

## Creating a New Plan

```bash
# Create new plan directory
mkdir -p plan/feature-name

# Create plan file following template
touch plan/feature-name/plan.md

# Update this README to reference the new plan
```
