import { useEffect, useRef } from 'react'
import { C } from '../constants/colors'

export default function LegalModal({ type, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const isPrivacy = type === 'privacy'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 10001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.sf, borderRadius: 24, width: '100%', maxWidth: 620,
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          border: `1px solid ${C.bd}`,
          boxShadow: `0 40px 120px rgba(0,0,0,.8)`,
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {/* Sticky header */}
        <div style={{
          padding: '20px 26px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: `1px solid ${C.bd}`, flexShrink: 0,
        }}>
          <h2 id="legal-modal-title" style={{ fontSize: 18, fontWeight: 800, color: C.tx }}>
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            style={{ background: C.card, border: `1px solid ${C.bd}`, color: C.sub, width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 16 }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '24px 26px', overflowY: 'auto', fontSize: 13, color: C.sub, lineHeight: 1.9 }}>
          {isPrivacy ? <PrivacyContent /> : <TosContent />}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 26px', borderTop: `1px solid ${C.bd}`, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
              background: C.vG, color: C.vio, fontWeight: 800, cursor: 'pointer', fontSize: 14,
              fontFamily: "'Outfit',sans-serif",
            }}
          >Close</button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: C.tx, marginBottom: 8 }}>{title}</h3>
      {children}
    </div>
  )
}

function TosContent() {
  return (
    <>
      <p style={{ marginBottom: 20, color: C.dim, fontSize: 11 }}>Last updated: March 2026 · Version 1.0</p>

      <Section title="1. Eligibility">
        <p>You must be at least 18 years of age and reside in a jurisdiction where prediction markets are lawful to use VERD1CT. By accessing the platform you represent that you meet these requirements. VERD1CT reserves the right to geo-restrict access at any time without notice.</p>
      </Section>

      <Section title="2. Nature of the Service">
        <p>VERD1CT operates a peer-to-peer prediction market platform. Prices reflect the aggregate beliefs of participants and are not investment advice. All trading activity is speculative. You may lose the entire amount you stake.</p>
      </Section>

      <Section title="3. Account and Funds">
        <p>Your account balance is maintained by VERD1CT. Funds deposited are held in segregated accounts and are not used for operating expenses. Withdrawals are processed within the timeframes stated on the platform. VERD1CT does not pay interest on balances.</p>
      </Section>

      <Section title="4. Proof Mesh™ Resolution">
        <p>Markets are resolved by the Proof Mesh™ system: a combination of AI source monitoring, a randomly-selected panel of 500 verified jurors, and cryptographic attestation. The resolution is final and binding. In cases of genuine ambiguity, VERD1CT may declare a market void and return all stakes.</p>
      </Section>

      <Section title="5. Dispute Resolution">
        <p>Disputes must be filed within 48 hours of market resolution. VERD1CT will investigate and issue a ruling within 24 hours. If VERD1CT is found to have made an error, you will receive 2× the disputed amount as stated in the Dispute Guarantee. An independent ombudsman is available for escalated disputes.</p>
      </Section>

      <Section title="6. Prohibited Conduct">
        <p>You may not: (a) use automated tools to trade without prior written consent; (b) attempt to manipulate market prices; (c) create accounts on behalf of third parties; (d) use VERD1CT for money laundering or any unlawful purpose. Violations result in immediate account suspension and forfeiture of funds.</p>
      </Section>

      <Section title="7. Fees">
        <p>VERD1CT charges a flat 1% fee on each trade, deducted at execution. No other fees are charged. Withdrawal fees vary by method and are displayed before confirmation.</p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>VERD1CT's total liability to you for any claim shall not exceed the amount you have deposited in the prior 30 days. VERD1CT is not liable for loss of profits, loss of opportunity, or any indirect or consequential loss.</p>
      </Section>

      <Section title="9. Governing Law">
        <p>These terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved by binding arbitration. Class action waiver applies.</p>
      </Section>

      <Section title="10. Changes to Terms">
        <p>VERD1CT may update these terms at any time. Continued use of the platform after notice of changes constitutes acceptance. You will be notified of material changes by email or in-platform notification.</p>
      </Section>
    </>
  )
}

function PrivacyContent() {
  return (
    <>
      <p style={{ marginBottom: 20, color: C.dim, fontSize: 11 }}>Last updated: March 2026 · Version 1.0</p>

      <Section title="1. Data We Collect">
        <p>We collect: (a) account information you provide (name, email, date of birth, government ID for KYC); (b) transaction data (trades, deposits, withdrawals); (c) device and usage data (IP address, browser type, session duration); (d) communications you send to support.</p>
      </Section>

      <Section title="2. How We Use Your Data">
        <p>Your data is used to: operate your account; process transactions; verify identity and comply with AML/KYC obligations; improve the platform; send service communications; prevent fraud and abuse. We do not sell your personal data to third parties.</p>
      </Section>

      <Section title="3. Data Sharing">
        <p>We share data with: identity verification providers (Jumio, Persona); payment processors (Stripe, crypto on-ramp partners); regulatory authorities when required by law; analytics providers under data processing agreements. All third parties are contractually bound to protect your data.</p>
      </Section>

      <Section title="4. Your Rights">
        <p>Depending on your jurisdiction, you may have rights to: access your personal data; correct inaccurate data; request deletion (subject to legal retention requirements); object to processing; data portability. Submit requests to privacy@verd1ct.io.</p>
      </Section>

      <Section title="5. Data Retention">
        <p>Account data is retained for the duration of your account plus 7 years for regulatory compliance. Transaction records are retained for a minimum of 5 years per AML requirements. You may request deletion of non-regulated data at any time.</p>
      </Section>

      <Section title="6. Security">
        <p>We use AES-256 encryption at rest, TLS 1.3 in transit, and multi-factor authentication. We conduct regular penetration tests. In the event of a data breach affecting your personal data, we will notify you within 72 hours as required by GDPR.</p>
      </Section>

      <Section title="7. Cookies">
        <p>We use strictly necessary cookies for authentication and session management. We use analytics cookies (opt-in only) to understand platform usage. You can manage cookie preferences via the settings menu. We do not use third-party advertising cookies.</p>
      </Section>

      <Section title="8. Contact">
        <p>Data Controller: VERD1CT Inc. · privacy@verd1ct.io · For EU residents, our GDPR representative is reachable at eu-privacy@verd1ct.io.</p>
      </Section>
    </>
  )
}
