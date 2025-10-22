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
	"""Generate index.html content from post metadata"""
	# Sort posts by date (newest first)
	sorted_posts = sorted(posts, key=lambda p: p.date, reverse=True)

	# Build HTML list items
	items = []
	for post in sorted_posts:
		date_str = post.date.strftime('%Y‑%m')
		items.append(
			f'''                <li>
                    <a class="item-link" href="/{post.url}">
                        <span class="date">{date_str}</span>
                        <span class="title">{post.title}</span>
                        <span class="description">{post.description}</span>
                    </a>
                </li>'''
		)

	# Generate the index content (will be wrapped by template.html)
	return f'''<div class="container">
            <h1>Hi, I'm James Pucula</h1>

            <!-- ABOUT -->
            <section class="about">
                <p>
                    Software engineer in the energy sector. I work on mathematical
                    modelling, simulation, and optimisation, then build tools to
                    explore the results.
                </p>
            </section>

            <!-- LIST -->
            <ul class="item-list">
{chr(10).join(items)}
            </ul>
        </div>'''


def main(incl_drafts=False):
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
	assets = ['favicon.ico', 'CNAME', 'style.css', 'finch_128.png']
	for asset in assets:
		try:
			shutil.copy2(asset, f'docs/{asset}')
		except FileNotFoundError:
			print(f"Warning: {asset} not found, skipping", file=sys.stderr)

	# Generate home page
	if posts:
		index_content = generate_index_html(posts)
		index_html = template('Home', index_content)
		with open('docs/index.html', 'w') as f:
			f.write(index_html)
	else:
		print("Warning: No posts found, skipping index.html generation", file=sys.stderr)

	print(f"✓ Site built successfully to docs/ ({len(paths)} posts processed)")


if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Build static site from posts and templates')
	parser.add_argument('--drafts', action='store_true', help='Include draft posts in build')
	args = parser.parse_args()

	main(incl_drafts=args.drafts)
