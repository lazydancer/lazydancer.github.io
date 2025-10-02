import os
import sys
import re
import shutil
import argparse
from glob import glob
from datetime import datetime
from collections import namedtuple

Post = namedtuple('Post', ['title', 'url', 'date', 'description'])


def parse_frontmatter(content):
	"""Extract YAML frontmatter from content if present"""
	frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
	match = re.match(frontmatter_pattern, content, re.DOTALL)

	if not match:
		return {}, content

	frontmatter_text = match.group(1)
	body = match.group(2)

	# Simple YAML parser for common fields
	metadata = {}
	for line in frontmatter_text.split('\n'):
		if ':' in line:
			key, value = line.split(':', 1)
			metadata[key.strip()] = value.strip().strip('"\'')

	return metadata, body


def extract_description(html_content, max_length=100):
	"""Extract first paragraph as description"""
	# Remove script tags
	html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)
	# Remove HTML tags
	text = re.sub(r'<[^>]+>', '', html_content)
	# Get first meaningful text
	text = text.strip()
	if len(text) > max_length:
		text = text[:max_length].rsplit(' ', 1)[0] + '...'
	return text if text else 'No description'


def template(title, content):
	"""Generate HTML by inserting content into template.html"""
	try:
		with open('template.html') as f:
			template_lines = f.readlines()
	except FileNotFoundError:
		print("Error: template.html not found", file=sys.stderr)
		sys.exit(1)

	try:
		chop = [x.strip() for x in template_lines].index('{{ content }}')
	except ValueError:
		print("Error: '{{ content }}' placeholder not found in template.html", file=sys.stderr)
		sys.exit(1)

	template_parts = [''.join(template_lines[:chop]), ''.join(template_lines[chop+1:])]
	template_parts[0] = template_parts[0].replace('{{page.title}}', title)

	return template_parts[0] + content + template_parts[1]


def write_post(title, url, post_content):
	"""Write a post's HTML to the docs directory"""
	content = template(title, post_content)

	try:
		with open('docs/' + url + '/index.html', 'w') as f:
			f.write(content)
	except IOError as e:
		print(f"Error writing post {url}: {e}", file=sys.stderr)
		sys.exit(1)

def copytree(src, dst):
    """Recursively copy *src* directory into *dst*.

    Existing directories are merged instead of raising an error.
    """
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copy2(s, d)


def generate_index_html(posts):
	"""Generate index.html from post metadata"""
	# Sort posts by date (newest first)
	sorted_posts = sorted(posts, key=lambda p: p.date, reverse=True)

	# Build HTML list items
	items = []
	for post in sorted_posts:
		date_str = post.date.strftime('%Y‑%m')
		items.append(f'''                <li>
                    <span class="date">{date_str}</span
                    ><span class="title"><a href="/{post.url}">{post.title}</a></span
                    ><span class="description"
                        >{post.description}</span
                    >
                </li>''')

	# Read the template structure from existing index.html
	try:
		with open('index.html', 'r') as f:
			index_template = f.read()
	except FileNotFoundError:
		# If no index.html exists, create a basic one
		return create_basic_index(items)

	# Replace the list items in the template
	# Find the <ul class="item-list"> section and replace its contents
	list_pattern = r'<ul class="item-list">.*?</ul>'
	new_list = '<ul class="item-list">\n' + '\n'.join(items) + '\n            </ul>'

	# Use string replace to avoid regex escape issues
	match = re.search(list_pattern, index_template, flags=re.DOTALL)
	if match:
		updated_content = index_template[:match.start()] + new_list + index_template[match.end():]
	else:
		# If pattern not found, append list at end of body
		updated_content = index_template.replace('</body>', new_list + '\n</body>')

	return updated_content


def create_basic_index(items):
	"""Create a basic index.html if one doesn't exist"""
	return f'''<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Home</title>
    <link rel="stylesheet" type="text/css" href="/style.css"/>
</head>
<body>
    <div class="container">
        <h1>Posts</h1>
        <ul class="item-list">
{chr(10).join(items)}
        </ul>
    </div>
</body>
</html>'''


def main(incl_drafts=False, auto_index=True):
	"""Build the static site from posts and templates"""
	# Clean docs directory
	if os.path.isdir('docs'):
		shutil.rmtree('docs')

	# Process posts
	paths = glob('posts/*')
	if not paths:
		print("Warning: No posts found in posts/", file=sys.stderr)

	try:
		copytree('posts', 'docs')
	except FileNotFoundError:
		print("Error: posts/ directory not found", file=sys.stderr)
		sys.exit(1)

	# Include drafts if requested
	if incl_drafts:
		draft_paths = glob('drafts/*')
		if draft_paths:
			paths += draft_paths
			copytree('drafts', 'docs')

	# Collect post metadata and generate HTML
	posts = []
	for post_path in paths:
		url = os.path.basename(post_path)

		try:
			with open(post_path + '/index.html', 'r') as f:
				post_content = f.read()
		except FileNotFoundError:
			print(f"Warning: {post_path}/index.html not found, skipping", file=sys.stderr)
			continue

		# Parse frontmatter if present
		metadata, body = parse_frontmatter(post_content)

		# Extract metadata with fallbacks
		title = metadata.get('title', url.replace('-', ' ').title())
		date_str = metadata.get('date', datetime.now().strftime('%Y-%m-%d'))
		description = metadata.get('description', extract_description(body))

		# Parse date
		try:
			date = datetime.strptime(date_str, '%Y-%m-%d')
		except ValueError:
			try:
				date = datetime.strptime(date_str, '%Y-%m')
			except ValueError:
				print(f"Warning: Invalid date format for {url}, using current date", file=sys.stderr)
				date = datetime.now()

		posts.append(Post(title, url, date, description))
		write_post(title, url, body)

	# Copy static assets
	assets = ['favicon.ico', 'CNAME', 'style.css']
	for asset in assets:
		try:
			shutil.copy2(asset, f'docs/{asset}')
		except FileNotFoundError:
			print(f"Warning: {asset} not found, skipping", file=sys.stderr)

	# Generate home page
	if auto_index and posts:
		index_content = generate_index_html(posts)
		index_html = template('Home', index_content)
	else:
		# Use existing index.html
		try:
			with open('index.html', 'r') as f:
				content = f.read()
			index_html = template('Home', content)
		except FileNotFoundError:
			print("Error: index.html not found", file=sys.stderr)
			sys.exit(1)

	with open('docs/index.html', 'w') as f:
		f.write(index_html)

	print(f"✓ Site built successfully to docs/ ({len(paths)} posts processed)")


if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Build static site from posts and templates')
	parser.add_argument('--drafts', action='store_true', help='Include draft posts in build')
	parser.add_argument('--no-auto-index', action='store_true', help='Use existing index.html instead of auto-generating')
	args = parser.parse_args()

	main(incl_drafts=args.drafts, auto_index=not args.no_auto_index)