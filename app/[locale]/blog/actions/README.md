# Blog Actions

This folder contains server actions specific to the Blog pages.

## Files
- `actions.ts` - Server actions for retrieving blog posts for public pages

## Functions
- `getPosts(params)` - List blog posts (always filters for published posts)
- `getPostBySlug(slug, locale)` - Get a single post by slug (returns null if not published)

