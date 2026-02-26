# Memory Bank Index

This directory contains CLAUDE's persistent memory across sessions. All files are in Markdown format for easy reading and editing.

## Core Files (Read these first)

1. **[projectbrief.md](projectbrief.md)** - Project goals, scope, and success metrics
2. **[productContext.md](productContext.md)** - Why the project exists and how it should work
3. **[activeContext.md](activeContext.md)** - Current focus, recent changes, and next steps
4. **[systemPatterns.md](systemPatterns.md)** - Architecture, design patterns, and component relationships
5. **[techContext.md](techContext.md)** - Technology stack and development setup
6. **[progress.md](progress.md)** - What works, what's left, and current status

## Usage

### When Starting a New Session
Read all core files in order to understand the project state before beginning work.

### When Completing Work
Update `activeContext.md` with:
- What was accomplished
- Any new patterns discovered
- Changes to project priorities
- Learnings or insights

### When Context is Lost
Review `progress.md` first to understand current state, then read other files as needed.

### Before Making Major Decisions
Review `systemPatterns.md` and `activeContext.md` to understand:
- Existing patterns that should be followed
- Recent decisions that affect current work
- Active considerations that might impact the decision

## File Update Cadence

| File | When to Update |
|------|----------------|
| `projectbrief.md` | Rarely - only if project scope/goals change significantly |
| `productContext.md` | Rarely - only if user experience or target users change |
| `activeContext.md` | Frequently - after every significant work session |
| `systemPatterns.md` | As needed - when new patterns are established or architecture changes |
| `techContext.md` | As needed - when dependencies or tooling changes |
| `progress.md` | Frequently - as features are completed or new work is started |

## Additional Context Files

Create additional files in this directory for:
- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

Example: `memory-bank/features/shopping-list.md` for detailed shopping list feature documentation.
