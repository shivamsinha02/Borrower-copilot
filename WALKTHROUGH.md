# Borrower Copilot – Five-Minute Walkthrough

## 1. Product idea

Borrower Copilot is a self-assessment tool for Indian borrowers.

The goal is to help a borrower understand four things before speaking to a lender:

1. Should I borrow at all?
2. How much can I safely borrow?
3. What is a fair interest rate?
4. What EMI should I agree to?

The app also provides a Negotiation Card that the borrower can use when comparing a lender's quote.

---

## 2. User flow

The app uses a two-step question flow.

### Step 1 – Must questions

The borrower provides:

- Name
- Net monthly income
- Income type
- Rent / home loan EMI
- Existing EMIs
- Loan purpose
- Desired loan amount
- Credit score if known
- Number of dependents

### Step 2 – Adaptive questions

Only relevant questions are shown based on income type.

**Salaried**
- Years in current job

**Self-employed**
- Collateral availability

**Informal / gig**
- Recent EMI bounce

This keeps the experience short and avoids asking irrelevant questions.

---

## 3. Calculation engine

The calculation engine is rule-based and all major rules are stored in the `CONFIG` object in `app.js`.

The main calculations are:

### Living cost

Base living cost plus an additional amount for every dependent.

### Safe EMI

The app calculates monthly surplus after rent, existing EMIs and estimated living costs.

Only 60% of this surplus is considered safe EMI capacity.

### Lender EMI capacity

The lender-side estimate uses a FOIR threshold based on income type.

- Salaried: 50%
- Self-employed: 40%
- Informal: 30%

### Loan amount

The lender and safe loan amounts are calculated using the EMI affordability and the applicable interest rate and tenure.

The recommended amount is the lower of:

- Lender likely sanction
- Safe carry amount
- Desired loan amount

---

## 4. Rate and APR

The app produces a rate range rather than a single number.

The rate depends on:

- Income type
- Collateral for self-employed borrowers
- Credit score
- Employment stability for salaried borrowers

Processing fees are added to the displayed rate range to provide an APR-style comparison.

If the borrower does not know their credit score, the rate band is widened to reflect uncertainty.

---

## 5. Stress test

The app includes a simple stress scenario.

It assumes monthly income falls by 20%.

It then recalculates the safe EMI using the reduced income.

This helps the borrower understand whether the proposed EMI remains manageable if their income weakens.

---

## 6. Confidence

The app shows a confidence level based on the information available.

- High: known credit score and relatively stable salaried profile
- Medium: some uncertainty remains
- Low: credit score is unknown

Unknown information is not silently treated as zero.

---

## 7. Verdict logic

The app can return:

### Borrow

The proposed borrowing fits within the calculated affordability.

### Borrow less

The requested amount produces an EMI above the safe ceiling.

### Don't borrow / Borrow less

This is triggered when there is a recent EMI bounce or existing EMIs already consume more than 60% of income.

The purpose of this rule is to avoid encouraging borrowers into a debt trap.

---

## 8. Negotiation Card

The final screen generates a one-page style Negotiation Card.

It contains:

- Fair interest rate
- APR
- Reason supporting the rate
- Monthly income
- Existing EMI

The borrower can use this information to compare a lender's quote against the Copilot's calculated range.

---

## 9. Three persona walkthrough

### Priya

Salaried borrower with a strong credit score and stable employment.

Expected behavior:

- Salaried FOIR is used
- Employment history improves the rate band
- High confidence is shown
- Safe affordability is compared against lender sanction
- Stress EMI is displayed

### Ravi

Self-employed business owner with collateral but no known credit score.

Expected behavior:

- Self-employed FOIR is used
- Collateral routes him to the secured rate band
- Longer secured tenure is used
- Rate range is widened because the credit score is unknown
- Confidence is lower because of missing credit information

### Anita

Informal/gig worker with existing debt and a recent EMI bounce.

Expected behavior:

- Informal FOIR is used
- Informal rate band is applied
- Unknown credit score widens the rate range
- Recent bounce triggers the Don't Borrow / Borrow Less verdict
- Stress EMI is shown

---

## 10. What I would build next

If this were developed beyond the challenge, I would add:

- More loan products such as home loans, gold loans and two-wheeler loans
- More detailed income-stability questions
- Existing-loan details and repayment history
- Better APR calculation using actual cash flows and fees
- Offer comparison between multiple lenders
- Export / shareable Negotiation Card
- Accessibility improvements
- Automated tests for the calculation engine
- More detailed stress scenarios such as both income reduction and interest-rate increase

---

## 11. What I would cut

I would avoid adding:

- A login system
- A backend database for personal data
- A machine-learning credit score
- Real bureau integration for this initial version

The core product value is explainable self-assessment, so these additions would increase complexity without being necessary for the first version.

---

## 12. Key product principle

The most important distinction in Borrower Copilot is:

> What a lender may give you is not necessarily what you should borrow.

The product therefore shows both numbers separately and recommends using the safer amount.