/* JEPRIS-P AI Assistant: a scripted site helper. Answers only from what the site itself says,
   and hands anything else to Jefrey & Priyanka on WhatsApp or email. No API, no tracking. */
(function () {
  var NAME = 'JEPRIS-P AI Assistant';
  var WA_NUM = '919789035749';
  var EMAIL = 'jeprispai@gmail.com';
  var AVATAR = 'https://raw.githubusercontent.com/Jefrey11/jepris-p-ai/main/mascot/poster.jpg';
  var KEY = 'jpa-chat-v1';

  function wa(text) { return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(text); }
  var WA_DEFAULT = wa('Hi, I saw your website and wanted to talk about a project.');
  var btnWA = '<a class="jpa-cta" href="' + WA_DEFAULT + '" target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>';
  var btnMail = '<a class="jpa-cta ghost" href="mailto:' + EMAIL + '">' + EMAIL + '</a>';

  /* ---------- knowledge: every answer is wording from index.html / landing.html ---------- */
  var K = [
    { id: 'hello', keys: ['hi', 'hello', 'hey', 'hai', 'vanakkam', 'good morning', 'good evening', 'namaste'],
      a: 'Hi! I\'m the ' + NAME + '. I can tell you what we build, show you our recent projects, explain how we work, or connect you with Jefrey &amp; Priyanka directly.',
      chips: ['What do you build?', 'Show your projects', 'How do you work?', 'Contact you'] },

    { id: 'services', keys: ['service', 'services', 'build', 'offer', 'what can you', 'provide'],
      a: 'We help in four ways:<ul>' +
         '<li><b>Websites &amp; Landing Pages</b>: custom-built sites that load fast and are easy for you to update.</li>' +
         '<li><b>Software &amp; Dashboards</b>: internal tools and real-time dashboards, built around how your team actually works.</li>' +
         '<li><b>Automation &amp; Integrations</b>: bots, workflows, and messaging integrations that handle the repetitive stuff automatically.</li>' +
         '<li><b>AI Assistants &amp; Chatbots</b>: chatbots and AI agents that answer questions, qualify leads, and handle support.</li></ul>',
      chips: ['Websites', 'Dashboards', 'Automation', 'AI chatbots', 'Deeper AI & engineering'] },

    { id: 'web', keys: ['website', 'websites', 'web site', 'landing page', 'landing', 'site', 'wordpress', 'page builder', 'ecommerce', 'online store'],
      a: '<b>Websites &amp; Landing Pages</b>: custom-built sites that load fast and are easy for you to update. No bloated page builders, no generic templates.<ul>' +
         '<li>Custom design, not templates</li><li>Fast load times</li><li>Built to convert visitors into messages</li></ul>' +
         'Example: the <a href="https://komang-bali-landing.vercel.app/" target="_blank" rel="noopener noreferrer">Komang Bali</a> booking landing page.',
      chips: ['Show your projects', 'How do you work?', 'Contact you'] },

    { id: 'software', keys: ['software', 'dashboard', 'dashboards', 'internal tool', 'tools', 'app', 'application', 'portal', 'crm', 'erp', 'monitor', 'monitoring'],
      a: '<b>Software &amp; Dashboards</b>: internal tools and real-time dashboards, built around how your team actually works.<ul>' +
         '<li>Real-time monitoring &amp; alerts</li><li>Built around your workflow</li>' +
         '<li>Shipped: Linux Server Health Dashboard, Church Member Management System</li></ul>',
      chips: ['Linux dashboard', 'Church system', 'Contact you'] },

    { id: 'automation', keys: ['automation', 'automate', 'automated', 'bot', 'bots', 'workflow', 'integration', 'integrations', 'whatsapp broadcast', 'repetitive', 'data entry', 'reports', 'reminders', 'alerts', 'scraping', 'scraper'],
      a: '<b>Automation &amp; Integrations</b>: bots, workflows, and messaging integrations that handle the repetitive stuff automatically: data entry, alerts, reports, reminders, so it happens without anyone chasing it.<ul>' +
         '<li>WhatsApp broadcast &amp; messaging</li><li>Workflow &amp; task automation</li><li>Shipped: self-hosted Remote Desk tool</li></ul>',
      chips: ['Deeper AI & engineering', 'How do you work?', 'Contact you'] },

    { id: 'ai', keys: ['chatbot', 'chatbots', 'chat bot', 'ai', 'assistant', 'agent', 'agents', 'llm', 'gpt', 'gemini', 'claude', 'rag', 'machine learning', 'artificial intelligence', 'fine tuning', 'fine-tuning', 'prompt'],
      a: '<b>AI Assistants &amp; Chatbots</b>: chatbots and AI agents that answer questions, qualify leads, and handle support, trained on your business, not a generic script.<ul>' +
         '<li>Custom chatbots &amp; chat widgets</li><li>AI agents for support &amp; sales</li><li>Conversational bots on WhatsApp &amp; web</li></ul>' +
         'For deeper work we also do LLM configuration, custom model fine-tuning, prompt engineering, and RAG architecture &amp; vector database setup.',
      chips: ['Deeper AI & engineering', 'Contact you'] },

    { id: 'deep', keys: ['deeper', 'engineering', 'capabilities', 'database', 'cloud', 'devops', 'ci/cd', 'api', 'serverless', 'migration', 'analytics', 'predictive', 'document', 'parsing', 'vector'],
      a: 'For teams that need the deeper stuff:<ul>' +
         '<li><b>Process &amp; Data Automation</b>: workflow automation, web scraping &amp; data extraction bots, API &amp; integration engineering, document intelligence.</li>' +
         '<li><b>Database &amp; Cloud</b>: architecture, optimization &amp; migration, cloud infrastructure &amp; serverless deployment.</li>' +
         '<li><b>AI &amp; Analytics</b>: agentic AI, chatbots &amp; virtual assistants, generative AI &amp; LLM integration, predictive analytics &amp; real-time dashboards.</li>' +
         '<li><b>Software &amp; Web Engineering</b>: tailored web applications &amp; portals, DevOps &amp; CI/CD pipeline automation.</li>' +
         '<li><b>LLM Engineering &amp; Optimization</b>: fine-tuning, prompt engineering, RAG &amp; vector databases, performance tuning &amp; evaluation.</li></ul>' +
         '<a href="/landing">See the full list on our services page &rarr;</a>',
      chips: ['Show your projects', 'Contact you'] },

    { id: 'projects', keys: ['project', 'projects', 'portfolio', 'work', 'examples', 'example', 'recent', 'built', 'case study', 'demo', 'clients', 'previous'],
      a: 'Real systems, not mockups. Our recent builds:<ul>' +
         '<li><b>Linux Server Health Dashboard</b>: real-time CPU, memory, disk and network health with alerts. <a href="https://linux-server-dashboard-community.onrender.com/" target="_blank" rel="noopener noreferrer">Live demo</a></li>' +
         '<li><b>Remote Desk</b>: a self-hosted remote-desktop tool with Device ID + PIN pairing and end-to-end TLS encryption.</li>' +
         '<li><b>Church Member Management System</b>: member records, attendance, and one-click WhatsApp broadcast.</li>' +
         '<li><b>Komang Bali</b>: a driver &amp; tour booking landing page with a day-by-day itinerary builder. <a href="https://komang-bali-landing.vercel.app/" target="_blank" rel="noopener noreferrer">Live demo</a></li></ul>',
      chips: ['Linux dashboard', 'Remote Desk', 'Church system', 'Komang Bali'] },

    { id: 'linux', keys: ['linux', 'server', 'server health', 'cpu', 'uptime', 'downtime'],
      a: '<b>Linux Server Health Dashboard</b>: a real-time monitoring dashboard for Linux servers. CPU, memory, disk, and network health at a glance, with alerts that catch trouble before it turns into downtime.<br><a href="https://linux-server-dashboard-community.onrender.com/" target="_blank" rel="noopener noreferrer">Open the live demo &rarr;</a>',
      chips: ['Show your projects', 'Contact you'] },

    { id: 'remote', keys: ['remote', 'remote desk', 'anydesk', 'remote desktop', 'teamviewer', 'tls', 'encryption'],
      a: '<b>Remote Desk</b> (like AnyDesk): a self-hosted remote-desktop tool built from scratch. Device ID + PIN pairing, end-to-end TLS encryption, and a relay mode for connecting across different networks. Runs on Windows and Linux.',
      chips: ['Show your projects', 'Contact you'] },

    { id: 'church', keys: ['church', 'churches', 'member', 'members', 'attendance', 'congregation', 'community'],
      a: '<b>Church Member Management System</b>: member records and attendance tracking, plus one-click WhatsApp broadcast messaging to reach the whole congregation instantly.',
      chips: ['Show your projects', 'Contact you'] },

    { id: 'bali', keys: ['bali', 'komang', 'travel', 'tour', 'tours', 'driver', 'booking', 'itinerary', 'tourism'],
      a: '<b>Komang Bali</b>: a booking landing page for a private Bali driver and tour guide. 102 name-audited destinations across 13 real geographic areas, an interactive day-by-day itinerary builder, and 78 real location photos with proper attribution.<br><a href="https://komang-bali-landing.vercel.app/" target="_blank" rel="noopener noreferrer">Open the live demo &rarr;</a>',
      chips: ['Websites', 'Contact you'] },

    { id: 'process', keys: ['process', 'how do you work', 'how does it work', 'steps', 'start', 'get started', 'begin', 'onboarding', 'proposal'],
      a: 'A clear process, start to finish:<ol>' +
         '<li><b>Talk</b>: tell us what you\'re trying to solve. We\'ll follow up with a small design discussion.</li>' +
         '<li><b>Build</b>: we design and build it directly, the same two people, start to finish.</li>' +
         '<li><b>Launch</b>: it goes live, fast. You see progress in days, not months.</li>' +
         '<li><b>Automate</b>: we wire up the busywork around it, so it keeps running without you chasing it.</li></ol>',
      chips: ['How long does it take?', 'How much does it cost?', 'Contact you'] },

    { id: 'time', keys: ['how long', 'timeline', 'time', 'deadline', 'fast', 'quick', 'turnaround', 'days', 'weeks', 'urgent', 'when'],
      a: 'Fast turnaround is how we work: conversations happen over WhatsApp, decisions happen fast, and you see progress in days, not months. The exact timeline depends on what you need, so the quickest way to get one is to tell us about your project.<br>' + btnWA,
      chips: ['How do you work?', 'How much does it cost?'] },

    { id: 'price', keys: ['price', 'pricing', 'cost', 'costs', 'budget', 'quote', 'quotation', 'rate', 'rates', 'charge', 'fee', 'fees', 'how much', 'expensive', 'cheap', 'affordable', 'payment', 'rupees', 'inr', 'usd', 'dollar'],
      a: 'We don\'t list fixed prices because every project is built around what you actually need. No lengthy proposals or procurement, just a conversation and a plan. Tell us what you\'re trying to solve and we\'ll tell you honestly whether we can help.<br>' + btnWA,
      chips: ['How do you work?', 'Show your projects'] },

    { id: 'about', keys: ['who', 'about', 'team', 'founder', 'founders', 'jefrey', 'priyanka', 'company', 'agency', 'freelance', 'freelancer', 'studio', 'people', 'you guys'],
      a: 'JEPRIS-P AI (Process &amp; Automation Intelligence) is <b>Jefrey Raj and Priyanka</b> working directly with you. No account managers, no handoffs between teams. Every project on our site is a real system we built and still run ourselves, not a demo made to look good in a portfolio.',
      chips: ['Why choose you?', 'Show your projects', 'Contact you'] },

    { id: 'why', keys: ['why', 'why you', 'different', 'trust', 'better', 'choose', 'reliable', 'experience', 'production'],
      a: 'Small enough to move fast, serious enough to trust with production.<ul>' +
         '<li><b>Direct</b>: you talk to the people building it, no account managers, no relay.</li>' +
         '<li><b>Production-grade</b>: every project on our site is a real system running today, not a mockup.</li>' +
         '<li><b>Fast turnaround</b>: conversations happen over WhatsApp. Decisions happen fast.</li>' +
         '<li><b>No middlemen</b>: two people, start to finish. Design, build, and automation under one roof.</li></ul>',
      chips: ['Show your projects', 'Contact you'] },

    { id: 'fit', keys: ['small business', 'business', 'startup', 'founder', 'it team', 'who do you work with', 'best fit', 'industry', 'industries', 'shop', 'restaurant', 'school', 'clinic'],
      a: 'We\'re built for small businesses, churches, IT teams, and founders. Best fit for:<ul>' +
         '<li>Small business websites &amp; software</li><li>Internal dashboards &amp; tools</li><li>Church &amp; community management systems</li>' +
         '<li>Workflow &amp; messaging automation</li><li>AI chatbots &amp; assistants</li></ul>',
      chips: ['What do you build?', 'Contact you'] },

    { id: 'available', keys: ['available', 'availability', 'hiring', 'taking', 'new projects', 'free to', 'capacity'],
      a: 'Yes, we\'re <b>available for new projects</b>. Tell us what you\'re trying to solve.<br>' + btnWA,
      chips: ['How do you work?'] },

    { id: 'contact', keys: ['contact', 'reach', 'talk', 'call', 'phone', 'number', 'whatsapp', 'email', 'mail', 'message', 'connect', 'hire', 'meeting', 'meet', 'speak'],
      a: 'The fastest way is WhatsApp. Every message goes straight to Jefrey &amp; Priyanka, not a support queue. You can also email us.<br>' + btnWA + btnMail,
      chips: ['How do you work?', 'Show your projects'] },

    { id: 'thanks', keys: ['thanks', 'thank you', 'thank', 'ok', 'okay', 'great', 'cool', 'nice', 'bye', 'goodbye'],
      a: 'You\'re welcome! Whenever you\'re ready, message us and we\'ll take it from there.<br>' + btnWA,
      chips: [] }
  ];
  var CHIP_MAP = {
    'What do you build?': 'services', 'Show your projects': 'projects', 'How do you work?': 'process', 'Contact you': 'contact',
    'Websites': 'web', 'Dashboards': 'software', 'Automation': 'automation', 'AI chatbots': 'ai', 'Deeper AI & engineering': 'deep',
    'Linux dashboard': 'linux', 'Remote Desk': 'remote', 'Church system': 'church', 'Komang Bali': 'bali',
    'How long does it take?': 'time', 'How much does it cost?': 'price', 'Why choose you?': 'why'
  };
  var START = ['What do you build?', 'Show your projects', 'How much does it cost?', 'Contact you'];

  var GENERIC = ['services', 'projects', 'about', 'fit'];
  function norm(s) { return ' ' + s.toLowerCase().replace(/[^a-z0-9/+\-\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function match(text) {
    var t = norm(text), best = null, bs = 0;
    K.forEach(function (k, order) {
      var s = 0;
      k.keys.forEach(function (w) {
        var hit = w.indexOf(' ') >= 0 ? t.indexOf(' ' + w + ' ') >= 0 || t.indexOf(w) >= 0 : t.indexOf(' ' + w + ' ') >= 0 || t.indexOf(' ' + w + 's ') >= 0;
        if (hit) s += w.indexOf(' ') >= 0 ? 2.5 : 1;   /* phrases beat single words */
      });
      if (k.id === 'hello' || k.id === 'thanks') s *= 0.6; /* "hi, what does it cost?" should answer the cost */
      if (GENERIC.indexOf(k.id) >= 0) s *= 0.8;            /* "bali project" -> Bali, not the project list */
      if (k.id === 'price' || k.id === 'time') s *= 1.3;   /* "price for a mobile app" is a price question */
      if (s > bs) { bs = s; best = k; }
    });
    return best;
  }
  function byId(id) { for (var i = 0; i < K.length; i++) if (K[i].id === id) return K[i]; }

  /* ---------- styles ---------- */
  var css = [
    '.jpa-launch{position:fixed;right:20px;bottom:20px;z-index:90;display:flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;border:1px solid rgba(232,148,79,.45);background:rgba(18,22,33,.88);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:#ECEEF3;font:500 13px "IBM Plex Mono",ui-monospace,monospace;cursor:pointer;box-shadow:0 12px 36px -12px rgba(0,0,0,.8),0 0 30px -10px rgba(232,148,79,.6);transition:transform .2s ease,box-shadow .2s ease}',
    '.jpa-launch:hover{transform:translateY(-2px);box-shadow:0 16px 40px -12px rgba(0,0,0,.85),0 0 36px -8px rgba(232,148,79,.75)}',
    '.jpa-launch:focus-visible,.jpa-x:focus-visible,.jpa-chip:focus-visible,.jpa-send:focus-visible{outline:2px solid #E8944F;outline-offset:3px}',
    '.jpa-av{width:38px;height:38px;border-radius:50%;background:#2B2C3E url(' + AVATAR + ') 50% 22%/190% auto no-repeat;flex:none;border:1px solid rgba(232,148,79,.5);position:relative}',
    '.jpa-av.sm{width:32px;height:32px}',
    '.jpa-launch .jpa-av::after{content:"";position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;background:#4FC27F;border:2px solid #121621}',
    '.jpa-launch.open{opacity:0;pointer-events:none;transform:scale(.9)}',
    '.jpa-panel{position:fixed;right:20px;bottom:20px;z-index:91;width:min(390px,calc(100vw - 32px));height:min(600px,calc(100vh - 40px));display:flex;flex-direction:column;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:rgba(15,18,27,.96);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);box-shadow:0 30px 80px -20px rgba(0,0,0,.9),0 0 50px -20px rgba(232,148,79,.45);color:#ECEEF3;font-family:"IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;transform-origin:100% 100%;transition:opacity .22s ease,transform .22s ease}',
    '.jpa-panel[hidden]{display:flex;opacity:0;transform:translateY(12px) scale(.97);pointer-events:none;visibility:hidden}',
    '.jpa-head{display:flex;align-items:center;gap:11px;padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(56,56,80,.55),rgba(56,56,80,0))}',
    '.jpa-title{font:800 19px/1 "Big Shoulders Display","Arial Narrow",sans-serif;letter-spacing:.01em}',
    '.jpa-sub{font:12px "IBM Plex Mono",ui-monospace,monospace;color:#9CA2B5;margin-top:4px;display:flex;align-items:center;gap:6px}',
    '.jpa-sub::before{content:"";width:6px;height:6px;border-radius:50%;background:#4FC27F}',
    '.jpa-x{margin-left:auto;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#C9CDD9;font-size:18px;line-height:1;cursor:pointer}',
    '.jpa-x:hover{border-color:rgba(232,148,79,.5);color:#fff}',
    '.jpa-log{flex:1;overflow-y:auto;padding:16px 14px 8px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;overscroll-behavior:contain}',
    '.jpa-row{display:flex;gap:8px;align-items:flex-end;max-width:100%}',
    '.jpa-row.me{justify-content:flex-end}',
    '.jpa-msg{max-width:84%;padding:10px 13px;border-radius:14px;font-size:14.5px;line-height:1.55;overflow-wrap:anywhere}',
    '.jpa-row.bot .jpa-msg{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px}',
    '.jpa-row.me .jpa-msg{background:linear-gradient(180deg,#FFB26B,#E8944F);color:#1A1006;border-bottom-right-radius:4px}',
    '.jpa-msg ul,.jpa-msg ol{margin:6px 0 2px;padding-left:18px}.jpa-msg li{margin:3px 0}',
    '.jpa-msg a{color:#FFB26B}.jpa-msg b{color:#fff}',
    '.jpa-cta{display:inline-block;margin:8px 8px 0 0;padding:8px 12px;border-radius:9px;background:linear-gradient(180deg,#FFB26B,#E8944F);color:#1A1006!important;font:500 12.5px "IBM Plex Mono",ui-monospace,monospace;text-decoration:none}',
    '.jpa-cta.ghost{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#ECEEF3!important}',
    '.jpa-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 2px 40px}',
    '.jpa-chip{border:1px solid rgba(232,148,79,.4);background:rgba(232,148,79,.08);color:#FFC794;border-radius:999px;padding:6px 11px;font:12.5px "IBM Plex Sans",sans-serif;cursor:pointer;transition:background .15s,border-color .15s}',
    '.jpa-chip:hover{background:rgba(232,148,79,.18);border-color:#E8944F}',
    '.jpa-typing{display:inline-flex;gap:4px;padding:12px 14px}.jpa-typing i{width:6px;height:6px;border-radius:50%;background:#9CA2B5;animation:jpa-b 1s infinite}',
    '.jpa-typing i:nth-child(2){animation-delay:.15s}.jpa-typing i:nth-child(3){animation-delay:.3s}',
    '@keyframes jpa-b{0%,60%,100%{opacity:.3;transform:none}30%{opacity:1;transform:translateY(-3px)}}',
    '.jpa-form{display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,.08)}',
    '.jpa-in{flex:1;min-width:0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:11px 12px;color:#ECEEF3;font:14.5px "IBM Plex Sans",sans-serif;outline:none}',
    '.jpa-in:focus{border-color:rgba(232,148,79,.6)}.jpa-in::placeholder{color:#737A8E}',
    '.jpa-send{flex:none;width:44px;border-radius:11px;border:none;background:linear-gradient(180deg,#FFB26B,#E8944F);color:#1A1006;cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.jpa-send svg{width:18px;height:18px}',
    '.jpa-note{font:11px "IBM Plex Mono",ui-monospace,monospace;color:#737A8E;text-align:center;padding:0 12px 10px}',
    '@media (max-width:520px){.jpa-panel{right:0;bottom:0;width:100vw;height:min(88vh,100dvh);border-radius:18px 18px 0 0}.jpa-launch{right:14px;bottom:14px}}',
    '@media (prefers-reduced-motion:reduce){.jpa-panel,.jpa-launch{transition:none}.jpa-typing i{animation:none}.jpa-log{scroll-behavior:auto}}',
    '@media print{.jpa-launch,.jpa-panel{display:none!important}}'
  ].join('\n');

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function init() {
    var st = el('style'); st.textContent = css; document.head.appendChild(st);

    var launch = el('button', 'jpa-launch', '<span class="jpa-av" aria-hidden="true"></span><span>Ask ' + NAME + '</span>');
    launch.type = 'button';
    launch.setAttribute('aria-haspopup', 'dialog');

    var panel = el('section', 'jpa-panel');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', NAME);
    panel.innerHTML =
      '<div class="jpa-head"><span class="jpa-av" aria-hidden="true"></span><div><div class="jpa-title">' + NAME + '</div>' +
      '<div class="jpa-sub">Usually replies instantly</div></div>' +
      '<button type="button" class="jpa-x" aria-label="Close chat">&times;</button></div>' +
      '<div class="jpa-log" role="log" aria-live="polite"></div>' +
      '<form class="jpa-form" autocomplete="off"><label class="sr" for="jpa-in" style="position:absolute;left:-9999px">Your question</label>' +
      '<input id="jpa-in" class="jpa-in" type="text" maxlength="300" placeholder="Ask about services, projects, pricing...">' +
      '<button class="jpa-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
      '<div class="jpa-note">Automated assistant &middot; answers come from this website</div>';
    document.body.appendChild(launch);
    document.body.appendChild(panel);

    var log = panel.querySelector('.jpa-log'), form = panel.querySelector('form'), input = panel.querySelector('.jpa-in');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var history = [];
    try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { history = []; }
    function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-40))); } catch (e) {} }

    function scroll() { log.scrollTop = log.scrollHeight; }
    function addUser(text) {
      var r = el('div', 'jpa-row me'), m = el('div', 'jpa-msg'); m.textContent = text; r.appendChild(m); log.appendChild(r); scroll();
    }
    function addBot(html, chips) {
      var r = el('div', 'jpa-row bot'); r.appendChild(el('span', 'jpa-av sm'));
      r.firstChild.setAttribute('aria-hidden', 'true');
      r.appendChild(el('div', 'jpa-msg', html)); log.appendChild(r);
      log.querySelectorAll('.jpa-chips').forEach(function (c) { c.remove(); });
      if (chips && chips.length) {
        var c = el('div', 'jpa-chips');
        chips.forEach(function (label) {
          var b = el('button', 'jpa-chip'); b.type = 'button'; b.textContent = label;
          b.addEventListener('click', function () { ask(label, CHIP_MAP[label]); });
          c.appendChild(b);
        });
        log.appendChild(c);
      }
      scroll();
    }
    function answerFor(text, id) {
      var k = id ? byId(id) : match(text);
      if (k) return { a: k.a, chips: k.chips };
      return {
        a: 'I\'m a simple assistant, so I can only answer from what\'s on this website, and I don\'t have an answer for that one. Jefrey &amp; Priyanka can answer it directly:<br>' +
           '<a class="jpa-cta" href="' + wa('Hi, I have a question from your website: ' + text) + '" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>' + btnMail,
        chips: ['What do you build?', 'Show your projects', 'How do you work?']
      };
    }
    var busy = false;
    function ask(text, id) {
      text = (text || '').trim();
      if (!text || busy) return;
      busy = true;
      addUser(text);
      var ans = answerFor(text, id);
      history.push({ me: text, id: id || null });
      save();
      var t = el('div', 'jpa-row bot', '<span class="jpa-av sm" aria-hidden="true"></span><div class="jpa-msg jpa-typing" aria-label="typing"><i></i><i></i><i></i></div>');
      log.appendChild(t); scroll();
      setTimeout(function () { t.remove(); addBot(ans.a, ans.chips); busy = false; }, reduce ? 0 : 450 + Math.min(500, text.length * 8));
    }
    function greet() {
      addBot('Hi! I\'m the <b>' + NAME + '</b>. Ask me what we build, see our recent projects, or find out how to start a project with Jefrey &amp; Priyanka.', START);
    }
    function replay() {                       /* restore this tab's conversation without the typing delay */
      greet();
      history.forEach(function (h) { addUser(h.me); var a = answerFor(h.me, h.id); addBot(a.a, a.chips); });
    }

    var started = false;
    function open() {
      if (!started) { started = true; history.length ? replay() : greet(); }
      panel.hidden = false; launch.classList.add('open'); launch.setAttribute('aria-expanded', 'true');
      setTimeout(function () { input.focus({ preventScroll: true }); }, 60);
      try { sessionStorage.setItem(KEY + '-open', '1'); } catch (e) {}
    }
    function close() {
      panel.hidden = true; launch.classList.remove('open'); launch.setAttribute('aria-expanded', 'false'); launch.focus();
      try { sessionStorage.removeItem(KEY + '-open'); } catch (e) {}
    }
    launch.addEventListener('click', open);
    panel.querySelector('.jpa-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
    try { if (sessionStorage.getItem(KEY + '-open')) open(); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
