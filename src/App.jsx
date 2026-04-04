import React, { useState } from 'react';

// ============================================
// CONFIGURATION - UPDATE YOUR API TOKEN
// ============================================
const CONFIG = {
  AIRTABLE_API_KEY: 'patO6KUSCRJPO1EKU.1ef07c61c847be61b2bf768dc9ad1db0345bd44f4429ef2f8ec4ae47a902cfbb',
  AIRTABLE_BASE_ID: 'app0VxmxZ09GZ46AT',
  AIRTABLE_TABLE_NAME: 'Client Intake',
  WHATSAPP_NUMBER: '15853047825',
  WHATSAPP_MESSAGE: "Hey! I just filled out the intake form and I'm ready to get started 🚀",
};
// ============================================

function App() {
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    whatYouSell: '',
    monthlyRevenue: '',
    metaAdsExperience: '',
    monthlyAdBudget: '',
    mainGoal: '',
    anythingElse: '',
    contactMethod: '',
    email: '',
    whatsapp: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitToAirtable = async (data) => {
    const response = await fetch(
      `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Business Name': data.businessName,
              'Website': data.website,
              'What They Sell': data.whatYouSell,
              'Monthly Revenue': data.monthlyRevenue,
              'Meta Ads Experience': data.metaAdsExperience,
              'Monthly Ad Budget': data.monthlyAdBudget,
              'Main Goal': data.mainGoal,
              'Additional Notes': data.anythingElse,
              'Preferred Contact': data.contactMethod,
              'Email': data.email,
              'WhatsApp': data.whatsapp,
              'Submitted At': new Date().toISOString(),
              'Status': 'New',
            }
          }]
        }),
      }
    );
    
    if (!response.ok) throw new Error('Failed to save');
    return response.json();
  };

  const redirectToWhatsApp = () => {
    // Fire Meta Pixel Lead event
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: 'Client Intake Form',
        content_category: formData.mainGoal,
        value: formData.monthlyAdBudget,
      });
    }
    const message = encodeURIComponent(CONFIG.WHATSAPP_MESSAGE);
    window.location.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitToAirtable(formData);
      redirectToWhatsApp();
    } catch (err) {
      setError('Something went wrong. Please try again or message us directly on WhatsApp.');
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const canProceedStep1 = formData.businessName && formData.whatYouSell && formData.monthlyRevenue;
  const canProceedStep2 = formData.metaAdsExperience && formData.monthlyAdBudget && formData.mainGoal;
  const canSubmit = formData.email && formData.contactMethod;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <a href="https://abnormalsocialmarketing.com" style={styles.logoLink}>
          <svg width="48" height="40" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="70" r="18" fill="#4285F4"/>
            <path d="M25 85C25 85 25 30 25 25C25 15 35 10 45 25C55 40 65 70 75 70C85 70 85 55 85 55L85 85" stroke="#0A0A0A" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M85 85L85 30C85 20 95 15 105 30L105 85" stroke="#0A0A0A" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </a>
      </header>

      {/* Hero Section */}
      <div style={styles.hero}>
        <p style={styles.eyebrow}>LET'S BUILD SOMETHING</p>
        <h1 style={styles.title}>Ready to Get Started?</h1>
        <p style={styles.subtitle}>
          Fill this out so we can hit the ground running. Takes about 2 minutes.
        </p>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(currentStep / 3) * 100}%` }} />
        </div>
        <div style={styles.progressLabels}>
          <span style={currentStep >= 1 ? styles.progressLabelActive : styles.progressLabel}>Your Business</span>
          <span style={currentStep >= 2 ? styles.progressLabelActive : styles.progressLabel}>Ad Experience</span>
          <span style={currentStep >= 3 ? styles.progressLabelActive : styles.progressLabel}>Contact Info</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Step 1: Business Info */}
        {currentStep === 1 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>Tell us about your business</h2>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Business name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Acme Fitness"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Website (optional)</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>What do you sell / who do you serve? *</label>
              <textarea
                name="whatYouSell"
                value={formData.whatYouSell}
                onChange={handleChange}
                placeholder="e.g. Online fitness coaching for busy professionals"
                rows={3}
                style={styles.textarea}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Current monthly revenue *</label>
              <div style={styles.optionGrid}>
                {['Under $5k/mo', '$5k-$10k/mo', '$10k-$25k/mo', '$25k-$50k/mo', '$50k-$100k/mo', '$100k+/mo'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, monthlyRevenue: opt }))}
                    style={formData.monthlyRevenue === opt ? styles.optionSelected : styles.option}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceedStep1}
              style={canProceedStep1 ? styles.primaryButton : styles.primaryButtonDisabled}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Ad Experience */}
        {currentStep === 2 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>Your ad experience</h2>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Have you run Meta ads before? *</label>
              <div style={styles.optionGrid}>
                {['Currently running ads', 'Paused right now', 'Tried before, didn\'t work', 'Never ran Meta ads'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, metaAdsExperience: opt }))}
                    style={formData.metaAdsExperience === opt ? styles.optionSelected : styles.option}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Monthly ad budget *</label>
              <div style={styles.optionGrid}>
                {['Under $1k/mo', '$1k-$2.5k/mo', '$2.5k-$5k/mo', '$5k-$10k/mo', '$10k+/mo', 'Not sure yet'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, monthlyAdBudget: opt }))}
                    style={formData.monthlyAdBudget === opt ? styles.optionSelected : styles.option}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Main goal *</label>
              <div style={styles.optionGrid}>
                {['More leads', 'More online sales', 'More bookings', 'Brand awareness', 'All of the above'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mainGoal: opt }))}
                    style={formData.mainGoal === opt ? styles.optionSelected : styles.option}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Anything else we should know? (optional)</label>
              <textarea
                name="anythingElse"
                value={formData.anythingElse}
                onChange={handleChange}
                placeholder="Timeline, specific challenges, goals, etc."
                rows={3}
                style={styles.textarea}
              />
            </div>

            <div style={styles.buttonRow}>
              <button type="button" onClick={prevStep} style={styles.secondaryButton}>
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceedStep2}
                style={canProceedStep2 ? styles.primaryButton : styles.primaryButtonDisabled}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {currentStep === 3 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>How can we reach you?</h2>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Preferred contact method *</label>
              <div style={styles.optionGrid}>
                {['WhatsApp', 'Email', 'Both'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, contactMethod: opt }))}
                    style={formData.contactMethod === opt ? styles.optionSelected : styles.option}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>WhatsApp number (optional)</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                style={styles.input}
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.buttonRow}>
              <button type="button" onClick={prevStep} style={styles.secondaryButton}>
                ← Back
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                style={canSubmit && !isSubmitting ? styles.primaryButton : styles.primaryButtonDisabled}
              >
                {isSubmitting ? 'Submitting...' : 'Submit & Chat on WhatsApp →'}
              </button>
            </div>

            <p style={styles.note}>
              After submitting, you'll be redirected to WhatsApp to start the conversation.
            </p>
          </div>
        )}
      </form>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Abnormal Marketing LLC</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #f0f0f0',
  },
  logoLink: {
    display: 'inline-block',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 24px 40px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '2px',
    color: '#4285F4',
    marginBottom: '16px',
  },
  title: {
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontWeight: '700',
    color: '#0A0A0A',
    margin: '0 0 16px',
    lineHeight: '1.1',
  },
  subtitle: {
    fontSize: '18px',
    color: '#5F5E5A',
    margin: 0,
    lineHeight: '1.6',
  },
  progressContainer: {
    maxWidth: '500px',
    margin: '0 auto 40px',
    padding: '0 24px',
  },
  progressBar: {
    height: '4px',
    background: '#E8E8E8',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#0A0A0A',
    transition: 'width 0.3s ease',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#AAAAAA',
  },
  progressLabelActive: {
    fontSize: '12px',
    color: '#0A0A0A',
    fontWeight: '500',
  },
  form: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '0 24px 60px',
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0A0A0A',
    margin: '0 0 8px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0A0A0A',
  },
  input: {
    padding: '16px',
    fontSize: '16px',
    border: '2px solid #E8E8E8',
    borderRadius: '12px',
    background: '#FFFFFF',
    color: '#0A0A0A',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '16px',
    fontSize: '16px',
    border: '2px solid #E8E8E8',
    borderRadius: '12px',
    background: '#FFFFFF',
    color: '#0A0A0A',
    outline: 'none',
    resize: 'vertical',
    minHeight: '100px',
    transition: 'border-color 0.2s',
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
  },
  option: {
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: '2px solid #E8E8E8',
    borderRadius: '10px',
    background: '#FFFFFF',
    color: '#0A0A0A',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  optionSelected: {
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #0A0A0A',
    borderRadius: '10px',
    background: '#0A0A0A',
    color: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'center',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  primaryButton: {
    flex: 1,
    padding: '18px 32px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    background: '#0A0A0A',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.1s, background 0.2s',
  },
  primaryButtonDisabled: {
    flex: 1,
    padding: '18px 32px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#AAAAAA',
    background: '#E8E8E8',
    border: 'none',
    borderRadius: '12px',
    cursor: 'not-allowed',
  },
  secondaryButton: {
    padding: '18px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0A0A0A',
    background: 'transparent',
    border: '2px solid #E8E8E8',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  error: {
    padding: '16px',
    background: 'rgba(226, 75, 74, 0.1)',
    border: '1px solid rgba(226, 75, 74, 0.3)',
    borderRadius: '12px',
    color: '#E24B4A',
    fontSize: '14px',
  },
  note: {
    fontSize: '14px',
    color: '#888888',
    textAlign: 'center',
    marginTop: '8px',
  },
  footer: {
    padding: '24px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#AAAAAA',
    borderTop: '1px solid #f0f0f0',
  },
};

export default App;
