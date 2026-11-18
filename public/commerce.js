export const offers = {3:.15,5:.20,8:.25};
export function bundleTotal(items,count){
 const complete=items.length===count&&items.every(Boolean);
 const known=complete&&items.every(p=>Number.isFinite(p.price));
 const subtotal=known?items.reduce((s,p)=>s+p.price,0):null;
 const saving=known?Math.round(subtotal*offers[count]*100)/100:null;
 return {complete,subtotal,saving,total:known?Math.round((subtotal-saving)*100)/100:null,rate:offers[count],spoon:count===8};
}
export const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n);
export function orderMessage(lines,{gift=false,message='',name='',phone='',address=''}={}){
 return ['Hello Nectra, I would like to order:',...lines,'',gift?'Gift order: Yes':'Gift order: No',...(gift&&message?[`Gift message: ${message}`]:[]),`Name: ${name}`,`Phone: ${phone}`,`Delivery address: ${address}`,'Please confirm availability, delivery charge and the final payable amount.'].join('\n');
}
