# Profile Send Off Board — Recon (Intake Group)

**Board ID:** `18406352652`
**Intake Group ID:** `group_mm1xf2jb`

## All Groups on Board

| Group | ID |
|---|---|
| 1. Intake | `group_mm1xf2jb` |
| Parachute Example | `group_mm1x1416` |
| Tests | `group_mm1wvq8p` |
| Stuck | `group_mm1xyczx` |
| Completed | `group_mm1y57sz` |

---

## Columns (Intake Group) — Full Schema

### Section: Top-Level / Triage

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **Name** | `name` | name | — |
| **Move to Onboarding** | `color_mm1zmeb3` | status | 0: Already Serving, 1: Advance to MN, 2: Send Back To Referral, 3: Need More Info. |
| **Primary Insurance** | `color_mm1xg10n` | status | 0: Fidelis Medicaid, 1: Fidelis Low-Cost, 2: Medicare A&B, 3: NYSHIP, 4: United Commercial, 6: United Medicare, 7: United Medicaid, 8: Aetna Commercial, 9: Aetna Medicare, 10: Wellcare, 11: Humana, 12: Cigna, 13: Medicaid, 14: Midlands Choice, 15: Horizon BCBS, 16: BCBS TN, 17: BCBS FL, 18: BCBS WY, 19: MagnaCare, 101: Oregon Care, 102: UMR, 103: Anthem BCBS Medicaid (JLJ), 104: Fidelis Commercial, 105: Anthem BCBS Commercial, 106: Anthem BCBS Medicare, 107: Stedi, 108: Anthem BCBS Low-Cost (JLJ), 109: United Low-Cost, 110: Fidelis Medicare |
| **General Insurance** | `color_mm24ap4j` | status | 0: Anthem BCBS, 1: Aetna, 2: Cigna, 3: Fidelis, 4: Medicare A&B, 6: Medicaid, 7: NYSHIP Empire, 8: UMR, 9: Wellcare, 10: United Healthcare, 11: Humana, 12: MagnaCare, 13: Midlands Choice, 14: Stedi, 15: Horizon BCBS |
| **Member ID 1** | `text_mm1x2qk2` | text | — |
| **Secondary Insurance** | `color_mm1zbrx0` | status | 0: NY Medicaid, 1: Done, 2: Stuck, 3: None |
| **Member ID 2** | `text_mm1xaccx` | text | — |
| **Stedi Plan Name** | `text_mm1xdcet` | text | — |
| **Insurance Plan** | `dropdown_mm1y2x75` | dropdown | (27 options — see raw data) |
| **Stedi Secondary / Medicaid ID** | `text_mm25bjz7` | text | — |
| **Run Stedi Eligibility** | `color_mm1yeksx` | status | 0: Failed, 1: Run |

### Section: Dates & Referral

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **Date of Intake** | `date_mm1wf43j` | date | — |
| **REFERRAL DETAILS -->** | `color_mm1wrrqz` | status | 0: REFERRAL DETAILS --> (section header) |
| **Referral Type** | `color_mm1wm4n4` | status | 0: Manufacturer, 1: Payor, 2: Patient, 3: Doctor, 7: Advocacy Group |
| **Referral Source** | `color_mm1w5wxr` | status | 0: Patient, 1: Tandem, 2: Beta Bionics, 3: CareCentrix, 4: Doctor, 7: Solace Advocates |

### Section: Product / Device

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **Pump Type** | `color_mm1wjjtk` | status | 0: iLet, 1: Mobi, 2: t:slim, 3: Not Serving, 4: Minimed 780G |
| **CGM Type** | `color_mm1w7pmf` | status | 0: FreeStyle Libre 14-Day, 1: Guardian 4, 2: Instinct, 3: FreeStyle Libre 3 Plus, 4: FreeStyle Libre 2 Plus, 6: Dexcom G7, 7: Dexcom G7 15-Day, 8: Dexcom G6, 9: Not Serving |
| **Request Type** | `color_mm1w1978` | status | 0: Insulin Pump, 1: Supplies Only, 2: CGM, 3: Insulin Pump + CGM, 4: Supplies + CGM |
| **CGM Cross-Sell** | `color_mm1yets8` | status | 0: Evaluate, 1: Cross-Sell, 2: Couldn't Cross-Sell, 4: Already Serving CGM |
| **Serving** | `color_mm1w1cm9` | status | 0: Insulin Pump, 1: Supplies Only, 2: CGM, 3: Insulin Pump + CGM, 4: Supplies + CGM |
| **EMAIL REFERRAL INFO -->** | `color_mm1yx6mq` | status | 0: EMAIL REFERRAL INFO --> (section header) |
| **OOW Date** | `date_mm1y43ak` | date | — |
| **Malfunction Reason** | `text_mm1yhgf7` | text | — |
| **Current Diabetes Therapy** | `dropdown_mm1ygncg` | dropdown | (options in board) |

### Section: Medical Necessity

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **MEDICAL NECESSITY DETAILS -->** | `color_mm1yd4v5` | status | 0: MEDICAL NECESSITY DETAILS --> (section header) |
| **Insulin Pump Coverage Path** | `color_mm1w5xn1` | status | 0: Not Serving, 1: IW New Insurance, 2: Omnipod Switch, 3: OOW Pump, 4: 1st Pump >6M Diagnosed, 6: 1st Pump <6M Diagnosed, 7: Supplies Only |
| **CGM Coverage Path** | `color_mm1w7e5q` | status | 0: Insulin, 1: Hypoglycemia, 2: Not Serving |
| **Clinical Files** | `file_mm1w5vwp` | file | — |

### Section: Demographics

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **DEMOGRAPHICS -->** | `color_mm1y4gyp` | status | 0: DEMOGRAPHICS--> (section header) |
| **DOB** | `text_mm1xvxst` | text | — |
| **Pt. Phone** | `phone_mm1x44yk` | phone | — |
| **Address** | `location_mm1xhw17` | location | — |
| **Email** | `text_mm1xc140` | text | — |
| **Gender** | `color_mm1x1bdg` | status | 0: Male, 1: Female, 4: Unknown |

### Section: Insurance Details

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **INSURANCE -->** | `color_mm1x3d9q` | status | 0: INSURANCE--> (section header) |
| **Active/Not-Active** | `color_mm1xycqc` | status | 0: Active, 1: Not Active |
| **Co-insurance %** | `numeric_mm1zzyph` | numbers | — |
| **Secondary Insurance** (text) | `text_mm1xyp9y` | text | — |
| **Deductible** | `numeric_mm1ztdz4` | numbers | — |
| **Deductible Remaining** | `numeric_mm1zv64b` | numbers | — |
| **OOP Max** | `numeric_mm1zfv02` | numbers | — |
| **OOP Max Remaining** | `numeric_mm1zxktp` | numbers | — |

### Section: Per-Product Insurance (CGM & Pump)

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **CGM & Pump Insurance** | `color_mm2bgjxp` | status | (same insurance list as Primary Insurance) |
| **CGM & Pump Member ID** | `text_mm2b5bf5` | text | — |
| **CGM & Pump Ins Active?** | `color_mm2bg0rs` | status | 0: Evaluate, 1: Active, 2: Not Active, 3: Not Serving |
| **Supplies Insurance** | `color_mm2b5e6a` | status | (same insurance list as Primary Insurance) |
| **Supplies Member ID** | `text_mm2bs9y4` | text | — |
| **Supplies Ins Active?** | `color_mm2bvmw7` | status | 0: Evaluate, 1: Active, 2: Not Active, 3: Not Serving |

### Section: Per-Product Auth / Network / HCPC

**Monitor:**

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| Monitor Auth Req? | `color_mm2bpw7z` | status | 0: Evaluate, 1: No, 2: Yes, 3: Not Serving |
| Monitor Network Status | `color_mm2bekxa` | status | 0: Evaluate, 1: INN, 2: OON, 3: Borrowed Network, 4: Not Serving |
| Monitor Co-insurance % | `numeric_mm2bffek` | numbers | — |
| Monitor HCPC | `color_mm2b1zgq` | status | 0: Evaluate, 1: Not Serving, 2: E2103 |

**Sensors:**

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| Sensors Auth Req? | `color_mm2bscj` | status | 0: Evaluate, 1: No, 2: Yes, 3: Not Serving |
| Sensors Network Status | `color_mm2brh0x` | status | 0: Evaluate, 1: INN, 2: OON, 3: Not Serving, 4: Borrowed Network |
| Sensors Co-insurance % | `numeric_mm2byn1k` | numbers | — |
| Sensors HCPC | `color_mm2b6t98` | status | 0: Evaluate, 1: Not Serving, 2: A4239 |

**Insulin Pump:**

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| Insulin Pump Auth Req? | `color_mm2bx2ys` | status | 0: Evaluate, 1: No, 2: Yes, 3: Not Serving |
| Insulin Pump Network Status | `color_mm2b91nc` | status | 0: Evaluate, 1: INN, 2: OON, 3: Not Serving, 4: Borrowed Network |
| Insulin Pump Co-insurance % | `numeric_mm2b4nzx` | numbers | — |
| Insulin Pump HCPC | `color_mm2bjwvx` | status | 0: Evaluate, 1: Not Serving, 2: E0784 |

**Infusion Set:**

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| Infusion Set Auth Req? | `color_mm2btvq0` | status | 0: Evaluate, 1: No, 2: Yes, 3: Not Serving |
| Infusion Set Network Status | `color_mm2b1ver` | status | 0: Evaluate, 1: INN, 2: OON, 3: Not Serving, 4: Borrowed Network |
| Infusion Set Co-insurance % | `numeric_mm2bksj8` | numbers | — |
| Infusion Set HCPC | `color_mm2bpvvy` | status | 0: Evaluate, 1: Not Serving, 2: A4230, 3: A4231, 4: A4224 |

**Cartridge:**

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| Cartridge Auth Req? | `color_mm2bd0q0` | status | 0: Evaluate, 1: No, 2: Yes, 3: Not Serving |
| Cartridge Network Status | `color_mm2bm7g8` | status | 0: Evaluate, 1: INN, 2: OON, 3: Not Serving, 4: Borrowed Network |
| Cartridge Co-insurance % | `numeric_mm2bhdrr` | numbers | — |
| Cartridge HCPC | `color_mm2bxxz2` | status | 0: Evaluate, 1: Not Serving, 2: A4232, 3: A4225 |

### Section: Doctor

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| **DOCTOR -->** | `color_mm1ycys3` | status | 1: DOCTOR --> (section header) |
| **Doctor Status** | `color_mm1ychz8` | status | 0: New, 1: Existing, 2: Failed Search |
| **Doctor Name** | `text_mm1x46et` | text | — |
| **Doctor Phone** | `phone_mm1xz8c0` | phone | — |
| **Doctor NPI** | `text_mm1x7d91` | text | — |
| **Clinicals Method** | `color_mm1xw7y5` | status | 0: Fax, 1: Parachute, 2: Email |
| **Doctor Email** | `email_mm1x6fq5` | email | — |
| **Doctor Fax (@rcfax)** | `email_mm1xdzcj` | email | — |
| **Clinic Name** | `dropdown_mm1xbvas` | dropdown | (84 clinic options) |
| **Clinic Address** | `location_mm1xjnfv` | location | — |

### Section: Stedi (Eligibility Data — all text, populated by automation)

| Column | ID | Type |
|---|---|---|
| STEDI --> | `color_mm1yf9k9` | status (section header) |
| Stedi Eligibility Active? | `text_mm1xpgy2` | text |
| Stedi Coverage Type | `text_mm25pxed` | text |
| Stedi Payer Name | `text_mm25wrxw` | text |
| Stedi Medicare Advantage? | `text_mm25j9aj` | text |
| Stedi Medicare Advantage Carrier | `text_mm25pyfx` | text |
| Stedi Medicare Advantage Member ID | `text_mm25j9j7` | text |
| Stedi QMB? | `text_mm25zsdd` | text |
| Stedi Medicare Jurisdiction | `text_mm298skc` | text |
| Stedi Medicaid MLTC | `text_mm29kccv` | text |
| Stedi Managed Medicaid | `text_mm2vyta1` | text |
| Stedi In Network? | `text_mm1xehx8` | text |
| Stedi Prior Auth Required? | `text_mm1xhymg` | text |
| Stedi Coinsurance % | `text_mm1xssyw` | text |
| Stedi Copay | `text_mm1xzqe0` | text |
| Stedi Individual Deductible | `text_mm1x46kd` | text |
| Stedi Individual Deductible Remaining | `text_mm1xyga2` | text |
| Stedi Family Deductible | `text_mm1x7hkk` | text |
| Stedi Family Deductible Remaining | `text_mm1xyzqx` | text |
| Stedi Individual OOP Max | `text_mm1xdtxq` | text |
| Stedi Individual OOP Max Remaining | `text_mm1x32jw` | text |
| Stedi Family OOP Max | `text_mm1xqmg9` | text |
| Stedi Family OOP Max Remaining | `text_mm1xkdgq` | text |
| Stedi Plan Begin Date | `text_mm1xsa9` | text |
| Stedi Eligibility Error Description | `text_mm1x9tje` | text |

### Section: Misc

| Column | ID | Type | Labels / Indices |
|---|---|---|---|
| Josh Error Log | `text_mm2nfwjs` | text | — |
| stuck reason | `text_mm2vf40t` | text | — |
| monday Doc v2 | `direct_doc_mm2trjyb` | direct_doc | — |
| Already In System | `color_mm2xe7r8` | status | 0: Yes, 1: No |
