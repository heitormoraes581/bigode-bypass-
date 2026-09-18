import './globals.css';

export const metadata={
  title:'Bigode Bypass',
  description:'Loja digital Bigode',
  icons:{
    icon:[
      {url:'/logo-bigode-bypass.png',type:'image/png'}
    ],
    shortcut:'/logo-bigode-bypass.png',
    apple:'/logo-bigode-bypass.png'
  }
};

export default function RootLayout({children}){
  return <html lang="pt-BR"><body>{children}</body></html>;
}
