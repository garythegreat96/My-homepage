# Gary Xiao — Personal Website

A small personal site and project prototypes, deployed from GitHub to Cloudflare Workers.

- \`index.html\` is the personal homepage.
- \`my-project.html\` is the Homeostasis wellness dashboard demo.
- \`original-ideas.html\` is the Original Ideas project.
- \`site.css\` and \`project.js\` style and power Homeostasis.
- \`ideas.css\` and \`ideas.js\` style and power Original Ideas.
- \`worker.js\` serves the static files and handles live idea searches through Cloudflare Web Search.

The Cloudflare Worker serves the homepage at \`garyxiao.org\`, Homeostasis at \`hstasis.garyxiao.org\`, and Original Ideas at \`oideas.garyxiao.org\`. Each project subdomain routes to its page based on the hostname.

Original Ideas searches public web results when a visitor submits an idea. It shows possible connections, result links, and an exact-wording signal when a result title or snippet repeats the full submitted idea. The summary is based on search result titles and snippets; it is not an AI originality check and cannot prove an idea is identical, who shared it first, or legal ownership. Search queries are sent to Cloudflare's Ceramic search provider. The provider currently lists a price of $0.25 per 1,000 searches. Identical searches are cached for 30 minutes. Idea notebooks and display names remain in the visitor's browser; there are no real accounts.
