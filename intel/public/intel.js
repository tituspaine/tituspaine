(()=>{'use strict';
const jsonHeaders={Accept:'application/json','X-Requested-With':'fetch'};
const announce=(el,msg)=>{let n=el.querySelector('.interaction-feedback');if(!n){n=document.createElement('span');n.className='interaction-feedback';n.setAttribute('role','status');el.append(n);}n.textContent=msg;setTimeout(()=>{if(n)n.textContent='';},1800);};
async function mutate(form){return fetch(form.action,{method:'POST',body:new FormData(form),headers:jsonHeaders,credentials:'same-origin'});}
document.addEventListener('submit',async e=>{
 const form=e.target;if(!(form instanceof HTMLFormElement))return;
 if(form.matches('form[data-async-like]')){
  e.preventDefault();const btn=form.querySelector('.like-button'),count=btn&&btn.querySelector('[data-like-count]');if(!btn||btn.dataset.busy)return;btn.dataset.busy='1';btn.disabled=true;
  try{const res=await mutate(form),data=await res.json().catch(()=>null);if(!res.ok||!data?.ok)throw new Error(data?.error?.message||'Like request failed');const liked=!!(data.liked??data.state?.liked);btn.classList.toggle('liked',liked);btn.setAttribute('aria-label',liked?'Unlike comment':'Like comment');if(count)count.textContent=String(data.like_count??data.state?.likeCount??0);}
  catch(err){console.error(err);announce(form,'Could not update like.');}finally{delete btn.dataset.busy;btn.disabled=false;}return;
 }
 if(form.matches('form[data-async-follow],form[data-async-save]')){
  e.preventDefault();const btn=form.querySelector('button');if(!btn||btn.dataset.busy)return;btn.dataset.busy='1';btn.disabled=true;
  try{const res=await mutate(form),data=await res.json().catch(()=>null);if(!res.ok||!data?.ok)throw new Error(data?.error?.message||'Request failed');if(form.matches('[data-async-follow]')){const on=!!data.state?.following;btn.textContent=on?'Joined':'Join';btn.classList.toggle('active',on);}else{const on=!!data.state?.saved;btn.textContent=on?'Saved':'Save';btn.classList.toggle('active',on);}}
  catch(err){console.error(err);announce(form,'Could not save that change.');}finally{delete btn.dataset.busy;btn.disabled=false;}return;
 }
 if(form.matches('.inline-reply-form')){
  e.preventDefault();const btn=form.querySelector('button[type="submit"],button.blue'),ta=form.querySelector('textarea');if(!btn||!ta||btn.dataset.busy)return;btn.dataset.busy='1';btn.disabled=true;
  try{const res=await mutate(form),data=await res.json().catch(()=>null);if(!res.ok||!data?.ok)throw new Error(data?.error?.message||'Reply failed');const st=data.state||{},article=document.createElement('article');article.className='comment-thread newly-added';article.id='comment-'+st.id;article.innerHTML='<details class="comment-card" open><summary><span class="comment-who">@'+escapeHtml(st.username||'you')+' · now</span></summary><div class="comment-body">'+escapeHtml(st.content||'')+'</div></details>';const host=form.closest('.comment-thread');let children=host&&host.querySelector(':scope > .comment-children');if(host&&!children){children=document.createElement('div');children.className='comment-children';host.append(children);}if(children)children.append(article);form.reset();form.hidden=true;article.scrollIntoView({block:'nearest'});}
  catch(err){console.error(err);announce(form,'Reply was not posted.');}finally{delete btn.dataset.busy;btn.disabled=false;}return;
 }
});
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.addEventListener('click',async e=>{
 const target=e.target instanceof Element?e.target:null;if(!target)return;
 const reply=target.closest('.inline-reply-toggle');if(reply){e.preventDefault();const card=reply.closest('.comment-card'),rf=card&&card.querySelector(':scope > .inline-reply-form');document.querySelectorAll('.inline-reply-form:not([hidden])').forEach(x=>{if(x!==rf)x.hidden=true;});if(rf){rf.hidden=!rf.hidden;if(!rf.hidden){rf.querySelector('textarea')?.focus();rf.scrollIntoView({block:'nearest'});}}return;}
 const cancel=target.closest('.reply-cancel');if(cancel){e.preventDefault();const rf=cancel.closest('.inline-reply-form');if(rf){rf.hidden=true;rf.reset();}return;}
 const share=target.closest('[data-share-url]');if(share){e.preventDefault();const url=share.getAttribute('data-share-url')||location.href,title=share.getAttribute('data-share-title')||document.title,text=share.getAttribute('data-share-text')||'';try{if(navigator.share)await navigator.share({title,text,url});else{await navigator.clipboard.writeText(url);const old=share.textContent;share.textContent='Copied';setTimeout(()=>share.textContent=old,1400);}}catch(err){if(err?.name!=='AbortError')console.error(err);}return;}
 const tab=target.closest('.investigation-tabs a[data-panel]');if(tab){const id=tab.getAttribute('data-panel');if(!id)return;const url=new URL(tab.href);if(url.searchParams.has('section'))return;e.preventDefault();const discussion=document.getElementById('discussion'),wrap=document.getElementById('investigation-panels');if(id==='discussion'){if(wrap)wrap.hidden=true;if(discussion)discussion.hidden=false;}else{if(discussion)discussion.hidden=true;if(wrap){wrap.hidden=false;wrap.querySelectorAll(':scope > section').forEach(x=>x.hidden=x.id!==id);}}document.querySelectorAll('.investigation-tabs a[data-panel]').forEach(x=>x.classList.toggle('active',x===tab));document.getElementById(id)?.scrollIntoView({block:'start'});history.pushState({intelPanel:id},'',tab.getAttribute('href')||location.pathname);return;}
});
})();