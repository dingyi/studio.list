# Separate screenshot capture from the site build

Agency screenshots are generated and reviewed by an explicit Playwright capture workflow, then stored as static assets for Astro to consume. This keeps site builds deterministic and independent of more than one thousand unreliable external websites, at the cost of requiring a separate refresh step when an agency is added or its official link changes.
