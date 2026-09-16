if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
for (const el of document.querySelectorAll('.entry[id^="update-"]')) {
  const id=el.id.slice(7), meta=el.querySelector('.meta'); if(!meta) continue;
  const form=document.createElement('form'); form.method='post'; form.action=`/api/updates/${encodeURIComponent(id)}/like`; form.style.display='inline';
  const b=document.createElement('button'); b.type='submit'; b.textContent='LIKE'; b.className='blue'; b.style.marginLeft='10px'; form.appendChild(b); meta.appendChild(form);
}
if (location.pathname.startsWith('/investigations/')||location.pathname.startsWith('/evidence/')||location.pathname.startsWith('/entities/')) {
  const h=document.querySelector('h1'); if(h){const b=document.createElement('button');b.type='button';b.textContent='SHARE';b.className='blue';b.style.marginBottom='20px';b.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else await navigator.clipboard.writeText(location.href);}catch{}});h.insertAdjacentElement('afterend',b);}
}
