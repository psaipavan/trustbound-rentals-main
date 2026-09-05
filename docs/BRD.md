# Business Requirements Document (BRD)

## Bricxley — Trust-First Rental Marketplace

**Document status:** Current prototype baseline  
**Product:** Bricxley  
**Primary market:** Hyderabad, India  
**Tagline:** _Rent with clarity._

## 1. Purpose

Bricxley is a rental marketplace designed to make the early rental journey more trustworthy and transparent. It connects tenants with property owners and clearly identified, verified agents, helping users discover a home, assess trust signals, make contact, schedule a visit, and decide with confidence.

This document records the business scope represented by the current repository. It distinguishes the working front-end prototype from the capabilities required for a production launch.

## 2. Business Problem

Renters in Hyderabad can encounter fake or stale listings, agents presenting themselves as owners, undisclosed brokerage, unclear deposit and maintenance costs, spam after sharing a phone number, and pressure to pay before viewing a property. Owners and genuine agents also need a credible way to reach suitable tenants and manage interest in their listings.

## 3. Product Vision

**Verified rentals. Transparent people. Better connections.**

Bricxley should support the journey below while making trust visible throughout:

`Discover → Verify → Connect → Visit → Decide → Move In`

The platform is not intended to be a generic listing directory. Its differentiators are listing and identity verification, upfront cost visibility, role clarity, protected contact, and accountable reporting.

## 4. Objectives and Success Measures

| Objective                                                 | Example measure for production                                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Increase confidence in listing quality                    | Percentage of active listings verified; rate of reports upheld                            |
| Make costs transparent                                    | Percentage of listings with complete rent, deposit, maintenance, and brokerage details    |
| Protect users before they choose to share contact details | Percentage of first conversations conducted in platform chat; spam complaints per contact |
| Help tenants find appropriate homes efficiently           | Search-to-detail, save, visit-request, and move-in conversion rates                       |
| Give owners and agents a clear operating experience       | Listing completion rate; inquiry and visit response time                                  |

Target values are intentionally not set in this prototype and should be agreed before launch.

## 5. Users and Stakeholders

| User / stakeholder           | Primary need                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Tenant                       | Find a suitable, trustworthy rental with clear costs and a safe path to contact the lister. |
| Property owner               | Publish and manage a rental listing, prove legitimacy, and respond to tenants.              |
| Verified agent               | List properties under an explicit agent identity and disclose brokerage upfront.            |
| Operations / moderation team | Review verification evidence, reports, availability, and potentially fraudulent content.    |
| Product / business team      | Improve trust, marketplace liquidity, and conversion while protecting users.                |

## 6. Scope

### In scope for the current prototype

- A responsive rental marketplace experience for Hyderabad.
- Discovery of illustrative rental listings by locality, property type, BHK, budget, move-in date, and additional filters.
- List, map, and split-map discovery views with Hyderabad locality search.
- Property detail pages with gallery, amenities, availability, lister type, verification labels, a demo Bricxley Score, and transparent cost breakdown.
- Save-home and property-comparison interactions in the browser.
- Owner, tenant, and agent dashboard previews.
- Listing form, visit-request flow, secure-chat interface, report flow, contact form, and role-based sign-in screens.
- Locality information, flatmate discovery, safety guidance, product explanation, and legal-information pages.

### Out of scope / not yet connected

- Real account creation, authentication, OTP, Google sign-in, and authorization.
- Persistent database storage for users, listings, messages, saved homes, visits, reports, or dashboards.
- Live property publication and moderation workflow.
- Actual identity, ownership, property, or agent verification.
- A live Bricxley Score calculation or auditable verification history.
- Real-time chat, contact-consent controls, notifications, or phone-number exchange.
- Payments, agreements, rent collection, or move-in management.
- Live locality market data, inventory feeds, analytics, or CRM integrations.
- Counsel-approved legal policies and production compliance processes.

## 7. Functional Requirements

### 7.1 Rental discovery

- **FR-01:** A tenant can browse rental listings in Hyderabad.
- **FR-02:** A tenant can search by locality or place and filter by property type, BHK, budget, move-in date, furnishing, lister type, amenities, parking, pets, verification, brokerage, and Bricxley Score.
- **FR-03:** A tenant can change between list, map, and split-map views and sort results.
- **FR-04:** The application must display an empty state when no listing matches the chosen criteria.

### 7.2 Listing detail and transparency

- **FR-05:** Each listing must show rent, deposit, maintenance, brokerage, configuration, furnishing, amenities, availability, and locality.
- **FR-06:** Each listing must clearly label whether the lister is an owner or agent. Agent brokerage must be visible before a tenant contacts the lister.
- **FR-07:** Listings may show owner, property, agent, and direct-owner verification indicators only when supported by a real verification process in production.
- **FR-08:** Each listing may show a Bricxley Score with an explanation of its inputs and verification status. The current score is explicitly demo data.
- **FR-09:** A tenant can save listings and compare selected listings within the browser; production must persist these preferences to the user account.

### 7.3 Connection and visits

- **FR-10:** A tenant can initiate an in-platform conversation with a lister through the secure-chat interface.
- **FR-11:** A tenant can request a property visit and provide a preferred date, time, and optional message.
- **FR-12:** The platform must not expose a tenant's phone number automatically. Production contact sharing must be explicit and consent-based.
- **FR-13:** Owners and agents need a dashboard view of inquiries, visits, and listing status; tenants need a view of saved homes and visit activity.

### 7.4 Listing and operations

- **FR-14:** Owners and agents can submit a listing draft with address/locality, configuration, rent, deposit, maintenance, brokerage, availability, and description.
- **FR-15:** Agents must declare brokerage, which must be displayed on the published listing.
- **FR-16:** A user can report a suspect listing or unsafe interaction and add supporting detail.
- **FR-17:** Production reports must create a reviewable moderation record with status, reviewer actions, and an audit trail. Prototype report submissions are display-only.
- **FR-18:** Owners and authorized agents can update listing availability.

### 7.5 Supporting content and trust education

- **FR-19:** The application must explain how verification, brokerage transparency, safe contact, and reporting work.
- **FR-20:** Users can access locality guides, flatmate discovery, product information, contact, privacy, terms, and community-guideline pages.

## 8. Business Rules

- A user must never be able to appear as an owner when they are acting as an agent.
- Brokerage must be declared and displayed before contact; a direct-owner listing must make ₹0 brokerage clear.
- A viewing request must not require a platform viewing fee. Suspected requests for a viewing payment should be reportable.
- Verification status must represent completed checks, not marketing claims. In the current application all such values are illustrative demo values.
- Contact information must remain private until the relevant users deliberately choose to share it.
- Reports require human review; automated removal is not represented by the prototype.
- Availability should be confirmed and time-stamped in production to reduce stale listings.

## 9. Non-Functional Requirements

- **Responsive design:** Usable on mobile, tablet, and desktop.
- **Performance:** Search and navigation should feel immediate; map loading must not block the overall page.
- **Accessibility:** Interactive controls need keyboard access, semantic labels, visible focus states, and sufficient color contrast.
- **Privacy and security:** Protect personal data; enforce role-based access; secure authentication, message storage, and consent records before launch.
- **Reliability:** Handle missing listings, failed loads, empty searches, and unavailable browser location gracefully.
- **Observability:** Production should record errors, security-relevant events, verification actions, reports, and key funnel events.
- **SEO:** Public listing and discovery pages should provide accurate titles and descriptions while unavailable listings should not be indexed.

## 10. Current Technical Baseline

The repository is a TypeScript, React 19 application built with Vite, TanStack Start/Router, TanStack Query, Tailwind CSS, Radix UI, and MapLibre.

- Route-driven pages cover home, rentals, property details, list property, authentication, three dashboards, flatmates, locality guides, safety, informational pages, and legal pages.
- Illustrative properties, localities, and geographic data are stored locally in the front end.
- Saved homes are client-side state.
- Forms and most action flows currently present success or informational notifications rather than calling a backend.
- Error and not-found boundaries are present at the routing layer.

## 11. Dependencies and Assumptions

- The initial launch geography is Hyderabad; the product model should later support additional cities.
- A production backend, database, authentication provider, storage service, and notification provider are required for transactional features.
- Verification requires defined operating procedures, eligible evidence, reviewer access, and audit logging.
- Map and locality data need approved data sources and licensing before production use.
- Legal policies, data retention, consent, and fraud-handling processes require appropriate legal and compliance review.

## 12. Risks and Mitigations

| Risk                                         | Mitigation                                                                                           |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Trust labels overstate actual verification   | Do not publish badges or scores until checks, evidence, and audit history are implemented.           |
| Stale or fraudulent listings                 | Use availability confirmations, reporting, human review, and lifecycle expiry rules.                 |
| Hidden brokerage or role misrepresentation   | Enforce account roles and mandatory brokerage fields; label agents consistently.                     |
| Spam or privacy harm                         | Keep early conversation in-app and require mutual, recorded consent for contact sharing.             |
| Prototype behavior mistaken for live service | Keep illustrative data and unconnected actions visibly labelled until production services are ready. |

## 13. Release Readiness Criteria

Before a public production launch, the platform should have:

1. Authenticated accounts and role-based permissions.
2. Persistent, validated data for listings, messages, reports, visits, and saved homes.
3. Defined and operational verification workflows, plus a transparent Bricxley Score methodology.
4. Moderation tooling and service-level expectations for report handling.
5. Consent-based contact sharing, security review, privacy controls, and approved legal documents.
6. Production data sources for properties and localities, plus analytics and monitoring.
7. Accessibility, responsiveness, error-path, and end-to-end testing for the core rental journey.

## 14. Open Decisions

- What evidence is required for owner, property, and agent verification?
- Which Bricxley Score inputs are displayed, weighted, and appealable?
- What are the service-level targets for reviewing listings, reports, and visit requests?
- How and when may users exchange contact details?
- Will launch inventory come from direct owner onboarding, agencies, partners, or data feeds?
- What is the policy for listing expiry, re-verification, duplicate detection, and removal?
