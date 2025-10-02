# lazydancer

A minimal static site generator for blog posts and project portfolios.

## Features

- **Simple templating** - Single HTML template with `{{ content }}` and `{{page.title}}` placeholders
- **Frontmatter support** - Optional YAML frontmatter for post metadata
- **Auto-generated index** - Automatically creates sorted post listings from metadata
- **Draft support** - Build with or without draft posts
- **Clean URLs** - Each post gets its own directory with `index.html`

## Usage

### Basic build

```bash
python lazydancer.py
```

### Include draft posts

```bash
python lazydancer.py --drafts
```

### Use existing index.html (skip auto-generation)

```bash
python lazydancer.py --no-auto-index
```

### Get help

```bash
python lazydancer.py --help
```

## Directory Structure

```
.
├── posts/              # Published posts
│   └── post-name/
│       └── index.html
├── drafts/             # Draft posts (optional, git ignored)
│   └── draft-name/
│       └── index.html
├── docs/               # Generated site (committed for GitHub Pages)
├── template.html       # Page template
├── index.html          # Homepage template/content
├── style.css           # Site stylesheet
├── favicon.ico         # Site icon
└── lazydancer.py       # Build script
```

## Post Format

Posts can include optional YAML frontmatter for metadata:

```html
---
title: My Post Title
date: 2025-02-01
description: A brief description of the post
---

<h1>My Post Title</h1>
<p>Post content here...</p>
```

### Frontmatter Fields

- `title` - Post title (defaults to directory name with title case)
- `date` - Publication date in `YYYY-MM-DD` or `YYYY-MM` format (defaults to current date)
- `description` - Short description (defaults to extracted first paragraph)

### Without Frontmatter

Posts without frontmatter work fine:

```html
<h1>My Post Title</h1>
<p>Post content here...</p>
```

Metadata will be auto-generated:
- Title: derived from directory name
- Date: current date
- Description: extracted from first paragraph

## Template System

### template.html

The main page template uses two placeholders:

- `{{page.title}}` - Replaced with the page title
- `{{ content }}` - Replaced with post/page content

Example:

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{page.title}}</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  {{ content }}
</body>
</html>
```

### index.html

The homepage template. When auto-index is enabled (default), the `<ul class="item-list">` section is automatically updated with all posts sorted by date.

To preserve a custom homepage, use `--no-auto-index`.

## Build Process

1. Cleans the `docs/` directory
2. Copies posts (and drafts if `--drafts` is used) to `docs/`
3. Parses frontmatter from each post
4. Wraps each post with `template.html`
5. Copies static assets (favicon.ico, CNAME, style.css)
6. Generates or copies index.html

## Error Handling

The script handles common errors gracefully:

- Missing template files
- Invalid frontmatter
- Missing post files
- Invalid date formats

Warnings are printed to stderr, critical errors exit with status 1.

## Example Workflow

### Create a new post

1. Create a new directory in `posts/`:
   ```bash
   mkdir posts/my-new-post
   ```

2. Create `index.html` with frontmatter:
   ```html
   ---
   title: My New Post
   date: 2025-10-01
   description: This is my new post about something cool
   ---

   <h1>My New Post</h1>
   <p>Content goes here...</p>
   ```

3. Build the site:
   ```bash
   python lazydancer.py
   ```

4. View in `docs/`:
   - `docs/my-new-post/index.html` - Your post
   - `docs/index.html` - Updated homepage with new post listed

### Work on a draft

1. Create draft in `drafts/`:
   ```bash
   mkdir drafts/work-in-progress
   echo "<h1>WIP</h1>" > drafts/work-in-progress/index.html
   ```

2. Build with drafts:
   ```bash
   python lazydancer.py --drafts
   ```

3. When ready to publish, move to `posts/`:
   ```bash
   mv drafts/work-in-progress posts/
   ```

## License

MIT
