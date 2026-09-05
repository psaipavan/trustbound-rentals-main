# Mutual Interest Rental Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal, authenticated tenant-to-owner interest flow in which an accepted interest creates one secure conversation and allows a visit to be scheduled from that conversation.

**Architecture:** Keep the present public application and its `/property/$propertyId` URLs intact. Add client-side session and workflow providers backed by a typed repository/service interface, with TanStack Query hooks as the UI boundary; the in-memory adapter makes the prototype usable now and can be exchanged for TanStack Start server functions plus PostgreSQL/Drizzle later. New tenant, owner, message, visit, and interest routes share workflow components and have focused access/error states.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Start/Router/Query, React Hook Form, Zod, Radix UI, Tailwind CSS, Vitest.

**Spec:** `/home/zadmin/.codex/attachments/b446135d-00f3-48cf-8891-a5cd382881c6/pasted-text.txt`

## Global Constraints

- Preserve the existing homepage, hero, search, public navbar, branding, discovery, and map/list experience; do not replace or redesign them.
- Keep existing public property URLs as `/property/$propertyId`; add the interest route at `/property/$propertyId/interest` because the specification explicitly allows adapting its target structure to the existing route tree.
- Require authentication only when starting interest; preserve the intended interest URL in `/auth?redirect=...` and return there after mock sign-in.
- Use one explicit `InterestStatus`: `DRAFT | SUBMITTED | ACCEPTED | DECLINED | WITHDRAWN | EXPIRED`.
- Use one explicit `VisitStatus`: `REQUESTED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW`.
- A conversation is created or activated only when an interest becomes `ACCEPTED`; it is unique by `interestId`.
- Do not reveal a phone number automatically; sharing contact requires an explicit confirmation and persisted consent record.
- Do not hardwire workflow arrays in React components. Components use typed services through TanStack Query hooks and invalidate only affected query keys.
- Do not use `window.location` for internal navigation. Use TanStack Router `Link`, `navigate`, and router APIs.
- Keep workflow UI small, responsive, accessible, and built from existing button, form, dialog, sheet, toast, icon, radius, shadow, and color primitives. Do not add an animation library.
- Use lazy route code splitting already provided by the TanStack/Vite integration; do not add workflow or chat code to the home route.
- Existing `npm run build` passes. Existing `npm run lint` has 46 unrelated Prettier errors at baseline; do not reformat unrelated files while implementing this feature.

---

## File Structure

| Path                                           | Responsibility                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/lib/workflow/types.ts`                    | Domain types, status groups, service/repository contracts, and typed errors.                                |
| `src/lib/workflow/mock-repository.ts`          | Replaceable development adapter and seeded fixture records.                                                 |
| `src/lib/workflow/service.ts`                  | State transitions, authorization, duplicate protection, conversation creation, visits, and contact consent. |
| `src/lib/workflow/query.ts`                    | Narrow TanStack Query keys, hooks, mutations, and targeted invalidation.                                    |
| `src/lib/auth/session.tsx`                     | Persisted mock session, role-aware sign-in, and guard helpers.                                              |
| `src/lib/analytics.ts`                         | Provider-free, typed analytics event boundary.                                                              |
| `src/components/workflow/*`                    | Reusable workflow navigation, form, compact cards, conversation, and visit dialog.                          |
| `src/routes/property.$propertyId.interest.tsx` | Protected three-step interest flow.                                                                         |
| `src/routes/tenant.*`, `src/routes/owner.*`    | Tenant and owner workflow routes, routed through shared components.                                         |
| `src/routes/auth.tsx`                          | Mock sign-in that stores session and honors safe redirects.                                                 |
| `src/routes/property.$propertyId.tsx`          | Replace direct chat/visit with the single dominant interest action.                                         |
| `src/routes/__root.tsx`                        | Choose public or compact authenticated app navigation without changing public navigation markup.            |
| `src/components/layout/WorkflowNavbar.tsx`     | Tenant and owner compact app navigation.                                                                    |
| `src/**/*.test.ts`                             | Focused domain tests, especially the interest state machine and duplicate/match behavior.                   |

### Task 1: Establish the test runner and workflow domain contract

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/lib/workflow/types.ts`
- Create: `src/lib/workflow/types.test.ts`

**Interfaces:**

- Produces `InterestStatus`, `VisitStatus`, `Interest`, `Conversation`, `Visit`, `WorkflowActor`, `WorkflowRepository`, `InterestInput`, and `WorkflowError` for all later tasks.

- [ ] **Step 1: Add Vitest and the `test` script without changing application code.**

  Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`; install Vitest as a development dependency and configure aliases through `vitest.config.ts`:

  ```ts
  import { defineConfig } from "vitest/config";
  export default defineConfig({ resolve: { tsconfigPaths: true }, test: { environment: "node" } });
  ```

- [ ] **Step 2: Write the failing status-contract test.**

  In `src/lib/workflow/types.test.ts`, import `interestStatusGroups` and assert literal mappings: `SUBMITTED` is the only pending status, `ACCEPTED` is the only matched status, and `DECLINED`, `WITHDRAWN`, and `EXPIRED` are closed. Name the break caught: a UI tab would show an interest in the wrong group.

  ```ts
  import { expect, test } from "vitest";
  import { interestStatusGroups } from "./types";

  test("groups submitted, accepted, and closed interests for their compact tabs", () => {
    expect(interestStatusGroups.pending).toEqual(["SUBMITTED"]);
    expect(interestStatusGroups.matched).toEqual(["ACCEPTED"]);
    expect(interestStatusGroups.closed).toEqual(["DECLINED", "WITHDRAWN", "EXPIRED"]);
  });
  ```

- [ ] **Step 3: Run the new test and confirm it fails because the module is absent.**

  Run: `npm test -- src/lib/workflow/types.test.ts`  
  Expected: failure resolving `./types`, not a passing or assertion failure from existing behavior.

- [ ] **Step 4: Implement the minimal typed domain contract.**

  Export the six allowed interest statuses, five allowed visit statuses, literal status groups, and objects with the exact fields from the specification. Define `WorkflowRepository` as methods returning promises, so a future server adapter can replace the mock adapter without component rewrites. Define `WorkflowError` with codes `UNAUTHENTICATED`, `UNAUTHORIZED`, `NOT_FOUND`, `UNAVAILABLE`, `DUPLICATE_INTEREST`, and `INVALID_TRANSITION`.

- [ ] **Step 5: Re-run the focused test.**

  Run: `npm test -- src/lib/workflow/types.test.ts`  
  Expected: one passing test with no test errors.

### Task 2: Implement and test the replaceable workflow service

**Files:**

- Create: `src/lib/workflow/mock-repository.ts`
- Create: `src/lib/workflow/service.ts`
- Create: `src/lib/workflow/service.test.ts`

**Interfaces:**

- Consumes: all Task 1 domain types and `getProperty()` from `src/data/properties.ts`.
- Produces: `WorkflowService` methods `createInterest`, `getInterest`, `listTenantInterests`, `listOwnerInterests`, `acceptInterest`, `declineInterest`, `withdrawInterest`, `getConversation`, `listConversations`, `sendMessage`, `shareContact`, `listVisits`, `createVisit`, and `confirmVisit`.

- [ ] **Step 1: Write failing service tests using a fresh in-memory repository per test.**

  Cover these observable contracts with hand-written fixtures:

  ```ts
  test("creates one submitted interest for an available property", async () => {
    const result = await service.createInterest(tenant, {
      propertyId: "br-001",
      moveInDate: "2026-10-01",
      occupants: 2,
      occupationType: "Working Professional",
      leasePreference: "11 months",
      message: "Quiet household",
    });
    expect(result.status).toBe("SUBMITTED");
    expect(result.listerId).toBe("u-anita");
  });

  test("rejects a second active interest for the same tenant and property", async () => {
    await service.createInterest(tenant, input);
    await expect(service.createInterest(tenant, input)).rejects.toMatchObject({
      code: "DUPLICATE_INTEREST",
    });
  });

  test("accepting a submitted interest creates exactly one matched conversation", async () => {
    const interest = await service.createInterest(tenant, input);
    const accepted = await service.acceptInterest(owner, interest.id);
    expect(accepted.status).toBe("ACCEPTED");
    const conversation = await service.getConversation(tenant, accepted.id);
    expect(conversation.interestId).toBe(accepted.id);
  });

  test("does not create a duplicate conversation when an accepted interest is read again", async () => {
    const interest = await acceptedInterest(service);
    await service.getConversation(tenant, interest.id);
    await service.getConversation(owner, interest.id);
    expect(await service.countConversationsForInterest(interest.id)).toBe(1);
  });
  ```

  Add tests that a non-owner cannot accept, a tenant cannot read another tenant's interest, unavailable properties reject new interest, a declined interest cannot be accepted, contact consent is explicit, and confirming a visit adds a system message.

- [ ] **Step 2: Run the service test and confirm it fails because the service is absent.**

  Run: `npm test -- src/lib/workflow/service.test.ts`  
  Expected: failure resolving `./service`.

- [ ] **Step 3: Implement `createMockWorkflowRepository()` and `WorkflowService`.**

  Seed only the minimum demo actors and records in the repository, not React components: a tenant, the `u-anita` owner already represented by `br-001`, and optional example records for dashboard states. Every mutation must authorize the actor before changing its cloned records. `createInterest` checks property existence and `status === "available"`; it rejects active duplicate statuses `DRAFT`, `SUBMITTED`, and `ACCEPTED`. `acceptInterest` allows only the matching lister, changes `SUBMITTED` to `ACCEPTED`, creates a single conversation keyed by interest id, and records `interest_accepted` and `match_created` through the Task 7 boundary after it exists.

- [ ] **Step 4: Implement visits and contact consent as service-owned state.**

  `shareContact` must record `userId`, `conversationId`, and `sharedAt`; it must never return a phone number. `createVisit` must require a conversation participant and accepted interest. `confirmVisit` changes `REQUESTED` to `CONFIRMED` and appends the system message `Visit Confirmed ✓` with the selected date/time.

- [ ] **Step 5: Run all workflow service tests.**

  Run: `npm test -- src/lib/workflow/types.test.ts src/lib/workflow/service.test.ts`  
  Expected: all status, authorization, duplicate, match, consent, and visit tests pass.

### Task 3: Add typed query, analytics, and mock session boundaries

**Files:**

- Create: `src/lib/workflow/query.ts`
- Create: `src/lib/analytics.ts`
- Create: `src/lib/auth/session.tsx`
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/auth.tsx`

**Interfaces:**

- Consumes: Task 2 `WorkflowService` and Task 1 domain types.
- Produces: `workflowKeys`, query hooks, mutation hooks, `trackWorkflowEvent`, `SessionProvider`, `useSession`, and `requireRole`.

- [ ] **Step 1: Write a failing query-key test.**

  Assert literal keys such as `workflowKeys.tenantInterests("u-tenant-demo")` equals `["tenant-interests", "u-tenant-demo"]` and a conversation key includes its id. Name the break: a mutation could invalidate an unrelated route's state.

- [ ] **Step 2: Run it to confirm the query module does not exist, then implement the smallest query boundary.**

  Build hooks with `useQuery` and `useMutation`; invalidate only the relevant tenant/owner interest, interest, conversation, and visit keys in each mutation's `onSuccess`. Do not call `invalidateQueries()` without a key. Use the singleton mock service only inside this module.

- [ ] **Step 3: Implement a provider-free analytics boundary.**

  Export a union of the ten required events and `trackWorkflowEvent(event, payload)`. Its default implementation may safely log only in development; it must have no provider dependency and must be invoked at property view, interest start/submission, accept/decline, match, chat start, visit request/confirm, and contact share boundaries.

- [ ] **Step 4: Implement persisted mock session and redirect-safe sign-in.**

  `SessionProvider` reads/writes `bricxley.session.v1` in local storage after mount. `signIn(role)` creates a role-specific demo actor and `signOut()` clears it. In `/auth`, validate `redirect` begins with `/` and does not begin with `//`; on continuing, persist the selected role and navigate to redirect or its role dashboard. Keep the existing role-selection visual design and public browsing behavior.

- [ ] **Step 5: Wrap the root with `SessionProvider` without changing public nav rendering yet.**

  Place the provider around existing saved state, outlet, compare drawer, AI launcher, and toaster. Existing public routes must continue to use their current navigation and layout.

- [ ] **Step 6: Run focused tests and the production build.**

  Run: `npm test -- src/lib/workflow`  
  Run: `npm run build`  
  Expected: focused tests and build pass.

### Task 4: Replace direct property contact with the protected interest workflow

**Files:**

- Create: `src/components/workflow/PropertySummaryCard.tsx`
- Create: `src/components/workflow/InterestWizard.tsx`
- Create: `src/routes/property.$propertyId.interest.tsx`
- Modify: `src/routes/property.$propertyId.tsx`
- Modify: `src/components/property/PropertyCard.tsx`

**Interfaces:**

- Consumes: property data, `useSession`, and `useCreateInterestMutation`.
- Produces: a protected route at `/property/$propertyId/interest` and the submitted-interest redirect to `/tenant/interests/$interestId`.

- [ ] **Step 1: Write a failing pure form-validation test.**

  Extract `interestDraftSchema` beside the wizard and test that a blank move-in date, non-positive occupants, or missing occupation type fails, while `{ moveInDate: "2026-10-01", occupants: 2, occupationType: "Student", leasePreference: "", message: "" }` succeeds. Name the break: malformed interest can reach the service.

- [ ] **Step 2: Run it, observe the missing module failure, then implement the schema and wizard.**

  Use React Hook Form plus Zod. Render a compact `1 — 2 — 3` indicator and only these fields: move-in date, occupant count, occupation type, optional lease preference, optional message. Store an in-progress draft in session storage keyed by property id; clear it only after a successful submission. Use `Sending…` and disabled controls while the mutation is pending.

- [ ] **Step 3: Implement the route loader and access states.**

  Loader resolves the existing property; absent properties use a not-found state. The component redirects an unauthenticated visitor to `/auth?redirect=` plus the encoded current pathname, redirects a non-tenant to their correct dashboard, and shows `This home is currently unavailable.` plus a `View Similar Homes` link when property status is not available. The small sticky summary card includes only image, title, locality, and monthly rent.

- [ ] **Step 4: Add the existing property's single primary workflow action.**

  Remove `SecureChat` and `VisitScheduler` from the property sidebar. Add a dominant `I'm Interested` link (heart icon) that goes to `/property/$propertyId/interest`; retain Save and add a share button using `navigator.share` only when available, otherwise copy the current URL and show a toast. If the current tenant has an active interest for this property, replace the CTA with `Interest Sent` linked to that interest. Do not expose chat, visit scheduling, or any phone number on the detail page.

- [ ] **Step 5: Prefetch property details from property-card hover/focus without changing card layout.**

  Use TanStack Router preload on the existing detail route from `onMouseEnter` and `onFocus`; retain all existing card text and visual hierarchy.

- [ ] **Step 6: Run the form test and build.**

  Run: `npm test -- src/components/workflow/InterestWizard.test.ts`  
  Run: `npm run build`  
  Expected: validation test and generated route tree build pass.

### Task 5: Add tenant workflow navigation and interest pages

**Files:**

- Create: `src/components/layout/WorkflowNavbar.tsx`
- Create: `src/components/workflow/InterestCard.tsx`
- Create: `src/routes/tenant.interests.tsx`
- Create: `src/routes/tenant.interests.$interestId.tsx`
- Create: `src/routes/tenant.visits.tsx`
- Modify: `src/routes/__root.tsx`

**Interfaces:**

- Consumes: session, query hooks, `interestStatusGroups`, property data, and shared `InterestCard`.
- Produces: compact tenant app navigation and routes `/tenant/interests`, `/tenant/interests/$interestId`, `/tenant/visits`.

- [ ] **Step 1: Write a failing test for the interest tab selector.**

  Export a pure `selectInterestTab(interests, tab)` helper from the interest card module. With literal test interests `SUBMITTED`, `ACCEPTED`, and `DECLINED`, assert pending returns only the submitted id, matched only accepted, and closed only declined. Name the break: a tenant sees a closed request as active.

- [ ] **Step 2: Implement shared compact interest cards and the selector.**

  Card must show image, property name, rent, locality, status, and submitted time only. Do not include sensitive profile fields. Use the shared card for tenant and owner list contexts, with optional owner action slot.

- [ ] **Step 3: Implement the compact tenant navbar and root switch.**

  On authenticated tenant routes (`/tenant/*` and `/property/*/interest`), show desktop links `Find a Home`, `My Interests`, `Messages`, `Visits`, and avatar/profile; show mobile `Explore`, `Interests`, `Messages`, `Profile`. On all current public paths and unauthenticated paths, continue rendering the original `Navbar` unchanged. Render the owner navigation only for authenticated owner routes.

- [ ] **Step 4: Implement tenant interest success and list routes.**

  The detail/success route verifies ownership and displays `Interest Sent`, the owner-received message, `View My Interests`, and `View Similar Homes` when submitted. The list route verifies tenant role, has only `Pending`, `Matched`, and `Closed` tabs, and displays a compact empty state. Accepted items link to their conversation; closed items remain read-only.

- [ ] **Step 5: Implement the tenant visits list.**

  Verify tenant role and show compact visit records grouped by upcoming and past status, with property, selected date/time, and status. It must never display contact details.

- [ ] **Step 6: Run selector tests and build.**

  Run: `npm test -- src/components/workflow/InterestCard.test.ts`  
  Run: `npm run build`

### Task 6: Integrate owner interest review and mutual match actions

**Files:**

- Create: `src/routes/owner.interests.tsx`
- Create: `src/routes/owner.interests.$interestId.tsx`
- Create: `src/routes/owner.visits.tsx`
- Modify: `src/routes/dashboard.owner.tsx`

**Interfaces:**

- Consumes: owner session, owner interest query/mutations, and `InterestCard` action slot.
- Produces: `/owner/interests`, `/owner/interests/$interestId`, `/owner/visits` and deep links from the existing owner dashboard.

- [ ] **Step 1: Write a failing component-independent action policy test.**

  Export `ownerInterestActions(status)` and assert `SUBMITTED` yields `["accept", "ask", "decline"]`, `ACCEPTED` yields `["message"]`, and `DECLINED` yields `[]`. Name the break: owners can attempt a transition the service rejects.

- [ ] **Step 2: Implement owner interest routes using the shared card.**

  Use only `New`, `Accepted`, and `Closed` tabs. New cards show tenant display name, move-in date, occupants, occupation type, and optional message plus compact `Accept`, `Ask`, `Decline` actions. `Ask` routes to a non-active reply prompt or displays a harmless “Questions unlock after a match” explanation; it must not create a chat before acceptance. Accept and decline call targeted mutations with pending-state button labels.

- [ ] **Step 3: Link the existing owner dashboard to owner interests and visits.**

  Reuse the dashboard shell and existing visual system; replace only the static inquiry/visit actions with links to the new pages. Do not build a second dashboard system.

- [ ] **Step 4: Implement owner visits with service-level authorization.**

  Owner can see visits associated only with their listings. Render property, tenant first name/display name, time, and visit status. Unauthorized role attempts redirect to their own dashboard.

- [ ] **Step 5: Run the action-policy tests and build.**

  Run: `npm test -- src/routes/owner.interests.test.ts`  
  Run: `npm run build`

### Task 7: Add shared matched chat, contact consent, and in-chat visit scheduling

**Files:**

- Create: `src/components/workflow/ConversationView.tsx`
- Create: `src/components/workflow/VisitDialog.tsx`
- Create: `src/routes/tenant.messages.tsx`
- Create: `src/routes/tenant.messages.$conversationId.tsx`
- Create: `src/routes/owner.messages.tsx`
- Create: `src/routes/owner.messages.$conversationId.tsx`

**Interfaces:**

- Consumes: conversation and visit query/mutation hooks, active session, and existing Dialog/Sheet/Button/Input/Textarea primitives.
- Produces: a single `ConversationView` implementation shared by tenant and owner routes.

- [ ] **Step 1: Write failing view-model tests for the visit slot helper.**

  Export `visitOptions(now)` from `VisitDialog.tsx` or a colocated pure module. With `new Date("2026-09-18T10:00:00")`, assert it offers the next three calendar days and exact time choices `10:00 AM`, `12:30 PM`, `4:00 PM`, `5:30 PM`. Name the break: users can schedule a vague or invalid slot.

- [ ] **Step 2: Implement conversation list and the shared conversation page.**

  Both roles list only conversations they participate in. Page header shows thumbnail, `2BHK · Locality`, and `Matched ✓`. Composer has message input, `Schedule Visit`, `Share Contact`, and send. Use the existing Input, Button, Dialog, toast, and 150–250ms transitions. Unmatched/unauthorized interests must not render a conversation page.

- [ ] **Step 3: Implement explicit contact consent.**

  `Share Contact` opens an accessible Radix dialog titled `Share your phone number with this user?` with Cancel and Share actions. On confirmation call `shareContact`; show a successful consent state but do not display any number because the mock session holds no real number.

- [ ] **Step 4: Implement the visit dialog inside chat.**

  Use date chips and the four stated time chips, then `Confirm Visit`. Call `createVisit`, followed by `confirmVisit` for the prototype confirmation flow. On success invalidate only conversation and current user's visits, close the dialog, and render the service-created system message `Visit Confirmed ✓` with selected date/time.

- [ ] **Step 5: Run view-model/service tests and build.**

  Run: `npm test -- src/components/workflow/VisitDialog.test.ts src/lib/workflow/service.test.ts`  
  Run: `npm run build`

### Task 8: Complete route robustness, performance checks, and focused verification

**Files:**

- Modify: all new workflow routes as necessary
- Modify: `src/router.tsx` only if a targeted preload configuration is required
- Modify: `README.md` only to add workflow development/test commands if absent

**Interfaces:**

- Consumes: all preceding workflow routes and services.
- Produces: route-level loading/error/not-found/unauthorized states and final verification evidence.

- [ ] **Step 1: Add route-level pending, error, not-found, unavailable, and unauthorized states.**

  Every interest, message, and visit route must have non-blank pending UI, a recoverable error message, and a not-found state. Unauthorized routes redirect to the appropriate tenant/owner dashboard. A property that is missing or inactive must provide a `View Similar Homes` link to `/rent`.

- [ ] **Step 2: Audit route behavior and bundles.**

  Confirm new routes are file routes and dynamically split by the existing Vite/TanStack configuration. Do not import conversation or visit components from the home or property-detail route. Retain `loading="lazy"`, explicit image dimensions, and object-cover behavior for card images.

- [ ] **Step 3: Run domain tests, type/build verification, and lint evidence.**

  Run: `npm test`  
  Run: `npm run build`  
  Run: `npm run lint`

  Record the exact lint result. Any new lint error in changed workflow files must be fixed. The known baseline Prettier errors outside workflow scope are documented but should not be mass-reformatted.

- [ ] **Step 4: Run browser verification against the dev server.**

  Verify: public home/search/list-property remain available; direct refresh of an interest URL redirects unauthenticated users to login then back; back/forward works across wizard steps; duplicate interest turns the property CTA into `Interest Sent`; owner accept creates one chat; contact sharing requires confirmation; visit confirmation appears in chat; tenant and owner cannot open the other role's records; mobile navigation has no horizontal overflow.

- [ ] **Step 5: Document implementation evidence.**

  In the handoff, list files changed, routes added/modified, components and services added, data-model changes, performance decisions, known mock-adapter limitations, passing test counts, build result, and baseline/new lint result separately.

## Plan Self-Review

- **Coverage:** Tasks 1–2 implement explicit state models, availability, duplicates, access checks, matching, chat, visits, and contact consent. Tasks 3–4 implement auth, query ownership, analytics, route-based interest, property CTA, and draft preservation. Tasks 5–7 cover both user shells, lists, owner review, shared chat, and scheduling. Task 8 covers route errors, performance, browser navigation, accessibility-adjacent validation, and handoff.
- **Ruling:** The existing property route is `/property/$propertyId`, not `/rentals/$propertyId`; this plan extends it rather than breaking all public property links. Cost if wrong: an external consumer expecting the preferred route may need a future redirect alias.
- **Ruling:** There is no database, ORM, API, authentication provider, existing server function, or test runner. The plan adds Vitest and an in-memory repository/service seam rather than competing infrastructure. Cost if wrong: mock workflow data does not persist across a full browser reload until a server adapter is added.
- **Ruling:** Existing direct `SecureChat` and `VisitScheduler` on property details conflict with the required mutual-interest gate. They are removed from that page but their UI primitives are reused inside the matched workflow.
- **Placeholder scan:** No implementation task relies on an unspecified component, service method, status, test behavior, or route name.
