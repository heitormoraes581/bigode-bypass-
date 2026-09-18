export const API_BASE=process.env.NEXT_PUBLIC_API_BASE||'https://gfsbxqrteilieesyzhwq.supabase.co/functions/v1/store-api';
export function getToken(){
  if(typeof window==='undefined')return'';
  return sessionStorage.getItem('bb_token')||localStorage.getItem('bb_token')||'';
}
export function setToken(token,remember=true){
  if(typeof window==='undefined')return;
  localStorage.removeItem('bb_token');
  sessionStorage.removeItem('bb_token');
  if(!token)return;
  (remember?localStorage:sessionStorage).setItem('bb_token',token);
}
export async function api(path,options={}){
  const token=getToken();
  const isForm=typeof FormData!=='undefined'&&options.body instanceof FormData;
  const headers={...(!isForm&&options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{}),...(token?{Authorization:'Bearer '+token}:{})};
  const res=await fetch(API_BASE+path,{...options,headers});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||'Erro na solicitação');
  return data;
}