# Borrower Copilot

A self-assessment tool that helps Indian borrowers understand:

- Whether they should borrow at all
- How much a lender may likely sanction
- How much they can safely carry
- What interest rate is fair for their profile
- What EMI they should agree to
- How their affordability changes under a stress scenario

The app also generates a Negotiation Card that the borrower can use while discussing terms with a lender.

## Run locally

1. Open `index.html` in any modern browser (Chrome / Edge / Firefox).
2. No build step and no server required.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to Settings → Pages.
3. Select the `main` branch and `/ (root)` folder.
4. The site will be available at:

`https://<your-username>.github.io/borrower-copilot/`

## Live Demo: https://borrower-copilot-rho.vercel.app/

## Project Structure

- `index.html` – UI skeleton and application layout
- `style.css` – responsive mobile-first styling
- `app.js` – questions, rules, calculation engine and result rendering
- `RULES.md` – thresholds, rate bands and assumptions
- `RUNTHROUGHS.md` – Priya, Ravi and Anita test run-throughs
- `WALKTHROUGH.md` – five-minute product walkthrough and next steps

## How the app works

The borrower first answers a small set of must-have questions.

The app then asks only income-type-specific questions:

- Salaried → years in current job
- Self-employed → collateral availability
- Informal / gig → recent EMI bounce

The calculation engine then produces:

1. Borrow / Don't Borrow / Borrow Less verdict
2. Lender likely sanction amount
3. Safe amount the borrower can carry
4. Fair interest-rate band
5. APR including processing fee
6. Recommended EMI ceiling
7. 20% income-drop stress case
8. Confidence level
9. Negotiation Card

## How to test the 3 personas

### Priya – Salaried

- Income: ₹1,10,000/month
- Rent: ₹28,000
- Existing EMI: ₹14,000
- Credit score: 780
- Dependents: 1
- Years in current job: 5
- Desired loan: ₹8,00,000
- Purpose: Wedding

### Ravi – Self-employed

- Income: ₹78,000/month
- Rent: ₹0
- Existing EMI: ₹0
- Credit score: Unknown
- Dependents: 2
- Collateral: Yes
- Desired loan: ₹15,00,000
- Purpose: Business expansion

### Anita – Informal / Gig

- Income: ₹28,000/month
- Rent: ₹0
- Existing EMI: ₹3,500
- Credit score: Unknown
- Dependents: 2
- Recent EMI bounce: Yes
- Desired loan: ₹1,50,000
- Purpose: Vehicle

Detailed outputs and observations for all three personas are documented in `RUNTHROUGHS.md`.

## Design Principles

### Adaptive questions

The app avoids asking every borrower the same questions. Conditional questions are shown according to income type.

### Unknown is not zero

If the borrower does not know their credit score, the app does not treat it as zero. Instead, it uses an assumed baseline internally and widens the displayed rate range to reflect uncertainty.

### Lender amount vs safe amount

The app intentionally separates:

- What a lender may likely sanction
- What the borrower can safely carry

The recommended amount is the lower of the relevant affordability limits.

### Explainable rules

The calculation engine uses explicit rules and assumptions rather than a machine-learning credit model. All major thresholds and assumptions are documented in `RULES.md`.

### Stress testing

The app shows how the safe EMI changes if monthly income falls by 20%.

## Limitations

This is a self-assessment tool, not a lending decision or financial approval.

It does not:

- Pull a real credit bureau report
- Connect to a lender
- Store borrower data on a backend
- Guarantee loan approval
- Predict an actual lender's exact sanction amount

The rate bands, FOIR thresholds, living-cost assumptions and other rules are documented assumptions for this challenge.

## Deliverables

- Working web application
- `RULES.md`
- `RUNTHROUGHS.md`
- `WALKTHROUGH.md`

## License

This project was built as part of the Lokta Borrower Copilot Build Challenge.
