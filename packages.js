/**
 * Health Packages JavaScript
 * Handles package card interactions, add to cart, and details dialog
 */

document.addEventListener('DOMContentLoaded', function() {
    initPackageCards();
    initPackageDetailsDialog();
});

// Package Data
const healthPackages = {
    // Wellness Packages
    'wellness-basic': {
        id: 'wellness-basic',
        name: 'WELLNESS BASIC',
        subtitle: 'Essential Health Checkup',
        tests: 39,
        mrp: 1200,
        discount: 50,
        finalPrice: 599,
        testsList: [
            'Complete Blood Count (CBC)',
            'Kidney Profile (7 parameters)',
            'GFR (Glomerular Filtration Rate)',
            'Electrolytes (Sodium, Potassium, Chloride)',
            'Liver Function Test (12 parameters)',
            'Thyroid Profile (T3, T4, TSH)',
            'Lipid Profile (9 parameters)',
            'Iron Profile (3 parameters)',
            'C-Reactive Protein (CRP)'
        ],
        note: 'Recommended for annual routine checkup',
        category: 'wellness'
    },
    'wellness-advance': {
        id: 'wellness-advance',
        name: 'WELLNESS ADVANCE',
        subtitle: 'Comprehensive Health Screening',
        tests: 65,
        mrp: 2000,
        discount: 55,
        finalPrice: 899,
        testsList: [
            'Complete Blood Count (CBC)',
            'Kidney Profile (7 parameters)',
            'GFR (Glomerular Filtration Rate)',
            'Electrolytes (Sodium, Potassium, Chloride)',
            'Liver Function Test (12 parameters)',
            'Thyroid Profile (T3, T4, TSH)',
            'Lipid Profile (9 parameters)',
            'Iron Profile (3 parameters)',
            'C-Reactive Protein (CRP)',
            'HbA1c (Diabetes Monitoring)',
            'Vitamin D (25-OH)',
            'Vitamin B12',
            'Blood Sugar Fasting',
            'Urine Routine & Microscopy'
        ],
        popular: true,
        category: 'wellness'
    },
    'wellness-premium': {
        id: 'wellness-premium',
        name: 'WELLNESS PREMIUM',
        subtitle: 'Complete Executive Health Checkup',
        tests: 90,
        mrp: 3000,
        discount: 60,
        finalPrice: 1199,
        testsList: [
            'Complete Blood Count (CBC)',
            'Kidney Profile (7 parameters)',
            'GFR (Glomerular Filtration Rate)',
            'Electrolytes (Sodium, Potassium, Chloride)',
            'Liver Function Test (12 parameters)',
            'Thyroid Profile (T3, T4, TSH)',
            'Lipid Profile (9 parameters)',
            'Iron Profile (3 parameters)',
            'C-Reactive Protein (CRP)',
            'HbA1c (Diabetes Monitoring)',
            'Vitamin D (25-OH)',
            'Vitamin B12',
            'Blood Sugar Fasting',
            'Urine Routine & Microscopy',
            'Testosterone Total',
            'hs-CRP',
            'Amylase',
            'Lipase',
            'Detailed Iron Studies',
            'Extended Liver Panel'
        ],
        premium: true,
        category: 'wellness'
    },
    // Fitness Packages
    'hy-fitness-1': {
        id: 'hy-fitness-1',
        name: 'HY FITNESS 1',
        subtitle: 'General Fitness Screening',
        tests: 45,
        mrp: 1500,
        discount: 40,
        finalPrice: 899,
        testsList: [
            'Complete Blood Count',
            'Blood Sugar Fasting',
            'Lipid Profile',
            'Liver Function Test',
            'Kidney Function Test',
            'Thyroid Profile',
            'Urine Routine',
            'ECG'
        ],
        category: 'fitness'
    },
    'hy-fitness-2': {
        id: 'hy-fitness-2',
        name: 'HY FITNESS 2',
        subtitle: 'Cardiac & Metabolic Health',
        tests: 65,
        mrp: 2000,
        discount: 50,
        finalPrice: 999,
        testsList: [
            'Complete Blood Count',
            'Blood Sugar Fasting',
            'HbA1c',
            'Lipid Profile',
            'Liver Function Test',
            'Kidney Function Test',
            'Thyroid Profile',
            'ECG',
            'CRP'
        ],
        category: 'fitness'
    },
    'hy-fitness-3': {
        id: 'hy-fitness-3',
        name: 'HY FITNESS 3',
        subtitle: 'Advanced Preventive Screening',
        tests: 90,
        mrp: 3000,
        discount: 60,
        finalPrice: 1199,
        testsList: [
            'Complete Blood Count',
            'Blood Sugar Fasting',
            'HbA1c',
            'Lipid Profile',
            'Liver Function Test',
            'Kidney Function Test',
            'Thyroid Profile',
            'Vitamin D',
            'Vitamin B12',
            'CRP',
            'ECG'
        ],
        category: 'fitness'
    },
    'hy-fitness-pro': {
        id: 'hy-fitness-pro',
        name: 'HY FITNESS PRO',
        subtitle: 'Hormonal + Vitamin + Thyroid + Cardiac',
        tests: 100,
        mrp: 3500,
        discount: 55,
        finalPrice: 1575,
        testsList: [
            'Complete Blood Count',
            'Blood Sugar Fasting',
            'HbA1c',
            'Lipid Profile',
            'Liver Function Test',
            'Kidney Function Test',
            'Thyroid Profile (T3, T4, TSH)',
            'Vitamin D (25-OH)',
            'Vitamin B12',
            'CRP',
            'ECG',
            'Testosterone'
        ],
        category: 'fitness'
    },
    'hy-fitness-elite': {
        id: 'hy-fitness-elite',
        name: 'HY FITNESS ELITE',
        subtitle: 'Full Body + Diabetes + Liver + Kidney + Vitamin + CRP',
        tests: 110,
        mrp: 4500,
        discount: 60,
        finalPrice: 1799,
        testsList: [
            'Complete Blood Count',
            'Blood Sugar Fasting',
            'Post Prandial Sugar',
            'HbA1c',
            'Lipid Profile',
            'Liver Function Test (Extended)',
            'Kidney Function Test',
            'Thyroid Profile (T3, T4, TSH)',
            'Vitamin D (25-OH)',
            'Vitamin B12',
            'CRP',
            'hs-CRP',
            'ECG'
        ],
        category: 'fitness'
    },
    'hy-fitness-ultimate': {
        id: 'hy-fitness-ultimate',
        name: 'HY FITNESS ULTIMATE',
        subtitle: 'Complete Executive Health Checkup Panel',
        tests: 125,
        mrp: 6000,
        discount: 65,
        finalPrice: 2099,
        gold: true,
        testsList: [
            'Complete Blood Count',
            'Blood Sugar Fasting',
            'Post Prandial Sugar',
            'HbA1c',
            'Lipid Profile (Extended)',
            'Liver Function Test (Complete)',
            'Kidney Function Test',
            'Thyroid Profile (T3, T4, TSH)',
            'Vitamin D (25-OH)',
            'Vitamin B12',
            'CRP',
            'hs-CRP',
            'ECG',
            'Testosterone',
            'Electrolytes'
        ],
        category: 'fitness'
    }
};

// Initialize Package Cards
function initPackageCards() {
    const packageCards = document.querySelectorAll('.package-card');
    
    packageCards.forEach(card => {
        const addBtn = card.querySelector('.book-now-btn');
        const detailsLink = card.querySelector('.view-details-link');
        const packageId = card.dataset.packageId;
        
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                addPackageToCart(packageId);
            });
        }
        
        if (detailsLink) {
            detailsLink.addEventListener('click', function(e) {
                e.preventDefault();
                openPackageDetails(packageId);
            });
        }
    });
}

// Add Package to Cart
function addPackageToCart(packageId) {
    const pkg = healthPackages[packageId];
    if (!pkg) return;
    
    // Create package item for cart
    const cartItem = {
        id: pkg.id,
        name: pkg.name,
        price: pkg.finalPrice,
        type: 'package',
        tests: pkg.tests
    };
    
    // Try to add to existing cart system
    if (typeof window.addToCart === 'function') {
        window.addToCart(cartItem);
    } else if (typeof window.addTestToCart === 'function') {
        window.addTestToCart(cartItem);
    } else {
        // Fallback: dispatch custom event
        const event = new CustomEvent('packageAdded', { detail: cartItem });
        document.dispatchEvent(event);
    }
    
    // Show success feedback
    showAddToCartFeedback(packageId);
}

// Show feedback when package is added
function showAddToCartFeedback(packageId) {
    const card = document.querySelector(`[data-package-id="${packageId}"]`);
    if (!card) return;
    
    const btn = card.querySelector('.book-now-btn');
    if (!btn) return;
    
    const originalText = btn.textContent;
    btn.textContent = '✓ Added to Cart';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Package Details Dialog
function initPackageDetailsDialog() {
    // Create dialog element if it doesn't exist
    let dialog = document.getElementById('packageDetailsDialog');
    
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'packageDetailsDialog';
        dialog.className = 'package-details-dialog';
        dialog.setAttribute('aria-labelledby', 'packageDetailsTitle');
        dialog.setAttribute('aria-modal', 'true');
        document.body.appendChild(dialog);
        
        // Close button handler
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.close();
            }
        });
        
        // Close on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dialog.open) {
                dialog.close();
            }
        });
    }
}

// Open Package Details
function openPackageDetails(packageId) {
    const pkg = healthPackages[packageId];
    if (!pkg) return;
    
    const dialog = document.getElementById('packageDetailsDialog');
    if (!dialog) return;
    
    const savings = pkg.mrp - pkg.finalPrice;
    
    // Build tests list HTML
    const testsListHTML = pkg.testsList.map(test => 
        `<li>${test}</li>`
    ).join('');
    
    // Build dialog content
    dialog.innerHTML = `
        <div class="dialog-inner">
            <div class="package-details-header">
                <div>
                    <h3 id="packageDetailsTitle" class="package-details-title">${pkg.name}</h3>
                    <p class="muted small">${pkg.subtitle}</p>
                    <span class="test-count-badge" style="position: static; margin-top: 0.5rem; width: auto; height: auto; border-radius: 8px; padding: 0.4rem 0.8rem;">
                        <span class="count">${pkg.tests}</span> <span class="label">Tests</span>
                    </span>
                </div>
                <div class="package-details-price">
                    <div class="package-details-original">₹${pkg.mrp}</div>
                    <div class="package-details-final">₹${pkg.finalPrice}</div>
                </div>
            </div>
            
            <div class="package-details-tests">
                <h4>Tests Included (${pkg.testsList.length} Tests)</h4>
                <ul class="all-tests-list">
                    ${testsListHTML}
                </ul>
            </div>
            
            ${pkg.note ? `<p class="package-note" style="margin-bottom: 1.5rem;">${pkg.note}</p>` : ''}
            
            <div class="package-details-savings">
                You Save: ₹${savings} (${pkg.discount}% OFF)
            </div>
            
            <div class="package-details-actions">
                <button type="button" class="btn" onclick="addPackageToCart('${pkg.id}'); document.getElementById('packageDetailsDialog').close();">
                    Book Now - ₹${pkg.finalPrice}
                </button>
                <button type="button" class="ghost" onclick="document.getElementById('packageDetailsDialog').close()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    dialog.showModal();
}

// Make function globally available
window.addPackageToCart = addPackageToCart;
window.openPackageDetails = openPackageDetails;

