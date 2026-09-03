# Cornerstone

> A calm, step-by-step guide that helps small-business owners go from "I need a website" to "My business is live online."

Cornerstone is a guided web application for non-technical small-business owners who need to set up a domain, choose a website approach, create a professional online presence, configure business email, and launch safely.

Instead of overwhelming people with technical jargon or pushing a single provider, Cornerstone turns website setup into a personalized roadmap: one clear task at a time.

## What it solves

Launching a first business website often means facing unfamiliar concepts, conflicting provider advice, account-access risks, and dozens of setup decisions. Cornerstone helps users work through questions such as:

- What is the difference between a domain, hosting, a website builder, and DNS?
- Which website setup is appropriate for my business?
- How can I connect a domain without breaking business email?
- What content and pages does a professional business website need?
- How can I make the site work on mobile and become easier for customers to find?
- How do I make sure that the business owner—not an agency, contractor, or former employee—controls key online accounts?

The product explains technical choices in plain English, guides users through safe next steps, and keeps launch work organized in an actionable plan.

## Who it is for

Cornerstone is built for small-business owners with limited technical experience, including:

- Local service businesses such as salons, tradespeople, consultants, tutors, repair shops, and clinics
- Restaurants, cafés, bakeries, and home-food businesses
- Freelancers, independent professionals, coaches, and creators
- Retailers and small ecommerce businesses
- Charities, community groups, and early-stage founders

It is especially useful for people who have a business name or social-media presence but no domain or website, already own a domain but do not know what to do next, are replacing an older website, or need clarity over accounts currently managed by someone else.

## Product capabilities

### Personalized launch roadmap

Users complete a short onboarding flow covering their business type, goals, current setup, website requirements, budget, timeline, and technical comfort. The app creates a tailored plan across these stages:

1. Plan the online presence
2. Secure the domain
3. Choose a website approach
4. Create core website pages
5. Connect domain, website, and email safely
6. Test and launch
7. Improve discoverability and maintain the site

Each stage contains practical tasks, plain-language guidance, estimated effort, and progress tracking.

### Domain and digital ownership guidance

The app helps owners understand and safeguard the online assets their business depends on:

- Domain and registrar account
- Website platform or hosting account
- DNS provider
- Business email provider
- Analytics and search-monitoring accounts
- Payment, booking, and social-media accounts

The guidance emphasizes owner-controlled accounts, recovery details, two-factor authentication, renewal reminders, and documented access. The Digital Ownership Record provides a dedicated place to track service ownership and recovery responsibility without storing secrets.

### Domain name helper

The domain helper suggests business-appropriate name formats and evaluates them through simple criteria:

- Clarity
- Memorability
- Ease of spelling
- Local relevance
- Brand flexibility
- Potential confusion

The app does not claim that a domain is available unless a live domain lookup integration is connected. It provides practical name ideas and directs users to verify availability with a registrar.

### Website platform matcher

An interactive decision tool guides owners toward a category of website setup rather than forcing a provider choice.

| Setup category                        | Best suited to                                                         |
| ------------------------------------- | ---------------------------------------------------------------------- |
| Easy all-in-one website builder       | Owners who want a straightforward, low-maintenance site quickly        |
| Ecommerce-first platform              | Businesses selling products online                                     |
| Flexible CMS with managed hosting     | Businesses needing more flexibility and room to grow                   |
| Professional designer/developer build | Businesses with complex requirements or a larger implementation budget |
| Simple one-page launch site           | Owners who need an immediate, focused online presence                  |

The matcher describes the advantages, trade-offs, maintenance expectations, feature fit, and questions owners should ask before purchasing.

### DNS connection center

DNS is often the most intimidating part of launching a website. The connection center breaks it into guided actions and explains records such as A, CNAME, TXT, and MX records in practical language.

It includes:

- A pre-change checklist
- DNS record tables with copy actions
- Plain-English explanations of each record
- Completion states for guided steps
- Provider-agnostic troubleshooting flows
- Warnings to preserve existing mail-related records

> **Important:** DNS changes can affect both websites and business email. Users are warned not to delete unknown records and not to remove email-related records unless they are intentionally changing email providers.

### Website content builder

The content workspace helps owners prepare the essential information for a credible business site. It supports guided drafts for:

- Home
- About
- Services
- Products
- Contact
- Booking
- Menu
- Portfolio
- Testimonials
- FAQ
- Privacy and business-policy pages

Each page includes a purpose statement, recommended sections, fill-in-the-blank prompts, quality checks, and editable AI-assisted drafting placeholders.

### Launch checklist

The central checklist organizes required, recommended, and optional launch tasks across:

- Account ownership and recovery
- Website content and contact details
- Mobile usability, links, forms, and accessibility basics
- Domain connection, redirects, HTTPS, and email preservation
- Search and local business visibility
- Analytics and conversion tracking
- Post-launch review and maintenance

Users can filter work, add notes, assign tasks to teammates or contractors, and monitor their launch readiness.

### Business email guide

A guided business-email section helps owners plan and set up professional addresses such as `hello@yourbusiness.com`, `support@yourbusiness.com`, or `bookings@yourbusiness.com`. It covers mailbox planning, mobile setup, signatures, recovery settings, and introductory SPF, DKIM, and DMARC guidance.

### Search and local presence

The discoverability guide focuses on durable fundamentals rather than ranking promises:

- Clear page titles, headings, and navigation
- Original, useful service and product descriptions
- Mobile-friendly and secure pages
- Consistent business name, address, phone number, hours, and service-area details
- Search-monitoring setup and ownership verification
- Sitemap and indexing guidance where supported
- Practical content ideas tailored to business type

### Ongoing maintenance

The maintenance center helps owners protect their investment after launch, with recurring reminders for reviewing enquiries, testing forms, updating offers and hours, checking analytics, reviewing account access, refreshing content, and monitoring domain renewal.

### Functional growth sprint — five new capabilities

Recent work connects the launch workflow end-to-end. All data stays in local storage and is not sent to a server.

- **Launch readiness scoring and blockers** — Deterministic checks over tasks, business essentials and customer-journey results. Shows overall completion and required-task completion separately (both with semantic color plus text/icons), lists up to 5 blockers with severity badges, plain-English why sentences and route links, filters blockers in the checklist (`/checklist?filter=blockers`), and exposes a next-action button. Guidance only — not a guarantee.
- **Customer journey tester (`/customer-journey`)** — Five-step flow: choose a goal, prepare, tailored steps, record outcome, summary. Supports 8 journey types (phone, WhatsApp, form, booking, purchase, visit, newsletter, custom) with inferred default from onboarding, 5–6 plain-English hints, per-step Passed / Needs improvement / Blocked / Not tested with notes, mark-all-passed and reset, summary counts with readiness impact, and links to checklist, dashboard and hire-help.
- **Saved domain shortlist (`/domains` → shortlist)** — Save ideas with normalized deduplication, statuses (Considering / Preferred — only one at a time / Backup / Rejected / Purchased), notes, local 0–10 scores (clarity, memorability, spelling ease, local relevance, brand flexibility), RDAP outcome with checkedAt messaging, table + mobile cards, compare up to 5 side-by-side, and handoff wiring to Business Profile preferred domain, readiness, ownership and hire-help.
- **Unified business profile workspace (`/business-profile`)** — One place for basics, location/service area, contact & primary customer action, brand & trust, and online setup. Shows completion percentage with per-section progress, essentials banner for readiness, pre-filled from onboarding, and downstream wiring to dashboard greetings, content builder, journey defaults, get-found and hire-help.
- **Professional handoff brief (`/hire-help`)** — Local-only brief compiled from business profile, onboarding, domain shortlist, launch plan, content drafts, journey test, ownership and readiness. Never sent to a server; user shares via copy, print/Save as PDF or download (.txt/.md). Includes completed/open tasks, blockers, journey status, domain/technical snapshot, no-password ownership checklist and eight questions to ask a professional.

Cross-feature wiring: onboarding → profile prefill; profile → dashboard/content/journey/get-found/handoff; shortlist → profile/readiness/ownership/handoff; journey → readiness/checklist/handoff; readiness → dashboard/checklist/handoff; ownership → domain/handoff; content → journey/handoff. All internal links use `Link` from `@tanstack/react-router` with no `href="#"` placeholders.

> No backend, authentication, PDF service or analytics backend is live in this sprint — storage is local-only and printing uses the browser dialog.

### Connected online presence — six new capabilities

This sprint connects domain, website and business email as one coherent setup — with no guesses, no duplicate prompts and no hidden DNS behaviour. All planning data stays in local storage; no DNS records are changed automatically, no domains are purchased and no audits are live.

- **Online Presence Command Center (dashboard)** — Welcome/context header with business snapshot, seven-area presence overview (domain, website, email, DNS & connection, customer action, ownership, local presence), consolidated readiness summary using the shared `getReadiness` helper, domain→website and domain→email setup-map preview, contextual next-best-action, and a 4-item quick-tools strip. Empty state for visitors without a plan keeps protection guidance visible without fear copy. Links to `/online-setup` are contextual (setup-map preview + help), not global nav clutter.
- **Domain → Website → Email Setup Map (`/online-setup`)** — Read-only visual map (mobile vertical flow + desktop branching layout) explaining DNS as traffic director. Distinct cards for Domain, DNS, Website and Business Email each show real status labels, plain-English summaries, blockers where relevant and actions. Includes at-a-glance “what we know / what to do next”, DNS provider location handling (unknown shown as unknown, not guessed), and high/medium/low DNS impact wording in plain English.
- **DNS Impact Preview (low / medium / high)** — Derived from five plain-English planning questions (change type, business-email use, DNS manager, screenshot saved, exact provider records). Supplies `level`, `title`, `summary`, `requiredBeforeChange`, `recordsToPreserve` and `recommendedNextStep`. Manual-loss protection:screenshot + exact records + provider confirmation required before changes. Levels: low = first site, no email, safeguards in place; high = replacing site with business email, no screenshot, provider unknown, no exact records; medium = everything else. Guidance only — no automatic DNS writes.
- **Conditional Launch Readiness (integrated with journey)** — Shared `getReadiness(state.tasks, business, ownership, customerJourneyTest)` consumed identically by dashboard, checklist, launch dossier and preflight. Covers domain ownership (2FA + renewal), website connection, HTTPS only when `websiteUrlStatus === "live"`, primary customer action via journey test (blocked → critical, needs improvement → important, not tested → critical), business essentials, local/ecommerce/booking/contact-form/email/migration specifics. Blocked journey creates a critical blocker and can optionally add deduped “Fix journey” tasks; reruns deduplicate via `addTask` existence check. No divergent “DNS safe” vs “launch ready” flags — DNS readiness feeds into the same readiness blockers.
- **Customer Journey Verification (wired end-to-end)** — Eight journey types inferred from onboarding/business profile with explicit `primaryCustomerAction` override, five-step tester (goal → prepare → tailored steps → record outcome → summary), per-step statuses with deduped “Add to launch plan” (no duplicates on rerun), evidence fields (date/device/URL/what you verified — no passwords, card numbers or bulk PII), and summary line `Customer journey result: Blocked/Needs improvement/Passed/Not tested — X of Y checks passed`. Result feeds `getReadiness` and `getOnlinePresenceStatus` (customer_action area) so dashboard, checklist, dossier and preflight all reflect the same outcome.
- **Unified dossiers via shared helpers** — `getOnlinePresenceStatus(state)` and `getDnsImpactPreview(state)` derive all seven presence areas from tasks + business + ownership + journey without re-asking completed profile questions (prefill from business profile). `OnlineSetupMap`, `OnlinePresenceStatusGrid`, `DnsImpactPreviewCard` and `SetupMapPreview` reuse the same helpers so dashboard and `/online-setup` never show conflicting states. Business Profile → setup map/readiness/journey, Domains → setup map, Ownership → setup map/readiness, Connect domain → setup map all read the shared state, avoiding repeated questions.

Cross-feature integration in this sprint: business profile prefills setup map and connect-domain planning; saved shortlist preferred domain surfaces in online setup domain card; live-site business email guards stay separate from website records (mutual preserve lists); no duplicate alerts on same screen — one banner/top-action per concern; no duplicate tasks from reruns due to deduped `addTask`; every status card links to a real route (`/domains`, `/connect-domain`, `/platform-matcher`, `/business-email`, `/customer-journey`, `/ownership-record`, `/get-found`, `/checklist?filter=blockers`); local migration is local-only with consent flag `localInsightsConsent`; all `Link` uses `@tanstack/react-router` without `href="#"`; semantic design tokens and light/dark/system via `ThemeMenu` remain in place, responsive and plain English throughout.

> This sprint does not perform live DNS changes, domain purchases, availability guarantees, audits or hosting provisioning — guidance and local planning only. Registrars confirm price and finalize registration. Network checks (RDAP, live DNS propagation) are read-only helpers where present.

## Application routes

The product includes guided workflow pages, support resources, account flows, legal information, and a branded fallback for unknown URLs.

### Planning and launch workflow

| Route               | Purpose                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| `/`                 | Product landing page and main entry point                                              |
| `/how-it-works`     | 7-phase guide with objectives, outcomes and tool links                                 |
| `/onboarding`       | Personalized plan creation flow                                                        |
| `/dashboard`        | Plan progress and next actions                                                         |
| `/domains`          | Domain guidance and domain-name exploration                                            |
| `/platform-matcher` | Website setup category recommendations                                                 |
| `/connect-domain`   | DNS and domain-connection guidance                                                     |
| `/content`          | Guided website-content workspace                                                       |
| `/checklist`        | Interactive launch checklist                                                           |
| `/business-email`   | Professional business-email planning                                                   |
| `/get-found`        | Search and local-presence basics                                                       |
| `/maintenance`      | Ongoing website-maintenance guidance                                                   |
| `/ownership-record` | Digital ownership and account-access record                                            |
| `/hire-help`        | Guidance for safely hiring a freelancer or agency                                      |
| `/customer-journey` | 5-step tester for your primary customer action                                         |
| `/business-profile` | Unified profile workspace for all business details                                     |
| `/online-setup`     | Domain → website → email setup map and DNS impact preview (read-only, contextual)      |
| `/launch-dossier`   | Compact, printable launch readiness + DNS impact + journey summary (shared readiness)  |
| `/preflight`        | Pre-flight sandbox + shared launch readiness check (same scorer, no separate decision) |
| `/launch-wizard`    | Guided 6-step launch track (domain → email → website → DNS → local → pre-flight)       |
| `/growth-toolkit`   | UTM builder, health checklists, SEO handrails, provider shortcuts                      |
| `/cost-calculator`  | 3-year total cost of ownership (domain, hosting, email, renewals)                      |
| `/email-signature`  | Professional email signature generator (4 templates)                                   |
| `/review-kit`       | Google review QR, counter card, WhatsApp/email templates                               |
| `/security-drill`   | Disaster recovery, DNS vault, 2FA and access triage                                    |

### Learning and support

| Route              | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `/learn`           | Learning library                                                        |
| `/help`            | Searchable help center                                                  |
| `/troubleshooting` | Guided paths for common domain, website, email, and access issues       |
| `/glossary`        | Plain-language technical glossary                                       |
| `/contact`         | Support, feedback, partnership, privacy, and accessibility contact form |
| `/status`          | Service-status page and future incident-history surface                 |
| `/changelog`       | Product release notes and updates                                       |

### Account and legal

| Route              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `/sign-in`         | Existing-user sign-in                                  |
| `/create-account`  | Account creation and plan-saving entry point           |
| `/forgot-password` | Privacy-safe password-reset request flow               |
| `/reset-password`  | Password-reset route and invalid/expired-link fallback |
| `/account`         | Account overview                                       |
| `/settings`        | Appearance, privacy, security, and support settings    |
| `/delete-account`  | Account-deletion confirmation and request flow         |
| `/privacy`         | Privacy information                                    |
| `/terms`           | Terms and educational-guidance disclaimer              |
| `/accessibility`   | Accessibility commitment and feedback information      |

### Unknown paths

Unknown URLs are handled by a friendly, branded 404 route rather than a blank page or generic framework error. The fallback gives users clear recovery actions for Home, Dashboard, plan creation, and learning resources.

## Dark mode

Cornerstone includes a global appearance system with three preferences:

- **Light**
- **Dark**
- **Use device settings**

The theme selection is persisted locally and is available from Settings and the application’s navigation. The visual system is designed to keep core workflow elements—cards, forms, tables, task states, DNS warnings, modals, tooltips, and navigation—readable and consistent in both light and dark themes.

Dark mode uses semantic design tokens rather than ad-hoc color overrides so the application can apply consistent surfaces, text contrast, borders, status states, and focus indicators across public pages, dashboard pages, and support flows.

## Design principles

- **Plain English first:** technical terms are introduced only when needed and explained immediately.
- **Progress over perfection:** users can move forward one useful task at a time.
- **Ownership and safety:** critical business accounts should remain under business-owner control.
- **Provider neutrality:** recommendations are based on needs and trade-offs, not a forced vendor choice.
- **No false guarantees:** the app does not promise rankings, uptime, legal compliance, domain availability, or third-party provider outcomes.
- **Progressive disclosure:** beginner guidance appears first; advanced details are available when useful.
- **Accessible by default:** the app supports semantic structure, keyboard use, visible focus states, readable contrast, responsive layouts, and light/dark/system appearance preferences.
- **No dead ends:** internal links lead to a route, a meaningful state, or a friendly fallback—not a 404.

## Main user flow

```text
Business details
      ↓
Goals and requirements
      ↓
Current domain / website status
      ↓
Personalized launch roadmap
      ↓
Domain and platform decisions
      ↓
Website content and account setup
      ↓
DNS connection and quality checks
      ↓
Launch checklist
      ↓
Discoverability and ongoing maintenance
```

## Example user scenario

**Harbor & Hearth Bakery** is a local bakery that wants to display its menu, receive custom-cake orders, use WhatsApp for enquiries, and establish a credible local online presence.

A personalized plan can recommend:

1. Select and register a simple, owner-controlled domain.
2. Choose an easy all-in-one website approach supporting a menu, photo gallery, enquiry form, and WhatsApp contact.
3. Prepare Home, Menu, About, Custom Cake Orders, and Contact pages.
4. Add real product images, business hours, location, and clear ordering instructions.
5. Set up a professional business email address.
6. Connect the domain while preserving any existing email configuration.
7. Test the website and enquiry path on mobile and desktop.
8. Set up search monitoring and local-profile basics.
9. Schedule monthly content and access reviews.

## Technical direction

The project uses a modern TypeScript web stack and a file-based route structure.

- **Frontend:** React and TypeScript
- **Routing:** TanStack Router file-based routes
- **Styling:** Tailwind CSS and semantic design tokens
- **UI direction:** reusable components and accessible controls
- **Icons:** Lucide
- **Theme:** global light, dark, and system-preference support with local persistence
- **Navigation:** grouped AppShell with collapsible sections, command search (`Find a tool or answer`, `⌘K`), recent tools, and in-app Launch Assistant (local curated KB)
- **Future backend/authentication/persistence:** Supabase-compatible architecture
- **Guest experience:** local persistence for in-progress plans
- **Future integrations:** domain lookup, AI content generation, analytics, calendar reminders, search-monitoring tools, and PDF export

Suggested data entities:

```text
profiles
businesses
business_requirements
launch_plans
launch_tasks
domain_profiles
website_content_drafts
maintenance_tasks
learning_progress
```

## Security and privacy

Cornerstone should not store:

- Passwords
- Account-recovery codes
- DNS credentials
- Payment-card information

When a backend is connected, use least-privilege access patterns, keep API secrets server-side, and design persistence with row-level-security readiness. The app should support guest mode, account creation, saved plans, privacy controls, and a data-deletion path.

Users should never send passwords, recovery codes, DNS credentials, or payment information through support forms.

## Accessibility and UX

The user experience should remain calm, clear, and usable by beginners.

- Use semantic HTML, accessible labels, keyboard navigation, and visible focus states.
- Maintain legible contrast in light and dark modes.
- Do not rely on color alone to communicate task, warning, or error state.
- Use clear inline validation and practical error messages.
- Include loading, empty, success, and fallback states.
- Prefer descriptive controls such as “Create my launch plan,” “Mark task complete,” and “Copy DNS value.”
- Avoid introducing complex DNS and security details before the user needs them.

## AI-assisted capabilities

AI features should assist—not replace—the business owner’s judgment. Planned capabilities include:

- Personalized roadmap generation
- Domain-name ideas
- Homepage headline and service-description drafts
- FAQ and local-content ideas
- Simplified explanations of technical terms
- Next-priority task recommendations
- Launch-plan gap analysis
- Project-brief generation for freelancers or agencies

Every generated result should offer edit, regenerate, and copy controls, plus a reminder to review content for accuracy before publishing.

## Roadmap

- [x] Build core landing, onboarding, dashboard, and guided workflow pages
- [x] Add domain guidance, platform matcher, website-content workspace, and launch checklist
- [x] Add account, support, legal, utility, and fallback routes
- [x] Add a global light, dark, and system appearance system
- [x] Add branded route fallback for unknown paths
- [x] Add launch readiness scoring and blockers (overall + required, top-3 blockers, next action, `?filter=blockers`)
- [x] Add customer journey tester (5-step flow with 8 journey types and readiness wiring)
- [x] Add saved domain shortlist (preferred/backup/purchased, scores, RDAP, compare, handoff wiring)
- [x] Add unified business profile workspace (pre-filled from onboarding, downstream feeds)
- [x] Add professional handoff brief (local-only, copy/print/download, ownership checklist and questions)
- [x] Add Online Presence Command Center on dashboard (seven-area overview + consolidated readiness from shared scorer)
- [x] Add Domain → Website → Email Setup Map at `/online-setup` (read-only map, distinct cards, contextual links from dashboard/domains/connect-domain/business-email/ownership/help — no global nav clutter)
- [x] Add DNS Impact Preview — low/medium/high risk from five planning questions, with required-before-change and records-to-preserve (manual checks, no auto DNS writes)
- [x] Make launch dossier (`/launch-dossier`) and preflight (`/preflight`) share the same `getReadiness`/`getDnsImpactPreview` scorer — compact dossier, no separate decision, every status card links to a real route
- [x] Verify Customer Journey end-to-end (blocked → critical blocker, deduped fix tasks, rerun shows no duplicates, plain-English summary `Customer journey result: … — X of Y checks passed`)
- [x] Verify cross-feature integration — no duplicate alerts on one screen, no repeated questions (prefill from business profile), no divergent DNS safe vs launch-ready flags, contextual `Link` only (no `href="#"`), semantic tokens + light/dark/system + mobile responsive
- [ ] Add authentication and saved plans backed by a production database (not live in this sprint)
- [ ] Add real-time domain availability lookup via provider integration (RDAP helper present, registrar confirms price)
- [ ] Add provider-specific DNS setup flows
- [ ] Add live AI generation and review workflows
- [ ] Add analytics, search-monitoring, reminder, and PDF-export backend integrations (browser print only today)
- [ ] Add automated route/link validation and end-to-end theme tests

## Contributing

Contributions, feedback, and product ideas are welcome. Please keep changes aligned with the core principles of beginner clarity, business-owner control, technical safety, accessible design, provider-neutral guidance, and reliable navigation.

## License

Add the project license here.
