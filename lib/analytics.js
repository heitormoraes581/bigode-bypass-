import{api}from'./api-client';

function getSessionId(){
  if(typeof window==='undefined')return'';
  let id=sessionStorage.getItem('bb_activity_session');
  if(!id){
    id=(crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36)).replace(/[^a-zA-Z0-9_-]/g,'');
    sessionStorage.setItem('bb_activity_session',id);
  }
  return id;
}

export function trackEvent(eventType,metadata={},page){
  if(typeof window==='undefined')return;
  const payload={
    eventType,
    sessionId:getSessionId(),
    page:page||location.pathname+location.search,
    metadata
  };
  api('/events',{method:'POST',body:JSON.stringify(payload)}).catch(()=>{});
}

export function trackPageView(extra={}){
  trackEvent('page_view',extra);
}
