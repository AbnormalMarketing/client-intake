import React, { useState } from 'react';

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CONFIG = {
  // Airtable - PASTE YOUR API TOKEN BELOW
  AIRTABLE_API_KEY: 'patO6KUSCRJPO1EKU.1ef07c61c847be61b2bf768dc9ad1db0345bd44f4429ef2f8ec4ae47a902cfbb',
  AIRTABLE_BASE_ID: 'app0VxmxZ09GZ46AT',
  AIRTABLE_TABLE_NAME: 'Client Intake',
  
  // WhatsApp redirect
  WHATSAPP_NUMBER: '15853047825',
  WHATSAPP_MESSAGE: "Hey! I just filled out the intake form and I'm ready to get started 🚀",
  
  // Email notifications (optional - set up later)
  EMAILJS_SERVICE_ID: '',
  EMAILJS_TEMPLATE_ID: '',
  EMAILJS_PUBLIC_KEY: '',
  NOTIFICATION_EMAIL: '',
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
    
    if (!response.ok) {
      throw new Error('Failed to save to Airtable');
    }
    
    return response.json();
  };

  const sendEmailNotification = async (data) => {
    // Using EmailJS for client-side email sending
    const emailData = {
      service_id: CONFIG.EMAILJS_SERVICE_ID,
      template_id: CONFIG.EMAILJS_TEMPLATE_ID,
      user_id: CONFIG.EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: CONFIG.NOTIFICATION_EMAIL,
        business_name: data.businessName,
        website: data.website,
        what_they_sell: data.whatYouSell,
        monthly_revenue: data.monthlyRevenue,
        meta_experience: data.metaAdsExperience,
        ad_budget: data.monthlyAdBudget,
        main_goal: data.mainGoal,
        notes: data.anythingElse || 'None',
        contact_method: data.contactMethod,
        email: data.email,
        whatsapp: data.whatsapp || 'Not provided',
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      console.warn('Email notification failed, but continuing...');
    }
  };

  const redirectToWhatsApp = () => {
    const message = encodeURIComponent(CONFIG.WHATSAPP_MESSAGE);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
    window.location.href = url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Submit to Airtable
      await submitToAirtable(formData);
      
      // Send email notification (don't block on failure)
      sendEmailNotification(formData).catch(console.warn);
      
      // Redirect to WhatsApp
      redirectToWhatsApp();
      
    } catch (err) {
      console.error('Submission error:', err);
      setError('Something went wrong. Please try again or message us directly on WhatsApp.');
      setIsSubmitting(false);
    }
  };

  const revenueOptions = [
    'Under $5,000/month',
    '$5,000 - $10,000/month',
    '$10,000 - $25,000/month',
    '$25,000 - $50,000/month',
    '$50,000 - $100,000/month',
    '$100,000+/month',
  ];

  const experienceOptions = [
    'Yes, currently running ads',
    'Yes, but paused right now',
    'Tried before, didn\'t work',
    'Never ran Meta ads',
  ];

  const budgetOptions = [
    'Under $1,000/month',
    '$1,000 - $2,500/month',
    '$2,500 - $5,000/month',
    '$5,000 - $10,000/month',
    '$10,000+/month',
    'Not sure yet',
  ];

  const goalOptions = [
    'More leads / inquiries',
    'More online sales',
    'More bookings / appointments',
    'Brand awareness',
    'All of the above',
  ];

  const contactOptions = [
    'WhatsApp',
    'Email',
    'Both',
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#0A0A0A"/>
            <path d="M12 28V12C12 12 16 12 20 20C24 12 28 12 28 12V28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="30" cy="12" r="2.5" fill="#2B5CE6"/>
          </svg>
          <span style={styles.logoText}>Abnormal Marketing</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.formCard}>
          {/* Welcome Section */}
          <div style={styles.welcomeSection}>
            <h1 style={styles.title}>Let's get started 🚀</h1>
            <p style={styles.subtitle}>
              Fill out the form below so we can hit the ground running. 
              Takes about 2 minutes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Business Info */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>About your business</h2>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Business name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Acme Fitness"
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Website</label>
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
                  required
                  placeholder="e.g. Online fitness coaching for busy professionals"
                  rows={3}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Current monthly revenue *</label>
                <select
                  name="monthlyRevenue"
                  value={formData.monthlyRevenue}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select range</option>
                  {revenueOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ads Experience */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Your ad experience</h2>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Have you run Meta ads before? *</label>
                <select
                  name="metaAdsExperience"
                  value={formData.metaAdsExperience}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select one</option>
                  {experienceOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Monthly ad budget *</label>
                <select
                  name="monthlyAdBudget"
                  value={formData.monthlyAdBudget}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select range</option>
                  {budgetOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main goal *</label>
                <select
                  name="mainGoal"
                  value={formData.mainGoal}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select your priority</option>
                  {goalOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Anything else we should know?</label>
                <textarea
                  name="anythingElse"
                  value={formData.anythingElse}
                  onChange={handleChange}
                  placeholder="Timeline, specific challenges, goals, etc."
                  rows={3}
                  style={styles.textarea}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>How to reach you</h2>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Preferred contact method *</label>
                <select
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select one</option>
                  {contactOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>WhatsApp number</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Connect on WhatsApp →'}
            </button>

            <p style={styles.note}>
              After submitting, you'll be redirected to WhatsApp to start the conversation.
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Abnormal Marketing LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 24px',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-secondary)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  main: {
    flex: 1,
    padding: '40px 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: '560px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-primary)',
    padding: '40px',
  },
  welcomeSection: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  input: {
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  error: {
    padding: '12px 16px',
    background: 'rgba(226, 75, 74, 0.1)',
    border: '1px solid rgba(226, 75, 74, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-error)',
    fontSize: '14px',
  },
  submitButton: {
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--brand-white)',
    background: 'var(--brand-blue)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'transform 0.1s, opacity 0.2s',
  },
  note: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    textAlign: 'center',
  },
  footer: {
    padding: '20px 24px',
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    borderTop: '1px solid var(--border-secondary)',
  },
};

export default App;
