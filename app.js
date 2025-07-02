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

// Patient Information Component
function PatientInfoForm({ patientData, setPatientData }) {
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'dob' ? { age: calculateAge(value) } : {})
    }));
  };

  return (
    <div className="form-section">
      <h2>Patient Information</h2>
      <div className="form-row">
        <div>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={patientData.name || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={patientData.dob || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Age</label>
          <input
            type="text"
            value={patientData.age || ''}
            disabled
          />
        </div>
        <div>
          <label>ID Number</label>
          <input
            type="text"
            name="id"
            value={patientData.id || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Ethnicity</label>
          <select
            name="ethnicity"
            value={patientData.ethnicity || 'Asian'}
            onChange={handleChange}
          >
            <option value="Asian">Asian</option>
            <option value="Caucasian">Caucasian</option>
            <option value="African">African</option>
            <option value="Hispanic">Hispanic</option>
          </select>
        </div>
        <div>
          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={patientData.weight || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>
            <input
              type="checkbox"
              name="smoking"
              checked={patientData.smoking || false}
              onChange={handleChange}
            />
            Smoker
          </label>
        </div>
      </div>
    </div>
  );
}

// Pregnancy Details Component
function PregnancyDetailsForm({ pregnancyData, setPregnancyData }) {
  const calculateGAFromCRL = (crl) => {
    if (!crl) return null;
    const gaDays = 8.052 * Math.sqrt(parseFloat(crl)) + 23.73;
    const weeks = Math.floor(gaDays / 7);
    const days = Math.round(gaDays % 7);
    return { days: Math.round(gaDays), weeks, daysRemainder: days };
  };

  const calculateSampleCollectionGA = (ultrasoundDate, sampleDate, gaAtUltrasound) => {
    if (!ultrasoundDate || !sampleDate || !gaAtUltrasound) return null;
    const daysBetween = (new Date(sampleDate) - new Date(ultrasoundDate)) / (1000 * 60 * 60 * 24);
    const totalDays = gaAtUltrasound.days + daysBetween;
    const weeks = Math.floor(totalDays / 7);
    const days = Math.round(totalDays % 7);
    return { days: Math.round(totalDays), weeks, daysRemainder: days };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPregnancyData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'crl' ? { 
        gestationalAge: calculateGAFromCRL(value),
        ...(prev.ultrasoundDate ? { 
          sampleCollectionGA: calculateSampleCollectionGA(
            prev.ultrasoundDate, 
            prev.sampleCollectionDate || new Date().toISOString().split('T')[0], 
            calculateGAFromCRL(value)
          ) 
        } : {})
      } : {}),
      ...(name === 'ultrasoundDate' && prev.crl ? { 
        sampleCollectionGA: calculateSampleCollectionGA(
          value, 
          prev.sampleCollectionDate || new Date().toISOString().split('T')[0], 
          prev.gestationalAge || calculateGAFromCRL(prev.crl)
        ) 
      } : {}),
      ...(name === 'sampleCollectionDate' && prev.crl && prev.ultrasoundDate ? { 
        sampleCollectionGA: calculateSampleCollectionGA(
          prev.ultrasoundDate, 
          value, 
          prev.gestationalAge || calculateGAFromCRL(prev.crl)
        ) 
      } : {})
    }));
  };

  return (
    <div className="form-section">
      <h2>Pregnancy & Ultrasound Details</h2>
      <div className="form-row">
        <div>
          <label>Last Menstrual Period</label>
          <input
            type="date"
            name="lmp"
            value={pregnancyData.lmp || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Date of Ultrasound</label>
          <input
            type="date"
            name="ultrasoundDate"
            value={pregnancyData.ultrasoundDate || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>CRL (mm)</label>
          <input
            type="number"
            name="crl"
            value={pregnancyData.crl || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      {pregnancyData.gestationalAge && (
        <div className="form-row">
          <div>
            <label>Gestational Age at Ultrasound</label>
            <input
              type="text"
              value={`${pregnancyData.gestationalAge.weeks} weeks ${pregnancyData.gestationalAge.daysRemainder} days`}
              disabled
            />
          </div>
        </div>
      )}
      <div className="form-row">
        <div>
          <label>Date of Sample Collection</label>
          <input
            type="date"
            name="sampleCollectionDate"
            value={pregnancyData.sampleCollectionDate || ''}
            onChange={handleChange}
          />
        </div>
        {pregnancyData.sampleCollectionGA && (
          <div>
            <label>Gestational Age at Sampling</label>
            <input
              type="text"
              value={`${pregnancyData.sampleCollectionGA.weeks} weeks ${pregnancyData.sampleCollectionGA.daysRemainder} days`}
              disabled
            />
          </div>
        )}
      </div>
      <div className="form-row">
        <div>
          <label>NT Measurement (mm) - Optional</label>
          <input
            type="number"
            step="0.1"
            name="nt"
            value={pregnancyData.nt || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Pregnancy Type</label>
          <select
            name="pregnancyType"
            value={pregnancyData.pregnancyType || 'singleton'}
            onChange={handleChange}
          >
            <option value="singleton">Singleton</option>
            <option value="twin">Twin</option>
          </select>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="ivf"
              checked={pregnancyData.ivf || false}
              onChange={handleChange}
            />
            IVF Conception
          </label>
        </div>
      </div>
    </div>
  );
}

// Serum Marker Component
function SerumMarkerForm({ serumData, setSerumData, gestationalAge }) {
  const calculateMoM = (value, medianTable) => {
    if (!gestationalAge || !gestationalAge.days || !value) return null;
    const median = medianTable[gestationalAge.days];
    return median ? value / median : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSerumData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'freeBetaHCG' ? { freeBetaHCGMoM: calculateMoM(value, asianMedians.freeBetaHCG) } : {}),
      ...(name === 'pappa' ? { pappaMoM: calculateMoM(value, asianMedians.pappa) } : {}),
    }));
  };

  return (
    <div className="form-section">
      <h2>Serum Markers</h2>
      <div className="form-row">
        <div>
          <label>Free β-hCG (IU/mL)</label>
          <input
            type="number"
            step="0.1"
            name="freeBetaHCG"
            value={serumData.freeBetaHCG || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Free β-hCG MoM</label>
          <input
            type="text"
            value={serumData.freeBetaHCGMoM ? serumData.freeBetaHCGMoM.toFixed(2) : ''}
            disabled
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>PAPP-A (ng/mL)</label>
          <input
            type="number"
            step="0.01"
            name="pappa"
            value={serumData.pappa || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>PAPP-A MoM</label>
          <input
            type="text"
            value={serumData.pappaMoM ? serumData.pappaMoM.toFixed(2) : ''}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

// Risk Assessment Component
function RiskAssessment({ patientData, pregnancyData, serumData }) {
  const calculateBackgroundRisk = (age) => {
    if (!age) return { t21: null, t18: null };
    const ageRiskT21 = Math.exp(-16.2395 + 0.286 * age);
    const ageRiskT18 = Math.exp(-14.199 + 0.287 * age);
    return {
      t21: ageRiskT21,
      t18: ageRiskT18
    };
  };

  const calculateAdjustedRisk = (backgroundRisk, freeBetaHCGMoM, pappaMoM, ntMoM) => {
    if (!freeBetaHCGMoM || !pappaMoM) return { t21: null, t18: null };
    
    // Likelihood ratios for Trisomy 21
    const lrFreeBetaHCGT21 = Math.exp(2.4892 * Math.log(freeBetaHCGMoM) - 0.0208 * Math.pow(Math.log(freeBetaHCGMoM), 3));
    const lrPAPPAT21 = Math.exp(-1.5826 * Math.log(pappaMoM) - 0.1546 * Math.pow(Math.log(pappaMoM), 2));
    let lrNTT21 = 1;
    
    if (ntMoM) {
      lrNTT21 = Math.exp(5.2528 * Math.log(ntMoM) - 0.3056 * Math.pow(Math.log(ntMoM), 3));
    }
    
    // Likelihood ratios for Trisomy 18
    const lrFreeBetaHCGT18 = Math.exp(-1.5826 * Math.log(freeBetaHCGMoM) - 0.1546 * Math.pow(Math.log(freeBetaHCGMoM), 2));
    const lrPAPPAT18 = Math.exp(-2.4859 * Math.log(pappaMoM) - 0.0716 * Math.pow(Math.log(pappaMoM), 2));
    let lrNTT18 = 1;
    
    if (ntMoM) {
      lrNTT18 = Math.exp(3.6541 * Math.log(ntMoM) - 0.1426 * Math.pow(Math.log(ntMoM), 3));
    }
    
    // Calculate adjusted risks
    const adjustedRiskT21 = (backgroundRisk.t21 * lrFreeBetaHCGT21 * lrPAPPAT21 * lrNTT21) / 
      ((1 - backgroundRisk.t21) + (backgroundRisk.t21 * lrFreeBetaHCGT21 * lrPAPPAT21 * lrNTT21));
    
    const adjustedRiskT18 = (backgroundRisk.t18 * lrFreeBetaHCGT18 * lrPAPPAT18 * lrNTT18) / 
      ((1 - backgroundRisk.t18) + (backgroundRisk.t18 * lrFreeBetaHCGT18 * lrPAPPAT18 * lrNTT18));
    
    return {
      t21: adjustedRiskT21,
      t18: adjustedRiskT18
    };
  };

  const classifyRisk = (risk, condition) => {
    if (!risk) return { classification: 'Not calculated', screenResult: 'Not calculated' };
    const cutoff = condition === 't21' ? 1/250 : 1/100;
    return {
      classification: risk >= cutoff ? 'High Risk' : 'Low Risk',
      screenResult: risk >= cutoff ? 'Screen Positive' : 'Screen Negative'
    };
  };

  const generatePDFReport = () => {
    const backgroundRisk = calculateBackgroundRisk(patientData.age);
    const ntMoM = pregnancyData.nt && pregnancyData.gestationalAge ? 
      pregnancyData.nt / asianMedians.nt[pregnancyData.gestationalAge.days] : null;
    const adjustedRisk = calculateAdjustedRisk(
      backgroundRisk, 
      serumData.freeBetaHCGMoM, 
      serumData.pappaMoM, 
      ntMoM
    );
    
    const t21Classification = classifyRisk(adjustedRisk.t21, 't21');
    const t18Classification = classifyRisk(adjustedRisk.t18, 't18');

    const docDefinition = {
      content: [
        { text: 'First Trimester Maternal Serum Screening Report', style: 'header' },
        { text: 'Patient Information', style: 'sectionHeader' },
        {
          table: {
            body: [
              ['Name:', patientData.name || 'Not provided'],
              ['Date of Birth:', patientData.dob || 'Not provided'],
              ['Age:', patientData.age ? `${patientData.age} years` : 'Not provided'],
              ['ID Number:', patientData.id || 'Not provided'],
              ['Ethnicity:', patientData.ethnicity || 'Asian'],
              ['Weight:', patientData.weight ? `${patientData.weight} kg` : 'Not provided'],
              ['Smoking Status:', patientData.smoking ? 'Yes' : 'No']
            ]
          }
        },
        { text: 'Pregnancy Details', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            body: [
              ['LMP:', pregnancyData.lmp || 'Not provided'],
              ['Ultrasound Date:', pregnancyData.ultrasoundDate || 'Not provided'],
              ['CRL:', pregnancyData.crl ? `${pregnancyData.crl} mm` : 'Not provided'],
              ['GA at Ultrasound:', pregnancyData.gestationalAge ? 
                `${pregnancyData.gestationalAge.weeks} weeks ${pregnancyData.gestationalAge.daysRemainder} days` : 'Not calculated'],
              ['NT Measurement:', pregnancyData.nt ? `${pregnancyData.nt} mm` : 'Not measured'],
              ['Pregnancy Type:', pregnancyData.pregnancyType === 'singleton' ? 'Singleton' : 'Twin'],
              ['IVF Conception:', pregnancyData.ivf ? 'Yes' : 'No']
            ]
          }
        },
        { text: 'Biochemical Markers', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            body: [
              ['Marker', 'Value', 'MoM'],
              [
                'Free β-hCG', 
                serumData.freeBetaHCG ? `${serumData.freeBetaHCG} IU/mL` : 'Not provided',
                serumData.freeBetaHCGMoM ? serumData.freeBetaHCGMoM.toFixed(2) : ''
              ],
              [
                'PAPP-A',
                serumData.pappa ? `${serumData.pappa} ng/mL` : 'Not provided',
                serumData.pappaMoM ? serumData.pappaMoM.toFixed(2) : ''
              ]
            ]
          }
        },
        { text: 'Risk Assessment', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            body: [
              ['Condition', 'Background Risk', 'Adjusted Risk', 'Classification'],
              [
                'Trisomy 21',
                backgroundRisk.t21 ? `1:${Math.round(1/backgroundRisk.t21)}` : 'Not calculated',
                adjustedRisk.t21 ? `1:${Math.round(1/adjustedRisk.t21)}` : 'Not calculated',
                t21Classification.classification
              ],
              [
                'Trisomy 18',
                backgroundRisk.t18 ? `1:${Math.round(1/backgroundRisk.t18)}` : 'Not calculated',
                adjustedRisk.t18 ? `1:${Math.round(1/adjustedRisk.t18)}` : 'Not calculated',
                t18Classification.classification
              ]
            ]
          }
        },
        { 
          text: 'Interpretation:', 
          style: 'sectionHeader', 
          margin: [0, 10, 0, 5] 
        },
        {
          text: t21Classification.screenResult === 'Screen Positive' || 
                t18Classification.screenResult === 'Screen Positive' ?
            'This screening result indicates an increased risk for chromosomal abnormalities. Diagnostic testing such as CVS or amniocentesis should be offered.' :
            'This screening result indicates a low risk for chromosomal abnormalities. Routine prenatal care is recommended.',
          margin: [0, 0, 0, 10]
        },
        { 
          text: 'Disclaimer: This is a screening test, not a diagnostic test. False positives and false negatives may occur. Diagnostic testing is recommended if clinically indicated.',
          style: 'disclaimer',
          fontSize: 8,
          italics: true
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 5, 0, 5] },
        disclaimer: { margin: [0, 10, 0, 0] }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  };

  if (!patientData.age || !serumData.freeBetaHCGMoM || !serumData.pappaMoM) {
    return (
      <div className="form-section">
        <h2>Risk Assessment</h2>
        <p>Complete all required fields to calculate risk.</p>
      </div>
    );
  }

  const backgroundRisk = calculateBackgroundRisk(patientData.age);
  const ntMoM = pregnancyData.nt && pregnancyData.gestationalAge ? 
    pregnancyData.nt / asianMedians.nt[pregnancyData.gestationalAge.days] : null;
  const adjustedRisk = calculateAdjustedRisk(
    backgroundRisk, 
    serumData.freeBetaHCGMoM, 
    serumData.pappaMoM, 
    ntMoM
  );
  
  const t21Classification = classifyRisk(adjustedRisk.t21, 't21');
  const t18Classification = classifyRisk(adjustedRisk.t18, 't18');

  return (
    <div className="form-section">
      <h2>Risk Assessment</h2>
      <div className="risk-table">
        <table>
          <thead>
            <tr>
              <th>Condition</th>
              <th>Background Risk</th>
              <th>Adjusted Risk</th>
              <th>Classification</th>
              <th>Screen Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Trisomy 21</td>
              <td>{backgroundRisk.t21 ? `1:${Math.round(1/backgroundRisk.t21)}` : '-'}</td>
              <td>{adjustedRisk.t21 ? `1:${Math.round(1/adjustedRisk.t21)}` : '-'}</td>
              <td className={t21Classification.classification === 'High Risk' ? 'high-risk' : 'low-risk'}>
                {t21Classification.classification}
              </td>
              <td className={t21Classification.screenResult === 'Screen Positive' ? 'high-risk' : 'low-risk'}>
                {t21Classification.screenResult}
              </td>
            </tr>
            <tr>
              <td>Trisomy 18</td>
              <td>{backgroundRisk.t18 ? `1:${Math.round(1/backgroundRisk.t18)}` : '-'}</td>
              <td>{adjustedRisk.t18 ? `1:${Math.round(1/adjustedRisk.t18)}` : '-'}</td>
              <td className={t18Classification.classification === 'High Risk' ? 'high-risk' : 'low-risk'}>
                {t18Classification.classification}
              </td>
              <td className={t18Classification.screenResult === 'Screen Positive' ? 'high-risk' : 'low-risk'}>
                {t18Classification.screenResult}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="form-row" style={{ marginTop: '20px' }}>
        <button onClick={generatePDFReport}>Generate PDF Report</button>
      </div>
    </div>
  );
}

// Main App Component
function FTMSSApp() {
  const [patientData, setPatientData] = React.useState({});
  const [pregnancyData, setPregnancyData] = React.useState({});
  const [serumData, setSerumData] = React.useState({});

  return (
    <div className="app-container">
      <h1>First Trimester Maternal Serum Screening</h1>
      
      <PatientInfoForm 
        patientData={patientData} 
        setPatientData={setPatientData} 
      />
      
      <PregnancyDetailsForm 
        pregnancyData={pregnancyData} 
        setPregnancyData={setPregnancyData} 
      />
      
      <SerumMarkerForm 
        serumData={serumData} 
        setSerumData={setSerumData} 
        gestationalAge={pregnancyData.sampleCollectionGA || pregnancyData.gestationalAge} 
      />
      
      <RiskAssessment 
        patientData={patientData} 
        pregnancyData={pregnancyData} 
        serumData={serumData} 
      />
    </div>
  );
}

// Render the app
ReactDOM.render(<FTMSSApp />, document.getElementById('root'));
