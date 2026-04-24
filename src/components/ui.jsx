import { useState } from 'react'

import ingoChat from '../assets/mascot/ingo/ingo-chat.png'
import ingoGames from '../assets/mascot/ingo/ingo-games.png'
import ingoHome from '../assets/mascot/ingo/ingo-home.png'
import ingoProduct from '../assets/mascot/ingo/ingo-product.png'
import ingoResult from '../assets/mascot/ingo/ingo-result.png'
import ingoScenarios from '../assets/mascot/ingo/ingo-scenarios.png'
import { getToneClass } from './theme'

const FAQ_FALLBACK =
  'Раздел помогает быстро схватить смысл продукта и перейти к своей ситуации.'

const MASCOT_VARIANTS = {
  home: {
    src: ingoHome,
    alt: 'Инго приветствует на главной странице',
  },
  chat: {
    src: ingoChat,
    alt: 'Инго помогает в чате',
  },
  product: {
    src: ingoProduct,
    alt: 'Инго помогает понять страховой продукт',
  },
  scenarios: {
    src: ingoScenarios,
    alt: 'Инго помогает выбрать подходящий сценарий',
  },
  result: {
    src: ingoResult,
    alt: 'Инго помогает понять результат',
  },
  games: {
    src: ingoGames,
    alt: 'Инго приглашает в обучающие игры',
  },
}

function ProductGlyph({ productKey }) {
  switch (productKey) {
    case 'accident':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M18 48 30 16l6 18 10-6-8 20H18Z" fill="currentColor" />
          <circle cx="46" cy="18" r="6" fill="currentColor" opacity="0.26" />
        </svg>
      )
    case 'travel':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M10 36h16l10 16h6l-4-16h10a4 4 0 0 0 0-8H38l4-16h-6L26 28H10a4 4 0 1 0 0 8Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'sport':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M26 12c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14Zm16 20c6 0 12 5 12 12v8H18v-4c0-9 7-16 16-16h8Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'event':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M18 16h28a6 6 0 0 1 6 6v8c-4 0-8 4-8 8s4 8 8 8v6a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6v-6c4 0 8-4 8-8s-4-8-8-8v-8a6 6 0 0 1 6-6Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'digital':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="16" y="12" width="32" height="40" rx="10" fill="currentColor" />
          <rect x="24" y="20" width="16" height="2" rx="1" fill="white" opacity="0.7" />
          <circle cx="32" cy="42" r="4" fill="white" opacity="0.9" />
        </svg>
      )
    default:
      return null
  }
}

export function ScreenHeader({ title, subtitle }) {
  return (
    <header className="screen-header">
      <div className="screen-header-copy">
        <h1>{title}</h1>
        {subtitle ? <p className="screen-subtitle">{subtitle}</p> : null}
      </div>
    </header>
  )
}

export function Mascot({ compact = false, variant = 'home', alt, className = '' }) {
  const mascot = MASCOT_VARIANTS[variant] || MASCOT_VARIANTS.home

  return (
    <div className={`mascot ${compact ? 'compact' : ''} mascot-${variant} ${className}`.trim()}>
      <img className="mascot-image" src={mascot.src} alt={alt || mascot.alt} />
    </div>
  )
}

export function ProductCard({ product, onOpen }) {
  return (
    <article className={`product-card ${getToneClass(product.key)}`}>
      <div className="product-card-top">
        <div className="product-card-icon" aria-hidden="true">
          <ProductGlyph productKey={product.key} />
        </div>
        <span className="product-badge">{product.badge}</span>
      </div>
      <h3>{product.title}</h3>
      <p>{product.homeText}</p>
      <button className="text-link" type="button" onClick={onOpen}>
        Разберёмся, что делать →
      </button>
    </article>
  )
}

export function FAQSection({ items }) {
  const [openQuestion, setOpenQuestion] = useState(items[0]?.question || '')

  return (
    <section className="content-card faq-card">
      <div className="section-heading">
        <span className="section-kicker">Вопросы</span>
        <h2>Часто задаваемые вопросы</h2>
      </div>
      <div className="faq-list">
        {items.map((item) => {
          const isOpen = openQuestion === item.question

          return (
            <article className="faq-item" key={item.question}>
              <button
                className={isOpen ? 'faq-trigger active' : 'faq-trigger'}
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenQuestion((current) => (current === item.question ? '' : item.question))
                }
              >
                <h3>{item.question}</h3>
                <span className="faq-icon" aria-hidden="true">+</span>
              </button>
              <div className={isOpen ? 'faq-answer-shell open' : 'faq-answer-shell'} aria-hidden={!isOpen}>
                <div className="faq-answer-inner">
                  <p>{item.answer || FAQ_FALLBACK}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function CtaBlock({ onNext, onOther, onChat }) {
  return (
    <section className="cta-block">
      <button className="primary-button" type="button" onClick={onNext}>
        Что делать дальше
      </button>
      <button className="secondary-button" type="button" onClick={onOther}>
        Разобрать другую ситуацию
      </button>
      <button className="ghost-button" type="button" onClick={onChat}>
        Спросить Инго
      </button>
    </section>
  )
}
