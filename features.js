export function mountMarket(ctx){
  const {api,state,houses,root,render,navigate,toast,esc,photoTag}=ctx;
  let live=false, lastToken='', my=[], inbox=[], fetching=false;
  const normalize=p=>{
    const pics=(p.images||[]).map(x=>/^\/properties\/uploads\/[a-z0-9-]+\.(jpg|png|webp)$/i.test(x.url)?api.baseUrl+x.url:/^https?:\/\/[^"'<> ]+$/i.test(x.url)?x.url:'hero-villa.webp');
    return {id:Number(p.id),title:p.title,description:p.description,price:Number(p.price),type:p.listingType,city:p.city,district:p.address,category:p.category?.name||'',rooms:p.rooms,area:p.area,bathrooms:p.bathrooms,photo:pics[0]||'hero-villa.webp',gallery:pics.length?pics:['hero-villa.webp'],ownerId:p.ownerId,real:true,status:p.status};
  };
  async function refresh(){
    try{const r=await api.properties({limit:100});const a=Array.isArray(r)?r:r.items;if(!Array.isArray(a))throw Error('Bad API');state.propertyApi='online';if(a.length){houses.splice(0,houses.length,...a.map(normalize));live=true;}render();}
    catch{state.propertyApi='offline';render();}
  }
  async function favorites(){
    if(!state.token||!live)return;
    try{const a=await api.getFavorites(state.token);if(Array.isArray(a)){state.favorites=a.map(x=>Number(x.propertyId));render();}}catch{}
  }
  const input=(n,title,type='text',extra='')=>'<label class="form-field"><span>'+title+'</span><input name="'+n+'" type="'+type+'" '+extra+' required></label>';
  function create(){
    if(!state.user)return '<main class="container inside-page"><div class="empty-state"><h2>E’lon joylash uchun kiring</h2><a class="btn btn-primary" href="#/login">Kirish</a></div></main>';
    return '<main class="container inside-page premium-editor"><div class="page-banner"><div><span class="eyebrow">EXCLUSIVE COLLECTION / LIST</span><h1>E’lon joylashtirish</h1><p>Uyingizni sifatli taqdim eting</p></div></div><div class="editor-columns"><form class="card-surface editor-form form-stack" id="create-property">' +
      '<h2>Uy haqida ma’lumot</h2>'+input('title','Sarlavha','text','minlength="5" maxlength="140" placeholder="Zamonaviy villa, Toshkent"')+
      '<label class="form-field"><span>Tavsif</span><textarea name="description" minlength="20" maxlength="5000" rows="5" required placeholder="Uy haqida batafsil yozing"></textarea></label>'+
      '<div class="editor-grid"><label class="form-field"><span>Kategoriya</span><select name="categoryId" required><option value="">Tanlang</option>'+state.categories.map(x=>'<option value="'+Number(x.id)+'">'+esc(x.name)+'</option>').join('')+'</select></label>'+
      '<label class="form-field"><span>Turi</span><select name="listingType"><option value="SALE">Sotuv</option><option value="RENT">Ijara</option></select></label>'+
      input('price','Narx ($)','number','min="1" step="0.01" placeholder="200000"')+input('area','Maydon (m²)','number','min="1" step="0.1" placeholder="200"')+
      input('city','Shahar','text','minlength="2" placeholder="Toshkent"')+input('address','Manzil','text','minlength="3" placeholder="Yakkasaroy tumani"')+
      input('rooms','Xonalar','number','min="0" max="100" value="3"')+input('bathrooms','Sanuzellar','number','min="0" max="100" value="1"')+'</div>'+
      '<h2>Fotogalereya</h2><label class="form-field"><span>JPEG, PNG, WebP — 8 tagacha (har biri 5 MB)</span><input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple></label>'+
      '<button class="btn btn-primary full" type="submit">E’lonni chop etish</button></form><aside class="card-surface editor-aside"><span class="eyebrow">COLLECTION / GUIDE</span><h2>Har bir uy — o‘ziga xos hikoya.</h2><p>Chiroyli rasmlar, to‘liq manzil va aniq ma’lumotlar sizning e’loningizni ajratib turadi.</p><a class="text-link" href="#/my-listings">Mening e’lonlarim ↗</a></aside></div></main>';
  }
  function myPage(){
    if(!state.user)return create();
    return '<main class="container inside-page"><div class="page-banner"><div><span class="eyebrow">MY PORTFOLIO</span><h1>Mening e’lonlarim</h1><p>O‘zingiz qo‘shgan ko‘chmas mulklar</p></div><a href="#/add-listing" class="btn btn-primary">+ E’lon</a></div><div class="properties-grid">'+my.map(p=>'<article class="property-card">'+photoTag(p.photo,p.title,'my-property-image')+'<div class="property-info"><span class="small-label">'+esc(p.status||'APPROVED')+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.city)+'</p><strong class="price">$'+p.price.toLocaleString('en-US')+'</strong><div class="editor-actions"><a class="btn btn-outline btn-sm" href="#/property/'+p.id+'">Ko‘rish</a><button type="button" class="btn btn-outline btn-sm" data-market="delete" data-id="'+p.id+'">O‘chirish</button></div></div></article>').join('')+'</div>'+(my.length?'':'<div class="empty-state"><p>E’lonlar hali yo‘q yoki yuklanmoqda.</p></div>')+'</main>';
  }
  function inboxPage(){
    return '<main class="container inside-page"><div class="page-banner"><div><span class="eyebrow">MESSAGES</span><h1>Kelgan xabarlar</h1></div></div>'+ (inbox.length?inbox.map(x=>'<article class="card-surface inbox-item"><h3>'+esc(x.property?.title||'E’lon')+'</h3><p>'+esc(x.message)+'</p><small>'+esc(x.sender?.fullName||'Xaridor')+' · '+esc(x.phone)+'</small></article>').join(''):'<div class="empty-state">Hozircha xabar yo‘q.</div>')+'</main>';
  }
  function afterRender(){
    const path=location.hash.split('?')[0];
    const main=root.querySelector('main');
    if(main&&path==='#/add-listing')main.outerHTML=create();
    if(main&&path==='#/my-listings')main.outerHTML=myPage();
    if(main&&path==='#/inbox')main.outerHTML=inboxPage();
    const nav=root.querySelector('.header-actions');
    if(nav&&!nav.querySelector('.publish-link'))nav.insertAdjacentHTML('afterbegin','<a class="btn btn-primary btn-sm publish-link" href="#/add-listing">+ E’lon berish</a>');
    if(nav&&!nav.querySelector('.tour-link'))nav.insertAdjacentHTML('afterbegin','<a class="btn btn-outline btn-sm tour-link" href="./premium-house.html" target="_blank" rel="noopener noreferrer">◈ 3D uy</a>');
    const side=root.querySelector('.side-links');
    if(side){const a=side.querySelector('a[href="#/add-listing"]');if(a){a.href='#/my-listings';a.innerHTML='Mening e’lonlarim';}if(!side.querySelector('a[href="#/inbox"]'))side.insertAdjacentHTML('beforeend','<a href="#/inbox">✉ Kelgan xabarlar</a>');}
    if(live)root.querySelectorAll('.demo-note,.tiny-demo-tag').forEach(x=>x.remove());
    if(path.startsWith('#/property/')){
      const id=Number(path.split('/')[2]),p=houses.find(x=>x.id===id),detail=root.querySelector('.detail-summary');
      if(p&&detail){
        const d=document.createElement('section');d.id='market-contact';d.className='card-surface market-contact';
        d.innerHTML=!p.real?'<h2>Namuna uy</h2><p>Bu e’lon real sotuvchiga tegishli emas.</p>':!state.user?'<h2>Sotuvchiga xabar yozing</h2><p>Xabar yuborish uchun tizimga kiring.</p><a class="btn btn-primary" href="#/login">Kirish</a>':p.ownerId===state.user.id?'<h2>Sizning e’loningiz</h2><a href="#/inbox" class="text-link">Kelgan xabarlarni ko‘rish</a>':
          '<h2>Sotuvchiga xabar yozing</h2><form id="market-inquiry" class="form-stack"><input name="propertyId" type="hidden" value="'+p.id+'">'+input('phone','Telefon raqamingiz','tel','minlength="7" maxlength="35" placeholder="+998 90 123 45 67"')+'<label class="form-field"><span>Xabaringiz</span><textarea name="message" rows="4" minlength="10" maxlength="2000" required placeholder="Assalomu alaykum, uyingiz haqida ma’lumot olmoqchiman"></textarea></label><button class="btn btn-primary" type="submit">Xabar yuborish</button></form>';
        detail.insertAdjacentElement('afterend',d);
      }
    }
    if(state.token&&state.token!==lastToken){lastToken=state.token;favorites();}
  }
  async function loadPage(){
    const route=location.hash.split('?')[0];
    if(route==='#/my-listings'&&!fetching&&state.token){fetching=true;try{my=(await api.myProperties(state.token)).map(normalize);render();}catch(e){toast(e.message,'error');}finally{fetching=false;}}
    if(route==='#/inbox'&&state.token){try{inbox=await api.inquiries(state.token);render();}catch(e){toast(e.message,'error');}}
  }
  async function submit(e){
    const f=e.target;
    if(!['create-property','market-inquiry'].includes(f.id))return;
    e.preventDefault();e.stopImmediatePropagation();
    const data=new FormData(f),btn=f.querySelector('[type=submit]');btn.disabled=true;
    try{
      if(f.id==='market-inquiry'){await api.sendInquiry(state.token,Number(data.get('propertyId')),{phone:String(data.get('phone')).trim(),message:String(data.get('message')).trim()});f.reset();toast('Xabar yuborildi');}
      else{
        const files=[...f.querySelector('[name=images]').files];
        if(files.length>8||files.some(x=>x.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(x.type)))throw Error('8 tagacha, har biri 5 MB dan kichik JPEG/PNG/WebP rasm yuklang');
        const payload={title:data.get('title').trim(),description:data.get('description').trim(),price:Number(data.get('price')),listingType:data.get('listingType'),city:data.get('city').trim(),address:data.get('address').trim(),area:Number(data.get('area')),rooms:Number(data.get('rooms')),bathrooms:Number(data.get('bathrooms')),categoryId:Number(data.get('categoryId'))};
        const created=await api.createProperty(state.token,payload);
        if(files.length){const fd=new FormData();files.forEach(x=>fd.append('files',x));try{await api.uploadImages(state.token,created.id,fd);}catch(e){toast('E’lon qo‘shildi, lekin rasmlar yuklanmadi: '+e.message,'error');}}
        await refresh();navigate('#/my-listings');loadPage();toast('E’lon muvaffaqiyatli qo‘shildi');
      }
    }catch(e){toast(e.message,'error');}finally{btn.disabled=false;}
  }
  async function click(e){
    const el=e.target.closest('[data-market],[data-action="demo-contact"],[data-action="favorite"]');
    if(!el)return;
    if(el.dataset.action==='demo-contact'){e.preventDefault();e.stopImmediatePropagation();root.querySelector('#market-contact')?.scrollIntoView({behavior:'smooth'});return;}
    if(el.dataset.action==='favorite'&&live){
      e.preventDefault();e.stopImmediatePropagation();if(!state.token){toast('Avval tizimga kiring','error');return;}
      const id=Number(el.dataset.id);
      try{if(state.favorites.includes(id)){await api.removeFavorite(state.token,id);state.favorites=state.favorites.filter(x=>x!==id);}else{await api.addFavorite(state.token,id);state.favorites.push(id);}render();toast('Sevimlilar yangilandi');}catch(e){toast(e.message,'error');}
      return;
    }
    if(el.dataset.market==='delete'){
      e.preventDefault();e.stopImmediatePropagation();if(!confirm('E’lon o‘chirilsinmi?'))return;
      try{await api.deleteProperty(state.token,Number(el.dataset.id));my=my.filter(x=>x.id!==Number(el.dataset.id));await refresh();render();toast('E’lon o‘chirildi');}catch(e){toast(e.message,'error');}
    }
  }
  root.addEventListener('submit',submit,true);root.addEventListener('click',click,true);
  window.addEventListener('hashchange',loadPage);
  return {init(){refresh();loadPage();},afterRender};
}
