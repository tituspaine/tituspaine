document.querySelectorAll('.mobile-menu a').forEach(link=>link.addEventListener('click',()=>{document.querySelector('.mobile-menu').open=false}));
const progress=document.querySelector('.progress');addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%'});
