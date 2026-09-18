'use client';
import{useEffect,useState}from'react';
import fallback from'../../data/products.json';
import{api}from'../../lib/api-client';
import{loadSite,defaultSite}from'../../lib/site-client';
import{addCartItem,loadCart,saveCart}from'../../lib/cart-client';

const money=v=>'R$ '+Number(v||0).toFixed(2).replace('.',',');

export default function ProductPage(){
 const[p,setP]=useState(null),[added,setAdded]=useState(false),[site,setSite]=useState(defaultSite);
 useEffect(()=>{
   const slug=new URLSearchParams(location.search).get('slug');
   const fb=fallback.find(x=>x.slug===slug);
   if(fb)setP(fb);
   if(slug)api('/products/'+encodeURIComponent(slug)).then(d=>setP(d.product)).catch(()=>{});
   loadSite().then(setSite);
 },[]);
 if(!p)return <main className="productPage"><p>Produto não encontrado.</p><a href="/">Voltar</a></main>;
 const add=()=>{saveCart(addCartItem(loadCart(),p));setAdded(true)};
 const style={'--blue':site.primaryColor,'--bg':site.backgroundColor,'--panel':site.panelColor};
 return <main className="productPage" style={style}><header className="accountHeader"><a className="accountBrand" href="/"><img src={site.logoUrl}/><b>{site.siteName}</b></a><a href="/">← Loja</a></header><div className="productDetail"><div className={'productHero '+(p.tone||'blue')}><img src={p.imageUrl||site.logoUrl}/><span>{p.tag}</span></div><section><small>{site.siteName?.toUpperCase()}</small><h1>{p.name}</h1><p>{p.description}</p><div className="productDetailPrice"><s>{money(p.old)}</s><b>{money(p.price)}</b><span>À vista no Pix</span></div><div className="stockPill">{p.stock>0?'Em estoque: '+p.stock:'Esgotado'}</div><button disabled={p.stock<=0} onClick={add}>🛒 Adicionar ao carrinho</button>{added&&<div className="addedBox">Adicionado ao carrinho. <a href="/checkout">Ir para checkout →</a></div>}<ul><li>Entrega digital</li><li>Pedido registrado na sua conta</li><li>Suporte para a compra</li></ul></section></div></main>
}