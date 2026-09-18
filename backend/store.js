const bcrypt=require('bcryptjs');
const {Pool}=require('pg');
const defaults=require('../data/products.json');

let pool;
let dbInit;
function useDb(){return !!process.env.DATABASE_URL}
function getPool(){
  if(!pool)pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:false}:undefined});
  return pool;
}
async function ensureDb(){
  if(!useDb())return;
  if(dbInit)return dbInit;
  dbInit=(async()=>{
    const p=getPool();
    await p.query(`CREATE TABLE IF NOT EXISTS bb_users(
      id SERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,cpf TEXT,
      password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'customer',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await p.query(`CREATE TABLE IF NOT EXISTS bb_products(
      id SERIAL PRIMARY KEY,slug TEXT UNIQUE NOT NULL,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',
      old_price NUMERIC(12,2) NOT NULL DEFAULT 0,price NUMERIC(12,2) NOT NULL DEFAULT 0,
      tag TEXT NOT NULL DEFAULT '',tone TEXT NOT NULL DEFAULT 'blue',stock INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await p.query(`CREATE TABLE IF NOT EXISTS bb_coupons(
      id SERIAL PRIMARY KEY,code TEXT UNIQUE NOT NULL,type TEXT NOT NULL DEFAULT 'percent',value NUMERIC(12,2) NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,max_uses INTEGER,used_count INTEGER NOT NULL DEFAULT 0,expires_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await p.query(`CREATE TABLE IF NOT EXISTS bb_orders(
      id SERIAL PRIMARY KEY,user_id INTEGER REFERENCES bb_users(id) ON DELETE SET NULL,customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,cpf TEXT,items JSONB NOT NULL,subtotal NUMERIC(12,2) NOT NULL,
      discount NUMERIC(12,2) NOT NULL DEFAULT 0,total NUMERIC(12,2) NOT NULL,status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'pix',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const {rows:[cnt]}=await p.query('SELECT COUNT(*)::int AS n FROM bb_products');
    if(!cnt.n){
      for(const x of defaults)await p.query(
        `INSERT INTO bb_products(slug,name,description,old_price,price,tag,tone,stock,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(slug) DO NOTHING`,
        [x.slug,x.name,x.description,x.old,x.price,x.tag,x.tone,x.stock,x.active]
      );
    }
    if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){
      const email=process.env.ADMIN_EMAIL.toLowerCase();
      const {rows}=await p.query('SELECT id FROM bb_users WHERE email=$1',[email]);
      if(!rows.length){
        const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
        await p.query('INSERT INTO bb_users(name,email,password_hash,role) VALUES($1,$2,$3,$4)',['Administrador',email,hash,'admin']);
      }
    }
  })();
  return dbInit;
}
let memReady;
async function memory(){
  if(!global.__bbStore)global.__bbStore={products:defaults.map(x=>({...x})),users:[],coupons:[],orders:[],ids:{user:1,product:Math.max(...defaults.map(x=>x.id))+1,coupon:1,order:1}};
  const s=global.__bbStore;
  if(!memReady)memReady=(async()=>{
    if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD&&!s.users.find(x=>x.email===process.env.ADMIN_EMAIL.toLowerCase())){
      s.users.push({id:s.ids.user++,name:'Administrador',email:process.env.ADMIN_EMAIL.toLowerCase(),cpf:'',password_hash:await bcrypt.hash(process.env.ADMIN_PASSWORD,12),role:'admin',created_at:new Date().toISOString()});
    }
  })();
  await memReady;return s;
}
const num=x=>Number(x||0);
function productMap(r){return{id:r.id,slug:r.slug,name:r.name,description:r.description,old:num(r.old_price??r.old),price:num(r.price),tag:r.tag,tone:r.tone,stock:Number(r.stock||0),active:r.active!==false}}
function userPublic(u){return u?{id:u.id,name:u.name,email:u.email,cpf:u.cpf||'',role:u.role}:null}
async function listProducts(admin=false){
  if(useDb()){await ensureDb();const {rows}=await getPool().query('SELECT * FROM bb_products '+(admin?'':'WHERE active=TRUE ')+'ORDER BY id');return rows.map(productMap)}
  const s=await memory();return s.products.filter(x=>admin||x.active).map(x=>({...x}));
}
async function getProduct(slug){const all=await listProducts(true);return all.find(x=>x.slug===slug)||null}
async function createProduct(d){
  const slug=String(d.slug||d.name||'produto').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  if(useDb()){await ensureDb();const {rows}=await getPool().query(`INSERT INTO bb_products(slug,name,description,old_price,price,tag,tone,stock,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[slug,d.name,d.description||'',num(d.old),num(d.price),d.tag||'',d.tone||'blue',Number(d.stock||0),d.active!==false]);return productMap(rows[0])}
  const s=await memory();if(s.products.some(x=>x.slug===slug))throw new Error('Slug já existe');const p={id:s.ids.product++,slug,name:d.name,description:d.description||'',old:num(d.old),price:num(d.price),tag:d.tag||'',tone:d.tone||'blue',stock:Number(d.stock||0),active:d.active!==false};s.products.push(p);return p;
}
async function updateProduct(id,d){
  id=Number(id);
  if(useDb()){await ensureDb();const current=(await getPool().query('SELECT * FROM bb_products WHERE id=$1',[id])).rows[0];if(!current)throw new Error('Produto não encontrado');const v={...productMap(current),...d};const {rows}=await getPool().query(`UPDATE bb_products SET name=$2,description=$3,old_price=$4,price=$5,tag=$6,tone=$7,stock=$8,active=$9,updated_at=NOW() WHERE id=$1 RETURNING *`,[id,v.name,v.description||'',num(v.old),num(v.price),v.tag||'',v.tone||'blue',Number(v.stock||0),v.active!==false]);return productMap(rows[0])}
  const s=await memory();const i=s.products.findIndex(x=>x.id===id);if(i<0)throw new Error('Produto não encontrado');s.products[i]={...s.products[i],...d,old:num(d.old??s.products[i].old),price:num(d.price??s.products[i].price),stock:Number(d.stock??s.products[i].stock)};return s.products[i];
}
async function createUser({name,email,password,cpf=''}){email=String(email).toLowerCase().trim();if(!email||!password||String(password).length<6)throw new Error('Dados inválidos');const hash=await bcrypt.hash(password,12);
  if(useDb()){await ensureDb();try{const {rows}=await getPool().query('INSERT INTO bb_users(name,email,cpf,password_hash) VALUES($1,$2,$3,$4) RETURNING *',[name||'Cliente',email,cpf,hash]);return userPublic(rows[0])}catch(e){if(e.code==='23505')throw new Error('E-mail já cadastrado');throw e}}
  const s=await memory();if(s.users.some(x=>x.email===email))throw new Error('E-mail já cadastrado');const u={id:s.ids.user++,name:name||'Cliente',email,cpf,password_hash:hash,role:'customer',created_at:new Date().toISOString()};s.users.push(u);return userPublic(u);
}
async function authenticate(email,password){email=String(email).toLowerCase().trim();let u;if(useDb()){await ensureDb();u=(await getPool().query('SELECT * FROM bb_users WHERE email=$1',[email])).rows[0]}else{const s=await memory();u=s.users.find(x=>x.email===email)}if(!u||!await bcrypt.compare(password,u.password_hash))return null;return userPublic(u)}
async function getUser(id){if(!id)return null;if(useDb()){await ensureDb();return userPublic((await getPool().query('SELECT * FROM bb_users WHERE id=$1',[id])).rows[0])}const s=await memory();return userPublic(s.users.find(x=>x.id===Number(id)))}
function couponDiscount(c,subtotal){if(!c)return 0;const raw=c.type==='fixed'?num(c.value):subtotal*(num(c.value)/100);return Math.max(0,Math.min(subtotal,raw))}
async function validateCoupon(code,subtotal){if(!code)return{valid:false,discount:0};code=String(code).trim().toUpperCase();let c;if(useDb()){await ensureDb();c=(await getPool().query('SELECT * FROM bb_coupons WHERE UPPER(code)=$1',[code])).rows[0]}else{const s=await memory();c=s.coupons.find(x=>x.code===code)}if(!c||!c.active)return{valid:false,discount:0};if(c.expires_at&&new Date(c.expires_at)<new Date())return{valid:false,discount:0};if(c.max_uses!=null&&Number(c.used_count)>=Number(c.max_uses))return{valid:false,discount:0};return{valid:true,code:c.code,type:c.type,value:num(c.value),discount:couponDiscount(c,num(subtotal))}}
async function createCoupon(d){const code=String(d.code||'').trim().toUpperCase();if(!code)throw new Error('Informe o código');if(useDb()){await ensureDb();const {rows}=await getPool().query(`INSERT INTO bb_coupons(code,type,value,active,max_uses,expires_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[code,d.type==='fixed'?'fixed':'percent',num(d.value),d.active!==false,d.maxUses?Number(d.maxUses):null,d.expiresAt||null]);return rows[0]}const s=await memory();if(s.coupons.some(x=>x.code===code))throw new Error('Cupom já existe');const c={id:s.ids.coupon++,code,type:d.type==='fixed'?'fixed':'percent',value:num(d.value),active:d.active!==false,max_uses:d.maxUses?Number(d.maxUses):null,used_count:0,expires_at:d.expiresAt||null};s.coupons.push(c);return c}
async function listCoupons(){if(useDb()){await ensureDb();return (await getPool().query('SELECT * FROM bb_coupons ORDER BY id DESC')).rows}const s=await memory();return s.coupons}
async function updateCoupon(id,d){id=Number(id);if(useDb()){await ensureDb();const c=(await getPool().query('SELECT * FROM bb_coupons WHERE id=$1',[id])).rows[0];if(!c)throw new Error('Cupom não encontrado');const v={...c,...d};return (await getPool().query('UPDATE bb_coupons SET active=$2,value=$3,max_uses=$4 WHERE id=$1 RETURNING *',[id,v.active!==false,num(v.value),v.max_uses??null])).rows[0]}const s=await memory();const i=s.coupons.findIndex(x=>x.id===id);if(i<0)throw new Error('Cupom não encontrado');s.coupons[i]={...s.coupons[i],...d};return s.coupons[i]}
async function createOrder({userId,customerName,customerEmail,cpf,items,couponCode,paymentMethod='pix'}){
  if(!Array.isArray(items)||!items.length)throw new Error('Carrinho vazio');
  if(useDb()){await ensureDb();const client=await getPool().connect();try{await client.query('BEGIN');const full=[];let subtotal=0;for(const item of items){const {rows}=await client.query('SELECT * FROM bb_products WHERE slug=$1 AND active=TRUE FOR UPDATE',[item.slug]);const p=rows[0];const q=Math.max(1,Math.min(20,Number(item.quantity||1)));if(!p)throw new Error('Produto indisponível');if(Number(p.stock)<q)throw new Error('Estoque insuficiente para '+p.name);subtotal+=num(p.price)*q;full.push({productId:p.id,slug:p.slug,name:p.name,price:num(p.price),quantity:q})}const cp=await validateCoupon(couponCode,subtotal);const discount=cp.valid?cp.discount:0;const total=Math.max(0,subtotal-discount);const {rows:[o]}=await client.query(`INSERT INTO bb_orders(user_id,customer_name,customer_email,cpf,items,subtotal,discount,total,status,payment_method) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9) RETURNING *`,[userId||null,customerName,customerEmail,cpf||'',JSON.stringify(full),subtotal,discount,total,paymentMethod]);for(const x of full)await client.query('UPDATE bb_products SET stock=stock-$2 WHERE id=$1',[x.productId,x.quantity]);if(cp.valid)await client.query('UPDATE bb_coupons SET used_count=used_count+1 WHERE UPPER(code)=$1',[cp.code]);await client.query('COMMIT');return o}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}}
  const s=await memory();let subtotal=0;const full=[];for(const item of items){const p=s.products.find(x=>x.slug===item.slug&&x.active);const q=Math.max(1,Math.min(20,Number(item.quantity||1)));if(!p)throw new Error('Produto indisponível');if(Number(p.stock)<q)throw new Error('Estoque insuficiente para '+p.name);subtotal+=num(p.price)*q;full.push({productId:p.id,slug:p.slug,name:p.name,price:num(p.price),quantity:q})}const cp=await validateCoupon(couponCode,subtotal);const discount=cp.valid?cp.discount:0;const o={id:s.ids.order++,user_id:userId||null,customer_name:customerName,customer_email:customerEmail,cpf:cpf||'',items:full,subtotal,discount,total:Math.max(0,subtotal-discount),status:'pending',payment_method:paymentMethod,created_at:new Date().toISOString()};s.orders.unshift(o);for(const x of full){const p=s.products.find(y=>y.id===x.productId);p.stock-=x.quantity}if(cp.valid){const c=s.coupons.find(x=>x.code===cp.code);if(c)c.used_count++}return o}
async function listOrders(userId){if(useDb()){await ensureDb();return (await getPool().query('SELECT * FROM bb_orders WHERE user_id=$1 ORDER BY id DESC',[userId])).rows}const s=await memory();return s.orders.filter(x=>x.user_id===Number(userId))}
async function listAllOrders(){if(useDb()){await ensureDb();return (await getPool().query('SELECT * FROM bb_orders ORDER BY id DESC LIMIT 200')).rows}const s=await memory();return s.orders}
async function updateOrder(id,d){id=Number(id);if(useDb()){await ensureDb();return (await getPool().query('UPDATE bb_orders SET status=$2 WHERE id=$1 RETURNING *',[id,d.status])).rows[0]}const s=await memory();const o=s.orders.find(x=>x.id===id);if(!o)throw new Error('Pedido não encontrado');o.status=d.status||o.status;return o}
async function dashboard(){const products=await listProducts(true),orders=await listAllOrders();const paid=orders.filter(x=>x.status==='paid');return{products:products.length,orders:orders.length,revenue:paid.reduce((s,x)=>s+num(x.total),0),pending:orders.filter(x=>x.status==='pending').length}}
module.exports={listProducts,getProduct,createProduct,updateProduct,createUser,authenticate,getUser,validateCoupon,createCoupon,listCoupons,updateCoupon,createOrder,listOrders,listAllOrders,updateOrder,dashboard,useDb};