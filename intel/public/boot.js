if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

for (const el of document.querySelectorAll('.entry[id^="update-"]')) {
  const id=el.id.slice(7), meta=el.querySelector('.meta'); if(!meta) continue;
  const form=document.createElement('form'); form.method='post'; form.action=`/api/updates/${encodeURIComponent(id)}/like`; form.style.display='inline';
  const b=document.createElement('button'); b.type='submit'; b.textContent='LIKE'; b.className='blue'; b.style.marginLeft='10px'; form.appendChild(b); meta.appendChild(form);
}

if (location.pathname.startsWith('/investigations/')||location.pathname.startsWith('/evidence/')||location.pathname.startsWith('/entities/')) {
  const h=document.querySelector('h1'); if(h){const b=document.createElement('button');b.type='button';b.textContent='SHARE';b.className='blue';b.style.marginBottom='20px';b.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else await navigator.clipboard.writeText(location.href);}catch{}});h.insertAdjacentElement('afterend',b);}
}

// Registration/login password UX. This progressively enhances the server-rendered form
// without weakening server-side validation or exposing credentials.
for (const form of document.querySelectorAll('form[action="/api/register"], form[action="/api/login"]')) {
  const password=form.querySelector('input[name="password"]');
  if (!password) continue;
  password.autocomplete=form.action.endsWith('/api/register')?'new-password':'current-password';

  const passwordField=password.closest('.field');
  if (passwordField) {
    const toggle=document.createElement('button');
    toggle.type='button'; toggle.className='password-toggle'; toggle.textContent='SHOW PASSWORD';
    toggle.setAttribute('aria-pressed','false');
    toggle.addEventListener('click',()=>{
      const show=password.type==='password'; password.type=show?'text':'password';
      toggle.textContent=show?'HIDE PASSWORD':'SHOW PASSWORD'; toggle.setAttribute('aria-pressed',String(show));
    });
    passwordField.appendChild(toggle);
  }

  if (form.action.endsWith('/api/register')) {
    const confirmField=document.createElement('div'); confirmField.className='field';
    const label=document.createElement('label'); label.htmlFor='confirm-password'; label.textContent='RE-ENTER PASSWORD';
    const confirm=document.createElement('input'); confirm.id='confirm-password'; confirm.name='confirm_password'; confirm.type='password'; confirm.minLength=4; confirm.maxLength=256; confirm.autocomplete='new-password'; confirm.required=true;
    const toggle=document.createElement('button'); toggle.type='button'; toggle.className='password-toggle'; toggle.textContent='SHOW PASSWORD'; toggle.setAttribute('aria-pressed','false');
    toggle.addEventListener('click',()=>{const show=confirm.type==='password';confirm.type=show?'text':'password';toggle.textContent=show?'HIDE PASSWORD':'SHOW PASSWORD';toggle.setAttribute('aria-pressed',String(show));});
    confirmField.append(label,confirm,toggle); passwordField?.insertAdjacentElement('afterend',confirmField);

    const error=document.createElement('div'); error.className='notice'; error.setAttribute('role','alert'); error.hidden=true; confirmField.insertAdjacentElement('afterend',error);
    let submitting=false;
    form.addEventListener('submit',(event)=>{
      error.hidden=true;
      if (password.value!==confirm.value) {
        event.preventDefault(); error.textContent='Passwords do not match.'; error.hidden=false; confirm.focus(); return;
      }
      const token=form.querySelector('input[name="cf-turnstile-response"]');
      if (!token || !token.value) {
        event.preventDefault(); error.textContent='Security verification is not ready yet. Please wait a moment and try again.'; error.hidden=false; return;
      }
      if (submitting) { event.preventDefault(); return; }
      submitting=true;
      const submit=form.querySelector('button[type="submit"], button:not([type])');
      if (submit) { submit.disabled=true; submit.textContent='CREATING ACCOUNT…'; }
    });
  }
}
