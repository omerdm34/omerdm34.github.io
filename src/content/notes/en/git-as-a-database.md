---
title: 'Git as a database: a one-password CMS for a preschool'
description: 'How a Cloudflare Worker, the GitHub API and a signed cookie replaced a content management system that its only user could not get into.'
date: 2026-09-19
code: MSL
project: masal-bahcesi
tags: ['Cloudflare Workers', 'GitHub API', 'Astro', 'Security']
---

A small preschool needed its website to carry weekly news: enrolment dates, holidays, a celebration next Friday. The person posting it runs the school from a phone and does not write code. The site is static, built with Astro from Markdown files, which is what makes it fast and free to host. The question was how a non-developer adds a Markdown file.

## The tool that was built for someone else

My first answer was a Git-based CMS, a web editor that commits Markdown to the repository for you. On paper it was ideal. In practice the owner needed a GitHub account, an invitation to a private repository, acceptance of that invitation, the CMS app installed on the repository by me, the right account picked in a switcher, and an English interface.

The owner got stuck three times. Each time the cause was a different link in that chain, and never the owner. That was the useful finding. The problem wasn't documentation. The tool was designed for developers, and every extra account was a new place to fail.

## Keep the repository, remove everything in front of it

The static site didn't need to change. Content already lived in Git, and every push already triggered a build on Cloudflare. What had to go was the chain of accounts between the owner and the repository.

So the panel became part of the site: one address, one password, one form, in Turkish, sized for a phone. Behind it, a Cloudflare Worker exposes three actions, *list*, *save* and *delete*, and turns each one into a GitHub API call:

```js
// Save = write a Markdown file into the content folder.
const path = `src/content/announcements/${slug(title)}.md`;

// Overwriting an existing file requires its current SHA.
const existing = await github(`contents/${path}?ref=main`);
const sha = existing.ok ? (await existing.json()).sha : undefined;

await github(`contents/${path}`, {
  method: 'PUT',
  body: JSON.stringify({
    message: `Panel: ${title}`,
    content: base64(frontmatter + body),
    branch: 'main',
    ...(sha && { sha }),
  }),
});
```

That commit is the whole write path. Cloudflare sees it, rebuilds the site, and the announcement is live a few minutes later. There's no database to back up and no server to patch. Every change the owner makes is also a commit with a readable message, so the history of the site is its own audit log, and any mistake is one revert away.

## A session without a session store

A panel needs a login, and a login usually needs somewhere to keep sessions. A Worker has no memory between requests, and I didn't want to add a database just for this. The cookie carries its own proof instead:

```js
// cookie value = "<expiry>.<HMAC-SHA256(password, expiry)>"
async function issue(password) {
  const expiry = Date.now() + 60 * DAY;
  return `${expiry}.${await hmac(password, String(expiry))}`;
}

async function isValid(cookie, password) {
  const [expiry, sig] = cookie.split('.');
  if (Number(expiry) < Date.now()) return false;
  return constantTimeEqual(sig, await hmac(password, expiry));
}
```

The server can check a cookie without storing anything. Nobody can forge one without the password, and the cookie is `HttpOnly`, `Secure` and `SameSite=Strict`. Because the password is the signing key, changing it logs every device out at once, with no extra code. Sixty days is deliberately long. A person who opens the panel once a month shouldn't be asked for a password every time.

Two details matter more than they look. Comparing the signature with `===` stops at the first different character, and that timing can leak how much of a guess was right, so the comparison is constant-time. A wrong password also waits a moment before answering, which makes guessing slow. The GitHub token lives in a Worker secret and is fine-grained: it can write the contents of this one repository and nothing else.

## Phone photos meet a static site

At first, photos from the panel went into the repository exactly as they were uploaded. A photo straight from a phone camera is several megabytes, and a static site would serve it to every visitor, forever. Two layers now handle that. The browser resizes the image before upload: a canvas, at most 1600 px on the long side, JPEG at quality 0.85. After each build, a script shrinks anything that is still too large.

I chose that script's limits by measuring the images already on the site, so it wouldn't touch any photo that was fine. It works on the build output, not on the repository, so quality loss can never pile up across builds.

## Things that surprised me

- **Scoped styles don't reach generated elements.** Astro scopes a component's CSS by adding an attribute to the elements in its template. The announcement list in the panel is built by JavaScript at runtime, so its elements never got that attribute, and the list rendered with no styles at all. The fix was one keyword (`is:global`), and a comment explaining why it has to stay.
- **The repository now has two writers.** The panel commits straight to GitHub, so my local copy falls behind without my noticing. Before I push anything, I pull with rebase first.
- **The token expires.** A fine-grained token has an end date, and when it passes the panel will simply stop saving. It's the one maintenance task this design has, and it comes with a date I know in advance.

The redirect logic and the panel API have 23 unit tests between them. Since handover, the owner has published seven real announcements and events from the panel, and every one of them is a commit I can read.

## What I took from it

- **When a user keeps getting stuck, look at the tool first.** Removing that chain of accounts did more than any feature could have.
- **Git is a fine database for a site that changes a few times a week.** You get history, review and rollback for free. The trade-off is minutes of delay per change, which a school's news page can easily live with.
- **Stateless can still be secure.** A signed cookie, a constant-time check and a narrowly scoped token cover what this panel needs without adding any infrastructure.

The site is live at [masalbahcesimaras.com](https://masalbahcesimaras.com). The rest of the project, from the colour system to the redirect tests, is in the [case study](/projects/masal-bahcesi/).
