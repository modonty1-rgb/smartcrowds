# Projects Actions

This folder contains server actions specific to the Projects pages.

## Files
- `actions.ts` - Server actions for retrieving projects for public pages

## Functions
- `getProjects(params)` - List projects (always filters for published projects)
- `getProjectBySlug(id, locale)` - Get a single project by slug (returns null if not published)

