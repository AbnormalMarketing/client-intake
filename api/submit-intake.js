export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN env var is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const body = req.body || {};

  const fields = {
    'First Name':          body.first_name     || '',
    'Email':               body.email          || '',
    'WhatsApp':            body.whatsapp       || '',
    'Meta Ads Experience': body.ads_experience || '',
    'Monthly Ad Budget':   body.ad_budget      || '',
    'Tier':                body.tier           || '',
    'What They Sell':      body.what_you_sell  || '',
    'Offer Price':         body.offer_price    || '',
    'Start Timing':        body.start_timing   || '',
    'Website':             body.website        || '',
    'Instagram':           body.instagram      || '',
    'Ideal Customer':      body.ideal_customer || '',
    'Preferred Contact':   'WhatsApp',
    'Submitted At':        new Date().toISOString(),
    'Status':              'New',
  };

  try {
    const airtableRes = await fetch(
      'https://api.airtable.com/v0/app0VxmxZ09GZ46AT/Applications',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
      }
    );

    if (!airtableRes.ok) {
      const errBody = await airtableRes.text();
      console.error(`Airtable error ${airtableRes.status}:`, errBody);
      return res.status(airtableRes.status).json({
        error: `Airtable rejected the record (HTTP ${airtableRes.status})`,
        details: errBody,
      });
    }

    const data = await airtableRes.json();
    return res.status(200).json({ id: data.records[0].id });
  } catch (err) {
    console.error('submit-intake error:', err);
    return res.status(500).json({ error: 'Could not reach Airtable' });
  }
}
