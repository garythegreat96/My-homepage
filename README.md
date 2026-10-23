# Gary Xiao — Personal Website

A small personal site and project prototypes, deployed from GitHub to Cloudflare Workers.

- `index.html` is the personal homepage.
- `my-project.html` is the Homeostasis wellness dashboard demo.
- `original-ideas.html` is an early Original Ideas prototype.
- `site.css` and `project.js` style and power Homeostasis.
- `ideas.css` and `ideas.js` style and power the Original Ideas prototype.

The Cloudflare Worker serves the homepage at `garyxiao.org`, Homeostasis at `hstasis.garyxiao.org`, and Original Ideas at `oideas.garyxiao.org`. Each project subdomain routes to its page based on the hostname.

The Homeostasis and Original Ideas pages are front-end prototypes. Their demo data stays in the current browser. Original Ideas compares wording against a small sample collection and offers links that open Google, Bing, or DuckDuckGo with the submitted idea. It does not fetch or summarize those search results, use a live AI service, or create real accounts. Its local timestamps are informal first-posted credit only and do not establish legal ownership.
