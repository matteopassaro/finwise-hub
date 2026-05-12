/**
 * Finwise.rocks — Express Server
 * Node.js + EJS + Tailwind CSS
 */
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Data ──
const promos = require('./src/data/promos.json');
const blogPosts = require('./src/data/blog.json');

// ── Middleware ──
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.static(path.join(__dirname, 'src/public'), { maxAge: '7d' }));

// ── View Engine ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ── Helpers available in all views ──
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.siteName = 'Finwise.rocks';
  res.locals.siteUrl = 'https://finwise.rocks';
  res.locals.promos = promos;
  next();
});

// ══════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════

// Homepage
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Migliori Bonus Bancari e Referral Italia 2026 | Finwise.rocks',
    description: 'Guadagna con i migliori bonus bancari 2026: Buddy UniCredit 50€, isybank 30€, Revolut e Trade Republic. Guide complete, codici referral e calcolatori.',
    canonical: 'https://finwise.rocks/',
    promos,
    blogPosts: blogPosts.filter(p => p.featured).slice(0, 3),
  });
});

// Bonus aggregator page
app.get('/bonus', (req, res) => {
  res.render('bonus/index', {
    title: 'Tutti i Bonus Bancari e Referral Attivi 2026 | Finwise.rocks',
    description: 'Tabella completa e filtrabile di tutti i bonus bancari e codici referral attivi in Italia nel 2026. Confronta importi, requisiti e scadenze.',
    canonical: 'https://finwise.rocks/bonus',
    promos,
  });
});

// Bonus detail pages
app.get('/bonus/:slug', (req, res) => {
  const promo = promos.find(p => p.slug === req.params.slug || p.id === req.params.slug);
  if (!promo) return res.status(404).render('pages/404', {
    title: 'Pagina non trovata | Finwise.rocks',
    description: 'La pagina richiesta non è stata trovata.',
    canonical: 'https://finwise.rocks/404',
  });
  res.render('bonus/detail', {
    title: `Bonus ${promo.name} ${promo.bonusAmount}€ 2026 – Guida Completa | Finwise.rocks`,
    description: promo.description,
    canonical: `https://finwise.rocks/bonus/${promo.slug}`,
    promo,
  });
});

// Blog
app.get('/blog', (req, res) => {
  res.render('blog/index', {
    title: 'Blog Finanza Personale – Guide e Confronti 2026 | Finwise.rocks',
    description: 'Articoli, guide e confronti sui migliori bonus bancari, conti correnti gratuiti e strategie di risparmio per il 2026.',
    canonical: 'https://finwise.rocks/blog',
    blogPosts,
  });
});

app.get('/blog/:slug', (req, res) => {
  const post = blogPosts.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).render('pages/404', {
    title: 'Articolo non trovato | Finwise.rocks',
    description: 'L\'articolo richiesto non è stato trovato.',
    canonical: 'https://finwise.rocks/404',
  });
  res.render('blog/detail', {
    title: `${post.title} | Finwise.rocks`,
    description: post.excerpt,
    canonical: `https://finwise.rocks/blog/${post.slug}`,
    post,
  });
});

// Static pages
app.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'Chi Siamo – Finwise.rocks | Guida ai Bonus Bancari',
    description: 'Finwise.rocks è il tuo hub autorevole per scoprire i migliori bonus bancari e programmi referral in Italia.',
    canonical: 'https://finwise.rocks/about',
  });
});

app.get('/disclaimer', (req, res) => {
  res.render('pages/disclaimer', {
    title: 'Disclaimer – Finwise.rocks',
    description: 'Disclaimer legale e informazioni importanti sull\'utilizzo dei link referral presenti su Finwise.rocks.',
    canonical: 'https://finwise.rocks/disclaimer',
  });
});

app.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    title: 'Privacy Policy – Finwise.rocks',
    description: 'Informativa sulla privacy e gestione dei dati personali di Finwise.rocks.',
    canonical: 'https://finwise.rocks/privacy',
  });
});

app.get('/contatti', (req, res) => {
  res.render('pages/contatti', {
    title: 'Contatti – Finwise.rocks',
    description: 'Contatta il team di Finwise.rocks per domande, collaborazioni o segnalazioni.',
    canonical: 'https://finwise.rocks/contatti',
  });
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/bonus', priority: '0.9', changefreq: 'daily' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/about', priority: '0.5', changefreq: 'monthly' },
    { loc: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { loc: '/contatti', priority: '0.4', changefreq: 'monthly' },
    ...promos.map(p => ({ loc: `/bonus/${p.slug}`, priority: '0.8', changefreq: 'weekly' })),
    ...blogPosts.map(p => ({ loc: `/blog/${p.slug}`, priority: '0.7', changefreq: 'monthly' })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://finwise.rocks${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: https://finwise.rocks/sitemap.xml`);
});

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: 'Pagina non trovata | Finwise.rocks',
    description: 'La pagina richiesta non è stata trovata.',
    canonical: 'https://finwise.rocks/404',
  });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`🚀 Finwise.rocks running on http://localhost:${PORT}`);
});
