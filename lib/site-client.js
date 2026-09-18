import{api}from'./api-client';

export const defaultSite={
 siteName:'Bigode Bypass',
 storeLabel:'LOJA DIGITAL',
 logoUrl:'/logo-bigode-bypass.png',
 primaryColor:'#2116ff',
 backgroundColor:'#07080b',
 panelColor:'#0d0e12',
 seoTitle:'Bigode Bypass',
 seoDescription:'Loja digital Bigode Bypass',
 termsLabel:'Termos e condições',
 termsUrl:'/termos',
 privacyLabel:'Privacidade',
 privacyUrl:'/privacidade',
 refundLabel:'Reembolso',
 refundUrl:'/reembolso',
 supportPageLabel:'Suporte',
 supportPageUrl:'/suporte',
 termsContent:'Use esta página para informar as condições de uso da loja. Revise este conteúdo no painel administrativo.',
 privacyContent:'Explique aqui como os dados dos clientes são tratados. Revise este conteúdo no painel administrativo.',
 refundContent:'Informe aqui as regras de cancelamento e reembolso. Revise este conteúdo no painel administrativo.',
 supportContent:'Para dúvidas sobre pedidos e atendimento, utilize os canais oficiais indicados nesta página.'
};

export async function loadSite(){
 try{
  const d=await api('/site');
  return {...defaultSite,...(d.settings||{})};
 }catch{
  return defaultSite;
 }
}
