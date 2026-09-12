# Borrower Copilot – Three Run-throughs

These are the three required persona run-throughs from the Lokta Build Challenge.

---

## 1. Priya – Salaried

### Profile

- Name: Priya
- Income type: Salaried employee
- Monthly income: ₹1,10,000
- Rent: ₹28,000
- Existing EMI: ₹14,000
- Credit score: 780
- Dependents: 1
- Years in current job: 5
- Loan purpose: Wedding
- Desired amount: ₹8,00,000

### Questions shown

**Must questions**
1. Your name
2. Net monthly income
3. Income type
4. Monthly rent / home loan EMI
5. Total existing monthly EMIs
6. Loan purpose
7. Desired loan amount
8. Credit score
9. Number of dependents

**Conditional question**
- Years in current job

### Expected outputs

- Verdict: Borrow / Borrow less depending on calculated safe EMI
- Lender sanction: Based on 50% FOIR
- Safe carry amount: Based on surplus and 60% safe-surplus utilisation
- Fair rate: Salaried rate band adjusted for 780 credit score and 5 years in current job
- APR: Interest rate band + processing fee
- EMI ceiling: Lower of lender EMI capacity and safe EMI
- Stress case: Safe EMI after a 20% income drop
- Confidence: High

### Negotiation Card

The card shows the fair interest-rate band and APR that Priya can compare against a lender's quote.

---

## 2. Ravi – Self-employed

### Profile

- Name: Ravi
- Income type: Self-employed / business
- Monthly income: ₹78,000
- Rent: ₹0
- Existing EMI: ₹0
- Credit score: Unknown
- Dependents: 2
- Collateral: Yes
- Loan purpose: Business expansion
- Desired amount: ₹15,00,000

### Questions shown

**Must questions**
1. Your name
2. Net monthly income
3. Income type
4. Monthly rent / home loan EMI
5. Total existing monthly EMIs
6. Loan purpose
7. Desired loan amount
8. Credit score
9. Number of dependents

**Conditional question**
- Do you own unencumbered property / collateral?

### Expected outputs

- Product route: Secured self-employed loan because collateral is available
- Lender sanction: Based on 40% FOIR
- Safe carry amount: Based on surplus and 60% safe-surplus utilisation
- Fair rate: Secured self-employed rate band
- APR: Interest rate band + secured processing fee
- EMI ceiling: Lower of lender EMI capacity and safe EMI
- Stress case: Safe EMI after a 20% income drop
- Confidence: Low because the credit score is unknown

### Negotiation Card

The card tells Ravi that the secured profile supports the lower secured rate band and that the lender's quote should be compared against the displayed APR.

---

## 3. Anita – Informal / Gig

### Profile

- Name: Anita
- Income type: Informal / gig / daily wage
- Monthly income: ₹28,000
- Rent: ₹0
- Existing EMI: ₹3,500
- Credit score: Unknown
- Dependents: 2
- Recent EMI bounce: Yes
- Loan purpose: Vehicle
- Desired amount: ₹1,50,000

### Questions shown

**Must questions**
1. Your name
2. Net monthly income
3. Income type
4. Monthly rent / home loan EMI
5. Total existing monthly EMIs
6. Loan purpose
7. Desired loan amount
8. Credit score
9. Number of dependents

**Conditional question**
- Have you bounced any EMI in the last 6 months?

### Expected outputs

- Verdict: DON'T BORROW / Borrow less
- Reason: Recent EMI bounce indicates elevated repayment risk
- Lender sanction: Based on 30% FOIR
- Safe carry amount: Based on surplus and 60% safe-surplus utilisation
- Fair rate: Informal / gig rate band
- APR: Interest rate band + processing fee
- EMI ceiling: Lower of lender EMI capacity and safe EMI
- Stress case: Safe EMI after a 20% income drop
- Confidence: Low because the credit score is unknown

### Negotiation Card

The card warns that borrowing is risky because of the recent bounce and existing debt. The borrower should focus on clearing existing debt before taking additional borrowing.

---

## Notes

The calculations are deterministic and are driven by the rules in `app.js`.

The app does not pull bureau data, store personal data, or use a machine-learning credit model.

Unknown credit scores are treated as unknown and widen the rate band rather than being treated as a zero score.

The three personas are used as product test cases to verify adaptive questions, affordability logic, rate bands, APR, EMI limits and the Don't Borrow path.