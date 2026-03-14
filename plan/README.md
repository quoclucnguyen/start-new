# Plans Directory

This directory contains detailed implementation plans for project features.

## Available Plans

### [recipe-management/](./recipe-management/plan.md)
**Status:** In Progress (Core implemented, quality/integration pending)
**Created:** 2026-02-26

Implementation plan for the Recipe Management feature including:
- Recipe CRUD (create/edit/delete/duplicate)
- Ingredient and step editor flows
- User-owned recipes + system recipes access model
- Supabase schema with RLS + soft delete pattern
- Integration contract for Recipe Suggestions

**Key Features:**
- [ ] Manage recipe database
- [ ] Manage ingredients and instructions
- [ ] Persist user recipes in Supabase/mock API
- [ ] Feed Recipe Suggestions from managed data

---

### [recipe-suggestions/](./recipe-suggestions/plan.md)
**Status:** Planned (Architecture and checklist defined, implementation not started)
**Created:** 2026-02-26

Implementation plan for the Recipe Suggestions feature including:
- Recipe catalog data model (recipes, ingredients, steps)
- Deterministic ingredient matching algorithm
- Missing-ingredient integration with Shopping List
- Mobile-friendly recipe detail flow
- Supabase schema + RLS policies + migration plan

**Key Features:**
- [ ] Recipe database
- [ ] Ingredient matching to inventory
- [ ] Missing ingredients per recipe
- [ ] Recipe detail with step-by-step instructions

---

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

### [food-diary/](./food-diary/plan.md)
**Status:** Planned
**Created:** 2026-03-14

Implementation plan for the Food Diary / Personal Foodie CRM feature including:
- Meal logging with progressive disclosure (quick log → detailed CRM fields)
- Venue memory (restaurant/delivery CRM with "món tủ", ratings, price tracking)
- Analytics dashboard (spending, visit frequency, favorites)
- Discovery engine (forgotten gems, random suggestions, nudge system)
- Automation (OCR receipt scan, transaction parsing, geolocation, data export)

**Phases:**
- **MVP A** — Quick log + Venue/dish memory (core)
- **MVP B** — Deep CRM + light analytics
- **MVP C** — Advanced discovery + nudge engine
- **MVP D** — Automation (OCR, transaction parsing, export, geolocation)

**Key Files:**
- [plan.md](./food-diary/plan.md) — Full implementation plan
- [checklist.md](./food-diary/checklist.md) — Task-by-task checklist

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
