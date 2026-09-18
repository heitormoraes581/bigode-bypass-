import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL='https://gfsbxqrteilieesyzhwq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_lPznn0iyOZ-aE-_IHQgCrQ_on2u9abU';

let client;
export function getSupabaseBrowser(){
  if(!client){
    client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{persistSession:true,detectSessionInUrl:true,flowType:'implicit'}
    });
  }
  return client;
}

export async function signInWithDiscord(remember=false){
  if(typeof window!=='undefined')sessionStorage.setItem('bb_remember_oauth',remember?'1':'0');
  const supabase=getSupabaseBrowser();
  const redirectTo=window.location.origin+'/auth/callback';
  return supabase.auth.signInWithOAuth({
    provider:'discord',
    options:{redirectTo}
  });
}

export async function signOutSupabase(){
  try{await getSupabaseBrowser().auth.signOut()}catch{}
}
