import React, { useState } from 'react';

// ============================================
// CONFIGURATION - PASTE YOUR AIRTABLE TOKEN
// ============================================
const CONFIG = {
  AIRTABLE_API_KEY: 'patO6KUSCRJPO1EKU.1ef07c61c847be61b2bf768dc9ad1db0345bd44f4429ef2f8ec4ae47a902cfbb',
  AIRTABLE_BASE_ID: 'app0VxmxZ09GZ46AT',
  AIRTABLE_TABLE_NAME: 'Client Intake',
  WHATSAPP_NUMBER: '15853047825',
  WHATSAPP_MESSAGE: "Hey! I just filled out the intake form and I'm ready to get started 🚀",
};
// ============================================

const questions = [
  {
    id: 'businessName',
    type: 'text',
    question: "What's your business called?",
    placeholder: 'e.g. Acme Fitness',
    required: true,
  },
  {
    id: 'website',
    type: 'text',
    question: "What's your website?",
    subtext: "Don't have one? No problem — just skip this.",
    placeholder: 'https://yourwebsite.com',
    required: false,
  },
  {
    id: 'whatYouSell',
    type: 'textarea',
    question: 'What do you sell or who do you serve?',
    placeholder: 'e.g. Online fitness coaching for busy professionals',
    required: true,
  },
  {
    id: 'monthlyRevenue',
    type: 'options',
    question: "What's your current monthly revenue?",
    options: ['Under $5k/mo', '$5k-$10k/mo', '$10k-$25k/mo', '$25k-$50k/mo', '$50k-$100k/mo', '$100k+/mo'],
    required: true,
  },
  {
    id: 'metaAdsExperience',
    type: 'options',
    question: 'Have you run Meta ads before?',
    options: ['Currently running ads', 'Paused right now', "Tried before, didn't work", 'Never ran Meta ads'],
    required: true,
  },
  {
    id: 'monthlyAdBudget',
    type: 'options',
    question: 'What monthly ad budget are you working with?',
    options: ['Under $1k/mo', '$1k-$2.5k/mo', '$2.5k-$5k/mo', '$5k-$10k/mo', '$10k+/mo', 'Not sure yet'],
    required: true,
  },
  {
    id: 'mainGoal',
    type: 'options',
    question: "What's your main goal?",
    options: ['More leads', 'More online sales', 'More bookings', 'Brand awareness', 'All of the above'],
    required: true,
  },
  {
    id: 'anythingElse',
    type: 'textarea',
    question: 'Anything else we should know?',
    subtext: 'Timeline, challenges, specific goals — whatever helps.',
    placeholder: 'Optional but helpful...',
    required: false,
  },
  {
    id: 'email',
    type: 'email',
    question: "What's your email?",
    placeholder: 'you@example.com',
    required: true,
  },
  {
    id: 'whatsapp',
    type: 'tel',
    question: "What's your WhatsApp number?",
    subtext: "We'll reach out here to get started.",
    placeholder: '+1 234 567 8900',
    required: true,
  },
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const current = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;

  const handleOptionSelect = (option) => {
    setAnswers(prev => ({ ...prev, [current.id]: option }));
    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setInputValue('');
      }
    }, 200);
  };

  const handleInputSubmit = () => {
    if (current.required && !inputValue.trim()) return;
    setAnswers(prev => ({ ...prev, [current.id]: inputValue }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && current.type !== 'textarea') {
      e.preventDefault();
      handleInputSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setInputValue(answers[questions[currentQuestion - 1].id] || '');
    }
  };

  const submitToAirtable = async () => {
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
              'Business Name': answers.businessName || '',
              'Website': answers.website || '',
              'What They Sell': answers.whatYouSell || '',
              'Monthly Revenue': answers.monthlyRevenue || '',
              'Meta Ads Experience': answers.metaAdsExperience || '',
              'Monthly Ad Budget': answers.monthlyAdBudget || '',
              'Main Goal': answers.mainGoal || '',
              'Additional Notes': answers.anythingElse || '',
              'Preferred Contact': 'WhatsApp',
              'Email': answers.email || '',
              'WhatsApp': answers.whatsapp || '',
              'Submitted At': new Date().toISOString(),
              'Status': 'New',
            }
          }]
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error:', errorData);
      throw new Error('Failed to save');
    }
    return response.json();
  };

  const handleFinalSubmit = async () => {
    // Save the last answer first
    const finalAnswers = { ...answers, [current.id]: inputValue };
    setAnswers(finalAnswers);
    
    if (current.required && !inputValue.trim()) {
      setError('Please fill in this field');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitToAirtable();
      
      // Fire Meta Pixel Lead event
      if (window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: 'Client Intake Form',
          content_category: finalAnswers.mainGoal,
        });
      }
      
      // Redirect to WhatsApp
      const message = encodeURIComponent(CONFIG.WHATSAPP_MESSAGE);
      window.location.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again or message us directly on WhatsApp.');
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = current.required ? (current.type === 'options' ? answers[current.id] : inputValue.trim()) : true;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <a href="https://abnormalsocialmarketing.com" style={styles.logoLink}>
          <img src="/logo.jpg" alt="Abnormal Marketing" style={styles.logo} />
        </a>
      </header>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <main style={styles.main}>
        <div style={styles.questionContainer}>
          {/* Back Button */}
          {currentQuestion > 0 && (
            <button onClick={handleBack} style={styles.backButton}>
              ← Back
            </button>
          )}

          {/* Question Number */}
          <p style={styles.questionNumber}>
            {currentQuestion + 1} of {questions.length}
          </p>

          {/* Question Text */}
          <h1 style={styles.questionText}>{current.question}</h1>
          
          {current.subtext && (
            <p style={styles.subtext}>{current.subtext}</p>
          )}

          {/* Answer Input */}
          <div style={styles.answerContainer}>
            {current.type === 'options' ? (
              <div style={styles.optionsContainer}>
                {current.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    style={answers[current.id] === option ? styles.optionSelected : styles.option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : current.type === 'textarea' ? (
              <>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={current.placeholder}
                  style={styles.textarea}
                  rows={4}
                  autoFocus
                />
                <button
                  onClick={isLastQuestion ? handleFinalSubmit : handleInputSubmit}
                  disabled={current.required && !inputValue.trim()}
                  style={canProceed ? styles.continueButton : styles.continueButtonDisabled}
                >
                  {isLastQuestion ? (isSubmitting ? 'Submitting...' : 'Submit →') : 'Continue →'}
                </button>
              </>
            ) : (
              <>
                <input
                  type={current.type}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={current.placeholder}
                  style={styles.input}
                  autoFocus
                />
                {isLastQuestion ? (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={!canProceed || isSubmitting}
                    style={canProceed && !isSubmitting ? styles.continueButton : styles.continueButtonDisabled}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit & Chat on WhatsApp →'}
                  </button>
                ) : (
                  <button
                    onClick={handleInputSubmit}
                    disabled={current.required && !inputValue.trim()}
                    style={canProceed ? styles.continueButton : styles.continueButtonDisabled}
                  >
                    Continue →
                  </button>
                )}
                {!current.required && (
                  <button
                    onClick={() => {
                      setCurrentQuestion(prev => prev + 1);
                      setInputValue('');
                    }}
                    style={styles.skipButton}
                  >
                    Skip this question
                  </button>
                )}
              </>
            )}
          </div>

          {/* Error Message */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Press Enter hint */}
          {current.type !== 'options' && current.type !== 'textarea' && (
            <p style={styles.hint}>Press Enter ↵</p>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #f0f0f0',
  },
  logoLink: {
    display: 'inline-block',
  },
  logo: {
    height: '40px',
    width: 'auto',
  },
  progressContainer: {
    padding: '0 24px',
  },
  progressBar: {
    height: '3px',
    background: '#E8E8E8',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#0A0A0A',
    transition: 'width 0.4s ease',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  questionContainer: {
    width: '100%',
    maxWidth: '480px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#888888',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '24px',
    fontFamily: 'inherit',
  },
  questionNumber: {
    fontSize: '13px',
    color: '#888888',
    marginBottom: '8px',
    fontWeight: '500',
  },
  questionText: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: '700',
    color: '#0A0A0A',
    margin: '0 0 8px',
    lineHeight: '1.2',
  },
  subtext: {
    fontSize: '15px',
    color: '#888888',
    margin: '0 0 24px',
    lineHeight: '1.5',
  },
  answerContainer: {
    marginTop: '32px',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  option: {
    padding: '18px 20px',
    fontSize: '16px',
    fontWeight: '500',
    border: '2px solid #E8E8E8',
    borderRadius: '12px',
    background: '#FFFFFF',
    color: '#0A0A0A',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  optionSelected: {
    padding: '18px 20px',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #0A0A0A',
    borderRadius: '12px',
    background: '#0A0A0A',
    color: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  input: {
    width: '100%',
    padding: '18px 20px',
    fontSize: '18px',
    border: '2px solid #E8E8E8',
    borderRadius: '12px',
    background: '#FFFFFF',
    color: '#0A0A0A',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  textarea: {
    width: '100%',
    padding: '18px 20px',
    fontSize: '18px',
    border: '2px solid #E8E8E8',
    borderRadius: '12px',
    background: '#FFFFFF',
    color: '#0A0A0A',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'border-color 0.2s',
  },
  continueButton: {
    width: '100%',
    padding: '18px 24px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    background: '#0A0A0A',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '16px',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
  continueButtonDisabled: {
    width: '100%',
    padding: '18px 24px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#AAAAAA',
    background: '#E8E8E8',
    border: 'none',
    borderRadius: '12px',
    cursor: 'not-allowed',
    marginTop: '16px',
    fontFamily: 'inherit',
  },
  skipButton: {
    width: '100%',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#888888',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: 'inherit',
  },
  error: {
    padding: '16px',
    background: 'rgba(226, 75, 74, 0.1)',
    border: '1px solid rgba(226, 75, 74, 0.3)',
    borderRadius: '12px',
    color: '#E24B4A',
    fontSize: '14px',
    marginTop: '16px',
  },
  hint: {
    fontSize: '13px',
    color: '#CCCCCC',
    marginTop: '16px',
    textAlign: 'center',
  },
};

export default App;
