'use client';
import{useEffect,useState}from'react';
import{loadSite,defaultSite}from'./site-client';

export default function LegalPage({type,title}){
 const[site,setSite]=useState(defaultSite);
 useEffect(()=>{loadSite().then(setSite)},[]);
 const key={terms:'termsContent',privacy:'privacyContent',refund:'refundContent',support:'supportContent'}[type];
 const content=site[key]||'';
 return <main className="legalPage" style={{'--blue':site.primaryColor,'--bg':site.backgroundColor,'--panel':site.panelColor}}>
   <header className="accountHeader"><a className="accountBrand" href="/"><img src={site.logoUrl}/><b>{site.siteName}</b></a><a href="/">← Voltar à loja</a></header>
   <section className="legalCard"><span>INFORMAÇÕES</span><h1>{title}</h1><div className="legalContent">{content.split('\n').map((p,i)=><p key={i}>{p}</p>)}</div>{type==='support'&&site.discordUrl&&site.discordUrl!=='#'&&<a className="legalCta" href={site.discordUrl}>Abrir Discord</a>}</section>
 </main>
}