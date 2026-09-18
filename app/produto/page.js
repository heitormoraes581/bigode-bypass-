'use client';
import{useEffect,useState}from'react';
import fallback from'../../data/products.json';
import{api}from'../../lib/api-client';
import{loadSite,defaultSite}from'../../lib/site-client';
import{addCartItem,loadCart,saveCart}from'../../lib/cart-client';
import{trackEvent,trackPageView}from'../../lib/analytics';

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


export default function ProductPage(){
 const[p,setP]=useState(null),[added,setAdded]=useState(false),[site,setSite]=useState(defaultSite);
 useEffect(()=>{
   const slug=new URLSearchParams(location.search).get('slug');
   trackPageView({source:'product'});
   if(slug)trackEvent('product_view',{product:slug});
   const fb=fallback.find(x=>x.slug===slug);
   if(fb)setP(fb);
   if(slug)api('/products/'+encodeURIComponent(slug)).then(d=>setP(d.product)).catch(()=>{});
   loadSite().then(setSite);
 },[]);
 if(!p)return <main className="productPage"><p>Produto não encontrado.</p><a href="/">Voltar</a></main>;
 const add=()=>{saveCart(addCartItem(loadCart(),p));trackEvent('add_to_cart',{product:p.slug,quantity:1,source:'product_page'});setAdded(true)};
 const style={'--blue':site.primaryColor,'--bg':site.backgroundColor,'--panel':site.panelColor};
 return <main className="productPage" style={style}><header className="accountHeader"><a className="accountBrand" href="/"><img src={site.logoUrl}/><b>{site.siteName}</b></a><a href="/">← Loja</a></header><div className="productDetail"><div className={'productHero '+(p.tone||'blue')}><img src={productImage(p)}/><span>{p.tag}</span></div><section><small>{site.siteName?.toUpperCase()}</small><h1>{p.name}</h1><p>{p.description}</p><div className="productDetailPrice"><s>{money(p.old)}</s><b>{money(p.price)}</b><span>À vista no Pix</span></div><div className="stockPill">{p.stock>0?'Em estoque: '+p.stock:'Esgotado'}</div><button disabled={p.stock<=0} onClick={add}>🛒 Adicionar ao carrinho</button>{added&&<div className="addedBox">Adicionado ao carrinho. <a onClick={()=>trackEvent('checkout_start',{product:p.slug,source:'product_page'})} href="/checkout">Ir para checkout →</a></div>}<ul><li>Entrega digital</li><li>Pedido registrado na sua conta</li><li>Suporte para a compra</li></ul></section></div></main>
}