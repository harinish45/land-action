# LandLens — Complete Feature Teardown (Reverse-Engineered Spec)

> Source: https://verified.realestate/landlens (crawled 14 Oct 2026)
> Purpose: build a **100% free, open-source equivalent** in LandAction.
> ⚠️ Rebuild *functionality*, not their assets: do not copy their brand name,
> logo, marketing copy, images, or code. Feature/behaviour parity is the goal.

---

## 1. Product Overview

**LandLens** (by Verified.RealEstate / A Gen Z Real Estate Private Limited,
RERA TN/Agent/0181/2024) is a Tamil Nadu–only land intelligence platform. It
reads the government's revenue, registration and planning registers plus the
Acts, rules, GOs and gazette notifications that govern land, and answers plot
questions **cited to source and date**. Headline: *"Every land question in
Tamil Nadu, answered from the registers."*

Positioning: **"Nine products. One ground truth."** — every product reads the
same registers so answers agree with each other.

Scale claims: 123 tools (41 free) · 33 map layers · 25 years of registered
sale prices · 450,000+ digitised archive records · 11,500+ Acts/rules/GOs/
gazettes · 33+ automated checks per report · 15,000+ daily users.

### Registers & data checked
1. Patta, chitta, A-register, town survey — ownership
2. Encumbrance certificates — registered transactions
3. Guideline values + 25 years of registered sale prices
4. Master plan land use + coastal/airport/heritage/water-body restrictions
5. Planning approvals, RERA registrations, court cases, CERSAI mortgage registry
6. Every check cites the governing Acts/rules/GOs/gazettes, to the page.

---

## 2. The Nine Products (+ Enterprise)

### 2.1 LandLens One (`/landlens/one`) — conversational AI "Veritas"
- Ask anything about TN land; answers from law **cited to the page**; "acts on
  the records" (runs tools, not just text).
- Voice: type or mic; **Tamil, English, Hindi**; reads answers aloud; Tamil
  land terms carried with meaning.
- Two surfaces: LandLens One (chat) and **One Map** (map + chat side panel).
- Retrieval: regulatory answers from authenticated documents (cited to page);
  record answers from live registers (patta/chitta, EC, survey/FMB, planning
  zones, guideline value, security-interest + court registries).
- Honesty rules: says "not in the register" instead of guessing; never a
  guarantee of title; not a lawyer substitute.
- Pricing: chat spends credits; a guideline-value read = 1 credit; free tools
  exist but One/One Map chat needs a credit balance; user approves all spend.
- TN only.

### 2.2 LandLens Minis (`/landlens/minis`) — 123 one-question tools
- One question → one answer from the registers, **date + source on every
  answer**.
- 41/123 free forever; paid minis show price in credits **before** running,
  need explicit approval, and **charge only when a record comes back**.
- Categories: Location and parcel · Ownership and records · Encumbrance ·
  Value and duty · Zones and restrictions · Planning and building · Legal and
  registers · Search and discovery · Documents and drafting · Customary ·
  Whole reports.
- Flow: pick question → give one input → read answer with what it adds.
- Login (phone + OTP) for most; pure calculators work signed-out.
- Full 123-slug catalog: see §7.

### 2.3 Verify My Land (`/landlens/verify-my-land`) — 33+ automated checks
- One report: patta, EC, 33+ checks, verdict; **PDF + read-only share link**.
- **Ten check groups behind every report**: EC & title trail · CERSAI mortgage
  · Court cases · Zoning & restrictions · Environment & risk · Pending dues &
  utilities · Document completeness · Temple & Waqf land · Building approvals ·
  Certified copy & comparison.
- Economics: 10 credits = 1 complete due diligence (≤100 pages, ≤3 survey
  numbers); extra pages 4 cr/50; extra surveys 2 cr each.
- Segments: property buyers, lawyers, banks/NBFCs, builders.
- Pitch: "33+ automated checks. Government data. AI-powered analysis.
  Results in minutes."

### 2.4 PriceMap (`/landlens/pricemap`) — registered price history
- 25 years (since 2001) of **actual registered deed prices**, plot by plot.
- **Price-by-plot map**: every survey in the deeds on the revenue map, shaded
  by rate of most recent sale; click → deeds behind it; land/flats toggle;
  full screen; subdivided plots show what they became; unplottable deeds
  listed with a reason, never guessed.
- Flats separate from land (built-up + UDS ≠ land rate) → **Flats/UDS tab**.
- Compares median deed rate vs guideline value with the difference.
- 4 credits/report; deeds behind it free; fetch failure ⇒ report failed and
  **credits auto-refunded**.
- Outputs: PDF of every deal, or share link without login (revocable).

### 2.5 Build Scope (`/landlens/build-scope`) — development potential
- FSI, setbacks, height limits, parking — "know what you can build".
- Adjacent minis: restriction bundle at a pin, airport funnel height (state
  NOC + AAI colour zoning), plot-cutting count, OSR fee, road width from
  cadastral map (2 cr).
- Segments: buyers, architects/planners, builders, banks/NBFCs.

### 2.6 Legal Opinion (`/landlens/legal-opinion`)
- AI legal due diligence → title verification + property risk assessment.
- Stats: ₹99 Cr+ saved · 10K+ properties verified · 100K+ hours saved ·
  trained on 50K+ documents.
- Same credit table as Verify My Land; human lawyer opinion sold separately.

### 2.7 Property Tracker (`/landlens/property-tracker`) — monitoring
- **Nightly** patta-owner & registration checks; **WhatsApp alert** on change.
- Watches: ownership changes, new registrations, EC updates.
- Economics: 10 cr (₹999) = 1 property/month · 100 cr = 16/month · 1000 cr =
  166/month · Starter ≈ ₹599/property/month.
- Segments: buyers (pre-close surprises), owners (fraud alerts), investors
  (portfolio), agents (client monitoring).

### 2.8 Deal Room (`/landlens/deal-room`) — transaction workspace
- Secure workspace: document sharing, **Aadhaar eSign**, milestone tracking,
  offer → registration.
- Mechanics: Deal Room creation free · Desk + 1 document = 11 cr · Aadhaar
  eSign 1 cr/signer · e-stamp purchase 1 cr per ₹7.5 of e-stamps · LandLens
  expert joins Desk for 100 cr · minimum purchase 10 cr (₹999), never expire.
- Tiers: Starter ₹999/10cr · Professional ₹8,999/100cr (multiple rooms,
  priority WhatsApp) · Business ₹84,999/1000cr (unlimited, account manager).

### 2.9 API and MCP (`/landlens/mcp`)
- Sign-in apps: **Claude, ChatGPT, Perplexity, Claude Code, Codex**. Link
  apps: **Cursor, Windsurf, OpenCode, Gemini CLI, GitHub Copilot, Zed**, any
  MCP client; otherwise dashboard **API key**. Scripts/Custom GPTs → plain
  HTTPS REST.
- Spend controls: every tool result returns an **approve-quote valid 30 min**;
  sign-in apps capped **500 credits/day**; keys have a configurable daily cap.
- Same wallet; register lookups 1–2 cr; **"a check that finds nothing is not
  charged"**; certificate pulls quoted first.
- Disconnect/Revoke from dashboard, effective next question.
- Privacy: the AI sees answers + balance only — never phone number, projects
  or documents.
- **11 Enterprise "Intelligence" tools** (market pulse, project/developer
  profiles, approvals pipeline, delivery, areas, registered sales & prices,
  site scan, launch watch, news…): free on Enterprise; otherwise they answer
  with the plan page and charge nothing.
- Fair use: bulk harvesting of owner names refused at source; offenders
  disconnected.

### 2.10 Enterprise (`/landlens/enterprise`)
- **Solo ₹24,999/mo (1 seat)** · **Team ₹49,999/mo (5 seats)** · **Team
  Annual ₹3,99,999/yr** (≈ ₹1,99,989 saved vs 12 monthly). GST included.
- Includes: 16 Intelligence tools incl. **Market Atlas**, every product (One
  Map, One, Minis, Verify My Land, PriceMap, Build Scope, Tracker, Deal Room,
  Chrome extension, API/MCP), seats with roles + per-product permissions, one
  shared credit balance, **Sales Watches + Ground Watches free** (Solo 3+3,
  Team 10+10).
- Credits NOT included (separate packs/plans, shared balance).
- Figures rebuilt from state records as read, dated; missing = "not held",
  never 0. TN only, all 38 districts. >5 seats by request; owner can stop.

---

## 3. Chrome Extension (Google Maps / Google Earth)

- Every TN plot shows its **survey boundary** over Google's map, with the
  survey number under the pointer.
- One click beside the map opens the plot's **survey record, owners and 13
  land checks**.
- 3-step flow: ① Add from Chrome Web Store + sign in → ② open Maps/Earth,
  boundaries appear → ③ click a plot to open its record panel.
- Free to install; paid checks show price first and use LandLens credits.

## 4. Pricing & Credit System (their model — we beat it with ₹0)

| Item | LandLens | LandAction |
|---|---|---|
| Minis | 41/123 free, rest 1–4 cr | **123/123 free** |
| Verify My Land | 10 cr per report | **free** |
| PriceMap report | 4 cr | **free** |
| Property Tracker | 10 cr/property/mo | **free** (demo) |
| Deal Room eSign | 1 cr/signer | **free** (demo) |
| Chat (Veritas) | credits + approve prompts | **free** |
| MCP/API | credits, 500 cr/day cap | **free, unlimited** |
| Starter pack | ₹999 / 10 cr | — |
| Professional | ₹8,999 / 100 cr (was ₹9,999) | — |
| Business | ₹84,999 / 1000 cr (was ₹99,999) | — |
| Enterprise | ₹24,999/mo Solo, ₹49,999/mo Team, ₹3,99,999/yr | — |
| Extra due-diligence pages | 4 cr / 50 pages, 2 cr / extra survey | free |

Rules to replicate *without* money: show the price before any paid action;
never charge for a null result; let the user approve every spend; credits
never expire; auto-refund on fetch failure. In LandAction these become
**"0 credits, always"** badges + a mock-approval UX for parity.

## 5. Homepage & UI Structure (landlens)

1. H1: "Every land question in Tamil Nadu, answered from the registers."
2. **What is LandLens** — platform explainer paragraph.
3. **Nine products. One ground truth.** — 9 product cards.
4. **One Map — 33 layers over one plot** — drop a pin, layer switcher, per-
   layer verdicts (water bodies → airport funnel).
5. **Chrome extension** — 3-step how-it-works.
6. **Minis — One question. One answer.**
7. **The ten checks behind every report** — 10 named check groups + stat
   band (123 tools/41 free, 33 layers, 25 yrs prices, 450k archives, 11.5k
   laws, 33+ checks).
8. **Who it is for** — buyers, lawyers, banks, builders, investors, families
   tracing old land, NRIs.
9. **Pricing** — Starter/Professional/Business + "What a credit buys".
10. Testimonials, then 9 FAQs, then final CTA
    "Know the land before you pay the advance."
- Global chrome: top nav (Home/Enterprise/Products/Company/Legal), search
  palette (⌘K, ↑↓/⏎/⌘⏎), phone-OTP login modal with country picker, WhatsApp
  support, footer with RERA/GSTIN/address, "Crafted in Chennai".

## 6. Auth, Support, Trust

- Login: **phone number + OTP** (WhatsApp OTP offered); no passwords.
- Docs: max 25 MB, PDF/JPG/PNG/TIFF.
- Support: hello@verified.realestate · +91 9996 12 9996 · Mon–Sat 9–18 IST ·
  24 h response.
- Security: TLS 1.2+, Cloudflare, account deletion ≤30 days, GDPR-style
  rights + IT Act 2000 compliance.
- Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.

---

## 7. The Complete 123 Minis Catalog (slug :: name)

**Location and parcel**
guideline-value :: Guideline value · zone-check :: Zone check · water-story ::
Waterways · planning-authority :: Planning authority · sro-finder ::
Sub-registrar office · radius-discovery :: Every parcel within 1 km ·
guideline-value-survey :: Guideline value by survey number · parcel-at-pin ::
Which survey number is this pin? · digipin :: DIGIPIN of a spot · pincode ::
Pincode and post office of a spot · elevation :: Height and slope of a plot ·
soil-type :: Soil under a plot · geo-insights :: Terrain and land-science
profile

**Ownership and records**
land-record :: Land record · land-record-by-patta :: Land record by patta
number · fmb :: FMB sketch · village-map :: FMB village map with survey
numbers · subdivision-list :: Subdivisions · land-quality :: Land class and tax
· patta-analyzer :: Patta analyzer · plot-owner :: Owner of a survey ·
owner-at-point :: Who owns the land at this pin · neighbours :: Who owns the
plots next door · adangal :: Crop and cultivation record · certificate-verify
:: Verify a patta or TSLR certificate · survey-history :: Survey number history
(UDR and town survey) · old-survey-to-new :: Old survey number to new ·
new-survey-to-old :: New survey number to old · village-xray :: X-ray of a
village · revenue-directory :: District/taluk/village directory · sro-directory
:: SRO directory

**Encumbrance**
ec :: Encumbrance certificate · ec-availability :: EC availability by village ·
ec-analyzer :: EC analyzer · certified-copy :: Certified copy of a deed ·
cersai-check :: Mortgages on CERSAI · document-records :: Every record from a
deed

**Value and duty**
stamp-duty :: Stamp duty · capital-gains :: Capital gains · unit-converter ::
Unit converter · price-converter :: Land rate converter · building-value ::
Building value calculator · composite-value :: Composite value for flats ·
locality-value :: Where a street sits in its locality · vacant-land-tax ::
Vacant land tax · tax-bill-lookup :: Chennai tax bill lookup · chennai-utility
:: Chennai tax/water/power at a pin · utility-dues :: Property tax and water
dues

**Zones and restrictions**
crz-check :: CRZ coastal zone check · water-body-check :: Water body and lake
check · flood-zone-check :: Flood zone check · ramsar-site-check :: Ramsar and
Pallikaranai marsh · reserve-forest-check :: Reserve forest check ·
eco-sensitive-zone-check :: Eco-sensitive zone check · asi-monument-check :: ASI
monument zone · haca-check :: HACA hill area · ht-line-check :: High tension
line distance · railway-line-check :: Railway line distance · quarry-check ::
Quarry distance · airport-zone-check :: Airport height zone · airport-height ::
Max building height near airport · airport-noc-issued :: Airport height
clearances granted · road-widening-check :: Road widening check ·
land-acquisition-check :: Is my land under acquisition · slum-area-check ::
Mapped slum area · slum-areas-by-ward :: Slum areas by ward · aquifer-zone-check
:: Aquifer recharge area · redhills-catchment-check :: Redhills catchment ·
forest-claim :: Is this survey on the forest list · waqf-land :: Is this survey
waqf land · temple-land :: Temple land · temple-lands-by-name :: Lands of a
temple by name · waqf-lands-by-name :: Lands of a waqf institution ·
bhoodan-land :: Is this survey Bhoodan land · industrial-park-check ::
Industrial park · industrial-parks :: Industrial parks and vacant plots

**Planning and building**
fsi-calculator :: FSI calculator · building-rule-calc :: Building rule
calculators · plot-layout :: How many plots can land be cut into · osr-fee ::
OSR fee · road-width :: Road width at a plot · plot-area :: Plot area from its
sides · first-sale-uds :: First sale flat UDS · airport-height (above) ·
planning-map :: Find the master plan sheet · cmda-land-use-check :: CMDA land
use zone · master-plan-zone-check :: Master plan zone · cba-check :: Continuous
Building Area check · approval-search :: Approvals on a survey ·
approvals-at-location :: Approvals at a location · approvals-by-street-or-name
:: Approvals by street/name · layout-lookup :: Approved layouts near a plot ·
street-profile :: Street width in Coimbatore/Salem · compare-plots :: Compare
2–4 plots

**Legal and registers**
court-cases-by-name :: Court cases in a name · revenue-court :: Revenue court
cases · civil-court :: Case by CNR number · rera-project :: RERA registered
project · rera-check :: RERA agents/orders/regularisations · seller-check ::
Seller background check · promoter-dossier :: Builder background · name-match ::
Are these the same person? · glossary :: What a land term means · statutory-form
:: Find a form/rule/checklist · iGr classification :: How the registration dept
classes a survey (igr-classification) · live-tracker :: Where a live topic
stands

**Search and discovery**
owner-search :: Every plot in a name · ancestral-search :: Trace an ancestor's
land · area-discovery :: Every parcel in a village · tnahr-search :: Search the
historical archives (450k records) · commercial-lookup :: Commercial
connection lookup · radius-discovery (above) · ground-watch :: Ground Watch ·
sales-watch :: Sales Watch

**Documents and drafting**
deed-drafter :: Draft a deed or agreement · document-translation :: Tamil ⇄
English translation · rent-receipts :: Rent receipts and invoices

**Customary**
manaiyadi :: Manaiyadi Sastram verdict · plot-vastu :: Vastu score of a plot ·
home-vastu :: Vastu score of a house · muhurtham-dates :: Muhurtham dates ·
property-panchangam :: Property panchangam for a day

**Whole reports**
land-record/EC/zone combos as one-question reports (see §2.2), plus
document-records (above).

---

## 8. Gap Analysis → LandAction Build Roadmap

| # | LandLens capability | LandAction status | Gap / next action |
|---|---|---|---|
| 1 | LandLens One (Veritas chat, cited) | ✅ `/api/v1/chat` keyword bot | ➕ Retrieval over statute corpus w/ citations |
| 2 | One Map 33 GIS layers | ✅ One Map (33 layers, 4 basemaps) | maintain |
| 3 | 123 Minis, one-question UI | ✅ catalog + runner (`/api/v1/tools/:id`) | ➕ align slugs with §7, price-before-run UX |
| 4 | Verify My Land 33+ checks | ✅ `/api/v1/verify` (33 checks, index) | ➕ PDF export + share link |
| 5 | PriceMap plot map + deeds | ⚠️ guideline history chart only | ➕ per-plot deed choropleth |
| 6 | Build Scope FSI engine | ✅ TNCDBR Rule 35/36 calc | ➕ airport funnel + OSR minis |
| 7 | Legal Opinion report | ⚠️ template-based page | ➕ structured opinion generator |
| 8 | Property Tracker nightly alerts | ⚠️ demo UI | ➕ cron diff + webhook/WhatsApp |
| 9 | Deal Room w/ eSign + milestones | ⚠️ demo UI | ➕ documents + milestone state machine |
| 10 | API + MCP with spend approval | ✅ MCP HTTP+SSE+stdio, OpenAPI | ➕ (parity: none needed — we're free) |
| 11 | Chrome extension (Maps boundaries) | ✅ Manifest V3 HUD | ➕ boundary polygon overlay parity |
| 12 | Enterprise (Atlas, seats, roles) | ❌ | ➕ later; open data first |
| 13 | Phone-OTP auth + dashboard | ❌ (no auth, fully open) | decide: keep open or add optional login |
| 14 | 450k archive + 11.5k law corpus | ⚠️ sample registers JSON | ➕ bulk public-record import pipeline |
| 15 | TN-only depth | ✅ TN-first + 28-state portals | maintain advantage |

**Positioning:** LandLens charges ₹999–₹3,99,999 for what LandAction ships
free. Every paid rule above (price-before-run, null-free, approval flow,
auto-refund) is replicated as a **0-credit equivalent** so users recognise the
workflow without ever paying.





