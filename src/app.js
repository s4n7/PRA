       // Asian population median tables
        const asianMedians = {
            freeBetaHCG: {
                70: 25.3, 71: 26.1, 72: 26.9, 73: 27.7, 74: 28.5, 75: 29.3, 
                76: 30.1, 77: 30.9, 78: 31.7, 79: 32.5, 80: 33.3, 81: 34.1,
                82: 34.9, 83: 35.7, 84: 36.5, 85: 37.3, 86: 38.1, 87: 38.9,
                88: 39.7, 89: 40.5, 90: 41.3, 91: 42.1, 92: 42.9, 93: 43.7,
                94: 44.5, 95: 45.3, 96: 46.1, 97: 46.9, 98: 47.7
            },
            pappa: {
                70: 0.72, 71: 0.78, 72: 0.84, 73: 0.91, 74: 0.98, 75: 1.05, 
                76: 1.13, 77: 1.21, 78: 1.29, 79: 1.38, 80: 1.47, 81: 1.56,
                82: 1.66, 83: 1.76, 84: 1.86, 85: 1.97, 86: 2.08, 87: 2.19,
                88: 2.31, 89: 2.43, 90: 2.55, 91: 2.68, 92: 2.81, 93: 2.94,
                94: 3.08, 95: 3.22, 96: 3.36, 97: 3.51, 98: 3.66
            },
            nt: {
                70: 1.1, 71: 1.1, 72: 1.1, 73: 1.1, 74: 1.1, 75: 1.2,
                76: 1.2, 77: 1.2, 78: 1.2, 79: 1.3, 80: 1.3, 81: 1.3,
                82: 1.3, 83: 1.4, 84: 1.4, 85: 1.4, 86: 1.4, 87: 1.5,
                88: 1.5, 89: 1.5, 90: 1.5, 91: 1.6, 92: 1.6, 93: 1.6,
                94: 1.6, 95: 1.7, 96: 1.7, 97: 1.7, 98: 1.7
            }
        };

        // Initialize Chart.js
        const ctx = document.getElementById('risk-chart').getContext('2d');
        const riskChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Trisomy 21', 'Trisomy 18'],
                datasets: [{
                    label: 'Risk Ratio (1:value)',
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(155, 89, 182, 0.7)'
                    ],
                    borderColor: [
                        'rgb(52, 152, 219)',
                        'rgb(155, 89, 182)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Risk Ratio (1:value)'
                        }
                    }
                }
            }
        });

        // Calculate gestational age from CRL
        function calculateGAFromCRL(crl) {
            if (!crl) return null;
            const gaDays = 8.052 * Math.sqrt(parseFloat(crl)) + 23.73;
            const weeks = Math.floor(gaDays / 7);
            const days = Math.round(gaDays % 7);
            return { days: Math.round(gaDays), weeks, daysRemainder: days };
        }

        // Calculate gestational age at sampling
        function calculateSampleCollectionGA(ultrasoundDate, sampleDate, gaAtUltrasound) {
            if (!ultrasoundDate || !sampleDate || !gaAtUltrasound) return null;
            const daysBetween = (new Date(sampleDate) - new Date(ultrasoundDate)) / (1000 * 60 * 60 * 24);
            const totalDays = gaAtUltrasound.days + daysBetween;
            const weeks = Math.floor(totalDays / 7);
            const days = Math.round(totalDays % 7);
            return { days: Math.round(totalDays), weeks, daysRemainder: days };
        }

        // Calculate MoM value
        function calculateMoM(value, marker, gaDays) {
            if (!gaDays || !value) return null;
            const median = asianMedians[marker][gaDays];
            return median ? value / median : null;
        }

        // Calculate age-based background risk
        function calculateBackgroundRisk(age, condition) {
            if (!age) return null;
            
            // Different formulas for Trisomy 21 and 18
            if (condition === 't21') {
                // Risk for Trisomy 21 (Down Syndrome)
                return Math.exp(-16.2395 + 0.286 * age);
            } else {
                // Risk for Trisomy 18 (Edwards Syndrome)
                return Math.exp(-14.199 + 0.287 * age);
            }
        }

        // Calculate adjusted risk
        function calculateAdjustedRisk(backgroundRisk, freeBetaHCGMoM, pappaMoM, ntMoM, condition) {
            if (!freeBetaHCGMoM || !pappaMoM) return null;
            
            // Different likelihood ratios for Trisomy 21 and 18
            if (condition === 't21') {
                // Trisomy 21 likelihood ratios
                const lrFreeBetaHCG = Math.exp(2.4892 * Math.log(freeBetaHCGMoM) - 0.0208 * Math.pow(Math.log(freeBetaHCGMoM), 3));
                const lrPAPPA = Math.exp(-1.5826 * Math.log(pappaMoM) - 0.1546 * Math.pow(Math.log(pappaMoM), 2));
                let lrNT = 1;
                
                if (ntMoM) {
                    lrNT = Math.exp(5.2528 * Math.log(ntMoM) - 0.3056 * Math.pow(Math.log(ntMoM), 3));
                }
                
                return (backgroundRisk * lrFreeBetaHCG * lrPAPPA * lrNT) / 
                    ((1 - backgroundRisk) + (backgroundRisk * lrFreeBetaHCG * lrPAPPA * lrNT));
            } else {
                // Trisomy 18 likelihood ratios
                const lrFreeBetaHCG = Math.exp(-1.5826 * Math.log(freeBetaHCGMoM) - 0.1546 * Math.pow(Math.log(freeBetaHCGMoM), 2));
                const lrPAPPA = Math.exp(-2.4859 * Math.log(pappaMoM) - 0.0716 * Math.pow(Math.log(pappaMoM), 2));
                let lrNT = 1;
                
                if (ntMoM) {
                    lrNT = Math.exp(3.6541 * Math.log(ntMoM) - 0.1426 * Math.pow(Math.log(ntMoM), 3));
                }
                
                return (backgroundRisk * lrFreeBetaHCG * lrPAPPA * lrNT) / 
                    ((1 - backgroundRisk) + (backgroundRisk * lrFreeBetaHCG * lrPAPPA * lrNT));
            }
        }

        // Update the UI with calculated risks
        function updateRiskUI() {
            const patientDOB = document.getElementById('patient-dob').value;
            const crl = document.getElementById('crl').value;
            const freeHCG = document.getElementById('free-hcg').value;
            const pappa = document.getElementById('pappa').value;
            const nt = document.getElementById('nt').value;
            
            if (!patientDOB || !crl || !freeHCG || !pappa) {
                alert('Please complete all required fields');
                return;
            }
            
            // Calculate gestational ages
            const gaUltrasound = calculateGAFromCRL(crl);
            document.getElementById('ga-ultrasound').value = 
                gaUltrasound ? `${gaUltrasound.weeks} weeks ${gaUltrasound.daysRemainder} days` : '';
            
            const ultrasoundDate = document.getElementById('ultrasound-date').value;
            const sampleDate = document.getElementById('sample-date').value;
            let gaSample = null;
            
            if (ultrasoundDate && sampleDate && gaUltrasound) {
                gaSample = calculateSampleCollectionGA(ultrasoundDate, sampleDate, gaUltrasound);
                document.getElementById('ga-sample').value = 
                    gaSample ? `${gaSample.weeks} weeks ${gaSample.daysRemainder} days` : '';
            }
            
            // Calculate MoM values
            const gaDays = gaSample ? gaSample.days : (gaUltrasound ? gaUltrasound.days : null);
            const freeHCGMom = calculateMoM(parseFloat(freeHCG), 'freeBetaHCG', gaDays);
            const pappaMom = calculateMoM(parseFloat(pappa), 'pappa', gaDays);
            const ntMom = nt ? calculateMoM(parseFloat(nt), 'nt', gaDays) : null;
            
            document.getElementById('free-hcg-mom').value = freeHCGMom ? freeHCGMom.toFixed(2) : '';
            document.getElementById('pappa-mom').value = pappaMom ? pappaMom.toFixed(2) : '';
            
            // Calculate age
            const today = new Date();
            const birthDate = new Date(patientDOB);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            document.getElementById('patient-age').value = age;
            
            // Calculate risks
            const bgRiskT21 = calculateBackgroundRisk(age, 't21');
            const adjRiskT21 = calculateAdjustedRisk(bgRiskT21, freeHCGMom, pappaMom, ntMom, 't21');
            
            const bgRiskT18 = calculateBackgroundRisk(age, 't18');
            const adjRiskT18 = calculateAdjustedRisk(bgRiskT18, freeHCGMom, pappaMom, ntMom, 't18');
            
            // Update UI for Trisomy 21
            const t21RiskCard = document.getElementById('t21-risk');
            const t21RiskValue = document.querySelector('#t21-risk .risk-value');
            const t21Classification = document.querySelector('#t21-risk .risk-classification');
            const t21BgRisk = document.getElementById('t21-bg-risk');
            const t21AdjRisk = document.getElementById('t21-adj-risk');
            
            if (adjRiskT21) {
                const riskRatio = Math.round(1 / adjRiskT21);
                t21RiskValue.textContent = `1:${riskRatio}`;
                t21BgRisk.textContent = `1:${Math.round(1 / bgRiskT21)}`;
                t21AdjRisk.textContent = `1:${riskRatio}`;
                
                if (adjRiskT21 > 1/250) {
                    t21RiskValue.classList.add('high');
                    t21RiskValue.classList.remove('low');
                    t21Classification.textContent = 'High Risk';
                    t21Classification.className = 'risk-classification high-risk';
                    t21RiskCard.classList.add('high-risk');
                } else {
                    t21RiskValue.classList.add('low');
                    t21RiskValue.classList.remove('high');
                    t21Classification.textContent = 'Low Risk';
                    t21Classification.className = 'risk-classification low-risk';
                    t21RiskCard.classList.remove('high-risk');
                }
            }
            
            // Update UI for Trisomy 18
            const t18RiskCard = document.getElementById('t18-risk');
            const t18RiskValue = document.querySelector('#t18-risk .risk-value');
            const t18Classification = document.querySelector('#t18-risk .risk-classification');
            const t18BgRisk = document.getElementById('t18-bg-risk');
            const t18AdjRisk = document.getElementById('t18-adj-risk');
            
            if (adjRiskT18) {
                const riskRatio = Math.round(1 / adjRiskT18);
                t18RiskValue.textContent = `1:${riskRatio}`;
                t18BgRisk.textContent = `1:${Math.round(1 / bgRiskT18)}`;
                t18AdjRisk.textContent = `1:${riskRatio}`;
                
                if (adjRiskT18 > 1/100) {
                    t18RiskValue.classList.add('high');
                    t18RiskValue.classList.remove('low');
                    t18Classification.textContent = 'High Risk';
                    t18Classification.className = 'risk-classification high-risk';
                    t18RiskCard.classList.add('high-risk');
                } else {
                    t18RiskValue.classList.add('low');
                    t18RiskValue.classList.remove('high');
                    t18Classification.textContent = 'Low Risk';
                    t18Classification.className = 'risk-classification low-risk';
                    t18RiskCard.classList.remove('high-risk');
                }
            }
            
            // Update chart
            riskChart.data.datasets[0].data = [
                adjRiskT21 ? Math.round(1 / adjRiskT21) : 0,
                adjRiskT18 ? Math.round(1 / adjRiskT18) : 0
            ];
            riskChart.update();
            
            // Enable PDF button
            document.getElementById('pdf-button').disabled = false;
        }

        // Generate PDF report
        function generatePDFReport() {
            const patientName = document.getElementById('patient-name').value || 'Not provided';
            const patientDOB = document.getElementById('patient-dob').value || 'Not provided';
            const patientAge = document.getElementById('patient-age').value || 'Not calculated';
            const patientID = document.getElementById('patient-id').value || 'Not provided';
            const ethnicity = document.getElementById('patient-ethnicity').value;
            const weight = document.getElementById('patient-weight').value || 'Not provided';
            const smoking = document.getElementById('patient-smoking').checked ? 'Yes' : 'No';
            
            const lmp = document.getElementById('lmp').value || 'Not provided';
            const ultrasoundDate = document.getElementById('ultrasound-date').value || 'Not provided';
            const crl = document.getElementById('crl').value || 'Not provided';
            const gaUltrasound = document.getElementById('ga-ultrasound').value || 'Not calculated';
            const sampleDate = document.getElementById('sample-date').value || 'Not provided';
            const gaSample = document.getElementById('ga-sample').value || 'Not calculated';
            const nt = document.getElementById('nt').value || 'Not measured';
            const pregnancyType = document.getElementById('pregnancy-type').value;
            const ivf = document.getElementById('ivf').checked ? 'Yes' : 'No';
            
            const freeHCG = document.getElementById('free-hcg').value || 'Not provided';
            const freeHCGMom = document.getElementById('free-hcg-mom').value || 'Not calculated';
            const pappa = document.getElementById('pappa').value || 'Not provided';
            const pappaMom = document.getElementById('pappa-mom').value || 'Not calculated';
            
            const t21RiskValue = document.querySelector('#t21-risk .risk-value').textContent;
            const t21Classification = document.querySelector('#t21-risk .risk-classification').textContent;
            const t21BgRisk = document.getElementById('t21-bg-risk').textContent;
            const t21AdjRisk = document.getElementById('t21-adj-risk').textContent;
            
            const t18RiskValue = document.querySelector('#t18-risk .risk-value').textContent;
            const t18Classification = document.querySelector('#t18-risk .risk-classification').textContent;
            const t18BgRisk = document.getElementById('t18-bg-risk').textContent;
            const t18AdjRisk = document.getElementById('t18-adj-risk').textContent;
            
            const today = new Date();
            const reportDate = today.toLocaleDateString();
            
            // Create visually enriched PDF
            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],
                content: [
                    {
                        text: 'FIRST TRIMESTER MATERNAL SERUM SCREENING REPORT',
                        style: 'header',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: `Report Date: ${reportDate}`,
                        style: 'subheader',
                        margin: [0, 0, 0, 30]
                    },
                    
                    // Patient Information
                    {
                        text: 'Patient Information',
                        style: 'sectionHeader'
                    },
                    {
                        table: {
                            widths: ['auto', '*', 'auto', '*'],
                            body: [
                                [
                                    {text: 'Name:', style: 'tableLabel'}, 
                                    patientName,
                                    {text: 'ID Number:', style: 'tableLabel'},
                                    patientID
                                ],
                                [
                                    {text: 'Date of Birth:', style: 'tableLabel'},
                                    patientDOB,
                                    {text: 'Age:', style: 'tableLabel'},
                                    patientAge + ' years'
                                ],
                                [
                                    {text: 'Ethnicity:', style: 'tableLabel'},
                                    ethnicity,
                                    {text: 'Weight:', style: 'tableLabel'},
                                    weight + ' kg'
                                ],
                                [
                                    {text: 'Smoking Status:', style: 'tableLabel'},
                                    smoking,
                                    {text: '', style: 'tableLabel'},
                                    ''
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    },
                    
                    // Pregnancy & Ultrasound Details
                    {
                        text: 'Pregnancy & Ultrasound Details',
                        style: 'sectionHeader',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        table: {
                            widths: ['auto', '*', 'auto', '*'],
                            body: [
                                [
                                    {text: 'LMP:', style: 'tableLabel'}, 
                                    lmp,
                                    {text: 'Pregnancy Type:', style: 'tableLabel'},
                                    pregnancyType === 'singleton' ? 'Singleton' : 'Twin'
                                ],
                                [
                                    {text: 'Ultrasound Date:', style: 'tableLabel'},
                                    ultrasoundDate,
                                    {text: 'CRL:', style: 'tableLabel'},
                                    crl + ' mm'
                                ],
                                [
                                    {text: 'GA at Ultrasound:', style: 'tableLabel'},
                                    gaUltrasound,
                                    {text: 'NT Measurement:', style: 'tableLabel'},
                                    nt + ' mm'
                                ],
                                [
                                    {text: 'Sample Date:', style: 'tableLabel'},
                                    sampleDate,
                                    {text: 'GA at Sampling:', style: 'tableLabel'},
                                    gaSample
                                ],
                                [
                                    {text: 'IVF Conception:', style: 'tableLabel'},
                                    ivf,
                                    {text: '', style: 'tableLabel'},
                                    ''
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    },
                    
                    // Biochemistry
                    {
                        text: 'Biochemical Markers',
                        style: 'sectionHeader',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        table: {
                            widths: ['*', '*', '*'],
                            body: [
                                [
                                    {text: 'Marker', style: 'tableHeader'},
                                    {text: 'Value', style: 'tableHeader'},
                                    {text: 'MoM', style: 'tableHeader'}
                                ],
                                [
                                    'Free β-hCG',
                                    freeHCG + ' IU/mL',
                                    freeHCGMom
                                ],
                                [
                                    'PAPP-A',
                                    pappa + ' ng/mL',
                                    pappaMom
                                ]
                            ]
                        },
                        margin: [0, 0, 0, 20]
                    },
                    
                    // Risk Assessment
                    {
                        text: 'Risk Assessment',
                        style: 'sectionHeader',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        table: {
                            widths: ['*', '*', '*', '*'],
                            body: [
                                [
                                    {text: 'Condition', style: 'tableHeader'},
                                    {text: 'Background Risk', style: 'tableHeader'},
                                    {text: 'Adjusted Risk', style: 'tableHeader'},
                                    {text: 'Classification', style: 'tableHeader'}
                                ],
                                [
                                    'Trisomy 21',
                                    '1:' + t21BgRisk,
                                    t21RiskValue,
                                    {text: t21Classification, style: t21Classification === 'High Risk' ? 'highRisk' : 'lowRisk'}
                                ],
                                [
                                    'Trisomy 18',
                                    '1:' + t18BgRisk,
                                    t18RiskValue,
                                    {text: t18Classification, style: t18Classification === 'High Risk' ? 'highRisk' : 'lowRisk'}
                                ]
                            ]
                        },
                        margin: [0, 0, 0, 20]
                    },
                    
                    // Interpretation
                    {
                        text: 'Interpretation',
                        style: 'sectionHeader',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        text: t21Classification === 'High Risk' || t18Classification === 'High Risk' ?
                            'This screening result indicates an increased risk for chromosomal abnormalities. Diagnostic testing such as chorionic villus sampling (CVS) or amniocentesis should be offered. Genetic counseling is recommended.' :
                            'This screening result indicates a low risk for chromosomal abnormalities. Routine prenatal care is recommended.',
                        margin: [0, 0, 0, 20]
                    },
                    
                    // Disclaimer
                    {
                        text: 'Disclaimer:',
                        style: 'disclaimerHeader',
                        margin: [0, 20, 0, 5]
                    },
                    {
                        text: 'This is a screening test, not a diagnostic test. False positives and false negatives may occur. Diagnostic testing is recommended if clinically indicated.',
                        style: 'disclaimerText',
                        margin: [0, 0, 0, 20]
                    },
                    
                    // Footer
                    {
                        columns: [
                            {
                                text: 'Reported by: FTMSS Screening System\nReport Date: ' + reportDate,
                                width: '50%'
                            },
                            {
                                text: 'Electronically Signed',
                                alignment: 'right',
                                width: '50%'
                            }
                        ],
                        margin: [0, 30, 0, 0]
                    }
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        alignment: 'center',
                        color: '#2c3e50'
                    },
                    subheader: {
                        fontSize: 12,
                        alignment: 'center',
                        color: '#7f8c8d'
                    },
                    sectionHeader: {
                        fontSize: 14,
                        bold: true,
                        color: '#2c3e50',
                        background: '#ecf0f1',
                        padding: [5, 10]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 11,
                        color: '#2c3e50',
                        fillColor: '#ecf0f1',
                        margin: [0, 5, 0, 5]
                    },
                    tableLabel: {
                        bold: true,
                        color: '#7f8c8d'
                    },
                    highRisk: {
                        bold: true,
                        color: '#e74c3c'
                    },
                    lowRisk: {
                        bold: true,
                        color: '#27ae60'
                    },
                    disclaimerHeader: {
                        bold: true,
                        color: '#e74c3c'
                    },
                    disclaimerText: {
                        fontSize: 10,
                        color: '#7f8c8d'
                    }
                }
            };
            
            pdfMake.createPdf(docDefinition).open();
        }

        // Initialize event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Set default values
            document.getElementById('patient-ethnicity').value = 'Asian';
            document.getElementById('pregnancy-type').value = 'singleton';
            
            // Calculate age when DOB changes
            document.getElementById('patient-dob').addEventListener('change', function() {
                if (this.value) {
                    const today = new Date();
                    const birthDate = new Date(this.value);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    document.getElementById('patient-age').value = age;
                }
            });
            
            // Calculate GA when CRL changes
            document.getElementById('crl').addEventListener('change', function() {
                if (this.value) {
                    const ga = calculateGAFromCRL(this.value);
                    document.getElementById('ga-ultrasound').value = 
                        ga ? `${ga.weeks} weeks ${ga.daysRemainder} days` : '';
                }
            });
            
            // Calculate GA at sampling when dates change
            document.getElementById('ultrasound-date').addEventListener('change', updateSampleGA);
            document.getElementById('sample-date').addEventListener('change', updateSampleGA);
            
            function updateSampleGA() {
                const ultrasoundDate = document.getElementById('ultrasound-date').value;
                const sampleDate = document.getElementById('sample-date').value;
                const crl = document.getElementById('crl').value;
                
                if (ultrasoundDate && sampleDate && crl) {
                    const gaUltrasound = calculateGAFromCRL(crl);
                    if (gaUltrasound) {
                        const gaSample = calculateSampleCollectionGA(ultrasoundDate, sampleDate, gaUltrasound);
                        document.getElementById('ga-sample').value = 
                            gaSample ? `${gaSample.weeks} weeks ${gaSample.daysRemainder} days` : '';
                    }
                }
            }
            
            // Calculate risk button
            document.getElementById('calculate-button').addEventListener('click', updateRiskUI);
            
            // Generate PDF button
            document.getElementById('pdf-button').addEventListener('click', generatePDFReport);
        });
