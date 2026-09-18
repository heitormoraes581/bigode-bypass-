'use client';
import{useEffect,useState}from'react';
import{loadSite,defaultSite}from'./site-client';

function titleIcon(site){
 return <img className="termMiniLogo" src={site.logoUrl||'/logo-bigode-bypass.png'} alt=""/>;
}
function renderContent(content,site){
 const lines=String(content||'').split('\n');
 return lines.map((raw,i)=>{
   const line=raw.trim();
   if(!line)return <div className="termsGap" key={i}/>;
   if(line==='---')return <hr className="termsDivider" key={i}/>;
   if(line.startsWith('### '))return <div className="termsSubhead" key={i}>{titleIcon(site)}<h3>{line.slice(4)}</h3></div>;
   if(line.startsWith('## '))return <div className="termsSectionHead" key={i}>{titleIcon(site)}<h2>{line.slice(3)}</h2></div>;
   if(line.startsWith('- '))return <div className="termsBullet" key={i}><span>•</span><p>{line.slice(2)}</p></div>;
   return <p className="termsParagraph" key={i}>{line}</p>;
 });
}

export default function LegalPage({type,title}){
 const[site,setSite]=useState(defaultSite);
 useEffect(()=>{loadSite().then(setSite)},[]);
 const key={terms:'termsContent',privacy:'privacyContent',refund:'refundContent',support:'supportContent'}[type];
 const content=site[key]||'';
 const isTerms=type==='terms';
 return <main className={'legalPage '+(isTerms?'termsPage':'')} style={{'--blue':site.primaryColor,'--bg':site.backgroundColor,'--panel':site.panelColor}}>
   <header className="accountHeader legalHeader"><a className="accountBrand" href="/"><img src={site.logoUrl}/><b>{site.siteName}</b></a><a href="/">← Voltar à loja</a></header>
   <section className="legalShell">
     <span className="legalEyebrow">{String(site.siteName||'BIGODE BYPASS').toUpperCase()}</span>
     <h1>{title}</h1>
     <div className="termsCard">{renderContent(content,site)}</div>
     {type==='support'&&site.discordUrl&&site.discordUrl!=='#'&&<a className="legalCta" href={site.discordUrl}>Abrir Discord</a>}
   </section>
 </main>
}