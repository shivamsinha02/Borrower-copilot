// ============================================================
//  CONFIG – change any rule here and the app adapts instantly
// ============================================================
const CONFIG = {
  // FOIR (Fixed Obligation to Income Ratio) by income type
  FOIR: {
    salaried: 0.50,
    selfEmployed: 0.40,
    informal: 0.30,
  },
  // Safe buffer: borrower should not use more than 60% of surplus
  SAFE_SURPLUS_RATIO: 0.60,
  // Monthly living cost (dependents adjust this)
  BASE_LIVING_COST: 15000,
  EXTRA_PER_DEPENDENT: 5000,
  // Interest rate bands (min / max)
  RATES: {
    salaried: { min: 10.5, max: 12.5 },
    selfEmployedSecured: { min: 8.5, max: 10.5 },   // if collateral
    selfEmployedUnsecured: { min: 14, max: 18 },
    informal: { min: 24, max: 32 },
  },
  // Processing fees (for APR)
  PROCESSING_FEE: {
    salaried: 2.0,
    selfEmployedSecured: 1.0,
    selfEmployedUnsecured: 2.5,
    informal: 3.0,
  },
  // Tenure in years (used for loan amount PV)
  TENURE: {
    salaried: 5,
    selfEmployedSecured: 15,
    selfEmployedUnsecured: 5,
    informal: 3,
  },
  // Default credit score if "I don't know"
  DEFAULT_SCORE: {
    salaried: 680,
    selfEmployed: 600,
    informal: 500,
  },
};

// ============================================================
//  QUESTION DEFINITIONS
// ============================================================
const MUST_QUESTIONS = [
  { id: 'name', label: 'Your name', type: 'text', placeholder: 'e.g. Priya' },
  { id: 'monthlyIncome', label: 'Net monthly income (₹)', type: 'number', placeholder: 'e.g. 110000' },
  {
    id: 'incomeType',
    label: 'Income type',
    type: 'select',
    options: [
      { value: 'salaried', text: 'Salaried employee' },
      { value: 'selfEmployed', text: 'Self-employed / business' },
      { value: 'informal', text: 'Informal / gig / daily wage' },
    ],
  },
  { id: 'rent', label: 'Monthly rent / home loan EMI (₹)', type: 'number', placeholder: '0 if none' },
  { id: 'existingEMI', label: 'Total existing monthly EMIs (₹)', type: 'number', placeholder: '0 if none' },
  {
    id: 'loanPurpose',
    label: 'Loan purpose',
    type: 'select',
    options: [
      { value: 'wedding', text: 'Wedding' },
      { value: 'business', text: 'Business expansion' },
      { value: 'vehicle', text: 'Vehicle' },
      { value: 'home', text: 'Home renovation / purchase' },
      { value: 'other', text: 'Other' },
    ],
  },
  { id: 'desiredAmount', label: 'How much do you want? (₹)', type: 'number', placeholder: 'e.g. 800000' },
  { id: 'creditScore', label: 'Your CIBIL / credit score (optional)', type: 'number', placeholder: 'e.g. 780' },
  { id: 'dependents', label: 'Number of dependents (including spouse/children)', type: 'number', placeholder: 'e.g. 1' },
];

// Conditional questions (shown based on incomeType)
const CONDITIONAL_QUESTIONS = {
  salaried: [
    { id: 'jobYears', label: 'Years in current job', type: 'number', placeholder: 'e.g. 3' },
  ],
  selfEmployed: [
    {
      id: 'hasCollateral',
      label: 'Do you own unencumbered property / collateral?',
      type: 'select',
      options: [
        { value: 'yes', text: 'Yes' },
        { value: 'no', text: 'No' },
      ],
    },
  ],
  informal: [
    {
      id: 'hasBounced',
      label: 'Have you bounced any EMI in the last 6 months?',
      type: 'select',
      options: [
        { value: 'yes', text: 'Yes' },
        { value: 'no', text: 'No' },
      ],
    },
  ],
};

// ============================================================
//  CORE CALCULATION ENGINE
// ============================================================
function calculate(answers) {
  const {
    monthlyIncome,
    incomeType,
    rent = 0,
    existingEMI = 0,
    desiredAmount = 0,
    creditScore,
    dependents = 0,
    hasCollateral,
    hasBounced,
    jobYears,
  } = answers;

  const numIncome = Number(monthlyIncome) || 0;
  const numRent = Number(rent) || 0;
  const numExisting = Number(existingEMI) || 0;
  const numDependents = Number(dependents) || 0;

  // ---------- 1. Living cost ----------
  const livingCost = CONFIG.BASE_LIVING_COST + numDependents * CONFIG.EXTRA_PER_DEPENDENT;

  // ---------- 2. Surplus & safe EMI ----------
  const surplus = numIncome - numRent - numExisting - livingCost;
  const safeEMI = Math.max(0, surplus * CONFIG.SAFE_SURPLUS_RATIO);

  // ---------- 3. FOIR-based lender EMI ----------
  const foir = CONFIG.FOIR[incomeType] || 0.40;
  const lenderEMI = Math.max(0, numIncome * foir - numExisting);

  // ---------- 4. Interest rate & tenure ----------
  let rateMin, rateMax, procFee, tenure;
  const isSecured = (incomeType === 'selfEmployed' && hasCollateral === 'yes');

  if (incomeType === 'salaried') {
    const r = CONFIG.RATES.salaried;
    rateMin = r.min;
    rateMax = r.max;
    procFee = CONFIG.PROCESSING_FEE.salaried;
    tenure = CONFIG.TENURE.salaried;
    // slight rate improvement if >3 years in job
    if (Number(jobYears) >= 3) {
      rateMin = Math.max(rateMin - 0.5, 8);
      rateMax = Math.max(rateMax - 0.5, 10);
    }
  } else if (incomeType === 'selfEmployed') {
    if (isSecured) {
      const r = CONFIG.RATES.selfEmployedSecured;
      rateMin = r.min;
      rateMax = r.max;
      procFee = CONFIG.PROCESSING_FEE.selfEmployedSecured;
      tenure = CONFIG.TENURE.selfEmployedSecured;
    } else {
      const r = CONFIG.RATES.selfEmployedUnsecured;
      rateMin = r.min;
      rateMax = r.max;
      procFee = CONFIG.PROCESSING_FEE.selfEmployedUnsecured;
      tenure = CONFIG.TENURE.selfEmployedUnsecured;
    }
  } else { // informal
    const r = CONFIG.RATES.informal;
    rateMin = r.min;
    rateMax = r.max;
    procFee = CONFIG.PROCESSING_FEE.informal;
    tenure = CONFIG.TENURE.informal;
  }

  // ---------- 5. Credit score adjustment (widen band if unknown) ----------
  let actualScore = Number(creditScore);
  const isUnknown = !creditScore || creditScore === '';
  if (isUnknown) {
    actualScore = CONFIG.DEFAULT_SCORE[incomeType] || 600;
    // widen band by ±2% when unknown
    rateMin = Math.max(rateMin - 1.5, 6);
    rateMax = Math.min(rateMax + 1.5, 36);
  } else if (actualScore >= 750) {
    // narrow to the lower half
    rateMax = (rateMin + rateMax) / 2;
  } else if (actualScore < 650) {
    rateMin = (rateMin + rateMax) / 2;
  }

  // ---------- Confidence ----------
let confidence = 'High';

if (isUnknown) {
  confidence = 'Low';
} else if (
  incomeType === 'selfEmployed' ||
  incomeType === 'informal'
) {
  confidence = 'Medium';
}

  // ---------- 6. Loan amounts (PV of annuity) ----------
  const monthlyRate = (rateMin / 100) / 12; // using the lower rate for conservative amount
  const nMonths = tenure * 12;

  const lenderLoan = (monthlyRate === 0)
    ? lenderEMI * nMonths
    : lenderEMI * (1 - Math.pow(1 + monthlyRate, -nMonths)) / monthlyRate;

  const safeLoan = (monthlyRate === 0)
    ? safeEMI * nMonths
    : safeEMI * (1 - Math.pow(1 + monthlyRate, -nMonths)) / monthlyRate;

  // ---------- 7. Verdict ----------
  let verdict = 'Borrow';
  let reason = 'Your surplus comfortably covers the proposed EMI.';
  const emiForDesired = (monthlyRate === 0)
    ? desiredAmount / nMonths
    : desiredAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -nMonths));

  if (hasBounced === 'yes') {
    verdict = 'DON\'T BORROW / Borrow less';
    reason = 'You have a recent bounce – lenders will view you as high risk. Focus on clearing existing loans first.';
  } else if (numExisting / numIncome > 0.60 && numIncome > 0) {
    verdict = 'DON\'T BORROW / Borrow less';
    reason = 'Your existing EMIs already take >60% of your income. Taking more will push you into a debt trap.';
  } else if (safeEMI < 2000 && desiredAmount > 0) {
    verdict = 'Borrow less';
    reason = 'Your monthly surplus is very tight. We suggest reducing the loan amount or extending tenure.';
  } else if (emiForDesired > safeEMI && desiredAmount > 0) {
    verdict = 'Borrow less';
    reason = `The EMI for your desired amount (₹${Math.round(emiForDesired)}) exceeds your safe ceiling of ₹${Math.round(safeEMI)}.`;
  }

  // ---------- 8. Stress case ----------
  // Stress scenario: income drops by 20%
  const stressIncome = numIncome * 0.80;
  const stressSurplus =
    stressIncome - numRent - numExisting - livingCost;

  const stressSafeEMI = Math.max(
    0,
    stressSurplus * CONFIG.SAFE_SURPLUS_RATIO
  );

  // ---------- 8. APR ----------
  const aprMin = rateMin + procFee;
  const aprMax = rateMax + procFee;

  // ---------- 9. Advised amount = min(lender, safe) ----------
  const advisedAmount = Math.min(lenderLoan, safeLoan, desiredAmount || Infinity);

   return {
  verdict,
  reason,
  confidence,
  lenderSanction: Math.round(lenderLoan),
  safeCarry: Math.round(safeLoan),
  advisedAmount: Math.round(advisedAmount),

  rateBand: `${rateMin.toFixed(1)}% – ${rateMax.toFixed(1)}%`,
  aprBand: `${aprMin.toFixed(1)}% – ${aprMax.toFixed(1)}%`,

  emiCeiling: Math.round(Math.min(lenderEMI, safeEMI)),

  // Stress case: income drops by 20%
  stressIncome: Math.round(stressIncome),
  stressSafeEMI: Math.round(stressSafeEMI),

  tenure,
  monthlyIncome: numIncome,
  existingEMI: numExisting,
  surplus: Math.round(surplus),
  emiForDesired: Math.round(emiForDesired),
};
}

// ============================================================
//  UI RENDER LOGIC
// ============================================================
function buildMustForm() {
  const form = document.getElementById('must-form');
  form.innerHTML = '';
  MUST_QUESTIONS.forEach(q => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = q.id;
    label.textContent = q.label;
    wrapper.appendChild(label);

    let input;
    if (q.type === 'select') {
      input = document.createElement('select');
      input.id = q.id;
      input.required = true;
      q.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.text;
        input.appendChild(o);
      });
    } else {
      input = document.createElement('input');
      input.type = q.type;
      input.id = q.id;
      input.placeholder = q.placeholder || '';
      if (q.type === 'number') input.step = 'any';
    }
    input.name = q.id;
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  // Add a "I don't know my credit score" checkbox
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  const checkDiv = document.createElement('div');
  checkDiv.className = 'check-group';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id = 'scoreUnknown';
  const lbl = document.createElement('label');
  lbl.htmlFor = 'scoreUnknown';
  lbl.textContent = 'I don\'t know my score';
  checkDiv.appendChild(cb);
  checkDiv.appendChild(lbl);
  wrapper.appendChild(checkDiv);
  form.appendChild(wrapper);

  // Next button
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = 'Continue →';
  btn.onclick = handleMustSubmit;
  form.appendChild(btn);
}

function handleMustSubmit() {
  const form = document.getElementById('must-form');
  const data = new FormData(form);
  const answers = {};
  for (let [key, val] of data.entries()) {
    answers[key] = val;
  }
  // Handle checkbox
  const unknown = document.getElementById('scoreUnknown').checked;
  if (unknown) {
    answers.creditScore = ''; // will be treated as unknown
  }

  // Basic validation
  if (!answers.monthlyIncome || Number(answers.monthlyIncome) <= 0) {
    alert('Please enter your monthly income.');
    return;
  }

  // Store in global state
  window.answers = answers;

  // Show conditional step
  document.getElementById('step-must').style.display = 'none';
  document.getElementById('step-conditional').style.display = 'block';
  buildConditionalForm(answers.incomeType);
}

function buildConditionalForm(incomeType) {
  const container = document.getElementById('conditional-form');
  container.innerHTML = '';
  const questions = CONDITIONAL_QUESTIONS[incomeType] || [];

  questions.forEach(q => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    const label = document.createElement('label');
    label.htmlFor = q.id;
    label.textContent = q.label;
    wrapper.appendChild(label);

    let input;
    if (q.type === 'select') {
      input = document.createElement('select');
      input.id = q.id;
      q.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.text;
        input.appendChild(o);
      });
    } else {
      input = document.createElement('input');
      input.type = q.type;
      input.id = q.id;
      input.placeholder = q.placeholder || '';
    }
    input.name = q.id;
    wrapper.appendChild(input);
    container.appendChild(wrapper);
  });

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = 'See my Copilot verdict';
  btn.onclick = handleConditionalSubmit;
  container.appendChild(btn);
}

function handleConditionalSubmit() {
  const form = document.getElementById('conditional-form');
  const data = new FormData(form);
  for (let [key, val] of data.entries()) {
    window.answers[key] = val;
  }

  // Run calculation
  const result = calculate(window.answers);
  window.result = result;

  // Show results
  document.getElementById('step-conditional').style.display = 'none';
  document.getElementById('step-results').style.display = 'block';
  renderResults(result);
}

function renderResults(r) {
  const container = document.getElementById('results-container');
  container.innerHTML = '';

  // Verdict
  const vBlock = document.createElement('div');
  vBlock.className = 'result-block';
  const vClass = r.verdict.includes('DON\'T') ? 'red' : (r.verdict.includes('less') ? 'amber' : 'green');
  vBlock.innerHTML = `
    <h3>Verdict</h3>
    <div class="verdict-big ${vClass}">${r.verdict}</div>
    <div class="note">${r.reason}</div>
  `;
  container.appendChild(vBlock);


    // Confidence
  const cBlock = document.createElement('div');
  cBlock.className = 'result-block';

  cBlock.innerHTML = `
    <h3>Confidence</h3>
    <div class="number">${r.confidence}</div>
    <div class="note">
      ${
        r.confidence === 'High'
          ? 'Most important inputs are known, so the estimate is relatively reliable.'
          : r.confidence === 'Medium'
          ? 'Some uncertainty remains because income type or financial history can vary.'
          : 'Your credit score is unknown, so the rate range is intentionally wider.'
      }
    </div>
  `;

  container.appendChild(cBlock);
  
  // O2: Max amount
  const aBlock = document.createElement('div');
  aBlock.className = 'result-block';
  aBlock.innerHTML = `
    <h3>Maximum amount</h3>
    <div><span class="number">₹${r.lenderSanction.toLocaleString()}</span> <em>lender will likely sanction</em></div>
    <div><span class="number">₹${r.safeCarry.toLocaleString()}</span> <em>you can safely carry</em></div>
    <div class="note"><strong>Use:</strong> ₹${r.advisedAmount.toLocaleString()} (the lower of the two)</div>
  `;
  container.appendChild(aBlock);

  // O3: Fair rate
  const rBlock = document.createElement('div');
  rBlock.className = 'result-block';
  rBlock.innerHTML = `
    <h3>Fair interest rate</h3>
    <div><span class="number">${r.rateBand}</span> (interest rate)</div>
    <div><span class="number">${r.aprBand}</span> (APR incl. processing fee)</div>
    <div class="note">Compare any lender quote to this band.</div>
  `;
  container.appendChild(rBlock);

  // O4: EMI + Stress Case
const eBlock = document.createElement('div');
eBlock.className = 'result-block';

eBlock.innerHTML = `
  <h3>EMI ceiling</h3>

  <div>
    <span class="number">₹${r.emiCeiling.toLocaleString()}</span>
    per month
  </div>

  <div class="note">
    Tenure: ${r.tenure} years.
    Your desired loan would cost ~₹${r.emiForDesired.toLocaleString()}/month.
  </div>

  <div class="note">
    <strong>Stress test:</strong>
    If your income drops 20% to
    ₹${r.stressIncome.toLocaleString()},
    your safe EMI falls to about
    ₹${r.stressSafeEMI.toLocaleString()}/month.
  </div>
`;

container.appendChild(eBlock);

  // Negotiation Card
  const card = document.getElementById('card-container');
  let cardReason = '';
  if (r.verdict.includes('DON\'T')) {
    cardReason = 'This lender quote is risky. Your existing debt or bounce history makes you ineligible for fair terms.';
  } else {
    cardReason = `Your profile (${window.answers.incomeType}, surplus ₹${r.surplus.toLocaleString()}) supports a rate of ${r.rateBand}. If a lender quotes above ${r.aprBand}, ask them why.`;
  }
  card.innerHTML = `
    <h3>🧾 Negotiation Card</h3>
    <div class="quote">“Fair for my profile is ${r.rateBand} (APR ${r.aprBand}).”</div>
    <div class="reason">${cardReason}</div>
    <div style="margin-top:0.5rem;font-size:0.9rem;color:#6b5a63;">
      <strong>Monthly income:</strong> ₹${r.monthlyIncome.toLocaleString()} · 
      <strong>Existing EMI:</strong> ₹${r.existingEMI.toLocaleString()}
    </div>
  `;
}

// Reset
document.getElementById('reset-btn').addEventListener('click', () => {
  window.answers = {};
  document.getElementById('step-results').style.display = 'none';
  document.getElementById('step-must').style.display = 'block';
  document.getElementById('step-conditional').style.display = 'none';
  buildMustForm();
});

// ============================================================
//  INIT
// ============================================================
buildMustForm();