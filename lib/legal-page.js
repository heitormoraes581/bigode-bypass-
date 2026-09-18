'use client';
import{useEffect,useState}from'react';
import{loadSite,defaultSite}from'./site-client';

function renderContent(content){
 const lines=String(content||'').split('\n');
 return lines.map((raw,i)=>{
   const line=raw.trim();
   if(!line)return <div className="legalSpacer" key={i}/>;
   if(line==='---')return <hr className="legalRule" key={i}/>;
   if(line.startsWith('### '))return <h3 className="legalSubheading" key={i}>{line.slice(4)}</h3>;
   if(line.startsWith('## '))return <h2 className="legalSectionHeading" key={i}>{line.slice(3)}</h2>;
   if(line.startsWith('- '))return <div className="legalBullet" key={i}><span>•</span><p>{line.slice(2)}</p></div>;
   return <p key={i}>{line}</p>;
 });
}

export default function LegalPage({type,title}){
 const[site,setSite]=useState(defaultSite);
 useEffect(()=>{loadSite().then(setSite)},[]);
 const key={terms:'termsContent',privacy:'privacyContent',refund:'refundContent',support:'supportContent'}[type];
 const content=site[key]||'';
 return <main className="legalPage" style={{'--blue':site.primaryColor,'--bg':site.backgroundColor,'--panel':site.panelColor}}>
   <header className="accountHeader"><a className="accountBrand" href="/"><img src={site.logoUrl}/><b>{site.siteName}</b></a><a href="/">← Voltar à loja</a></header>
   <section className="legalWrap">
     <span className="legalEyebrow">{String(site.siteName||'BIGODE BYPASS').toUpperCase()}</span>
     <h1>{title}</h1>
     <div className="legalDocument">{renderContent(content)}</div>
     {type==='support'&&site.discordUrl&&site.discordUrl!=='#'&&<a className="legalCta" href={site.discordUrl}>Abrir Discord</a>}
   </section>
 </main>
}