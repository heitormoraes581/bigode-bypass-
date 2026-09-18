'use client';
import{useEffect,useState}from'react';
import{api,setToken}from'../../../lib/api-client';
import{getSupabaseBrowser,signOutSupabase}from'../../../lib/supabase-browser';
import{trackEvent}from'../../../lib/analytics';

export default function DiscordCallback(){
 const[msg,setMsg]=useState('Conectando sua conta do Discord...');
 useEffect(()=>{
   let done=false;
   const finish=async session=>{
     if(done||!session?.access_token)return;
     done=true;
     try{
       const d=await api('/auth/discord',{method:'POST',body:JSON.stringify({accessToken:session.access_token})});
       const remember=sessionStorage.getItem('bb_remember_oauth')==='1';
       setToken(d.token,remember);
       trackEvent('login_success',{method:'discord'});
       sessionStorage.removeItem('bb_remember_oauth');
       if(!remember)await signOutSupabase();
       setMsg('Login concluído. Redirecionando...');
       location.replace('/pedidos');
     }catch(e){
       setMsg(e.message||'Não foi possível concluir o login.');
     }
   };
   const supabase=getSupabaseBrowser();
   supabase.auth.getSession().then(({data})=>finish(data.session));
   const{data:listener}=supabase.auth.onAuthStateChange((_event,session)=>finish(session));
   const timeout=setTimeout(async()=>{
     if(done)return;
     const hash=new URLSearchParams(location.hash.replace(/^#/,''));
     const error=hash.get('error_description')||hash.get('error');
     if(error)setMsg(decodeURIComponent(error));
   },1800);
   return()=>{clearTimeout(timeout);listener.subscription.unsubscribe()};
 },[]);
 return <main className="authPage"><a className="authBrand" href="/"><img src="/logo-bigode-bypass.png"/><b>Bigode Bypass</b></a><section className="authCard callbackCard"><span>DISCORD</span><h1>Entrando...</h1><p className="formMessage">{msg}</p><a className="callbackBack" href="/conta">Voltar para o login</a></section></main>
}