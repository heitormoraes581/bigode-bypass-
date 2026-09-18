const KEY='bb_cart_v2';
export function loadCart(){if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function saveCart(cart){if(typeof window!=='undefined')localStorage.setItem(KEY,JSON.stringify(cart))}
export function clearCart(){if(typeof window!=='undefined')localStorage.removeItem(KEY)}
export function addCartItem(cart,p){
  const idx=cart.findIndex(x=>x.slug===p.slug);
  if(idx>=0)return cart.map((x,i)=>i===idx?{...x,quantity:(x.quantity||1)+1}:x);
  return [...cart,{id:p.id,slug:p.slug,name:p.name,price:Number(p.price),quantity:1}];
}
export function cartTotal(cart){return cart.reduce((s,x)=>s+Number(x.price)*(x.quantity||1),0)}
export function cartCount(cart){return cart.reduce((s,x)=>s+(x.quantity||1),0)}