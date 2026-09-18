'use client';
import{useEffect,useMemo,useState}from'react';
import fallbackProducts from'../data/products.json';
import{api,setToken}from'../lib/api-client';
import{signOutSupabase}from'../lib/supabase-browser';
import{addCartItem,cartCount,cartTotal,loadCart,saveCart}from'../lib/cart-client';

const money=v=>'R$ '+Number(v||0).toFixed(2).replace('.',',');
export default function Home(){
  const[products,setProducts]=useState(fallbackProducts),[cart,setCart]=useState([]),[drawer,setDrawer]=useState(false),[query,setQuery]=useState(''),[profile,setProfile]=useState(false),[user,setUser]=useState(null);
  useEffect(()=>{setCart(loadCart());api('/products').then(d=>d.products?.length&&setProducts(d.products)).catch(()=>{});api('/auth/me').then(d=>setUser(d.user)).catch(()=>{})},[]);
  useEffect(()=>{saveCart(cart)},[cart]);
  const shown=products.filter(p=>p.active!==false&&p.name.toLowerCase().includes(query.toLowerCase()));
  const total=useMemo(()=>cartTotal(cart),[cart]),count=useMemo(()=>cartCount(cart),[cart]);
  const add=p=>{setCart(c=>addCartItem(c,p));setDrawer(true)};
  const change=(slug,delta)=>setCart(c=>c.map(x=>x.slug===slug?{...x,quantity:Math.max(1,(x.quantity||1)+delta)}:x));
  const remove=slug=>setCart(c=>c.filter(x=>x.slug!==slug));
  const logout=async()=>{setToken('');await signOutSupabase();setUser(null);setProfile(false)};
  return <main>
    <div className="support">Alguma dúvida? <b>Abra um ticket em nosso servidor</b></div>
    <header>
      <a className="brand" href="/"><img className="brandLogo" src="/logo-bigode-bypass.png" alt="Bigode Bypass"/><div><strong>Bigode Bypass</strong><small>LOJA DIGITAL</small></div><i>✓</i></a>
      <div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar produto"/></div>
      <div className="actions"><button className="headset" type="button">◉</button><div className="profileWrap">
        <button className="profile" type="button" onClick={()=>user?setProfile(!profile):location.href='/conta'}>{user?.avatar_url?<img className="profileAvatar" src={user.avatar_url} alt="Avatar"/>:<span>{user?.name?.slice(0,2).toUpperCase()||'BB'}</span>}<div><b>{user?.name||'Entrar'}</b><small>{user?'Meu perfil ⌄':'Acessar conta'}</small></div></button>
        {profile&&user&&<div className="profileMenu"><b>{user.name}</b><small>{user.email}</small><hr/><a href="/pedidos">▣ Meus pedidos</a>{user.role==='admin'&&<a href="/admin">⚙ Administração</a>}<button className="logout" onClick={logout}>↪ Sair da conta</button></div>}
      </div><button className="cartBtn" onClick={()=>setDrawer(true)}>🛒 Carrinho <b>{count}</b></button></div>
    </header>

    <section className="banner officialBannerWrap"><img className="officialBanner" src="/banner-bigode-bypass.png" alt="Bigode Bypass"/></section>

    <section className="intro"><h1>Sua experiência em<br/><em>produtos digitais.</em></h1><p>Uma loja moderna, rápida e organizada, com atendimento eficiente e uma experiência de compra feita para PC.</p><a href="#produtos">Ver produtos　→</a></section>

    <section className="popular"><h2>Categorias populares</h2><a className="category fivemCategory" href="#produtos"><div className="categoryMark">FIVEM</div></a></section>

    <section id="produtos" className="catalog"><aside className="filters"><b>CATEGORIAS</b><button className="active">FIVEM</button></aside><div className="productArea"><div className="tab">FIVEM</div><div className="products">
      {shown.map(p=><article className={'product '+(p.tone||'blue')} key={p.slug}>
        <a className="productArt" href={'/produto?slug='+encodeURIComponent(p.slug)}>
          <img className="productThumb" src={{
            'bigode-basic':'/cards/fivem-basic.svg',
            'bigode-advanced':'/cards/fivem-advanced.svg',
            'bigode-premium':'/cards/fivem-private.svg',
            'bigode-ultimate':'/cards/fivem-slotted.svg',
            'bigode-remote':'/cards/bigode-remote.svg',
            'bigode-exclusive':'/cards/fivem-exclusive.svg',
            'bigode-pro':'/cards/fivem-pro.svg',
            'bigode-1-1':'/cards/fivem-1-1.svg'
          }[p.slug]||'/banner-bigode-bypass.png'} alt={p.name}/>
        </a>
        <div className="productBody"><a href={'/produto?slug='+encodeURIComponent(p.slug)}><h3>{p.name}</h3></a><div className="deal"><s>{money(p.old)}</s><span>⌁ {p.old?Math.round((1-Number(p.price)/Number(p.old))*100):0}% OFF</span></div><b className="amount">{money(p.price)}</b><small>À vista no Pix</small><button onClick={()=>add(p)}>🛒 Comprar agora</button></div>
      </article>)}
      {!shown.length&&<div className="noResults">Nenhum produto encontrado.</div>}
    </div></div></section>

    <section className="why"><div><b>⚡ Entrega digital</b><span>Processo rápido e organizado.</span></div><div><b>🔒 Compra segura</b><span>Checkout preparado para pagamento protegido.</span></div><div><b>🎧 Suporte</b><span>Atendimento para suas compras.</span></div></section>
    <footer><div><div className="brand foot"><img className="footerLogo" src="/logo-bigode-bypass.png" alt="Bigode Bypass"/><strong>Bigode Bypass</strong></div><p>Produtos digitais com uma experiência rápida e suporte eficiente.</p></div><div className="social">◉　▶　♪</div><div className="copy">Copyright © 2026 - Bigode Bypass.</div><div className="links">Termos e condições　 Privacidade</div></footer>

    {drawer&&<div className="shade" onClick={()=>setDrawer(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setDrawer(false)}>×</button><h2>Carrinho <small>{count} item(ns)</small></h2>{!cart.length?<p className="empty">Seu carrinho está vazio.</p>:cart.map(x=><div className="cartLine" key={x.slug}><div><b>{x.name}</b><small>{money(x.price)}</small><div className="qty"><button onClick={()=>change(x.slug,-1)}>−</button><span>{x.quantity||1}</span><button onClick={()=>change(x.slug,1)}>+</button></div></div><strong>{money(Number(x.price)*(x.quantity||1))}</strong><button onClick={()=>remove(x.slug)}>×</button></div>)}<div className="sum"><span>Total</span><b>{money(total)}</b></div><a className={'go '+(!cart.length?'disabled':'')} href={cart.length?'/checkout':'#'}>Ir para checkout</a><small className="safe">🔒 Ambiente de compra protegido</small></aside></div>}
  </main>
}