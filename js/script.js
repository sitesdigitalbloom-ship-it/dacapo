/* ==========================================================================
   Da Capo Musical — interações
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP = '5551992611175';

  /* ---------- ano dinâmico no rodapé ---------- */
  var ano = document.getElementById('footer-year');
  if (ano) { ano.textContent = new Date().getFullYear(); }

  /* ---------- header reativo ao scroll ---------- */
  var cabecalho = document.getElementById('cabecalho');
  function atualizaCabecalho() {
    if (!cabecalho) { return; }
    cabecalho.classList.toggle('rolado', window.scrollY > 24);
  }
  atualizaCabecalho();

  /* ---------- drawer mobile ---------- */
  var toggle   = document.getElementById('navToggle');
  var menu     = document.getElementById('mobileMenu');
  var backdrop = document.getElementById('menuBackdrop');
  var fechar   = document.getElementById('mobileClose');

  function abreMenu() {
    menu.classList.add('aberto');
    backdrop.classList.add('aberto');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function fechaMenu() {
    menu.classList.remove('aberto');
    backdrop.classList.remove('aberto');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (toggle && menu && backdrop && fechar) {
    toggle.addEventListener('click', abreMenu);
    fechar.addEventListener('click', fechaMenu);
    backdrop.addEventListener('click', fechaMenu);
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', fechaMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('aberto')) { fechaMenu(); }
    });
  }

  /* ---------- reveal on-scroll ---------- */
  var alvos = document.querySelectorAll('.animate-on-scroll');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          io.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(alvos, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(alvos, function (el) { el.classList.add('visible'); });
  }

  /* ---------- destaque do item de menu ativo ---------- */
  var secoes = [];
  Array.prototype.forEach.call(document.querySelectorAll('.cabecalho__nav a[href^="#"]'), function (link) {
    var alvo = document.querySelector(link.getAttribute('href'));
    if (alvo) { secoes.push({ link: link, el: alvo }); }
  });
  function atualizaMenuAtivo() {
    var linha = window.scrollY + window.innerHeight * 0.34;
    var atual = null;
    secoes.forEach(function (s) { if (s.el.offsetTop <= linha) { atual = s; } });
    secoes.forEach(function (s) { s.link.classList.toggle('ativo', s === atual); });
  }

  var pendente = false;
  window.addEventListener('scroll', function () {
    if (pendente) { return; }
    pendente = true;
    requestAnimationFrame(function () {
      atualizaCabecalho();
      atualizaMenuAtivo();
      pendente = false;
    });
  }, { passive: true });
  atualizaMenuAtivo();

  /* ---------- FAQ: acordeão, um aberto por vez ---------- */
  var itens = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));
  itens.forEach(function (item) {
    var botao = item.querySelector('.faq__pergunta');
    botao.addEventListener('click', function () {
      var jaAtivo = item.classList.contains('ativo');
      itens.forEach(function (outro) {
        outro.classList.remove('ativo');
        outro.querySelector('.faq__pergunta').setAttribute('aria-expanded', 'false');
      });
      if (!jaAtivo) {
        item.classList.add('ativo');
        botao.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- máscara de celular ---------- */
  var celular = document.getElementById('celular');
  if (celular) {
    celular.addEventListener('input', function () {
      var d = celular.value.replace(/\D/g, '').slice(0, 11);
      var corte = d.length > 10 ? 7 : 6;
      var saida = '';
      if (d.length > 0) { saida = '(' + d.slice(0, 2); }
      if (d.length >= 3) { saida += ') ' + d.slice(2, corte); }
      if (d.length > corte) { saida += '-' + d.slice(corte); }
      celular.value = saida;
    });
  }

  /* ---------- formulário: monta a mensagem e abre o WhatsApp ---------- */
  var form = document.getElementById('formularioContato');
  if (!form) { return; }

  var botaoEnviar = document.getElementById('botaoEnviar');
  var rotuloOriginal = botaoEnviar ? botaoEnviar.textContent : '';

  function marcaErro(campo, mensagem) {
    var caixa = campo.closest('.campo');
    caixa.classList.add('invalido');
    var alvo = caixa.querySelector('.campo__erro');
    if (alvo) { alvo.textContent = mensagem; }
  }
  function limpaErro(campo) {
    var caixa = campo.closest('.campo');
    caixa.classList.remove('invalido');
    var alvo = caixa.querySelector('.campo__erro');
    if (alvo) { alvo.textContent = ''; }
  }

  Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (campo) {
    campo.addEventListener('input', function () { limpaErro(campo); });
    campo.addEventListener('change', function () { limpaErro(campo); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nome = form.nome, email = form.email, tel = form.celular;
    var mensagem = form.mensagem, consentiu = form.consentimento;
    var valido = true, primeiroErro = null;

    function falha(campo, texto) {
      marcaErro(campo, texto);
      valido = false;
      if (!primeiroErro) { primeiroErro = campo; }
    }

    if (nome.value.trim().length < 2) { falha(nome, 'Escreva seu nome.'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { falha(email, 'Informe um e-mail válido.'); }
    if (tel.value.replace(/\D/g, '').length < 10) { falha(tel, 'Informe o celular com DDD.'); }
    if (mensagem.value.trim().length < 5) { falha(mensagem, 'Conte um pouco do que você precisa.'); }
    if (!consentiu.checked) { falha(consentiu, 'É preciso autorizar o contato para enviar.'); }

    if (!valido) {
      if (primeiroErro) { primeiroErro.focus(); }
      return;
    }

    var texto =
      'Olá! Vim pelo site e gostaria de mais informações.\n\n' +
      'Nome: ' + nome.value.trim() + '\n' +
      'E-mail: ' + email.value.trim() + '\n' +
      'Celular: ' + tel.value.trim() + '\n' +
      'Mensagem: ' + mensagem.value.trim();

    if (botaoEnviar) {
      botaoEnviar.textContent = 'Abrindo o WhatsApp...';
      botaoEnviar.disabled = true;
      setTimeout(function () {
        botaoEnviar.textContent = rotuloOriginal;
        botaoEnviar.disabled = false;
      }, 2600);
    }

    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  });
})();
