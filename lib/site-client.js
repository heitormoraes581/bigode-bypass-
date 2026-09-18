import{api}from'./api-client';

export const defaultSite={
 siteName:'Bigode Bypass',
 storeLabel:'LOJA DIGITAL',
 logoUrl:'/logo-bigode-bypass.png',
 primaryColor:'#2116ff',
 backgroundColor:'#07080b',
 panelColor:'#0d0e12',
 seoTitle:'Bigode Bypass',
 seoDescription:'Loja digital Bigode Bypass'
};

export async function loadSite(){
 try{
  const d=await api('/site');
  return {...defaultSite,...(d.settings||{})};
 }catch{
  return defaultSite;
 }
}
