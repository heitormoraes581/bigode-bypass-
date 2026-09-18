const jwt=require('jsonwebtoken');
const crypto=require('crypto');
if(!global.__bbJwtSecret)global.__bbJwtSecret=process.env.JWT_SECRET||crypto.randomBytes(48).toString('hex');
const SECRET=global.__bbJwtSecret;
function sign(user){return jwt.sign({sub:String(user.id),role:user.role,email:user.email,name:user.name},SECRET,{expiresIn:'7d'})}
function read(req){const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):'';if(!token)return null;try{return jwt.verify(token,SECRET)}catch{return null}}
function requireUser(req,res,next){const s=read(req);if(!s)return res.status(401).json({error:'Faça login para continuar'});req.session=s;next()}
function requireAdmin(req,res,next){const s=read(req);if(!s||s.role!=='admin')return res.status(403).json({error:'Acesso administrativo necessário'});req.session=s;next()}
module.exports={sign,read,requireUser,requireAdmin};