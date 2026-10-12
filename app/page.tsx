"use client";

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaTelegramPlane, FaLinkedin, FaInstagram } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Navbar from "./components/navbar";
import HeroBackground from "./components/hero-background";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7221";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [contactForm, setContactForm] = useState({
    fullName: '', email: '', phoneNumber: '', subject: '', message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const [faqs, setFaqs] = useState<Array<{
    id: number; question: string; answer: string; category: string; displayOrder: number;
  }>>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [faqsError, setFaqsError] = useState('');

  const [reviews, setReviews] = useState<Array<{
    id: number; clientName: string; review: string; rating: number;
    isApproved: boolean; createdAt: string;
  }>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const [categories, setCategories] = useState<Array<{
    id: number; name: string; description: string;
  }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/FAQ`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setFaqs(result.data.sort((a: { displayOrder: number }, b: { displayOrder: number }) => a.displayOrder - b.displayOrder));
        } else { setFaqsError('Failed to load FAQs'); }
      })
      .catch(() => setFaqsError('Failed to load FAQs. Please check your connection.'))
      .finally(() => setFaqsLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/Review`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setReviews(result.data.data.filter((r: { isApproved: boolean }) => r.isApproved));
        } else { setReviewsError('Failed to load reviews'); }
      })
      .catch(() => setReviewsError('Failed to load reviews. Please check your connection.'))
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/Category`)
      .then(res => res.json())
      .then(result => { if (result.success) setCategories(result.data); })
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    setContactSuccess(false);
    try {
      const response = await fetch(`${API_BASE}/api/Enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setContactSuccess(true);
        setContactForm({ fullName: '', email: '', phoneNumber: '', subject: '', message: '' });
      } else {
        setContactError(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setContactError('Failed to send message. Please check your connection.');
    } finally {
      setContactLoading(false);
    }
  };

  const contactInfo = [
  { icon: FaWhatsapp, label: 'WhatsApp', value: '+234 913 783 8525', href: 'https://wa.me/2349137838525', color: '#25D366' },
  { icon: MdEmail, label: 'Email', value: 'hello@neumalab.com', href: 'mailto:hello@neumalab.com', color: '#EA4335' },
  { icon: FaTelegramPlane, label: 'Telegram', value: '@neumalab', href: 'https://t.me/neumalab', color: '#0088cc' },
  { icon: FaLinkedin, label: 'LinkedIn', value: 'NeumaLab', href: 'https://linkedin.com/company/neumalab', color: '#0A66C2' },
  { icon: FaInstagram, label: 'Instagram', value: '@neumalab.ng', href: 'https://instagram.com/neumalab.ng', color: '#E4405F' },
  ];

  const createSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const fluid = {
    pagePadding: 'clamp(16px, 4vw, 80px)',
    heroHeight: 'clamp(500px, 92vh, 900px)',
    headline: 'clamp(32px, 5vw, 80px)',
    sectionTitle: 'clamp(28px, 3.5vw, 52px)',
    eyebrow: 'clamp(10px, 0.8vw, 13px)',
    body: 'clamp(13px, 1vw, 17px)',
    cardWidth: 'clamp(260px, 25vw, 380px)',
    cardHeight: 'clamp(200px, 20vw, 320px)',
    logo: 'clamp(16px, 1.5vw, 28px)',
    menuText: 'clamp(18px, 2vw, 28px)',
    gap: 'clamp(8px, 1vw, 24px)',
    sectionPadding: 'clamp(40px, 6vw, 120px)',
  };

  return (
    <main style={{ overflowX: 'hidden' }}>

      {/* ==================== NAVBAR ==================== */}
      <Navbar />

      {/* ==================== HERO ==================== */}
      <section style={{
        position: 'relative', height: fluid.heroHeight, minHeight: '400px',
        overflow: 'hidden', display: 'flex', alignItems: 'center',
      }}>
        <HeroBackground />
        <div style={{ position: 'relative', zIndex: 2, padding: `0 ${fluid.pagePadding}`, width: 'min(90%, 1400px)', margin: '0 auto' }}>
          <p style={{ fontSize: fluid.eyebrow, letterSpacing: 'clamp(2px, 0.3vw, 4px)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 'clamp(12px, 1.5vw, 24px)', fontWeight: 400 }}>
            Architecture & Interior Design
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: fluid.headline, fontWeight: 300, color: '#fff', lineHeight: 1.08, marginBottom: 'clamp(16px, 2vw, 32px)', letterSpacing: '-0.02em', maxWidth: 'min(100%, 800px)' }}>
            Spaces that<br />tell your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>story.</em>
          </h1>
          <p style={{ fontSize: fluid.body, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, fontWeight: 300, maxWidth: 'min(100%, 560px)' }}>
            We design and build stunning residential and commercial spaces from concept to completion. Interior, exterior, and construction services tailored to your vision.
          </p>
        </div>
      </section>

      {/* ==================== ABOUT ==================== */}
      <section id="about" style={{ padding: `${fluid.sectionPadding} ${fluid.pagePadding}`, background: 'var(--warm)' }}>
        <div style={{ width: 'min(90%, 1200px)', margin: '0 auto', display: 'flex', gap: 'clamp(32px, 5vw, 80px)', alignItems: 'center', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px' }}>
            <div style={{ fontSize: fluid.eyebrow, letterSpacing: 'clamp(2px, 0.3vw, 4px)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 'clamp(8px, 1vw, 16px)', fontWeight: 400 }}>Who we are</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: fluid.sectionTitle, fontWeight: 300, color: 'var(--text)', lineHeight: 1.18, letterSpacing: '-0.02em', marginBottom: 'clamp(16px, 2vw, 28px)' }}>Designing spaces that inspire</h2>
            <p style={{ fontSize: fluid.body, color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300 }}>
              Neuma Lab was founded with a simple belief: every space has a story waiting to be told. We are a team of passionate architects and designers dedicated to transforming residential and commercial environments into places that reflect your personality, support your lifestyle, and stand the test of time.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section style={{ padding: `${fluid.sectionPadding} ${fluid.pagePadding}`, background: '#fff' }}>
        <div style={{ width: 'min(100%, 1400px)', margin: '0 auto' }}>
          <div style={{ fontSize: fluid.eyebrow, letterSpacing: 'clamp(2px, 0.3vw, 4px)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 'clamp(8px, 1vw, 16px)', fontWeight: 400 }}>Browse by category</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: fluid.sectionTitle, fontWeight: 300, color: 'var(--text)', lineHeight: 1.18, letterSpacing: '-0.02em', marginBottom: 'clamp(24px, 3vw, 48px)' }}>Find the service you&apos;re looking for</h2>
          {categoriesLoading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading categories...</div>}
          {!categoriesLoading && categories.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No categories available.</div>}
          <div style={{ display: 'flex', gap: fluid.gap, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 'clamp(12px, 1.5vw, 24px)', scrollbarWidth: 'none' }}>
            <style>{`div::-webkit-scrollbar{display:none}`}</style>
            {categories.map((category, index) => (
              <a key={category.id} href={`/services?category=${createSlug(category.name)}`} style={{ flex: '0 0 auto', width: fluid.cardWidth, height: fluid.cardHeight, borderRadius: 'clamp(4px, 0.5vw, 8px)', overflow: 'hidden', position: 'relative', cursor: 'pointer', border: '0.5px solid var(--border)', scrollSnapAlign: 'start', textDecoration: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, background: index % 3 === 0 ? 'linear-gradient(145deg, #2a1f14, #4a3520)' : index % 3 === 1 ? 'linear-gradient(145deg, #14201a, #253d2e)' : 'linear-gradient(145deg, #1a1620, #2e2540)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(16px, 2vw, 32px)' }}>
                  <div style={{ fontSize: fluid.eyebrow, letterSpacing: 'clamp(2px, 0.3vw, 4px)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 'clamp(4px, 0.5vw, 10px)' }}>Category</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(18px, 2vw, 32px)', fontWeight: 300, color: '#fff', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>{category.name}</div>
                  <div style={{ fontSize: 'clamp(10px, 0.9vw, 14px)', color: 'rgba(255,255,255,0.5)' }}>{category.description.length > 60 ? category.description.substring(0, 60) + '...' : category.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== REVIEWS ==================== */}
      <section id="reviews" style={{ padding: `${fluid.sectionPadding} ${fluid.pagePadding}`, background: 'var(--warm)' }}>
        <div style={{ width: 'min(100%, 1400px)', margin: '0 auto' }}>
          <div style={{ fontSize: fluid.eyebrow, letterSpacing: 'clamp(2px, 0.3vw, 4px)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 'clamp(8px, 1vw, 16px)', fontWeight: 400 }}>Client reviews</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: fluid.sectionTitle, fontWeight: 300, color: 'var(--text)', lineHeight: 1.18, letterSpacing: '-0.02em', marginBottom: 'clamp(32px, 4vw, 60px)' }}>What our clients say</h2>
          {reviewsLoading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading reviews...</div>}
          {reviewsError && <div style={{ background: '#ffebee', border: '0.5px solid #ef5350', borderRadius: '4px', padding: '16px', color: '#c62828', textAlign: 'center' }}>{reviewsError}</div>}
          {!reviewsLoading && !reviewsError && reviews.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No reviews yet. Be the first to share your experience!</div>}
          {!reviewsLoading && !reviewsError && reviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 30vw, 380px), 1fr))', gap: fluid.gap }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: '6px', padding: 'clamp(20px, 2.5vw, 36px)' }}>
                  <div style={{ color: 'var(--gold)', fontSize: 'clamp(10px, 1vw, 14px)', marginBottom: 'clamp(10px, 1.5vw, 18px)', letterSpacing: '2px' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(14px, 1.3vw, 18px)', color: 'var(--text)', lineHeight: 1.7, marginBottom: 'clamp(16px, 2vw, 28px)', fontStyle: 'italic', fontWeight: 300 }}>
                    &ldquo;{review.review}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 14px)' }}>
                    <div style={{ width: 'clamp(32px, 3vw, 44px)', height: 'clamp(32px, 3vw, 44px)', borderRadius: '50%', background: 'var(--warm)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(10px, 1vw, 14px)', fontWeight: 500, color: 'var(--gold)', flexShrink: 0 }}>
                      {review.clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 'clamp(12px, 1vw, 15px)', fontWeight: 500, color: 'var(--text)' }}>{review.clientName}</div>
                      <div style={{ fontSize: 'clamp(11px, 0.9vw, 13px)', color: 'var(--muted)' }}>Verified Client</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section id="faq" style={{ padding: `${fluid.sectionPadding} ${fluid.pagePadding}`, background: '#fff' }}>
        <div style={{ width: 'min(100%, 800px)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 4vw, 60px)' }}>
            <div style={{ fontSize: fluid.eyebrow, letterSpacing: 'clamp(2px, 0.3vw, 4px)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 'clamp(8px, 1vw, 16px)', fontWeight: 400 }}>Common questions</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: fluid.sectionTitle, fontWeight: 300, color: 'var(--text)', lineHeight: 1.18, letterSpacing: '-0.02em' }}>Frequently asked questions</h2>
          </div>
          {faqsLoading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading FAQs...</div>}
          {faqsError && <div style={{ background: '#ffebee', border: '0.5px solid #ef5350', borderRadius: '4px', padding: '16px', color: '#c62828', textAlign: 'center' }}>{faqsError}</div>}
          {!faqsLoading && !faqsError && faqs.map((faq, index) => (
            <div key={faq.id} style={{ borderBottom: '0.5px solid var(--border)', padding: 'clamp(16px, 2vw, 24px) 0', cursor: 'pointer' }}>
              <div onClick={() => setOpenFaq(openFaq === index ? null : index)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(16px, 1.5vw, 20px)', fontWeight: 400, color: 'var(--text)' }}>{faq.question}</span>
                <div style={{ width: 'clamp(20px, 2vw, 28px)', height: 'clamp(20px, 2vw, 28px)', border: '0.5px solid', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(12px, 1.2vw, 16px)', flexShrink: 0, transition: 'all 0.2s', color: openFaq === index ? '#fff' : 'var(--muted)', background: openFaq === index ? 'var(--gold)' : 'transparent', borderColor: openFaq === index ? 'var(--gold)' : 'var(--border)' }}>
                  {openFaq === index ? '−' : '+'}
                </div>
              </div>
              <div style={{ fontSize: fluid.body, color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300, maxHeight: openFaq === index ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease, padding 0.2s', paddingTop: openFaq === index ? 'clamp(10px, 1.5vw, 16px)' : '0' }}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CONTACT ==================== */}
      <section id="contact" style={{ padding: `${fluid.sectionPadding} ${fluid.pagePadding}`, background: 'var(--warm2)' }}>
        <div style={{ width: 'min(90%, 1200px)', margin: '0 auto', display: 'flex', gap: 'clamp(32px, 5vw, 80px)', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 min(100%, 400px)' }}>
            <div style={{ fontSize: fluid.eyebrow, letterSpacing: 'clamp(2px, 0.3vw, 4px)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 'clamp(8px, 1vw, 16px)', fontWeight: 400 }}>Get in touch</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3vw, 42px)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.18, letterSpacing: '-0.02em', marginBottom: 'clamp(16px, 2vw, 24px)' }}>We&apos;d love to hear about your project</h2>
            <p style={{ fontSize: fluid.body, color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300, marginBottom: 'clamp(24px, 3vw, 40px)' }}>Have a question or ready to start? Reach out and we&apos;ll get back to you within 24 hours.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2vw, 24px)' }}>
              {contactInfo.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 14px)' }}>
                    <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                      <IconComponent size={20} strokeWidth={1.5} />
                    </span>
                    <div>
                      <div style={{ fontSize: 'clamp(10px, 0.8vw, 12px)', letterSpacing: '1px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</div>
                      <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: fluid.body, color: 'var(--text)', fontWeight: 400, textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = item.color; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                      >{item.value}</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleContactSubmit} style={{ flex: '1 1 min(100%, 500px)', background: '#fff', border: '0.5px solid var(--border)', borderRadius: '6px', padding: 'clamp(24px, 3vw, 40px)' }}>
            {contactSuccess && <div style={{ background: '#e8f5e9', border: '0.5px solid #4caf50', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontSize: fluid.body, color: '#2e7d32' }}>✓ Message sent successfully! We&apos;ll get back to you soon.</div>}
            {contactError && <div style={{ background: '#ffebee', border: '0.5px solid #ef5350', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontSize: fluid.body, color: '#c62828' }}>✗ {contactError}</div>}
            {[
              { label: 'Full Name *', name: 'fullName', type: 'text', placeholder: 'Your full name', required: true },
              { label: 'Email *', name: 'email', type: 'email', placeholder: 'your@email.com', required: true },
              { label: 'Phone Number', name: 'phoneNumber', type: 'tel', placeholder: '+234 801 234 5678', required: false },
              { label: 'Subject', name: 'subject', type: 'text', placeholder: 'What is this about?', required: false },
            ].map((field) => (
              <div key={field.name} style={{ marginBottom: 'clamp(16px, 2vw, 24px)' }}>
                <label style={{ display: 'block', fontSize: 'clamp(11px, 0.9vw, 13px)', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{field.label}</label>
                <input type={field.type} name={field.name} value={contactForm[field.name as keyof typeof contactForm]} onChange={handleContactChange} required={field.required} placeholder={field.placeholder}
                  style={{ width: '100%', padding: 'clamp(10px, 1.2vw, 14px) clamp(12px, 1.5vw, 16px)', border: '0.5px solid var(--border)', borderRadius: '3px', fontSize: fluid.body, fontFamily: "'Outfit', sans-serif", color: 'var(--text)', background: 'var(--warm)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 'clamp(16px, 2vw, 24px)' }}>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 0.9vw, 13px)', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Message *</label>
              <textarea name="message" value={contactForm.message} onChange={handleContactChange} required placeholder="Tell us about your project..." rows={4}
                style={{ width: '100%', padding: 'clamp(10px, 1.2vw, 14px) clamp(12px, 1.5vw, 16px)', border: '0.5px solid var(--border)', borderRadius: '3px', fontSize: fluid.body, fontFamily: "'Outfit', sans-serif", color: 'var(--text)', background: 'var(--warm)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={contactLoading} style={{ width: '100%', padding: 'clamp(12px, 1.5vw, 16px)', background: contactLoading ? 'var(--muted)' : 'var(--gold)', border: 'none', borderRadius: '3px', color: '#fff', fontSize: fluid.body, fontWeight: 500, cursor: contactLoading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.4px', transition: 'background 0.2s' }}>
              {contactLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ background: '#0d0b09', padding: `${fluid.sectionPadding} ${fluid.pagePadding} clamp(24px, 3vw, 40px)` }}>
        <div style={{ width: 'min(100%, 1400px)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 20vw, 280px), 1fr))', gap: 'clamp(24px, 3vw, 48px)', marginBottom: 'clamp(32px, 4vw, 60px)' }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(18px, 1.8vw, 24px)', color: '#fff', marginBottom: 'clamp(8px, 1vw, 14px)', fontWeight: 400 }}>Neuma<span style={{ color: 'var(--gold)' }}>Lab</span></div>
              <p style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: '#444', lineHeight: 1.75, fontWeight: 300, maxWidth: '280px' }}>Designing and building spaces that inspire, function beautifully, and stand the test of time.</p>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(9px, 0.8vw, 11px)', letterSpacing: '2.5px', color: '#333', textTransform: 'uppercase', marginBottom: 'clamp(12px, 1.5vw, 20px)' }}>Services</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 12px)', padding: 0, margin: 0 }}>
                {['Interior Design', 'Exterior Design', 'Construction', 'Space Planning', 'Consultation'].map((item, i) => (
                  <li key={i}><a href="/services" style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: '#444', textDecoration: 'none', fontWeight: 300 }}>{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(9px, 0.8vw, 11px)', letterSpacing: '2.5px', color: '#333', textTransform: 'uppercase', marginBottom: 'clamp(12px, 1.5vw, 20px)' }}>Company</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 12px)', padding: 0, margin: 0 }}>
                {[{ name: 'About Us', href: '/#about' }, { name: 'Reviews', href: '/#reviews' }, { name: 'FAQ', href: '/#faq' }, { name: 'Contact', href: '/#contact' }].map((item, i) => (
                  <li key={i}><a href={item.href} style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: '#444', textDecoration: 'none', fontWeight: 300 }}>{item.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(9px, 0.8vw, 11px)', letterSpacing: '2.5px', color: '#333', textTransform: 'uppercase', marginBottom: 'clamp(12px, 1.5vw, 20px)' }}>Support</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 12px)', padding: 0, margin: 0 }}>
                {[{ name: 'Book a Service', href: '/services' }, { name: 'WhatsApp Us', href: 'https://wa.me/2349137838525' }, { name: 'Privacy Policy', href: '#' }].map((item, i) => (
                  <li key={i}><a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: '#444', textDecoration: 'none', fontWeight: 300 }}>{item.name}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '0.5px solid #1a1814', paddingTop: 'clamp(16px, 2vw, 28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: 'clamp(11px, 0.9vw, 13px)', color: '#333' }}>© 2026 NeumaLab. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}