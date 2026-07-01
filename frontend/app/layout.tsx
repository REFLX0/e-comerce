import type { Metadata } from 'next'
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KiosqueTN | Lubrifiants et Huiles Moteur en Tunisie',
  description:
    'KiosqueTN — votre spécialiste en ligne de lubrifiants, huiles moteur, filtres et accessoires auto en Tunisie. Livraison rapide partout en Tunisie.',
  keywords: [
    'huile moteur',
    'lubrifiant',
    'Tunisie',
    'KiosqueTN',
    'huile synthétique',
    'vidange',
    'Total',
    'Shell',
    'Castrol',
    'Motul',
    'filtres auto',
  ],
  openGraph: {
    title: 'KiosqueTN | Lubrifiants et Huiles Moteur en Tunisie',
    description:
      'KiosqueTN — votre spécialiste en ligne de lubrifiants et huiles moteur en Tunisie.',
    type: 'website',
    locale: 'fr_TN',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}
      style={{ scrollBehavior: 'smooth' }}
      suppressHydrationWarning
    >
      <body
        className="text-foreground bg-brand-surface flex min-h-screen flex-col font-sans"
        suppressHydrationWarning
      >
        <Providers>
          {/* Skip link for keyboard / screen reader navigation */}
          <a
            href="#main-content"
            className="bg-brand-primary ring-brand-accent sr-only z-50 rounded-lg p-4 font-bold text-white ring-2 outline-none focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
          >
            Aller au contenu principal
          </a>

          {children}

          <Toaster position="bottom-right" richColors closeButton />
        </Providers>

        {/* ── Müller-Brockmann Grid Toggle ─────────────────────────────────
            Press 'G' anywhere on the page (when not in a form field) to
            toggle the 12-column / 8px baseline overlay. The overlay lives
            inside each .wrap — same content box — so columns match exactly.
            ───────────────────────────────────────────────────────────────── */}
        <button
          id="gridToggle"
          className="grid-toggle"
          aria-pressed="false"
          aria-label="Afficher/Masquer la grille de mise en page"
          title="G — Afficher/Masquer la grille"
        >
          <span className="dot" aria-hidden="true" />
          <span className="lbl">Show grid</span>
        </button>

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var btn=document.getElementById('gridToggle');
  function setGrid(on){
    document.body.classList.toggle('grid-on',on);
    localStorage.setItem('grid-on',on?'1':'0');
    if(btn){
      btn.setAttribute('aria-pressed',on?'true':'false');
      var l=btn.querySelector('.lbl');if(l)l.textContent=on?'Hide grid':'Show grid';
    }
  }
  /* Restore from localStorage (survives page reloads during dev) */
  var saved=localStorage.getItem('grid-on');
  if(saved==='1') setGrid(true);

  if(btn) btn.addEventListener('click',function(){setGrid(!document.body.classList.contains('grid-on'));});

  document.addEventListener('keydown',function(e){
    var tag=document.activeElement?document.activeElement.tagName:'';
    if((e.key==='g'||e.key==='G')&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&
       tag!=='INPUT'&&tag!=='TEXTAREA'&&tag!=='SELECT'){
      setGrid(!document.body.classList.contains('grid-on'));
    }
  });

  /* Populate overlay column numbers in every .guides on the page */
  function populateGuides(){
    document.querySelectorAll('.guides .cols').forEach(function(h){
      if(h.children.length>0) return; /* already populated */
      var n=parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--cols').trim()||'12',10);
      for(var i=1;i<=n;i++){
        var c=document.createElement('div');c.className='col';
        var s=document.createElement('span');s.textContent=i;
        c.appendChild(s);h.appendChild(c);
      }
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',populateGuides);
  } else {
    populateGuides();
  }

  /* ── OPTICAL ALIGNMENT ──────────────────────────────────────────────
     Large display type carries a left side-bearing: the glyph ink is
     inset from the layout box. This measures the real side-bearing at
     runtime (after the webfont loads) and nudges each [data-optical]
     element so its INK lands on the column line, not just its box.
     ──────────────────────────────────────────────────────────────────── */
  (function(){
    var cvs=document.createElement('canvas'),ctx=cvs.getContext('2d');
    var sel='[data-optical]';
    function alignInk(){
      document.querySelectorAll(sel).forEach(function(el){
        el.style.marginLeft='0px';
        var cs=getComputedStyle(el);
        var ch=(el.textContent||'').trim().charAt(0);if(!ch)return;
        if(cs.textTransform==='uppercase')ch=ch.toUpperCase();
        ctx.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
        ctx.textAlign='left';
        var abl=ctx.measureText(ch).actualBoundingBoxLeft;
        if(isFinite(abl))el.style.marginLeft=abl.toFixed(2)+'px';
      });
    }
    if(document.fonts&&document.fonts.ready){
      document.fonts.ready.then(alignInk);
    }
    alignInk();
    var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(alignInk,120);});
  })();
})();
`,
          }}
        />
      </body>
    </html>
  )
}
