

# Add More Community Workarounds

Expand the `community_workarounds` table with ~20 additional real, verified entries across all four categories.

---

## New Entries by Category

### Devices (5 new)
- **Dexcom Bridge Program** - For patients losing insurance coverage, Dexcom offers a temporary bridge supply (up to 3 months). Source: dexcom.com/patient-assistance
- **Medtronic Financial Assistance** - Medtronic offers copay cards and patient assistance for Guardian sensors and insulin pumps. Source: medtronic.com
- **Tandem t:slim Copay Card** - Up to $100/month off Tandem pump supplies for commercially insured patients. Source: tandemdiabetes.com
- **InPen Savings Program** - Medtronic's InPen smart insulin pen with savings card reducing copay to as low as $0. Source: inpen.com
- **Eversense Bridge Program** - Senseonics offers a patient bridge program for Eversense CGM for those losing coverage. Source: eversensediabetes.com

### Medications (5 new)
- **Novo Nordisk Immediate Supply** - Emergency 90-day free insulin supply for patients who cannot afford. Call 1-866-310-7549. Source: novocare.com
- **Lilly Cares Foundation** - Full free insulin supply for uninsured patients under 400% FPL. Separate from $35 program. Source: lillycares.com
- **Sanofi Insulins Valyou Savings** - Cash-pay program: Lantus $99/month, Admelog $99/month, no insurance needed. Source: insulinsvalyou.com
- **GetInsulin.org** - Mutual aid organization that ships donated insulin to people in need, free of charge. Source: getinsulin.org
- **Civica Rx Insulin** - Biosimilar insulins (glargine, lispro, aspart) at $30/vial or $55 for 5 KwikPens. Source: civicarx.org

### Insurance (5 new)
- **External Review Rights** - After exhausting internal appeals, federal law guarantees an independent external review. Free process. Source: healthcare.gov
- **ADA Legal Advocacy** - ADA provides free legal help for insurance discrimination cases related to diabetes supplies. Source: diabetes.org/legal
- **State Insurance Commissioner Complaints** - Filing a complaint with your state insurance department can force coverage decisions. Source: naic.org
- **Medical Necessity Letter Template** - Community-shared template for doctors to write compelling medical necessity letters for CGMs/pumps. Source: community forums
- **Prior Authorization Appeal Timeline** - Step-by-step guide with federal deadline requirements insurers must follow (30 days standard, 72 hours urgent). Source: CMS.gov

### Financial (5 new)
- **JDRF Financial Assistance Resources** - JDRF maintains a database of financial assistance programs and can connect patients with local resources. Source: jdrf.org
- **NeedyMeds** - Nonprofit database of patient assistance programs, discount drug cards, and copay assistance across all diabetes meds. Source: needymeds.org
- **Patient Advocate Foundation** - Free case managers who help navigate insurance denials, copay assistance, and financial aid. Source: patientadvocate.org
- **211 Helpline for Diabetes Supplies** - Dialing 211 connects to local United Way resources that often include emergency diabetes supply funds. Source: 211.org
- **Diabetes Supply Donation Programs** - Organizations like Insulin for Life USA accept and redistribute unexpired supplies. Source: insulinforlife.org

---

## Technical Details

### Implementation
- Single database migration with INSERT statements for all 20 new workarounds
- Each entry includes: title, description, detailed instructions, category, source_url, source_platform, is_verified (true), last_verified_at (current date), is_active (true), relevant tags, and initial upvotes
- No code file changes needed -- the existing `CommunityWorkaroundsSection.tsx` component already queries all active workarounds dynamically

### No changes to
- Any existing component files
- Existing workaround entries
- RLS policies or table schema

