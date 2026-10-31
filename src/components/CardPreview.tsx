'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { Printer } from 'lucide-react';
import { receiptTotal, formatCardAmount } from '@/lib/cardDesign';
import type { CardDesign, Currency } from '@/lib/types';
import { CARD_PREVIEW_DEFAULTS } from '@/lib/constants';
import styles from './CardStudio.module.css';

interface Props { design: CardDesign; currency: Currency; onPrint: () => void; }
type CardStyle = CSSProperties & { '--accent': string; '--deep': string; '--leaf': string; '--paper': string; '--zoom': string };

// ─── TEMPLATE 1: FLORAL INVITATION (Reference Image 4) ────────────────────────
function FloralCard({ design }: { design: CardDesign }) {
  const f = design.fields;
  const eventName = f.eventTitle || CARD_PREVIEW_DEFAULTS.floral.eventTitle;
  const dateStr = f.eventDate || CARD_PREVIEW_DEFAULTS.floral.eventDate;
  const messageStr = f.message || CARD_PREVIEW_DEFAULTS.floral.message;

  return (
    <div className={`${styles.face} ${styles.floralFace}`}>
      {/* Watercolor Botanical Frame Elements */}
      <div className={styles.floralTopFrame} aria-hidden="true">
        <svg viewBox="0 0 400 180" className={styles.floralSvg} preserveAspectRatio="xMidYMin meet">
          <defs>
            <radialGradient id="flowerGrad1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F9A8B6" />
              <stop offset="60%" stopColor="#EE6983" />
              <stop offset="100%" stopColor="#A83C61" />
            </radialGradient>
            <radialGradient id="flowerGrad2" cx="40%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="70%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#C2410C" />
            </radialGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6E8E59" />
              <stop offset="100%" stopColor="#2D4A22" />
            </linearGradient>
          </defs>
          {/* Left floral spray */}
          <g transform="translate(10, 10)">
            <path d="M 0,20 Q 50,30 80,70 Q 110,110 120,160" stroke="#4A5D3B" strokeWidth="2.5" fill="none" />
            <ellipse cx="45" cy="35" rx="14" ry="7" transform="rotate(-25 45 35)" fill="url(#leafGrad)" />
            <ellipse cx="75" cy="65" rx="16" ry="8" transform="rotate(20 75 65)" fill="url(#leafGrad)" />
            <ellipse cx="105" cy="115" rx="15" ry="7" transform="rotate(45 105 115)" fill="url(#leafGrad)" />
            {/* Berries */}
            <circle cx="95" cy="50" r="4" fill="#7E1D38" />
            <circle cx="103" cy="56" r="4.5" fill="#A83C61" />
            <circle cx="88" cy="60" r="3.5" fill="#7E1D38" />
            {/* Large Rose bloom */}
            <circle cx="55" cy="85" r="34" fill="url(#flowerGrad1)" />
            <circle cx="55" cy="85" r="24" fill="#F472B6" opacity="0.8" />
            <circle cx="55" cy="85" r="14" fill="#FDF2F8" opacity="0.9" />
            <circle cx="55" cy="85" r="5" fill="#9D174D" />
            {/* Small peach bloom */}
            <circle cx="100" cy="85" r="16" fill="url(#flowerGrad2)" />
            <circle cx="100" cy="85" r="7" fill="#FEF3C7" />
          </g>
          {/* Right floral spray */}
          <g transform="translate(390, 10) scale(-1, 1)">
            <path d="M 0,20 Q 50,30 80,70 Q 110,110 120,160" stroke="#4A5D3B" strokeWidth="2.5" fill="none" />
            <ellipse cx="45" cy="35" rx="14" ry="7" transform="rotate(-25 45 35)" fill="url(#leafGrad)" />
            <ellipse cx="75" cy="65" rx="16" ry="8" transform="rotate(20 75 65)" fill="url(#leafGrad)" />
            <ellipse cx="105" cy="115" rx="15" ry="7" transform="rotate(45 105 115)" fill="url(#leafGrad)" />
            <circle cx="95" cy="50" r="4" fill="#7E1D38" />
            <circle cx="103" cy="56" r="4.5" fill="#A83C61" />
            <circle cx="55" cy="85" r="30" fill="url(#flowerGrad1)" />
            <circle cx="55" cy="85" r="20" fill="#F472B6" opacity="0.8" />
            <circle cx="55" cy="85" r="10" fill="#FDF2F8" />
          </g>
        </svg>
      </div>

      {/* Invitation Content Center */}
      <div className={styles.floralContent}>
        <div className={styles.floralHeadingGroup}>
          <p className={styles.floralSubheading}>You&apos;re invited</p>
          <div className={styles.floralDivider} />
        </div>

        <h2 className={styles.floralTitle}>{eventName}</h2>

        <div className={styles.floralDateBox}>
          <p className={styles.floralDate}>{dateStr.toUpperCase()}</p>
        </div>

        <p className={styles.floralMessage}>{messageStr}</p>
      </div>

      {/* Bottom Watercolor Bouquet */}
      <div className={styles.floralBottomFrame} aria-hidden="true">
        <svg viewBox="0 0 400 160" className={styles.floralSvg}>
          <g transform="translate(390, 150) scale(-1, -1)">
            <path d="M 0,20 Q 50,30 80,70 Q 110,110 120,150" stroke="#4A5D3B" strokeWidth="2.5" fill="none" />
            <ellipse cx="50" cy="40" rx="16" ry="8" transform="rotate(-30 50 40)" fill="url(#leafGrad)" />
            <ellipse cx="80" cy="75" rx="18" ry="9" transform="rotate(15 80 75)" fill="url(#leafGrad)" />
            <circle cx="65" cy="90" r="38" fill="url(#flowerGrad1)" />
            <circle cx="65" cy="90" r="26" fill="#F472B6" opacity="0.8" />
            <circle cx="65" cy="90" r="16" fill="#FFF1F2" />
            <circle cx="65" cy="90" r="6" fill="#831843" />
            <circle cx="115" cy="90" r="17" fill="url(#flowerGrad2)" />
            <circle cx="115" cy="90" r="8" fill="#FEF3C7" />
          </g>
          <g transform="translate(10, 150) scale(1, -1)">
            <ellipse cx="45" cy="35" rx="14" ry="7" transform="rotate(-25 45 35)" fill="url(#leafGrad)" />
            <circle cx="45" cy="70" r="24" fill="url(#flowerGrad1)" />
            <circle cx="45" cy="70" r="14" fill="#FCE7F3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

// ─── TEMPLATE 2: PREMIERE FOLDOUT TICKET (Reference Image 1) ───────────────────
function TicketCard({ design }: { design: CardDesign }) {
  const f = design.fields;
  const defaults = CARD_PREVIEW_DEFAULTS.ticket;
  const hosts = f.hostNames || defaults.hostNames;
  const dateVal = f.eventDate || defaults.eventDate;
  const venueVal = f.venue || defaults.venue;
  const dressCodeVal = f.dressCode || defaults.dressCode;
  const timeVal = f.eventTime || defaults.eventTime;
  const ticketLabel = f.ticketLabel || defaults.ticketLabel;

  return (
    <div className={styles.ticketWrapper}>
      {/* Top Wine Crimson Sleeve Flap Mockup (Image 1 top part) */}
      <div className={styles.ticketSleeve}>
        <div className={styles.ticketSleevePanel} />
        <div className={styles.ticketSleeveCenter}>
          <div className={styles.ticketSleeveScript}>{hosts}</div>
        </div>
        <div className={styles.ticketSleevePanel} />
      </div>

      {/* Main Scalloped Ticket Body */}
      <div className={`${styles.face} ${styles.ticketFace}`}>
        {/* Left Edge Vertical Tag */}
        <div className={styles.ticketLeftRotated}>
          <span>БИЛЕТ № 16+</span>
          <span>ВХОД ПО БИЛЕТУ</span>
        </div>

        {/* Main Section */}
        <div className={styles.ticketMain}>
          <p className={styles.ticketCurvedKicker}>{ticketLabel}</p>

          {/* Bride & Groom Silhouette Icon */}
          <div className={styles.ticketCoupleIcon} aria-hidden="true">
            <svg width="42" height="42" viewBox="0 0 64 64" fill="currentColor">
              <path d="M32 10a8 8 0 100 16 8 8 0 000-16zm-10 26c-4.4 0-8 3.6-8 8v8h36v-8c0-4.4-3.6-8-8-8H22z" opacity="0.3" />
              <path d="M26 14a6 6 0 1112 0 6 6 0 01-12 0zm-8 24a6 6 0 016-6h16a6 6 0 016 6v14H18V38z" />
              <circle cx="24" cy="18" r="4" fill="#721B29" />
              <circle cx="40" cy="18" r="4" fill="#721B29" />
            </svg>
          </div>

          <h2 className={styles.ticketScriptNames}>{hosts}</h2>
          <p className={styles.ticketMovieSub}>В главных ролях:<br /><em>«...их любовь оказалась ярче любого кино»</em></p>

          <div className={styles.ticketDetailsTable}>
            <div className={styles.ticketDetailRow}>
              <span className={styles.ticketHeart}>♥</span>
              <strong className={styles.ticketDetailLabel}>ДАТА:</strong>
              <span className={styles.ticketDetailValue}>{dateVal}</span>
            </div>
            <div className={styles.ticketDetailRow}>
              <span className={styles.ticketHeart}>♥</span>
              <strong className={styles.ticketDetailLabel}>МЕСТО ПОКАЗА:</strong>
              <span className={styles.ticketDetailValue}>{venueVal}</span>
            </div>
            <div className={styles.ticketDetailRow}>
              <strong className={styles.ticketDetailLabel} style={{ marginLeft: 16 }}>ДРЕСС-КОД:</strong>
              <span className={styles.ticketDetailValue} style={{ fontStyle: 'italic', fontFamily: 'serif' }}>{dressCodeVal}</span>
            </div>
          </div>
        </div>

        {/* Right Stub (with Perforated Line & QR Code) */}
        <div className={styles.ticketStub}>
          <div className={styles.ticketTimeLine}>
            <span>ВРЕМЯ СБОРА</span>
            <strong>{timeVal}</strong>
          </div>
          <div className={styles.ticketTimeLine}>
            <span>НАЧАЛО УЖИНА</span>
            <strong>18:00</strong>
          </div>

          {/* High Contrast Crimson QR Code Graphic */}
          <div className={styles.ticketQrContainer}>
            <div className={styles.ticketRealQr} aria-label="Ticket QR code">
              <div className={styles.qrCornerTl} />
              <div className={styles.qrCornerTr} />
              <div className={styles.qrCornerBl} />
              <div className={styles.qrCenterGrid} />
            </div>
          </div>

          <p className={styles.ticketStubNotice}>
            Сеанс один раз.<br />Впечатления навсегда!<br />
            <strong>До встречи на премьере!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 3: VIP ACCESS PASS / LANYARD BADGE (Reference Image 2) ───────────
function BadgeCard({ design }: { design: CardDesign }) {
  const f = design.fields;
  const defaults = CARD_PREVIEW_DEFAULTS.member;
  const brand = f.cardBrand || defaults.cardBrand;
  const name = f.hostNames || defaults.hostNames;
  const memberId = f.memberId || defaults.memberId;
  const perk = f.perk || defaults.perk;
  const message = f.message || defaults.message;
  const website = f.website || defaults.website;

  return (
    <div className={styles.badgeWrapper}>
      {/* Hanging Red Lanyard Ribbon & Swivel Clasp */}
      <div className={styles.lanyardTop} aria-hidden="true">
        <div className={styles.lanyardRibbon} />
        <div className={styles.lanyardRing} />
        <div className={styles.lanyardClasp}>
          <div className={styles.claspBody} />
          <div className={styles.claspHook} />
        </div>
      </div>

      {/* Main Laminate Card */}
      <div className={`${styles.face} ${styles.badgeFace}`}>
        {/* Badge Hole Punch Slot */}
        <div className={styles.badgePunchHole} />

        {/* Top Header & Monogram */}
        <div className={styles.badgeTopBar}>
          <div className={styles.badgeMonogram}>
            <span>VS</span>
          </div>
        </div>

        {/* VIP Access Cursive Script Title */}
        <div className={styles.badgeVipHeader}>
          <h2 className={styles.badgeVipScript}>vip Access</h2>
          <span className={styles.badgeSubBrand}>{brand}</span>
        </div>

        {/* Two Column Section: Portrait Box + Fields */}
        <div className={styles.badgeGridSection}>
          <div className={styles.badgePortraitBox}>
            {design.portraitDataUrl ? (
              <Image src={design.portraitDataUrl} alt="Portrait" width={180} height={180} unoptimized />
            ) : (
              <div className={styles.badgeSilhouette} />
            )}
          </div>

          <div className={styles.badgeFieldLines}>
            <div className={styles.badgeLine}>
              <strong className={styles.badgeVal}>{name}</strong>
              <small className={styles.badgeLbl}>NAME</small>
            </div>
            <div className={styles.badgeLine}>
              <strong className={styles.badgeVal}>{memberId}</strong>
              <small className={styles.badgeLbl}>MEMBER ID</small>
            </div>
            <div className={styles.badgeLine}>
              <strong className={styles.badgeVal}>{perk}</strong>
              <small className={styles.badgeLbl}>DISCOUNT / PERK</small>
            </div>
          </div>
        </div>

        {/* Centered Message Notice */}
        <p className={styles.badgeNoticeText}>{message}</p>

        {/* Red Barcode */}
        <div className={styles.badgeBarcodeWrap}>
          <div className={styles.badgeRedBarcode} />
          <span className={styles.badgeBarcodeNum}>{memberId}</span>
        </div>

        {/* Footer */}
        <div className={styles.badgeShopFooter}>
          SHOP NOW ON <strong>{website}</strong>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 4: THERMAL RECEIPT COLLAGE (Reference Image 3) ───────────────────
function ReceiptCard({ design, currency }: { design: CardDesign; currency: Currency }) {
  const f = design.fields;
  const defaults = CARD_PREVIEW_DEFAULTS.receipt;
  const storeName = f.receiptHeading || defaults.storeName;
  const dateStr = f.eventDate || defaults.eventDate;
  const cashierStr = f.venue ? `CASHIER: ${f.venue.slice(0, 8)}` : 'CASHIER: No. IIII';

  const rows = [
    { no: '01', item: f.receiptItem1 || defaults.item1, price: f.receiptPrice1 || defaults.price1 },
    { no: '02', item: f.receiptItem2 || defaults.item2, price: f.receiptPrice2 || defaults.price2 },
    { no: '03', item: f.receiptItem3 || defaults.item3, price: f.receiptPrice3 || defaults.price3, highlight: true },
    { no: '04', item: 'MOTION-SENSING EXTRA LOUD ALARM CLOCK', price: '85.00' },
    { no: '05', item: 'STAR-SHAPED EGG TART MOLD SET', price: '270.00' },
  ];

  return (
    <div className={styles.receiptWrapper}>
      {/* 3D Purple Binder Clip Top-Left */}
      <div className={styles.receiptBinderClip} aria-hidden="true">
        <div className={styles.clipWireLeft} />
        <div className={styles.clipWireRight} />
        <div className={styles.clipClampBody} />
      </div>

      {/* Purple Washi Tape Top-Right */}
      <div className={styles.receiptWashiTape} aria-hidden="true" />

      {/* Thermal Receipt Paper Body */}
      <div className={`${styles.face} ${styles.receiptFace}`}>
        {/* Header with Sparkles */}
        <div className={styles.receiptStoreHeader}>
          <span className={styles.receiptSparkleStar}>✦</span>
          <p className={styles.receiptWelcome}>WELCOME</p>
          <h2 className={styles.receiptMallTitle}>{storeName}</h2>
          <div className={styles.receiptSubTags}>
            <span>RECEIPT</span>
            <span className={styles.receiptHeartIcon}>♥</span>
            <span>RECEIPT</span>
          </div>
        </div>

        {/* Date & Cashier Line */}
        <div className={styles.receiptMetaLine}>
          <span>{dateStr}</span>
          <span>{cashierStr}</span>
        </div>

        {/* Items Table */}
        <div className={styles.receiptTableHeader}>
          <span>NO.</span>
          <span>ITEM</span>
          <span style={{ textAlign: 'right' }}>PRICE</span>
        </div>

        <div className={styles.receiptItemsList}>
          {rows.map((row, i) => (
            <div key={i} className={`${styles.receiptRowItem} ${row.highlight ? styles.receiptHighlightRow : ''}`}>
              <span className={styles.receiptNo}>{row.no}</span>
              <span className={styles.receiptDesc}>{row.item}</span>
              <span className={styles.receiptPrice}>{row.price}</span>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className={styles.receiptTotalBlock}>
          <div className={styles.receiptTotalRow}>
            <span>ITEM COUNT:</span>
            <strong>{rows.length}</strong>
          </div>
          <div className={styles.receiptTotalRow}>
            <span>TOTAL:</span>
            <strong>{formatCardAmount(receiptTotal(f) || defaults.defaultTotal, currency)}</strong>
          </div>
        </div>

        {/* Cute Shopping Stamp Sticker */}
        <div className={styles.receiptShoppingStamp} aria-hidden="true">
          <span>Shopping!</span>
          <small>❤❤❤</small>
        </div>

        {/* Barcode & Deepspace Footer */}
        <div className={styles.receiptBarcodeArea}>
          <div className={styles.receiptBarcodeLines} />
          <div className={styles.receiptHeartBrand}>
            <span>♥</span> <strong>LOVE AND DEEPSPACE</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCardSize(template: CardDesign['template']): string {
  return { floral: '5 × 7 in', badge: '3.5 × 5.5 in', receipt: '5 × 7 in', ticket: '7 × 3 in' }[template];
}

export default function CardPreview({ design, currency, onPrint }: Props) {
  const [zoom, setZoom] = useState(100);
  const style: CardStyle = {
    '--accent': design.colors.accent,
    '--deep': design.colors.deep,
    '--leaf': design.colors.leaf,
    '--paper': design.colors.paper,
    '--zoom': `${zoom / 100}`,
  };

  const cardClass = `${styles.card} ${design.layout === 'editorial' ? styles.layoutEditorial : ''} ${design.layout === 'compact' ? styles.layoutCompact : ''}`;

  return (
    <section id="card-studio-preview" className={styles.preview} role="tabpanel" aria-labelledby={`card-template-${design.template}`} aria-label="Card preview">
      <div className={styles.previewToolbar}>
        <div className={styles.liveLabel}>
          <span className={styles.liveDot} />
          Live preview <span className={styles.sizeLabel}>{getCardSize(design.template)}</span>
        </div>
        <div className={styles.previewActions}>
          <label className={styles.zoom} htmlFor="card-zoom">
            Zoom
            <input id="card-zoom" type="range" min={80} max={115} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            <output>{zoom}%</output>
          </label>
          <button className={`${styles.button} ${styles.printButton}`} type="button" onClick={onPrint}>
            <Printer aria-hidden="true" />
            Print card
          </button>
        </div>
      </div>

      <div className={styles.previewStage}>
        <article
          id="card-studio-print-card"
          className={cardClass}
          data-template={design.template}
          data-font={design.font}
          data-finish={design.finish}
          style={style}
          aria-label={`${design.template} event card preview`}
        >
          {design.template === 'floral' ? (
            <FloralCard design={design} />
          ) : design.template === 'badge' ? (
            <BadgeCard design={design} />
          ) : design.template === 'receipt' ? (
            <ReceiptCard design={design} currency={currency} />
          ) : (
            <TicketCard design={design} />
          )}
        </article>
      </div>

      <p className={styles.caption}>
        <b>✦</b> Authentic event stationery designed for keepsake physical printing. Edit every line from the controls.
      </p>
    </section>
  );
}
