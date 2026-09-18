'use client';
import{useEffect,useMemo,useState}from'react';
import fallbackProducts from'../data/products.json';
import{api,setToken}from'../lib/api-client';
import{signOutSupabase}from'../lib/supabase-browser';
import{addCartItem,cartCount,cartTotal,loadCart,saveCart}from'../lib/cart-client';
import{trackEvent,trackPageView}from'../lib/analytics';

const fallbackSettings={
 siteName:'Bigode Bypass',storeLabel:'LOJA DIGITAL',logoUrl:'/logo-bigode-bypass.png',
 supportText:'Alguma dúvida?',supportCta:'Abra um ticket em nosso servidor',supportUrl:'#',
 bannerUrl:'/banner-bigode-bypass.png',heroTitle:'Sua experiência em',heroHighlight:'produtos digitais.',
 heroText:'Uma loja moderna, rápida e organizada, com atendimento eficiente e uma experiência de compra feita para PC.',
 heroButton:'Ver produtos',popularTitle:'Categorias populares',
 footerText:'Produtos digitais com uma experiência rápida e suporte eficiente.',
 copyright:'Copyright © 2026 - Bigode Bypass.',termsLabel:'Termos e condições',termsUrl:'#',
 privacyLabel:'Privacidade',privacyUrl:'#',discordUrl:'#',youtubeUrl:'#',tiktokUrl:'#',
 primaryColor:'#2116ff',backgroundColor:'#07080b',panelColor:'#0d0e12',
 seoTitle:'Bigode Bypass',seoDescription:'Loja digital Bigode Bypass',
 why1Title:'⚡ Entrega digital',why1Text:'Processo rápido e organizado.',
 why2Title:'🔒 Compra segura',why2Text:'Checkout preparado para pagamento protegido.',
 why3Title:'🎧 Suporte',why3Text:'Atendimento para suas compras.'
};
const fallbackCategories=[{id:1,slug:'fivem',name:'FIVEM',image_url:'',active:true,sort_order:1}];
const money=v=>'R$ '+Number(v||0).toFixed(2).replace('.',',');
const productImages={
 'bigode-basic':'/cards/fivem-basic.svg',
 'bigode-advanced':'/cards/fivem-advanced.svg',
 'bigode-premium':'/cards/fivem-private.svg',
 'bigode-ultimate':'/cards/fivem-slotted.svg',
 'bigode-remote':'/cards/bigode-remote.svg',
 'bigode-exclusive':'/cards/fivem-exclusive.svg',
 'bigode-pro':'/cards/fivem-pro.svg',
 'bigode-1-1':'/cards/fivem-1-1.svg'
};
const productImage=p=>p?.imageUrl||p?.image_url||productImages[p?.slug]||'/banner-bigode-bypass.png';


export default function Home(){
  const[products,setProducts]=useState(fallbackProducts),[categories,setCategories]=useState(fallbackCategories),[settings,setSettings]=useState(fallbackSettings);
  const[cart,setCart]=useState([]),[drawer,setDrawer]=useState(false),[query,setQuery]=useState(''),[profile,setProfile]=useState(false),[user,setUser]=useState(null),[category,setCategory]=useState('fivem');

  useEffect(()=>{
    trackPageView({source:'home'});
    setCart(loadCart());
    api('/products').then(d=>d.products?.length&&setProducts(d.products)).catch(()=>{});
    api('/site').then(d=>{
      if(d.settings)setSettings({...fallbackSettings,...d.settings});
      if(d.categories?.length){setCategories(d.categories);setCategory(d.categories[0].slug)}
    }).catch(()=>{});
    api('/auth/me').then(d=>setUser(d.user)).catch(()=>{});
  },[]);

  useEffect(()=>{saveCart(cart)},[cart]);
  useEffect(()=>{
    document.title=settings.seoTitle||settings.siteName||'Bigode Bypass';
    let m=document.querySelector('meta[name="description"]');
    if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m)}
    m.content=settings.seoDescription||'';
  },[settings]);

  const shown=products.filter(p=>p.active!==false&&(category==='all'||(p.categorySlug||'fivem')===category)&&p.name.toLowerCase().includes(query.toLowerCase()));
  const total=useMemo(()=>cartTotal(cart),[cart]),count=useMemo(()=>cartCount(cart),[cart]);
  const add=p=>{setCart(c=>addCartItem(c,p));trackEvent('add_to_cart',{product:p.slug,quantity:1});setDrawer(true)};
  const change=(slug,delta)=>setCart(c=>c.map(x=>x.slug===slug?{...x,quantity:Math.max(1,(x.quantity||1)+delta)}:x));
  const remove=slug=>setCart(c=>c.filter(x=>x.slug!==slug));
  const logout=async()=>{trackEvent('logout',{source:'home'});setToken('');await signOutSupabase();setUser(null);setProfile(false)};

  const style={'--blue':settings.primaryColor||'#2116ff','--bg':settings.backgroundColor||'#07080b','--panel':settings.panelColor||'#0d0e12'};
  return <main style={style}>
    <div className="support">{settings.supportText} <a href={settings.supportUrl||'#'}><b>{settings.supportCta}</b></a></div>
    <header>
      <a className="brand headerBrand" href="/"><img className="brandLogo" src={settings.logoUrl||'/logo-bigode-bypass.png'} alt={settings.siteName}/><div className="brandCopy"><div className="brandTitleRow"><strong>{settings.siteName}</strong><svg className="verifiedBadge" viewBox="0 0 24 24" role="img" aria-label="Verificado"><path className="verifiedShape" d="M23.2 12c0 1.18-1.37 2.02-1.71 3.08-.36 1.1.31 2.5-.36 3.42-.68.93-2.21.72-3.15 1.4-.92.67-1.2 2.18-2.3 2.54-1.06.34-2.17-.7-3.35-.7s-2.29 1.04-3.35.7c-1.1-.36-1.38-1.87-2.3-2.54-.94-.68-2.47-.47-3.15-1.4-.67-.92 0-2.32-.36-3.42C2.84 14.02 1.47 13.18 1.47 12s1.37-2.02 1.71-3.08c.36-1.1-.31-2.5.36-3.42.68-.93 2.21-.72 3.15-1.4.92-.67 1.2-2.18 2.3-2.54 1.06-.34 2.17.7 3.35.7s2.29-1.04 3.35-.7c1.1.36 1.38 1.87 2.3 2.54.94.68 2.47.47 3.15 1.4.67.92 0 2.32.36 3.42.34 1.06 1.71 1.9 1.71 3.08Z"/><path className="verifiedCheck" d="m9.86 15.52-3.1-3.1 1.42-1.42 1.68 1.68 5.98-5.98 1.42 1.42-7.4 7.4Z"/></svg></div><small>{settings.storeLabel}</small></div></a>
      <div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar produto"/></div>
      <div className="actions"><button className="headset" type="button">◉</button><div className="profileWrap">
        <button className="profile" type="button" onClick={()=>user?setProfile(!profile):location.href='/conta'}>{user?.avatar_url?<img className="profileAvatar" src={user.avatar_url} alt="Avatar"/>:<span>{user?.name?.slice(0,2).toUpperCase()||'BB'}</span>}<div><b>{user?.name||'Entrar'}</b><small>{user?'Meu perfil ⌄':'Acessar conta'}</small></div></button>
        {profile&&user&&<div className="profileMenu"><b>{user.name}</b><small>{user.email}</small><hr/><a href="/pedidos">▣ Meus pedidos</a>{user.role==='admin'&&<a href="/admin">⚙ Administração</a>}<button className="logout" onClick={logout}>↪ Sair da conta</button></div>}
      </div><button className="cartBtn" onClick={()=>{trackEvent('cart_open',{cartCount:count,cartTotal:total});setDrawer(true)}}>🛒 Carrinho <b>{count}</b></button></div>
    </header>

    <section className="banner officialBannerWrap"><img className="officialBanner" src={settings.bannerUrl||'/banner-bigode-bypass.png'} alt={settings.siteName}/></section>

    <section className="intro"><h1>{settings.heroTitle}<br/><em>{settings.heroHighlight}</em></h1><p>{settings.heroText}</p><a href="#produtos">{settings.heroButton}　→</a></section>

    <section className="popular"><h2>{settings.popularTitle}</h2><div className="categoryList">
      {categories.filter(c=>c.active!==false).map(c=><button className={'category '+(category===c.slug?'selected':'')} key={c.id||c.slug} onClick={()=>{setCategory(c.slug);trackEvent('category_select',{category:c.slug});location.hash='produtos'}}>
        {c.image_url?<img className="categoryLogo" src={c.image_url} alt={c.name}/>:<div className="categoryMark">{c.name}</div>}
      </button>)}
    </div></section>

    <section id="produtos" className="catalog"><div className="productArea"><div className="catalogHeader"><div><small>CATÁLOGO</small><h2>{categories.find(c=>c.slug===category)?.name||'Produtos'}</h2></div><span>{shown.length} {shown.length===1?'produto':'produtos'}</span></div><div className="products">
      {shown.map(p=><article className={'product '+(p.tone||'blue')} key={p.slug}>
        <a className="productArt" onClick={()=>trackEvent('product_click',{product:p.slug,source:'image'})} href={'/produto?slug='+encodeURIComponent(p.slug)}>
          <img className="productThumb" src={productImage(p)} alt={p.name}/>
        </a>
        <div className="productBody"><a onClick={()=>trackEvent('product_click',{product:p.slug,source:'title'})} href={'/produto?slug='+encodeURIComponent(p.slug)}><h3>{p.name}</h3></a><div className="deal"><s>{money(p.old)}</s><span>⌁ {p.old?Math.round((1-Number(p.price)/Number(p.old))*100):0}% OFF</span></div><b className="amount">{money(p.price)}</b><small>À vista no Pix</small><button onClick={()=>add(p)}>🛒 Comprar agora</button></div>
      </article>)}
      {!shown.length&&<div className="noResults">Nenhum produto encontrado.</div>}
    </div></div></section>

    <section className="why"><div><b>{settings.why1Title}</b><span>{settings.why1Text}</span></div><div><b>{settings.why2Title}</b><span>{settings.why2Text}</span></div><div><b>{settings.why3Title}</b><span>{settings.why3Text}</span></div></section>

    <footer><div><div className="brand foot"><img className="footerLogo" src={settings.logoUrl||'/logo-bigode-bypass.png'} alt={settings.siteName}/><strong>{settings.siteName}</strong></div><p>{settings.footerText}</p></div><div className="social">
  <a href={settings.discordUrl||'#'} aria-label="Discord" title="Discord">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 7.2c1.5-1.1 7.7-1.1 9.2 0 .9 1.4 1.7 3.9 1.6 6.3-1.1 1.6-2.7 2.5-4.1 2.9l-.9-1.2c.8-.2 1.6-.6 2.2-1.1-2.1 1-4.7 1-6.8 0 .6.5 1.4.9 2.2 1.1l-.9 1.2c-1.4-.4-3-1.3-4.1-2.9-.1-2.4.7-4.9 1.6-6.3Zm2.2 5.5c.7 0 1.2-.6 1.2-1.3s-.5-1.3-1.2-1.3-1.2.6-1.2 1.3.5 1.3 1.2 1.3Zm4.8 0c.7 0 1.2-.6 1.2-1.3s-.5-1.3-1.2-1.3-1.2.6-1.2 1.3.5 1.3 1.2 1.3Z"/></svg>
  </a>
  <a href={settings.youtubeUrl||'#'} aria-label="YouTube" title="YouTube">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 7.2a2.8 2.8 0 0 0-2-2C16.8 4.7 12 4.7 12 4.7s-4.8 0-6.5.5a2.8 2.8 0 0 0-2 2C3 8.9 3 12 3 12s0 3.1.5 4.8a2.8 2.8 0 0 0 2 2c1.7.5 6.5.5 6.5.5s4.8 0 6.5-.5a2.8 2.8 0 0 0 2-2c.5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8ZM10.2 15.2V8.8l5.5 3.2-5.5 3.2Z"/></svg>
  </a>
  <a href={settings.tiktokUrl||'#'} aria-label="TikTok" title="TikTok">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 4h2.3c.2 1.5 1.1 2.7 2.7 3.2v2.4c-1.1 0-2.1-.3-3-.9v5.4a5 5 0 1 1-4.3-5v2.5a2.6 2.6 0 1 0 1.9 2.5V4h.4Z"/></svg>
  </a>
</div><div className="copy">{settings.copyright}</div><div className="links"><a href={settings.termsUrl||'/termos'}>{settings.termsLabel||'Termos'}</a>　 <a href={settings.privacyUrl||'/privacidade'}>{settings.privacyLabel||'Privacidade'}</a>　 <a href={settings.refundUrl||'/reembolso'}>{settings.refundLabel||'Reembolso'}</a>　 <a href={settings.supportPageUrl||'/suporte'}>{settings.supportPageLabel||'Suporte'}</a></div></footer>

    {drawer&&<div className="shade" onClick={()=>setDrawer(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setDrawer(false)}>×</button><h2>Carrinho <small>{count} item(ns)</small></h2>{!cart.length?<p className="empty">Seu carrinho está vazio.</p>:cart.map(x=><div className="cartLine" key={x.slug}><div><b>{x.name}</b><small>{money(x.price)}</small><div className="qty"><button onClick={()=>change(x.slug,-1)}>−</button><span>{x.quantity||1}</span><button onClick={()=>change(x.slug,1)}>+</button></div></div><strong>{money(Number(x.price)*(x.quantity||1))}</strong><button onClick={()=>remove(x.slug)}>×</button></div>)}<div className="sum"><span>Total</span><b>{money(total)}</b></div><a className={'go '+(!cart.length?'disabled':'')} onClick={()=>cart.length&&trackEvent('checkout_start',{cartCount:count,cartTotal:total,source:'cart'})} href={cart.length?'/checkout':'#'}>Ir para checkout</a><small className="safe">🔒 Ambiente de compra protegido</small></aside></div>}
  </main>
}