// NT Medians Table
const ntMedians = {
    10: [0.95, 0.97, 0.99, 1.01, 1.03, 1.05, 1.07],
    11: [1.10, 1.13, 1.15, 1.18, 1.20, 1.23, 1.26],
    12: [1.30, 1.36, 1.42, 1.48, 1.54, 1.60, 1.66],
    13: [1.73, 1.80, 1.88, 1.95, 2.03, 2.10, 2.18]
};

// Beta-hCG Medians
const betaHcgMedians = {
    10: [176.95, 172.70, 168.55, 164.50, 160.55, 156.70, 152.93],
    11: [149.26, 145.68, 142.18, 138.76, 135.43, 132.18, 129.01],
    12: [125.91, 122.88, 119.93, 117.05, 114.24, 111.50, 108.82],
    13: [106.21, 103.66, 101.17, 98.74, 96.37, 94.05, 91.80]
};

// PAPP-A Medians
const pappaMedians = {
    10: [777.13, 749.46, 727.25, 710.06, 697.57, 689.55, 685.84],
    11: [686.37, 691.15, 700.28, 713.92, 732.33, 755.86, 784.99],
    12: [820.28, 862.46, 912.43, 971.27, 1040.31, 1121.15, 1215.75],
    13: [1326.49, 1456.29, 1608.68, 1788.02, 1999.66, 2250.19, 2547.79]
};

// Base risks by maternal age
const ageBasedRisks = {
    t21: {
        '<25': 1/1350,
        '25-29': 1/900,
        '30-34': 1/350,
        '35-39': 1/100,
        '≥40': 1/25
    },
    t18: {
        '<25': 1/5000,
        '25-29': 1/4000,
        '30-34': 1/2500,
        '35-39': 1/1000,
        '≥40': 1/500
    },
    t13: {
        '<25': 1/16000,
        '25-29': 1/12000,
        '30-34': 1/7000,
        '35-39': 1/2500,
        '≥40': 1/1000
    }
};

// DOM Elements
const calculateBtn = document.getElementById('calculateBtn');
const reportSection = document.getElementById('reportSection');
const pdfBtn = document.getElementById('pdfBtn');
const newPatientBtn = document.getElementById('newPatientBtn');
const calculateGA = document.getElementById('calculateGA');
const forceGA = document.getElementById('forceGA');
const calculatedGA = document.getElementById('calculatedGA');
const finalGA = document.getElementById('finalGA');
const dobInput = document.getElementById('dob');
const calculatedAge = document.getElementById('calculatedAge');
const collectionDateInput = document.getElementById('collectionDate');
const ultrasoundDateInput = document.getElementById('ultrasoundDate');
const reportDateInput = document.getElementById('reportDate');

// Event Listeners
calculateBtn.addEventListener('click', calculateRisk);
pdfBtn.addEventListener('click', generatePDF);
newPatientBtn.addEventListener('click', resetForm);
calculateGA.addEventListener('click', calculateGAFromCRL);

// Date calculations
dobInput.addEventListener('change', calculateAgeFromDOB);
collectionDateInput.addEventListener('change', calculateFinalGA);
ultrasoundDateInput.addEventListener('change', calculateFinalGA);

// Initialize with current date
document.getElementById('reportDate').valueAsDate = new Date();

// Set sample data for demo
setSampleData();

// Calculate gestational age from CRL using Robinson method
function calculateGAFromCRL() {
    const crl = parseFloat(document.getElementById('crl').value);
    if (!isNaN(crl)) {
        // Robinson formula: GA (days) = 8.052 * √(CRL) + 23.73
        const gaDays = 8.052 * Math.sqrt(crl) + 23.73;
        const weeks = Math.floor(gaDays / 7);
        const days = Math.round(gaDays % 7);
        
        if (weeks >= 10 && weeks <= 13) {
            document.getElementById('weeks').value = weeks;
            document.getElementById('days').value = days;
            calculatedGA.textContent = `${weeks} weeks + ${days} days`;
            calculateFinalGA();
        } else {
            calculatedGA.textContent = "CRL out of range (10-13 weeks)";
        }
    } else {
        calculatedGA.textContent = "Enter valid CRL";
    }
}

// Calculate patient age from DOB including days
function calculateAgeFromDOB() {
    const dob = new Date(dobInput.value);
    if (!isNaN(dob.getTime())) {
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        let days = today.getDate() - dob.getDate();
        
        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        const ageInDays = Math.floor((today - dob) / (1000 * 60 * 60 * 24));
        calculatedAge.textContent = `${years} years, ${months} months (${ageInDays} days)`;
        return { years, months, days: ageInDays };
    } else {
        calculatedAge.textContent = "Enter valid DOB";
        return null;
    }
}

// Calculate final GA adjusted for ultrasound and collection dates
function calculateFinalGA() {
    const weeks = parseInt(document.getElementById('weeks').value);
    const days = parseInt(document.getElementById('days').value);
    const ultrasoundDate = new Date(ultrasoundDateInput.value);
    const collectionDate = new Date(collectionDateInput.value);
    
    if (isNaN(weeks) || isNaN(days) || isNaN(ultrasoundDate.getTime()) || isNaN(collectionDate.getTime())) {
        finalGA.textContent = "Complete all fields";
        return;
    }
    
    // Calculate GA at ultrasound in days
    const gaAtUltrasound = (weeks * 7) + days;
    
    // Calculate days difference between ultrasound and collection
    const timeDiff = collectionDate - ultrasoundDate;
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Adjust GA
    const finalGADays = gaAtUltrasound + dayDiff;
    const finalWeeks = Math.floor(finalGADays / 7);
    const finalDays = finalGADays % 7;
    
    finalGA.textContent = `${finalWeeks} weeks + ${finalDays} days`;
    
    return { weeks: finalWeeks, days: finalDays };
}

// Get NT median for given gestational age
function getNTMedian(weeks, days) {
    if (ntMedians[weeks] && ntMedians[weeks][days]) {
        return ntMedians[weeks][days];
    }
    return 0;
}

// Get Beta-hCG median for given gestational age
function getBetaHcgMedian(weeks, days) {
    if (betaHcgMedians[weeks] && betaHcgMedians[weeks][days]) {
        return betaHcgMedians[weeks][days];
    }
    return 0;
}

// Get PAPP-A median for given gestational age
function getPappaMedian(weeks, days) {
    if (pappaMedians[weeks] && pappaMedians[weeks][days]) {
        return pappaMedians[weeks][days];
    }
    return 0;
}

// Get age-based risk
function getAgeBasedRisk(age, condition) {
    if (age < 25) return ageBasedRisks[condition]['<25'];
    if (age < 30) return ageBasedRisks[condition]['25-29'];
    if (age < 35) return ageBasedRisks[condition]['30-34'];
    if (age < 40) return ageBasedRisks[condition]['35-39'];
    return ageBasedRisks[condition]['≥40'];
}

// Main calculation function
function calculateRisk() {
    // Get input values
    const patientName = document.getElementById('patientName').value;
    const patientId = document.getElementById('patientId').value;
    const dob = document.getElementById('dob').value;
    const ethnicity = document.getElementById('ethnicity').value;
    const weeks = parseInt(document.getElementById('weeks').value);
    const days = parseInt(document.getElementById('days').value);
    const crl = parseFloat(document.getElementById('crl').value);
    const betaHcg = parseFloat(document.getElementById('betaHcg').value);
    const pappa = parseFloat(document.getElementById('pappa').value);
    const nt = parseFloat(document.getElementById('nt').value);
    const nasalBone = document.getElementById('nasalBone').value;
    const previousTrisomy = document.getElementById('previousTrisomy').value;
    const collectionDate = document.getElementById('collectionDate').value;
    const ultrasoundDate = document.getElementById('ultrasoundDate').value;
    const reportDate = document.getElementById('reportDate').value;
    
    // Validate inputs
    if (!patientName || !weeks || !days || isNaN(betaHcg) || isNaN(pappa) || isNaN(nt) || !dob) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (weeks < 10 || weeks > 13) {
        alert('Gestational age must be between 10+0 and 13+6 weeks');
        return;
    }
    
    if (days < 0 || days > 6) {
        alert('Days must be between 0 and 6');
        return;
    }
    
    // Calculate maternal age
    const ageInfo = calculateAgeFromDOB();
    if (!ageInfo) {
        alert('Please enter a valid date of birth');
        return;
    }
    
    // Calculate final GA
    const finalGA = calculateFinalGA();
    if (!finalGA) {
        alert('Please enter valid dates for ultrasound and collection');
        return;
    }
    
    // Get medians
    const ntMedian = getNTMedian(finalGA.weeks, finalGA.days);
    const betaHcgMedian = getBetaHcgMedian(finalGA.weeks, finalGA.days);
    const pappaMedian = getPappaMedian(finalGA.weeks, finalGA.days);
    
    // Calculate MoMs
    const ntMom = nt / ntMedian;
    const betaHcgMom = betaHcg / betaHcgMedian;
    const pappaMom = pappa / pappaMedian;
    
    // Get age-based risks
    const ageRiskT21 = getAgeBasedRisk(ageInfo.years, 't21');
    const ageRiskT18 = getAgeBasedRisk(ageInfo.years, 't18');
    const ageRiskT13 = getAgeBasedRisk(ageInfo.years, 't13');
    
    // Calculate risks
    const riskT21 = calculateRiskT21(ageInfo.years, previousTrisomy === 'yes', betaHcgMom, pappaMom, ntMom, nasalBone);
    const riskT18 = calculateRiskT18(ageInfo.years, previousTrisomy === 'yes', betaHcgMom, pappaMom, ntMom);
    const riskT13 = calculateRiskT13(ageInfo.years, previousTrisomy === 'yes', betaHcgMom, pappaMom, ntMom);
    
    // Display report
    displayReport(
        patientName, patientId, dob, ageInfo,
        betaHcg, pappa, nt,
        ntMedian, betaHcgMedian, pappaMedian,
        ntMom, betaHcgMom, pappaMom,
        riskT21, riskT18, riskT13,
        collectionDate, ultrasoundDate, reportDate,
        finalGA,
        ageRiskT21, ageRiskT18, ageRiskT13
    );
    
    // Show report section
    reportSection.classList.remove('hidden');
    
    // Scroll to report
    reportSection.scrollIntoView({ behavior: 'smooth' });
}

// Risk calculation functions
function calculateRiskT21(age, prevTrisomy, hcgMom, pappaMom, ntMom, nasalBone) {
    // Start with age-based risk
    let risk = getAgeBasedRisk(age, 't21');
    
    // Adjust for previous trisomy
    if (prevTrisomy) risk *= 1.5;
    
    // Adjust for biomarkers
    if (hcgMom > 2.5) risk *= 1.8;
    if (pappaMom < 0.5) risk *= 2.2;
    
    // Adjust for NT
    if (ntMom > 1.5) risk *= ntMom * 1.5;
    
    // Adjust for nasal bone
    if (nasalBone === 'absent') risk *= 5;
    
    return risk;
}

function calculateRiskT18(age, prevTrisomy, hcgMom, pappaMom, ntMom) {
    // Start with age-based risk
    let risk = getAgeBasedRisk(age, 't18');
    
    // Adjust for previous trisomy
    if (prevTrisomy) risk *= 1.5;
    
    // Adjust for biomarkers
    if (hcgMom < 0.3) risk *= 3;
    if (pappaMom < 0.3) risk *= 4;
    
    // Adjust for NT
    if (ntMom > 2.0) risk *= ntMom * 2;
    
    return risk;
}

function calculateRiskT13(age, prevTrisomy, hcgMom, pappaMom, ntMom) {
    // Start with age-based risk
    let risk = getAgeBasedRisk(age, 't13');
    
    // Adjust for previous trisomy
    if (prevTrisomy) risk *= 1.5;
    
    // Adjust for biomarkers
    if (hcgMom < 0.4) risk *= 2.5;
    if (pappaMom < 0.4) risk *= 3;
    
    // Adjust for NT
    if (ntMom > 1.8) risk *= ntMom * 1.8;
    
    return risk;
}

// Display report function
function displayReport(
    patientName, patientId, dob, ageInfo,
    betaHcg, pappa, nt,
    ntMedian, betaHcgMedian, pappaMedian,
    ntMom, betaHcgMom, pappaMom,
    riskT21, riskT18, riskT13,
    collectionDate, ultrasoundDate, reportDate,
    finalGA,
    ageRiskT21, ageRiskT18, ageRiskT13
) {
    // Format patient info
    document.getElementById('reportPatientName').textContent = patientName;
    document.getElementById('reportPatientId').textContent = patientId || 'N/A';
    document.getElementById('reportDOB').textContent = dob ? new Date(dob).toLocaleDateString() : 'N/A';
    document.getElementById('reportGA').textContent = `${finalGA.weeks} weeks + ${finalGA.days} days`;
    document.getElementById('reportCollectionDate').textContent = collectionDate ? new Date(collectionDate).toLocaleDateString() : 'N/A';
    document.getElementById('reportUltrasoundDate').textContent = ultrasoundDate ? new Date(ultrasoundDate).toLocaleDateString() : 'N/A';
    document.getElementById('reportDateDisplay').textContent = reportDate ? new Date(reportDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Format risks
    const formattedRiskT21 = formatRisk(riskT21);
    const formattedRiskT18 = formatRisk(riskT18);
    const formattedRiskT13 = formatRisk(riskT13);
    
    // Format age-based risks
    const formattedAgeRiskT21 = formatRisk(ageRiskT21);
    const formattedAgeRiskT18 = formatRisk(ageRiskT18);
    const formattedAgeRiskT13 = formatRisk(ageRiskT13);
    
    document.getElementById('reportT21RiskValue').textContent = formattedRiskT21;
    document.getElementById('reportT18RiskValue').textContent = formattedRiskT18;
    document.getElementById('reportT13RiskValue').textContent = formattedRiskT13;
    
    // Set risk categories and styling
    setRiskCategory('reportT21Risk', riskT21, 'reportT21RiskCategory');
    setRiskCategory('reportT18Risk', riskT18, 'reportT18RiskCategory');
    setRiskCategory('reportT13Risk', riskT13, 'reportT13RiskCategory');
    
    // Fill detailed results
    document.getElementById('reportHcgValue').textContent = betaHcg.toFixed(2) + ' IU/ml';
    document.getElementById('reportHcgMedian').textContent = betaHcgMedian.toFixed(2) + ' IU/ml';
    document.getElementById('reportHcgMom').textContent = betaHcgMom.toFixed(2) + ' MoM';
    document.getElementById('reportHcgStatus').textContent = getStatus(betaHcgMom, 0.4, 2.5);
    
    document.getElementById('reportPappaValue').textContent = pappa.toFixed(2) + ' ng/mL';
    document.getElementById('reportPappaMedian').textContent = pappaMedian.toFixed(2) + ' ng/mL';
    document.getElementById('reportPappaMom').textContent = pappaMom.toFixed(2) + ' MoM';
    document.getElementById('reportPappaStatus').textContent = getStatus(pappaMom, 0.5, 2.0);
    
    document.getElementById('reportNtValue').textContent = nt.toFixed(2) + ' mm';
    document.getElementById('reportNtMedian').textContent = ntMedian.toFixed(2) + ' mm';
    document.getElementById('reportNtMom').textContent = ntMom.toFixed(2) + ' MoM';
    document.getElementById('reportNtStatus').textContent = getNtStatus(nt, ntMedian);
    
    // Set status colors
    setStatusColor('reportHcgStatus');
    setStatusColor('reportPappaStatus');
    setStatusColor('reportNtStatus');
    
    // Create risk visualization chart
    createRiskChart(riskT21, riskT18, riskT13);
    
    // Set interpretation
    setInterpretation(riskT21, riskT18, riskT13, nt, nasalBone, ageInfo, ageRiskT21, riskT21);
    
    // Add maternal age risks to the report
    addMaternalAgeRisks(ageInfo.years, formattedAgeRiskT21, formattedAgeRiskT18, formattedAgeRiskT13);
}

function formatRisk(risk) {
    if (risk >= 1) return "1:1";
    if (risk <= 0) return "1:∞";
    
    const inverse = Math.round(1 / risk);
    return `1:${inverse}`;
}

function setRiskCategory(elementId, risk, categoryElementId) {
    const inverseRisk = 1 / risk;
    const element = document.getElementById(elementId);
    const categoryElement = document.getElementById(categoryElementId);
    
    // Updated thresholds for T21
    if (elementId === 'reportT21Risk') {
        if (inverseRisk <= 300) {
            // High risk
            element.className = "risk-card risk-high";
            categoryElement.textContent = "High Risk";
            categoryElement.className = "text-sm text-red-600 font-medium";
        } else if (inverseRisk <= 350) {
            // Moderate risk
            element.className = "risk-card risk-moderate";
            categoryElement.textContent = "Moderate Risk";
            categoryElement.className = "text-sm text-yellow-600 font-medium";
        } else {
            // Low risk
            element.className = "risk-card risk-low";
            categoryElement.textContent = "Low Risk";
            categoryElement.className = "text-sm text-green-600 font-medium";
        }
    } 
    // Standard thresholds for other trisomies
    else {
        if (inverseRisk <= 50) {
            // High risk
            element.className = "risk-card risk-high";
            categoryElement.textContent = "High Risk";
            categoryElement.className = "text-sm text-red-600 font-medium";
        } else if (inverseRisk <= 1000) {
            // Moderate risk
            element.className = "risk-card risk-moderate";
            categoryElement.textContent = "Moderate Risk";
            categoryElement.className = "text-sm text-yellow-600 font-medium";
        } else {
            // Low risk
            element.className = "risk-card risk-low";
            categoryElement.textContent = "Low Risk";
            categoryElement.className = "text-sm text-green-600 font-medium";
        }
    }
}

function getStatus(value, min, max) {
    if (value < min) return "Low";
    if (value > max) return "High";
    return "Normal";
}

function getNtStatus(nt, median) {
    if (nt > median * 1.8) return "High";
    if (nt < median * 0.8) return "Low";
    return "Normal";
}

function setStatusColor(elementId) {
    const element = document.getElementById(elementId);
    if (element.textContent === "Low" || element.textContent === "High") {
        element.className = "text-red-600 font-medium";
    } else {
        element.className = "text-green-600 font-medium";
    }
}

function createRiskChart(riskT21, riskT18, riskT13) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.riskChartInstance) {
        window.riskChartInstance.destroy();
    }
    
    // Calculate inverse risks for visualization
    const invT21 = 1 / riskT21;
    const invT18 = 1 / riskT18;
    const invT13 = 1 / riskT13;
    
    window.riskChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Trisomy 21', 'Trisomy 18', 'Trisomy 13'],
            datasets: [{
                label: 'Risk Score (1 in X)',
                data: [invT21, invT18, invT13],
                backgroundColor: [
                    invT21 <= 300 ? 'rgba(239, 68, 68, 0.7)' : 
                        invT21 <= 350 ? 'rgba(234, 179, 8, 0.7)' : 'rgba(34, 197, 94, 0.7)',
                    invT18 <= 50 ? 'rgba(239, 68, 68, 0.7)' : 
                        invT18 <= 1000 ? 'rgba(234, 179, 8, 0.7)' : 'rgba(34, 197, 94, 0.7)',
                    invT13 <= 50 ? 'rgba(239, 68, 68, 0.7)' : 
                        invT13 <= 1000 ? 'rgba(234, 179, 8, 0.7)' : 'rgba(34, 197, 94, 0.7)'
                ],
                borderColor: [
                    invT21 <= 300 ? 'rgba(239, 68, 68, 1)' : 
                        invT21 <= 350 ? 'rgba(234, 179, 8, 1)' : 'rgba(34, 197, 94, 1)',
                    invT18 <= 50 ? 'rgba(239, 68, 68, 1)' : 
                        invT18 <= 1000 ? 'rgba(234, 179, 8, 1)' : 'rgba(34, 197, 94, 1)',
                    invT13 <= 50 ? 'rgba(239, 68, 68, 1)' : 
                        invT13 <= 1000 ? 'rgba(234, 179, 8, 1)' : 'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Risk Score (1 in X)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `1 in ${Math.round(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

function setInterpretation(riskT21, riskT18, riskT13, nt, nasalBone, ageInfo, ageRiskT21, combinedRiskT21) {
    const interpretationText = document.getElementById('reportInterpretationText');
    
    // Base interpretation
    let interpretation = "The results of the first trimester maternal serum screening indicate ";
    
    // Risk level determination for T21 with updated thresholds
    const inverseRiskT21 = 1 / riskT21;
    let riskLevel = "low";
    
    if (inverseRiskT21 <= 300) {
        riskLevel = "high";
    } else if (inverseRiskT21 <= 350) {
        riskLevel = "moderate";
    }
    
    interpretation += `a ${riskLevel} risk for chromosomal abnormalities such as Trisomy 21, 18, and 13. `;
    
    // Add age information
    interpretation += `Based on maternal age (${ageInfo.years} years), the background risk for Down Syndrome was ${formatRisk(ageRiskT21)}. `;
    
    // Add information about risk modification
    const riskModification = combinedRiskT21 / ageRiskT21;
    if (riskModification > 1.5) {
        interpretation += "Screening markers have significantly increased this risk. ";
    } else if (riskModification < 0.67) {
        interpretation += "Screening markers have significantly decreased this risk. ";
    } else {
        interpretation += "Screening markers have had minimal effect on this age-related risk. ";
    }
    
    // Add specific findings
    if (nt > 3.5) {
        interpretation += "The nuchal translucency measurement is significantly increased, which may indicate an increased risk for chromosomal abnormalities or congenital heart defects. ";
    } else if (nt > 2.5) {
        interpretation += "The nuchal translucency measurement is mildly increased. ";
    }
    
    if (nasalBone === 'absent') {
        interpretation += "The fetal nasal bone appears absent, which is a soft marker for trisomy 21. ";
    }
    
    interpretation += "This screening test has a detection rate of approximately 90% for trisomy 21 with a 5% false-positive rate. ";
    
    if (riskLevel === "low") {
        interpretation += "No further diagnostic testing is recommended at this time, but regular prenatal care should continue.";
    } else if (riskLevel === "moderate") {
        interpretation += "Non-invasive prenatal testing (NIPT) should be considered as a follow-up test.";
    } else {
        interpretation += "Invasive diagnostic testing (CVS or amniocentesis) should be offered due to high risk.";
    }
    
    interpretationText.textContent = interpretation;
}

// Add maternal age risks to the report
function addMaternalAgeRisks(age, riskT21, riskT18, riskT13) {
    // Create the risk container
    const riskContainer = document.createElement('div');
    riskContainer.className = 'mb-6';
    
    // Create the table
    const table = document.createElement('table');
    table.className = 'report-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th colspan="2" class="text-center bg-blue-50">Maternal Age Risk (Age: ${age} years)</th>
            </tr>
            <tr>
                <th>Condition</th>
                <th>Background Risk</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Trisomy 21 (Down Syndrome)</td>
                <td class="text-center">${riskT21}</td>
            </tr>
            <tr>
                <td>Trisomy 18 (Edwards Syndrome)</td>
                <td class="text-center">${riskT18}</td>
            </tr>
            <tr>
                <td>Trisomy 13 (Patau Syndrome)</td>
                <td class="text-center">${riskT13}</td>
            </tr>
        </tbody>
    `;
    
    riskContainer.appendChild(table);
    
    // Find the risk assessment section and insert before the cards
    const riskAssessmentSection = document.querySelector('#reportSection .mb-8:has(#riskChart)');
    if (riskAssessmentSection) {
        const cardsSection = riskAssessmentSection.querySelector('.grid.grid-cols-1');
        if (cardsSection) {
            riskAssessmentSection.insertBefore(riskContainer, cardsSection);
        }
    }
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Capture the report card
    html2canvas(document.querySelector('.report-card'), {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = doc.internal.pageSize.getWidth() - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
        
        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Developed by Clinicalsci | https://clinicalsci.info', 
            doc.internal.pageSize.getWidth()/2, doc.internal.pageSize.getHeight() - 20, 
            {align: 'center'});
        doc.text('Not for Commercial use. We do not store any data', 
            doc.internal.pageSize.getWidth()/2, doc.internal.pageSize.getHeight() - 20, 
            {align: 'center'});
        // Save the PDF
        doc.save('First_Trimester_Screening_Report.pdf');
    });
}

function resetForm() {
    // Clear all form fields
    document.getElementById('patientName').value = '';
    document.getElementById('patientId').value = '';
    document.getElementById('dob').value = '';
    document.getElementById('ethnicity').selectedIndex = 0;
    document.getElementById('crl').value = '';
    document.getElementById('weeks').value = '';
    document.getElementById('days').value = '';
    document.getElementById('betaHcg').value = '';
    document.getElementById('pappa').value = '';
    document.getElementById('nt').value = '';
    document.getElementById('nasalBone').selectedIndex = 0;
    document.getElementById('previousTrisomy').selectedIndex = 0;
    document.getElementById('collectionDate').value = '';
    document.getElementById('ultrasoundDate').value = '';
    document.getElementById('calculatedGA').textContent = 'Enter CRL to calculate';
    document.getElementById('finalGA').textContent = 'Not calculated';
    document.getElementById('calculatedAge').textContent = 'Enter DOB to calculate';
    document.getElementById('forceGA').checked = false;
    
    // Hide report section
    reportSection.classList.add('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function setSampleData() {
    document.getElementById('patientName').value = 'Jane Doe';
    document.getElementById('patientId').value = 'PT-2025-12345';
    document.getElementById('dob').value = '1995-01-15';
    document.getElementById('crl').value = '65';
    document.getElementById('betaHcg').value = '125.5';
    document.getElementById('pappa').value = '1850.25';
    document.getElementById('nt').value = '1.5';
    document.getElementById('collectionDate').value = '2025-06-30';
    document.getElementById('ultrasoundDate').value = '2025-06-31';
    
    // Trigger calculations
    calculateAgeFromDOB();
    calculateGAFromCRL();
}
