const http=require('http');
const PORT=process.env.PORT||3001;
const replacement='https://gfsbxqrteilieesyzhwq.supabase.co/functions/v1/store-api';

const server=http.createServer((req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-store');
  if(req.url==='/health'){
    res.statusCode=200;
    return res.end(JSON.stringify({ok:true,deprecated:true,replacement}));
  }
  res.statusCode=410;
  res.end(JSON.stringify({error:'API antiga desativada',replacement}));
});

server.listen(PORT,()=>console.log('Legacy API disabled on port '+PORT));
