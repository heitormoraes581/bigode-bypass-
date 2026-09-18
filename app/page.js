'use client';

import { useMemo, useState } from 'react';

const products = [
  {
    name: 'Bigode Basic',
    old: 70,
    price: 50,
    tag: 'BASIC',
    tone: 'green',
  },
  {
    name: 'Bigode Advanced',
    old: 200,
    price: 150,
    tag: 'ADVANCED',
    tone: 'purple',
  },
  {
    name: 'Bigode Premium',
    old: 300,
    price: 250,
    tag: 'PREMIUM',
    tone: 'pink',
  },
  {
    name: 'Bigode Ultimate',
    old: 450,
    price: 400,
    tag: 'ULTIMATE',
    tone: 'cyan',
  },
  {
    name: 'Bigode Remote',
    old: 700,
    price: 500,
    tag: 'REMOTE',
    tone: 'blue',
  },
  {
    name: 'Bigode Exclusive',
    old: 750,
    price: 600,
    tag: 'EXCLUSIVE',
    tone: 'orange',
  },
  {
    name: 'Bigode Pro',
    old: 950,
    price: 750,
    tag: 'PRO',
    tone: 'violet',
  },
  {
    name: 'Bigode 1:1',
    old: 1500,
    price: 1300,
    tag: '1:1',
    tone: 'blue',
  },
];

const money = (value) =>
  'R$ ' + value.toFixed(2).replace('.', ',');

export default function Home() {
  const [cart, setCart] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState(false);

  const shown = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  const total = useMemo(
    () => cart.reduce((sum, product) => sum + product.price, 0),
    [cart]
  );

  function addToCart(product) {
    setCart([...cart, product]);
    setDrawer(true);
  }

  function removeFromCart(index) {
    setCart(cart.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <main>
      <div className="support">
        Alguma dúvida?
        <b>Abra um ticket em nosso servidor</b>
      </div>

      <header>
        <a className="brand" href="/">
          <img
            className="brandLogo"
            src="/logo-bigode-bypass.png"
            alt="Bigode Bypass"
          />

          <div>
            <strong>Bigode Bypass</strong>
            <small>LOJA DIGITAL</small>
          </div>

          <i>✓</i>
        </a>

        <div className="search">
          <span>⌕</span>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produto"
          />
        </div>

        <div className="actions">
          <button className="headset" type="button">
            ◉
          </button>

          <div className="profileWrap">
            <button
              className="profile"
              type="button"
              onClick={() => setProfile(!profile)}
            >
              <span>BB</span>

              <div>
                <b>Cliente</b>
                <small>Meu perfil ⌄</small>
              </div>
            </button>

            {profile && (
              <div className="profileMenu">
                <b>Minha conta</b>
                <small>cliente@bigode.com</small>

                <hr />

                <a href="/pedidos">
                  ▣ Meus pedidos
                </a>

                <button className="logout" type="button">
                  ↪ Sair da conta
                </button>
              </div>
            )}
          </div>

          <button
            className="cartBtn"
            type="button"
            onClick={() => setDrawer(true)}
          >
            🛒 Carrinho
            <b>{cart.length}</b>
          </button>
        </div>
      </header>

      <section className="banner officialBannerWrap">
        <img
          className="officialBanner"
          src="/banner-bigode-bypass.png"
          alt="Bigode Bypass"
        />
      </section>

      <section className="intro">
        <h1>
          Sua experiência em
          <br />
          <em>produtos digitais.</em>
        </h1>

        <p>
          Uma loja moderna, rápida e organizada, com atendimento
          eficiente e uma experiência de compra feita para PC.
        </p>

        <a href="#produtos">
          Ver produtos　→
        </a>
      </section>

      <section className="popular">
        <h2>Categorias populares</h2>

        <div className="category">
          <img
            className="categoryLogo"
            src="/logo-bigode-bypass.png"
            alt="Bigode"
          />

          <strong>BIGODE</strong>
        </div>
      </section>

      <section id="produtos" className="catalog">
        <aside className="filters">
          <b>PRODUTOS</b>

          <button className="active" type="button">
            BIGODE
          </button>

          <button type="button">
            DESTAQUES
          </button>
        </aside>

        <div className="productArea">
          <div className="tab">
            BIGODE
          </div>

          <div className="products">
            {shown.map((product) => (
              <article
                className={`product ${product.tone}`}
                key={product.name}
              >
                <div className="productArt">
                  <img
                    className="productLogo"
                    src="/logo-bigode-bypass.png"
                    alt="Bigode Bypass"
                  />

                  <strong>
                    {product.tag}
                  </strong>

                  <small>
                    BIGODE BYPASS
                  </small>
                </div>

                <div className="productBody">
                  <h3>
                    {product.name}
                  </h3>

                  <div className="deal">
                    <s>
                      {money(product.old)}
                    </s>

                    <span>
                      ⌁{' '}
                      {Math.round(
                        (1 - product.price / product.old) * 100
                      )}
                      % OFF
                    </span>
                  </div>

                  <b className="amount">
                    {money(product.price)}
                  </b>

                  <small>
                    À vista no Pix
                  </small>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                  >
                    🛒 Comprar agora
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="why">
        <div>
          <b>⚡ Entrega digital</b>
          <span>
            Processo rápido e organizado.
          </span>
        </div>

        <div>
          <b>🔒 Compra segura</b>
          <span>
            Checkout preparado para pagamento protegido.
          </span>
        </div>

        <div>
          <b>🎧 Suporte</b>
          <span>
            Atendimento para suas compras.
          </span>
        </div>
      </section>

      <footer>
        <div>
          <div className="brand foot">
            <img
              className="footerLogo"
              src="/logo-bigode-bypass.png"
              alt="Bigode Bypass"
            />

            <strong>
              Bigode Bypass
            </strong>
          </div>

          <p>
            Produtos digitais com uma experiência rápida e suporte
            eficiente.
          </p>
        </div>

        <div className="social">
          ◉　▶　♪
        </div>

        <div className="copy">
          Copyright © 2026 - Bigode Bypass.
        </div>

        <div className="links">
          Termos e condições　 Privacidade
        </div>
      </footer>

      {drawer && (
        <div
          className="shade"
          onClick={() => setDrawer(false)}
        >
          <aside
            className="drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close"
              type="button"
              onClick={() => setDrawer(false)}
            >
              ×
            </button>

            <h2>Carrinho</h2>

            {cart.length === 0 ? (
              <p className="empty">
                Seu carrinho está vazio.
              </p>
            ) : (
              cart.map((product, index) => (
                <div
                  className="cartLine"
                  key={`${product.name}-${index}`}
                >
                  <div>
                    <b>{product.name}</b>
                    <small>Produto digital</small>
                  </div>

                  <strong>
                    {money(product.price)}
                  </strong>

                  <button
                    type="button"
                    onClick={() => removeFromCart(index)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}

            <div className="sum">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>

            <a
              className={`go ${
                !cart.length ? 'disabled' : ''
              }`}
              href={cart.length ? '/checkout' : '#'}
            >
              Ir para checkout
            </a>

            <small className="safe">
              🔒 Ambiente de compra protegido
            </small>
          </aside>
        </div>
      )}
    </main>
  );
}
