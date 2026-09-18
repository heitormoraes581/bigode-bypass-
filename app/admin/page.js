'use client';
import{useEffect,useState}from'react';
import{api,setToken}from'../../lib/api-client';

const money=v=>'R$ '+Number(v||0).toFixed(2).replace('.',',');
const emptySettings={
 siteName:'Bigode Bypass',storeLabel:'LOJA DIGITAL',logoUrl:'/logo-bigode-bypass.png',
 supportText:'Alguma dúvida?',supportCta:'Abra um ticket em nosso servidor',supportUrl:'#',
 bannerUrl:'/banner-bigode-bypass.png',heroTitle:'Sua experiência em',heroHighlight:'produtos digitais.',
 heroText:'Uma loja moderna, rápida e organizada, com atendimento eficiente e uma experiência de compra feita para PC.',
 heroButton:'Ver produtos',popularTitle:'Categorias populares',
 footerText:'Produtos digitais com uma experiência rápida e suporte eficiente.',
 copyright:'Copyright © 2026 - Bigode Bypass.',termsLabel:'Termos e condições',termsUrl:'/termos',
 privacyLabel:'Privacidade',privacyUrl:'/privacidade',refundLabel:'Reembolso',refundUrl:'/reembolso',supportPageLabel:'Suporte',supportPageUrl:'/suporte',discordUrl:'#',youtubeUrl:'#',tiktokUrl:'#',
 primaryColor:'#2116ff',backgroundColor:'#07080b',panelColor:'#0d0e12',
 seoTitle:'Bigode Bypass',seoDescription:'Loja digital Bigode Bypass',
 why1Title:'⚡ Entrega digital',why1Text:'Processo rápido e organizado.',
 why2Title:'🔒 Compra segura',why2Text:'Checkout preparado para pagamento protegido.',
 why3Title:'🎧 Suporte',why3Text:'Atendimento para suas compras.',termsContent:'',privacyContent:'',refundContent:'',supportContent:''
};

export default function Admin(){
 const[user,setUser]=useState(undefined),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[tab,setTab]=useState('overview');
 const[metrics,setMetrics]=useState({}),[products,setProducts]=useState([]),[orders,setOrders]=useState([]),[orderEvents,setOrderEvents]=useState([]),[customers,setCustomers]=useState([]),[coupons,setCoupons]=useState([]),[categories,setCategories]=useState([]),[settings,setSettings]=useState(emptySettings),[media,setMedia]=useState([]),[activity,setActivity]=useState([]),[activityQuery,setActivityQuery]=useState(''),[activityType,setActivityType]=useState('all'),[orderQuery,setOrderQuery]=useState(''),[orderStatus,setOrderStatus]=useState('all'),[customerQuery,setCustomerQuery]=useState(''),[expandedOrder,setExpandedOrder]=useState(null);
 const[msg,setMsg]=useState(''),[saving,setSaving]=useState(false);

 const load=async()=>{
   const me=await api('/auth/me');setUser(me.user);
   if(me.user.role!=='admin')return;
   const[d,p,o,c,s,cat,m,cu,a]=await Promise.all([
     api('/admin/dashboard'),api('/admin/products'),api('/admin/orders'),api('/admin/coupons'),
     api('/admin/site'),api('/admin/categories'),api('/admin/media'),api('/admin/customers'),api('/admin/activity')
   ]);
   setMetrics(d);setProducts(p.products||[]);setOrders(o.orders||[]);setOrderEvents(o.events||[]);setCustomers(cu.customers||[]);setCoupons(c.coupons||[]);
   setSettings({...emptySettings,...(s.settings||{})});setCategories(cat.categories||[]);setMedia(m.files||[]);setActivity(a.activity||[]);
 };
 useEffect(()=>{load().catch(()=>setUser(null))},[]);
 const refreshActivity=async()=>{try{const a=await api('/admin/activity');setActivity(a.activity||[])}catch{}};
 useEffect(()=>{if(tab!=='activity'||user?.role!=='admin')return;refreshActivity();const id=setInterval(refreshActivity,10000);return()=>clearInterval(id)},[tab,user?.role]);

 const login=async e=>{e.preventDefault();try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});setToken(d.token);await load()}catch(e){setMsg(e.message)}};
 const flash=t=>{setMsg(t);setTimeout(()=>setMsg(''),2500)};

 const saveSite=async()=>{
   setSaving(true);
   try{const d=await api('/admin/site',{method:'PATCH',body:JSON.stringify({settings})});setSettings({...emptySettings,...d.settings});flash('Site atualizado.');}
   catch(e){flash(e.message)}finally{setSaving(false)}
 };
 const setS=(k,v)=>setSettings(x=>({...x,[k]:v}));
 const uploadMedia=async(file)=>{
   if(!file)return null;
   const fd=new FormData();fd.append('file',file);
   const d=await api('/admin/upload',{method:'POST',body:fd});
   setMedia(x=>[{name:d.name,url:d.url,createdAt:new Date().toISOString()},...x]);
   flash('Imagem enviada.');
   return d.url;
 };

 const patchProduct=async(p,changes)=>{
   try{const d=await api('/admin/products/'+p.id,{method:'PATCH',body:JSON.stringify(changes)});setProducts(xs=>xs.map(x=>x.id===p.id?d.product:x));flash('Produto atualizado.')}
   catch(e){flash(e.message)}
 };
 const createProduct=async e=>{
   e.preventDefault();const f=new FormData(e.currentTarget);
   try{
     const d=await api('/admin/products',{method:'POST',body:JSON.stringify({
       name:f.get('name'),slug:f.get('slug'),description:f.get('description'),
       old:Number(f.get('old')||0),price:Number(f.get('price')||0),stock:Number(f.get('stock')||0),
       tag:f.get('tag'),tone:f.get('tone')||'blue',imageUrl:f.get('imageUrl')||'',
       categorySlug:f.get('categorySlug')||'fivem',sortOrder:Number(f.get('sortOrder')||0),active:true
     })});
     setProducts(x=>[...x,d.product].sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0)));e.currentTarget.reset();flash('Produto criado.');
   }catch(e){flash(e.message)}
 };

 const createCategory=async e=>{
   e.preventDefault();const f=new FormData(e.currentTarget);
   try{
     const d=await api('/admin/categories',{method:'POST',body:JSON.stringify({name:f.get('name'),slug:f.get('slug'),imageUrl:f.get('imageUrl'),sortOrder:Number(f.get('sortOrder')||0),active:true})});
     setCategories(x=>[...x,d.category].sort((a,b)=>a.sort_order-b.sort_order));e.currentTarget.reset();flash('Categoria criada.');
   }catch(e){flash(e.message)}
 };
 const patchCategory=async(c,changes)=>{
   try{const d=await api('/admin/categories/'+c.id,{method:'PATCH',body:JSON.stringify(changes)});setCategories(xs=>xs.map(x=>x.id===c.id?d.category:x));flash('Categoria atualizada.')}
   catch(e){flash(e.message)}
 };

 const createCoupon=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{const d=await api('/admin/coupons',{method:'POST',body:JSON.stringify({code:f.get('code'),type:f.get('type'),value:Number(f.get('value')),maxUses:Number(f.get('maxUses'))||null})});setCoupons(x=>[d.coupon,...x]);e.currentTarget.reset();flash('Cupom criado.')}catch(e){flash(e.message)}};
 const status=async(o,s)=>{try{const note=prompt('Observação da mudança (opcional):')||'';const d=await api('/admin/orders/'+o.id,{method:'PATCH',body:JSON.stringify({status:s,note})});setOrders(xs=>xs.map(x=>x.id===o.id?d.order:x));if(d.event)setOrderEvents(x=>[...x,d.event]);flash('Pedido atualizado.')}catch(e){flash(e.message)}};
 const deleteOrder=async o=>{
   const extra=o.status==='pending'?' O estoque reservado será devolvido automaticamente.':'';
   if(!confirm('Excluir definitivamente o pedido #'+o.id+'?'+extra+' Esta ação não pode ser desfeita.'))return;
   try{
     await api('/admin/orders/'+o.id,{method:'DELETE'});
     setOrders(xs=>xs.filter(x=>x.id!==o.id));
     setOrderEvents(xs=>xs.filter(x=>x.order_id!==o.id));
     if(expandedOrder===o.id)setExpandedOrder(null);
     flash('Pedido #'+o.id+' excluído.');
   }catch(e){flash(e.message)}
 };

 if(user===undefined)return <main className="adminLogin"><p>Carregando...</p></main>;
 if(!user||user.role!=='admin')return <main className="adminLogin"><form onSubmit={login}><img src="/logo-bigode-bypass.png"/><h1>Administração</h1><input type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} required/>{msg&&<p>{msg}</p>}<button>Entrar</button><a href="/">← Voltar para a loja</a></form></main>;

 const title={overview:'Visão geral',site:'Editar site',appearance:'Aparência',categories:'Categorias',media:'Mídia',products:'Produtos',customers:'Clientes',activity:'Atividade',orders:'Pedidos',coupons:'Cupons'}[tab]||'Administração';

 return <main className="adminPage">
   <aside>
     <div className="adminBrand"><img src={settings.logoUrl||'/logo-bigode-bypass.png'}/><div><h2>{settings.siteName||'BIGODE'}</h2><small>ADMIN</small></div></div>
     <small>CMS DA LOJA</small>
     <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>▦ Visão geral</button>
     <button className={tab==='site'?'active':''} onClick={()=>setTab('site')}>✎ Editar site</button>
     <button className={tab==='appearance'?'active':''} onClick={()=>setTab('appearance')}>◐ Aparência</button>
     <button className={tab==='categories'?'active':''} onClick={()=>setTab('categories')}>▤ Categorias</button>
     <button className={tab==='media'?'active':''} onClick={()=>setTab('media')}>▧ Mídia</button>
     <button className={tab==='products'?'active':''} onClick={()=>setTab('products')}>▣ Produtos</button>
     <button className={tab==='customers'?'active':''} onClick={()=>setTab('customers')}>◎ Clientes</button>
     <button className={tab==='activity'?'active':''} onClick={()=>setTab('activity')}>◌ Atividade</button>
     <button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}>◫ Pedidos</button>
     <button className={tab==='coupons'?'active':''} onClick={()=>setTab('coupons')}>◇ Cupons</button>
     <a href="/">← Ver loja</a>
   </aside>

   <section>
     <div className="adminTopline"><div><span>PAINEL ADMINISTRATIVO</span><h1>{title}</h1></div>{['site','appearance'].includes(tab)&&<button className="publishBtn" onClick={saveSite} disabled={saving}>{saving?'Salvando...':'Salvar / Publicar'}</button>}</div>
     {msg&&<p className="formMessage">{msg}</p>}

     {tab==='overview'&&<>
       <div className="metrics">
         <div><small>Produtos</small><b>{metrics.products||0}</b></div>
         <div><small>Pedidos</small><b>{metrics.orders||0}</b></div>
         <div><small>Receita paga</small><b>{money(metrics.revenue)}</b></div>
         <div><small>Pendentes</small><b>{metrics.pending||0}</b></div>
       </div>
       <div className="adminTable cmsIntro"><h2>Editor do site</h2><p>Use <b>Editar site</b> para textos, banners, links, rodapé e SEO. Em <b>Aparência</b>, altere as cores principais. Categorias e produtos são atualizados diretamente no catálogo.</p></div>
     </>}

     {tab==='site'&&<div className="cmsGrid">
       <CmsSection title="Marca e cabeçalho">
         <Field label="Nome da loja" value={settings.siteName} onChange={v=>setS('siteName',v)}/>
         <Field label="Texto abaixo do nome" value={settings.storeLabel} onChange={v=>setS('storeLabel',v)}/>
         <MediaField label="Logo" value={settings.logoUrl} onChange={v=>setS('logoUrl',v)} upload={uploadMedia}/>
       </CmsSection>
       <CmsSection title="Barra de aviso">
         <Field label="Texto" value={settings.supportText} onChange={v=>setS('supportText',v)}/>
         <Field label="Botão / chamada" value={settings.supportCta} onChange={v=>setS('supportCta',v)}/>
         <Field label="Link" value={settings.supportUrl} onChange={v=>setS('supportUrl',v)}/>
       </CmsSection>
       <CmsSection title="Banner e destaque">
         <MediaField label="Banner principal" value={settings.bannerUrl} onChange={v=>setS('bannerUrl',v)} upload={uploadMedia}/>
         <Field label="Título" value={settings.heroTitle} onChange={v=>setS('heroTitle',v)}/>
         <Field label="Texto em destaque" value={settings.heroHighlight} onChange={v=>setS('heroHighlight',v)}/>
         <Area label="Descrição" value={settings.heroText} onChange={v=>setS('heroText',v)}/>
         <Field label="Texto do botão" value={settings.heroButton} onChange={v=>setS('heroButton',v)}/>
         <Field label="Título de categorias" value={settings.popularTitle} onChange={v=>setS('popularTitle',v)}/>
       </CmsSection>
       <CmsSection title="Blocos de confiança">
         <Field label="Bloco 1 - título" value={settings.why1Title} onChange={v=>setS('why1Title',v)}/>
         <Field label="Bloco 1 - texto" value={settings.why1Text} onChange={v=>setS('why1Text',v)}/>
         <Field label="Bloco 2 - título" value={settings.why2Title} onChange={v=>setS('why2Title',v)}/>
         <Field label="Bloco 2 - texto" value={settings.why2Text} onChange={v=>setS('why2Text',v)}/>
         <Field label="Bloco 3 - título" value={settings.why3Title} onChange={v=>setS('why3Title',v)}/>
         <Field label="Bloco 3 - texto" value={settings.why3Text} onChange={v=>setS('why3Text',v)}/>
       </CmsSection>
       <CmsSection title="Rodapé e redes">
         <Area label="Texto do rodapé" value={settings.footerText} onChange={v=>setS('footerText',v)}/>
         <Field label="Copyright" value={settings.copyright} onChange={v=>setS('copyright',v)}/>
         <Field label="Texto dos termos" value={settings.termsLabel} onChange={v=>setS('termsLabel',v)}/>
         <Field label="Link dos termos" value={settings.termsUrl} onChange={v=>setS('termsUrl',v)}/>
         <Field label="Texto da privacidade" value={settings.privacyLabel} onChange={v=>setS('privacyLabel',v)}/>
         <Field label="Link da privacidade" value={settings.privacyUrl} onChange={v=>setS('privacyUrl',v)}/>
         <Field label="Texto do reembolso" value={settings.refundLabel} onChange={v=>setS('refundLabel',v)}/>
         <Field label="Link do reembolso" value={settings.refundUrl} onChange={v=>setS('refundUrl',v)}/>
         <Field label="Texto do suporte" value={settings.supportPageLabel} onChange={v=>setS('supportPageLabel',v)}/>
         <Field label="Link do suporte" value={settings.supportPageUrl} onChange={v=>setS('supportPageUrl',v)}/>
       </CmsSection>
       <CmsSection title="Links das redes sociais">
         <p className="cmsHelp">Cole o link completo de cada perfil. Esses links são usados nos ícones do rodapé.</p>
         <Field label="Discord" value={settings.discordUrl} onChange={v=>setS('discordUrl',v)}/>
         <Field label="YouTube" value={settings.youtubeUrl} onChange={v=>setS('youtubeUrl',v)}/>
         <Field label="TikTok" value={settings.tiktokUrl} onChange={v=>setS('tiktokUrl',v)}/>
       </CmsSection>
       <CmsSection title="Páginas legais e suporte">
         <Area label="Termos de uso" value={settings.termsContent} onChange={v=>setS('termsContent',v)}/>
         <Area label="Privacidade" value={settings.privacyContent} onChange={v=>setS('privacyContent',v)}/>
         <Area label="Reembolso" value={settings.refundContent} onChange={v=>setS('refundContent',v)}/>
         <Area label="Suporte" value={settings.supportContent} onChange={v=>setS('supportContent',v)}/>
       </CmsSection>
       <CmsSection title="SEO">
         <Field label="Título do site" value={settings.seoTitle} onChange={v=>setS('seoTitle',v)}/>
         <Area label="Descrição do site" value={settings.seoDescription} onChange={v=>setS('seoDescription',v)}/>
       </CmsSection>
     </div>}

     {tab==='appearance'&&<div className="cmsGrid appearanceGrid">
       <CmsSection title="Cores principais">
         <ColorField label="Cor principal" value={settings.primaryColor} onChange={v=>setS('primaryColor',v)}/>
         <ColorField label="Fundo" value={settings.backgroundColor} onChange={v=>setS('backgroundColor',v)}/>
         <ColorField label="Painéis" value={settings.panelColor} onChange={v=>setS('panelColor',v)}/>
       </CmsSection>
       <div className="themePreview" style={{'--preview-primary':settings.primaryColor,'--preview-bg':settings.backgroundColor,'--preview-panel':settings.panelColor}}>
         <small>PRÉVIA</small><div className="previewCard"><b>{settings.siteName}</b><span>Produto de exemplo</span><button>Comprar agora</button></div>
       </div>
     </div>}

     {tab==='media'&&<>
       <div className="mediaUploader"><div><h2>Biblioteca de mídia</h2><p>Envie logos, banners e imagens dos produtos. Formatos: PNG, JPG, WebP, GIF ou SVG, até 10 MB.</p></div><label className="uploadBtn">Enviar imagem<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={async e=>{const file=e.target.files?.[0];if(file)await uploadMedia(file);e.target.value=''}}/></label></div>
       <div className="mediaGrid">{media.map((m,i)=><article className="mediaCard" key={(m.url||'')+i}><img src={m.url} alt={m.name}/><div><b>{m.name}</b><input value={m.url} readOnly onFocus={e=>e.target.select()}/></div></article>)}{!media.length&&<p className="emptyMedia">Nenhuma imagem enviada pelo painel ainda.</p>}</div>
     </>}

     {tab==='categories'&&<>
       <form className="cmsCreateRow" onSubmit={createCategory}>
         <input name="name" placeholder="Nome da categoria" required/>
         <input name="slug" placeholder="slug-opcional"/>
         <input name="imageUrl" placeholder="URL da imagem (opcional)"/>
         <input name="sortOrder" type="number" placeholder="Ordem"/>
         <button>Criar categoria</button>
       </form>
       <div className="adminTable"><h2>Categorias</h2>{categories.map(c=><div className="categoryAdminRow" key={c.id}>
         <label>Nome<input defaultValue={c.name} onBlur={e=>patchCategory(c,{name:e.target.value})}/></label>
         <label>Slug<input defaultValue={c.slug} onBlur={e=>patchCategory(c,{slug:e.target.value})}/></label>
         <label>Imagem<input defaultValue={c.image_url||''} onBlur={e=>patchCategory(c,{imageUrl:e.target.value})}/><input className="miniUpload" type="file" accept="image/*" onChange={async e=>{const u=await uploadMedia(e.target.files?.[0]);if(u)patchCategory(c,{imageUrl:u});e.target.value=''}}/></label>
         <label>Ordem<input type="number" defaultValue={c.sort_order||0} onBlur={e=>patchCategory(c,{sortOrder:Number(e.target.value)})}/></label>
         <label className="switchLabel"><input type="checkbox" defaultChecked={c.active} onChange={e=>patchCategory(c,{active:e.target.checked})}/> Ativa</label>
       </div>)}</div>
     </>}

     {tab==='products'&&<>
       <form className="productCreateForm" onSubmit={createProduct}>
         <h2>Novo produto</h2>
         <div className="productCreateGrid">
           <input name="name" placeholder="Nome" required/>
           <input name="slug" placeholder="Slug (opcional)"/>
           <input name="tag" placeholder="Tag"/>
           <select name="categorySlug">{categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select>
           <input name="old" type="number" step="0.01" placeholder="Preço antigo"/>
           <input name="price" type="number" step="0.01" placeholder="Preço" required/>
           <input name="stock" type="number" placeholder="Estoque" required/>
           <input name="sortOrder" type="number" placeholder="Ordem"/>
           <input name="tone" placeholder="Cor/tag CSS (blue, green...)"/>
           <input name="imageUrl" placeholder="URL da imagem"/>
           <textarea name="description" placeholder="Descrição"></textarea>
         </div><button className="publishBtn">Criar produto</button>
       </form>
       <div className="adminTable productsAdmin"><h2>Gerenciar produtos</h2>{products.map(p=><div className="productEditor" key={p.id}>
         <div className="productEditorHead"><div><b>{p.name}</b><small>{p.slug}</small></div><a href={'/produto?slug='+p.slug}>Abrir produto ↗</a></div>
         <div className="productEditorGrid">
           <label>Nome<input defaultValue={p.name} onBlur={e=>patchProduct(p,{name:e.target.value})}/></label>
           <label>Preço antigo<input type="number" step="0.01" defaultValue={p.old} onBlur={e=>patchProduct(p,{old:Number(e.target.value)})}/></label>
           <label>Preço<input type="number" step="0.01" defaultValue={p.price} onBlur={e=>patchProduct(p,{price:Number(e.target.value)})}/></label>
           <label>Estoque<input type="number" defaultValue={p.stock} onBlur={e=>patchProduct(p,{stock:Number(e.target.value)})}/></label>
           <label>Tag<input defaultValue={p.tag||''} onBlur={e=>patchProduct(p,{tag:e.target.value})}/></label>
           <label>Categoria<select defaultValue={p.categorySlug||'fivem'} onChange={e=>patchProduct(p,{categorySlug:e.target.value})}>{categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>
           <label>Ordem<input type="number" defaultValue={p.sortOrder||0} onBlur={e=>patchProduct(p,{sortOrder:Number(e.target.value)})}/></label>
           <label>Imagem<input defaultValue={p.imageUrl||''} onBlur={e=>patchProduct(p,{imageUrl:e.target.value})}/><input className="miniUpload" type="file" accept="image/*" onChange={async e=>{const u=await uploadMedia(e.target.files?.[0]);if(u)patchProduct(p,{imageUrl:u});e.target.value=''}}/></label>
           <label className="wide">Descrição<textarea defaultValue={p.description||''} onBlur={e=>patchProduct(p,{description:e.target.value})}></textarea></label>
           <label className="switchLabel"><input type="checkbox" defaultChecked={p.active} onChange={e=>patchProduct(p,{active:e.target.checked})}/> Produto ativo</label>
         </div>
       </div>)}</div>
     </>}


     {tab==='customers'&&<>
       <div className="adminToolbar"><input value={customerQuery} onChange={e=>setCustomerQuery(e.target.value)} placeholder="Buscar por nome ou e-mail"/></div>
       <div className="customerGrid">{customers.filter(x=>!customerQuery||x.name?.toLowerCase().includes(customerQuery.toLowerCase())||x.email?.toLowerCase().includes(customerQuery.toLowerCase())).map(x=><article className="customerCard" key={x.id}>
         <div className="customerHead">{x.avatar_url?<img src={x.avatar_url} alt=""/>:<span>{(x.name||'C').slice(0,1).toUpperCase()}</span>}<div><b>{x.name}</b><small>{x.email}</small></div></div>
         <div className="customerStats"><div><small>PEDIDOS</small><b>{x.orders||0}</b></div><div><small>PAGOS</small><b>{x.paidOrders||0}</b></div><div><small>TOTAL PAGO</small><b>{money(x.totalPaid||0)}</b></div></div>
         <div className="customerMeta"><span>{x.auth_provider==='discord'?'Discord':'E-mail'}</span><span>{x.role==='admin'?'Administrador':'Cliente'}</span>{x.lastOrderAt&&<span>Último pedido: {new Date(x.lastOrderAt).toLocaleDateString('pt-BR')}</span>}</div>
       </article>)}{!customers.length&&<p>Nenhum cliente cadastrado.</p>}</div>
     </>}


     {tab==='activity'&&<>
       <div className="activityNotice"><span>Registra somente eventos de navegação e compra. Não registra senhas, conteúdo digitado em campos sensíveis nem dados completos de pagamento.</span><button onClick={refreshActivity}>Atualizar agora</button></div>
       <div className="adminToolbar"><input value={activityQuery} onChange={e=>setActivityQuery(e.target.value)} placeholder="Buscar cliente, página, produto ou sessão"/><select value={activityType} onChange={e=>setActivityType(e.target.value)}><option value="all">Todos os eventos</option><option value="page_view">Página acessada</option><option value="category_select">Categoria selecionada</option><option value="product_click">Produto clicado</option><option value="product_view">Produto visualizado</option><option value="add_to_cart">Adicionou ao carrinho</option><option value="cart_open">Abriu carrinho</option><option value="checkout_start">Iniciou checkout</option><option value="checkout_submit">Criou/tentou pedido</option><option value="coupon_attempt">Tentou cupom</option><option value="login_click">Tentou login</option><option value="login_success">Login realizado</option><option value="logout">Logout</option></select></div>
       <div className="activityList">{activity.filter(x=>{
         const q=activityQuery.toLowerCase();
         const hay=[x.page,x.session_id,x.event_type,x.bb_users?.name,x.bb_users?.email,JSON.stringify(x.metadata||{})].filter(Boolean).join(' ').toLowerCase();
         return (activityType==='all'||x.event_type===activityType)&&(!q||hay.includes(q));
       }).map(x=><article className="activityRow" key={x.id}>
         <div className={'activityIcon '+x.event_type}></div>
         <div className="activityMain"><div><b>{eventLabel(x.event_type)}</b><span>{x.bb_users?.name||'Visitante'}</span></div><small>{x.bb_users?.email||'Sessão '+String(x.session_id).slice(0,12)} · {x.page||'/'}</small>{Object.keys(x.metadata||{}).length>0&&<code>{Object.entries(x.metadata).map(([k,v])=>k+': '+v).join(' · ')}</code>}</div>
         <time>{new Date(x.created_at).toLocaleString('pt-BR')}</time>
       </article>)}{!activity.length&&<p>Nenhum evento registrado ainda.</p>}</div>
     </>}

     {tab==='orders'&&<>
       <div className="adminToolbar"><input value={orderQuery} onChange={e=>setOrderQuery(e.target.value)} placeholder="Buscar pedido, nome ou e-mail"/><select value={orderStatus} onChange={e=>setOrderStatus(e.target.value)}><option value="all">Todos os status</option><option value="pending">Pendente</option><option value="paid">Pago</option><option value="cancelled">Cancelado</option><option value="delivered">Entregue</option></select></div>
       <div className="adminTable"><h2>Pedidos</h2>{orders.filter(o=>(orderStatus==='all'||o.status===orderStatus)&&(!orderQuery||String(o.id).includes(orderQuery)||o.customer_email?.toLowerCase().includes(orderQuery.toLowerCase())||o.customer_name?.toLowerCase().includes(orderQuery.toLowerCase()))).map(o=><div className="orderAdminCard" key={o.id}>
         <div className="adminOrderRow"><button className="orderToggle" onClick={()=>setExpandedOrder(expandedOrder===o.id?null:o.id)}>#{o.id}</button><span>{o.customer_email}</span><span>{money(o.total)}</span><select value={o.status} onChange={e=>status(o,e.target.value)}><option value="pending">Pendente</option><option value="paid">Pago</option><option value="cancelled">Cancelado</option><option value="delivered">Entregue</option></select><button className="deleteOrderBtn" onClick={()=>deleteOrder(o)} title="Excluir pedido">Excluir</button></div>
         {expandedOrder===o.id&&<div className="orderAdminDetails"><div><small>Cliente</small><b>{o.customer_name}</b><span>{o.customer_email}</span></div><div><small>Data</small><b>{new Date(o.created_at).toLocaleString('pt-BR')}</b><span>{o.payment_method||'pix'}</span></div><div><small>Itens</small>{(typeof o.items==='string'?JSON.parse(o.items):o.items||[]).map((it,i)=><span key={i}>{it.name} × {it.quantity}</span>)}</div><div><small>Histórico</small>{orderEvents.filter(ev=>ev.order_id===o.id).map(ev=><span key={ev.id}>{new Date(ev.created_at).toLocaleString('pt-BR')} — {ev.status}{ev.note?' · '+ev.note:''}</span>)}</div></div>}
       </div>)}{!orders.length&&<p>Nenhum pedido.</p>}</div>
     </>}

     {tab==='coupons'&&<><form className="couponAdmin" onSubmit={createCoupon}><input name="code" placeholder="Código" required/><select name="type"><option value="percent">Percentual</option><option value="fixed">Valor fixo</option></select><input name="value" type="number" step="0.01" placeholder="Valor" required/><input name="maxUses" type="number" placeholder="Limite de usos"/><button>Criar cupom</button></form><div className="adminTable"><h2>Cupons</h2>{coupons.map(c=><div className="adminCouponRow" key={c.id}><b>{c.code}</b><span>{c.type==='percent'?c.value+'%':money(c.value)}</span><span>{c.used_count||0}/{c.max_uses||'∞'}</span><em>{c.active?'Ativo':'Inativo'}</em></div>)}</div></>}
   </section>
 </main>
}

function CmsSection({title,children}){return <div className="cmsSection"><h2>{title}</h2>{children}</div>}
function Field({label,value,onChange}){return <label className="cmsField">{label}<input value={value||''} onChange={e=>onChange(e.target.value)}/></label>}
function Area({label,value,onChange}){return <label className="cmsField">{label}<textarea value={value||''} onChange={e=>onChange(e.target.value)}/></label>}
function ColorField({label,value,onChange}){return <label className="cmsField colorField">{label}<div><input type="color" value={value||'#000000'} onChange={e=>onChange(e.target.value)}/><input value={value||''} onChange={e=>onChange(e.target.value)}/></div></label>}

function MediaField({label,value,onChange,upload}){return <label className="cmsField mediaField">{label}<div className="mediaFieldRow"><input value={value||''} onChange={e=>onChange(e.target.value)}/><label className="miniUploadBtn">Upload<input type="file" accept="image/*" onChange={async e=>{const u=await upload(e.target.files?.[0]);if(u)onChange(u);e.target.value=''}}/></label></div>{value&&<img className="mediaPreview" src={value} alt="Prévia"/>}</label>}

function eventLabel(type){
 const labels={
  page_view:'Página acessada',
  category_select:'Categoria selecionada',
  product_click:'Produto clicado',
  product_view:'Produto visualizado',
  add_to_cart:'Adicionou ao carrinho',
  cart_open:'Abriu o carrinho',
  checkout_start:'Iniciou checkout',
  checkout_submit:'Ação no checkout',
  coupon_attempt:'Tentou cupom',
  login_click:'Tentou login',
  login_success:'Login realizado',
  logout:'Saiu da conta'
 };
 return labels[type]||type;
}
