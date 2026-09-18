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
      <a className="brand" href="/"><img className="brandLogo" src={settings.logoUrl||'/logo-bigode-bypass.png'} alt={settings.siteName}/><div><strong>{settings.siteName}</strong><small>{settings.storeLabel}</small></div><i>✓</i></a>
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
          <img className="productThumb" src={p.imageUrl||'/banner-bigode-bypass.png'} alt={p.name}/>
        </a>
        <div className="productBody"><a onClick={()=>trackEvent('product_click',{product:p.slug,source:'title'})} href={'/produto?slug='+encodeURIComponent(p.slug)}><h3>{p.name}</h3></a><div className="deal"><s>{money(p.old)}</s><span>⌁ {p.old?Math.round((1-Number(p.price)/Number(p.old))*100):0}% OFF</span></div><b className="amount">{money(p.price)}</b><small>À vista no Pix</small><button onClick={()=>add(p)}>🛒 Comprar agora</button></div>
      </article>)}
      {!shown.length&&<div className="noResults">Nenhum produto encontrado.</div>}
    </div></div></section>

    <section className="why"><div><b>{settings.why1Title}</b><span>{settings.why1Text}</span></div><div><b>{settings.why2Title}</b><span>{settings.why2Text}</span></div><div><b>{settings.why3Title}</b><span>{settings.why3Text}</span></div></section>

    <footer><div><div className="brand foot"><img className="footerLogo" src={settings.logoUrl||'/logo-bigode-bypass.png'} alt={settings.siteName}/><strong>{settings.siteName}</strong></div><p>{settings.footerText}</p></div><div className="social"><a href={settings.discordUrl||'#'}>◉</a>　<a href={settings.youtubeUrl||'#'}>▶</a>　<a href={settings.tiktokUrl||'#'}>♪</a></div><div className="copy">{settings.copyright}</div><div className="links"><a href={settings.termsUrl||'/termos'}>{settings.termsLabel||'Termos'}</a>　 <a href={settings.privacyUrl||'/privacidade'}>{settings.privacyLabel||'Privacidade'}</a>　 <a href={settings.refundUrl||'/reembolso'}>{settings.refundLabel||'Reembolso'}</a>　 <a href={settings.supportPageUrl||'/suporte'}>{settings.supportPageLabel||'Suporte'}</a></div></footer>

    {drawer&&<div className="shade" onClick={()=>setDrawer(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setDrawer(false)}>×</button><h2>Carrinho <small>{count} item(ns)</small></h2>{!cart.length?<p className="empty">Seu carrinho está vazio.</p>:cart.map(x=><div className="cartLine" key={x.slug}><div><b>{x.name}</b><small>{money(x.price)}</small><div className="qty"><button onClick={()=>change(x.slug,-1)}>−</button><span>{x.quantity||1}</span><button onClick={()=>change(x.slug,1)}>+</button></div></div><strong>{money(Number(x.price)*(x.quantity||1))}</strong><button onClick={()=>remove(x.slug)}>×</button></div>)}<div className="sum"><span>Total</span><b>{money(total)}</b></div><a className={'go '+(!cart.length?'disabled':'')} onClick={()=>cart.length&&trackEvent('checkout_start',{cartCount:count,cartTotal:total,source:'cart'})} href={cart.length?'/checkout':'#'}>Ir para checkout</a><small className="safe">🔒 Ambiente de compra protegido</small></aside></div>}
  </main>
}