'use client';
import{useEffect,useState}from'react';
import{api,setToken}from'../../lib/api-client';
import{signInWithDiscord,signOutSupabase}from'../../lib/supabase-browser';

export default function Account(){
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[user,setUser]=useState(null),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false),[discordLoading,setDiscordLoading]=useState(false);
 useEffect(()=>{api('/auth/me').then(d=>setUser(d.user)).catch(()=>{})},[]);
 const login=async e=>{e.preventDefault();setLoading(true);setMsg('');try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});setToken(d.token);setUser(d.user);setMsg('Login realizado.')}catch(e){setMsg(e.message)}finally{setLoading(false)}};
 const discord=async()=>{setDiscordLoading(true);setMsg('');try{const{error}=await signInWithDiscord();if(error)throw error}catch(e){setMsg(e.message||'Não foi possível abrir o Discord.');setDiscordLoading(false)}};
 const logout=async()=>{setToken('');await signOutSupabase();setUser(null);setEmail('');setPassword('')};
 return <main className="authPage"><a className="authBrand" href="/"><img src="/logo-bigode-bypass.png"/><b>Bigode Bypass</b></a><section className="authCard">{user?<><span>MINHA CONTA</span><h1>Olá, {user.name}</h1>{user.avatar_url&&<img className="accountAvatar" src={user.avatar_url} alt="Avatar"/>}<p>{user.email}</p><div className="authActions"><a href="/pedidos">Meus pedidos</a>{user.role==='admin'&&<a href="/admin">Painel admin</a>}<button onClick={logout}>Sair</button></div></>:<><span>ACESSAR CONTA</span><h1>Entrar</h1><button className="discordLogin" onClick={discord} disabled={discordLoading}><span className="discordIcon">◉</span>{discordLoading?'Abrindo Discord...':'Entrar com Discord'}</button><div className="authDivider"><span>ou</span></div><form onSubmit={login}><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength="6" required/></label>{msg&&<p className="formMessage">{msg}</p>}<button className="authSubmit" disabled={loading}>{loading?'Entrando...':'Entrar com e-mail'}</button></form><p className="authSwitch">Ainda não tem conta? <a href="/cadastro">Criar conta</a></p></>}</section></main>
}