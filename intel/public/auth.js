document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('form.auth-panel');
  if(!form)return;
  const password=form.querySelector('#password');
  const confirm=form.querySelector('#password_confirm');
  if(!password)return;

  for(const old of form.querySelectorAll('.password-toggle')) old.remove();
  const toggle=document.createElement('button');
  toggle.type='button'; toggle.className='password-toggle blue'; toggle.textContent='SHOW PASSWORD'; toggle.setAttribute('aria-pressed','false');
  const anchor=(confirm?.closest('.field')||password.closest('.field'));
  anchor?.insertAdjacentElement('afterend',toggle);
  toggle.addEventListener('click',()=>{
    const show=password.type==='password';
    password.type=show?'text':'password';
    if(confirm)confirm.type=show?'text':'password';
    toggle.textContent=show?'HIDE PASSWORD':'SHOW PASSWORD';
    toggle.setAttribute('aria-pressed',String(show));
  });
});

document.addEventListener('submit',event=>{
  const form=event.target;
  if(!(form instanceof HTMLFormElement)||!form.action.endsWith('/api/register'))return;
  const a=form.querySelector('#password'),b=form.querySelector('#password_confirm');
  if(a&&b&&a.value!==b.value){
    event.preventDefault();
    b.setCustomValidity('Passwords do not match.'); b.reportValidity();
    b.addEventListener('input',()=>b.setCustomValidity(''),{once:true});
  }
});
