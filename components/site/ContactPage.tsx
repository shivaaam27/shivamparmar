'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/track';
import { tc } from '@/lib/title-case';
import { LOOP, THIN } from './Hero';
import { ArrowUR } from './Art';

type Phone = { label: string; tel: string; wa: string };

/**
 * The contact page (docs/SITE.md, "Contact"): one full screen on the deep green with the loop line. The headline,
 * the email large, then the ways to reach out as large tiles (WhatsApp, call, email); a row of topics that opens
 * WhatsApp with a first line already written; the profiles, where Shivo Labs is and the time there now.
 */
export default function ContactPage({ headline, email, phone, location, profiles, topics }: {
  headline: [string, string]; email: string; phone: Phone; location: string;
  profiles: { label: string; href: string }[]; topics: string[];
}) {
  const [drawn, setDrawn] = useState(false);
  const [time, setTime] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dar_es_Salaam' });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, []);

  const hello = topic ? `Hi Shivo Labs, I'd like help with ${topic.toLowerCase()}.` : 'Hi Shivo Labs, ';
  const wa = `https://wa.me/${phone.wa}?text=${encodeURIComponent(hello)}`;
  const mail = `mailto:${email}${topic ? `?subject=${encodeURIComponent(tc(topic))}` : ''}`;

  return (
    <section className={`v2-ct v2-dark${drawn ? ' is-drawn' : ''}`} aria-labelledby="contact-title">
      <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path className="v2-hloop__thin" d={THIN} pathLength={1} />
        <path className="v2-hloop__base" d={LOOP} pathLength={1} />
      </svg>
      <div className="v2-ct__in">
        <div className="v2-ct__head">
          <p className="v2-ct__k">Contact</p>
          <h1 id="contact-title" className="v2-ct__title">{tc(headline[0])} <em>{tc(headline[1], { start: false })}</em></h1>
        </div>

        <div className="v2-ct__topics">
          <p className="v2-ct__label" id="ct-topic">What is it about?</p>
          <div className="v2-ct__chips" role="group" aria-labelledby="ct-topic">
            {topics.map((t) => (
              <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(topic === t ? null : t)}>{tc(t)}</button>
            ))}
          </div>
        </div>

        <ul className="v2-ct__ways">
          {/* one number, written once: it is the call and the WhatsApp */}
          <li className="v2-ct__way">
            <p className="v2-ct__wk">Phone</p>
            <p className="v2-ct__wv">{phone.label}</p>
            <p className="v2-ct__links">
              <a className="v2-btn" href={wa} target="_blank" rel="noopener" onClick={() => track('Contact · page WhatsApp')}>WhatsApp<span className="v2-btn__dot"><ArrowUR /></span></a>
              <a className="v2-btn" href={`tel:${phone.tel}`} onClick={() => track('Contact · page call')}>Call<span className="v2-btn__dot"><ArrowUR /></span></a>
            </p>
            <p className="v2-ct__wn">{topic ? `WhatsApp opens with: "${hello}"` : `Message any time. It is ${time || '…'} in Dar es Salaam now.`}</p>
          </li>
          <li className="v2-ct__way">
            <p className="v2-ct__wk">Email</p>
            <p className="v2-ct__wv">{email}</p>
            <p className="v2-ct__links">
              <a className="v2-btn" href={mail} onClick={() => track('Contact · page email')}>Write an email<span className="v2-btn__dot"><ArrowUR /></span></a>
            </p>
            <p className="v2-ct__wn">{topic ? `Subject: ${tc(topic)}` : 'For quotes and longer questions.'}</p>
          </li>
        </ul>

        <div className="v2-ct__foot">
          <p><span className="v2-ct__label">Based in</span>{location} · working with people anywhere, in person or online</p>
          <p className="v2-ct__profiles">
            {profiles.map((p) => <a key={p.href} href={p.href} target="_blank" rel="noopener me">{p.label} <ArrowUR /></a>)}
          </p>
        </div>
      </div>
    </section>
  );
}
