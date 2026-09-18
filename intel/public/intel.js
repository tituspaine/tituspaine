(()=>{'use strict';
document.addEventListener('submit',async e=>{
 const form=e.target;
 if(!(form instanceof HTMLFormElement)||!form.matches('form[data-async-like]'))return;
 e.preventDefault();
 const btn=form.querySelector('.like-button'),count=btn&&btn.querySelector('[data-like-count]');
 if(!btn||btn.dataset.busy)return;
 btn.dataset.busy='1';btn.disabled=true;
 try{
  const res=await fetch(form.action,{method:'POST',headers:{Accept:'application/json','X-Requested-With':'fetch'},credentials:'same-origin'});
  if(!res.ok)throw new Error('Like request failed');
  const data=await res.json();
  btn.classList.toggle('liked',!!data.liked);
  btn.setAttribute('aria-label',data.liked?'Unlike comment':'Like comment');
  if(count)count.textContent=String(data.like_count);
 }catch(err){console.error(err);btn.classList.add('like-error');setTimeout(()=>btn.classList.remove('like-error'),1200);}
 finally{delete btn.dataset.busy;btn.disabled=false;}
});
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null;if(!target)return;
 const reply=target.closest('.inline-reply-toggle');
 if(reply){e.preventDefault();const card=reply.closest('.comment-card'),rf=card&&card.querySelector(':scope > .inline-reply-form');document.querySelectorAll('.inline-reply-form:not([hidden])').forEach(x=>{if(x!==rf)x.hidden=true;});if(rf){rf.hidden=!rf.hidden;if(!rf.hidden){const ta=rf.querySelector('textarea');if(ta)ta.focus();rf.scrollIntoView({block:'nearest'});}}return;}
 const cancel=target.closest('.reply-cancel');
 if(cancel){e.preventDefault();const rf=cancel.closest('.inline-reply-form');if(rf){rf.hidden=true;rf.reset();}return;}
 const tab=target.closest('.investigation-tabs a[data-panel]');
 if(tab){e.preventDefault();const id=tab.getAttribute('data-panel'),discussion=document.getElementById('discussion'),wrap=document.getElementById('investigation-panels');if(!id)return;if(id==='discussion'){if(wrap)wrap.hidden=true;if(discussion)discussion.hidden=false;}else{if(discussion)discussion.hidden=true;if(wrap){wrap.hidden=false;wrap.querySelectorAll(':scope > section').forEach(x=>x.hidden=x.id!==id);}}document.querySelectorAll('.investigation-tabs a[data-panel]').forEach(x=>x.classList.toggle('active',x===tab));const panel=document.getElementById(id);if(panel)panel.scrollIntoView({block:'start'});history.replaceState(null,'','#'+id);return;}
});
})();