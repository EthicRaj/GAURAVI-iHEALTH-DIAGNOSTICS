/* ===========================
   Symptoms filters for quick tags
   =========================== */

(function() {
  // Symptom -> test-tag names mapping (data-test-name se match hoga)
  const SYMPTOM_MAP = {
    all: [
      'Pregnancy Test',
      'Full Body Checkups',
      'Covid 19 Test',
      'Heart Test',
      'Kidney Test',
      'Liver Test',
      'CBC Test',
      'Cholesterol Test',
      'HbA1c Test',
      'Hepatitis B Test',
      'Kidney Function Test',
      'Liver Function Test',
      'Sugar Test',
      'Thyroid Test',
      'Typhoid Test',
      'Uric Acid Test',
      'Vitamin B12 Test',
      'Vitamin D Test',
      'Allergy Test',
      'Arthritis Test',
      'Cancer Test',
      'Bone And Joint',
      'Dengue Test',
      'Diabetes Test',
      'Rheumatoid Test',
      'Tuberculosis Test',
      'Infertility Test',
      'Diabetes Care',
      'Anemia Test',
      'GastroIntestinal',
      'Autoimmune Disorders',
      'Fever Test'
    ],

    fever: [
      'Fever Test',
      'Dengue Test',
      'Typhoid Test',
      'Covid 19 Test'
    ],

    diabetes: [
      'Sugar Test',
      'Diabetes Test',
      'HbA1c Test',
      'Diabetes Care'
    ],

    thyroid: [
      'Thyroid Test'
    ],

    heart: [
      'Heart Test',
      'Cholesterol Test',
      'Lipid Profile',       // agar baad me add karo to chalega
    ],

    pregnancy: [
      'Pregnancy Test',
      'Infertility Test'
    ],

    full: [
      'Full Body Checkups',
      'CBC Test',
      'Liver Function Test',
      'Kidney Function Test'
    ]
  };

  // DOM elements
  const symptomButtons = document.querySelectorAll('.symptom-btn');
  const testTags = document.querySelectorAll('.test-tag');

  if (!symptomButtons.length || !testTags.length) {
    // Agar kuch nahi mila to silently return (page pe feature nahi hai)
    return;
  }

  function applySymptomFilter(key) {
    const list = SYMPTOM_MAP[key] || SYMPTOM_MAP.all;

    // Buttons ka active / aria-pressed state
    symptomButtons.forEach(btn => {
      const isActive = btn.dataset.symptom === key;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    // Har test-tag check karo
    testTags.forEach(tag => {
      const name = (tag.dataset.testName || tag.textContent || '').trim();
      const match = list.includes(name);

      // sab clear karo
      tag.classList.remove('dimmed', 'highlight');

      if (key === 'all') {
        // show all – koi dimming nahi
        return;
      }

      if (match) {
        // matching tests ko thoda highlight
        tag.classList.add('highlight');
      } else {
        // baaki ko dim karo
        tag.classList.add('dimmed');
      }
    });
  }

  // Button click listeners
  symptomButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.symptom || 'all';
      applySymptomFilter(key);
    });
  });

  // Page load pe default: "Show all" active
  document.addEventListener('DOMContentLoaded', () => {
    applySymptomFilter('all');
  });
})();

