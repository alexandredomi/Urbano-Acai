const WHATSAPP = '5553991883532'; // Brasil (55) + DDD 53 + número do panfleto.
const BUSINESS_HOURS = {
  0: { start: 14 * 60 + 30, end: 2 * 60 },
  1: null,
  2: null,
  3: { start: 14 * 60 + 30, end: 2 * 60 },
  4: { start: 14 * 60 + 30, end: 2 * 60 },
  5: { start: 14 * 60 + 30, end: 2 * 60 },
  6: { start: 14 * 60 + 30, end: 2 * 60 }
};
function updateBusinessStatus(){
  const now=new Date();
  const day=now.getDay();
  const minute=now.getHours()*60+now.getMinutes();
  const todayHours=BUSINESS_HOURS[day];
  const previousDayHours=BUSINESS_HOURS[(day+6)%7];
  const isOpen=Boolean(
    (todayHours&&(todayHours.end>todayHours.start?minute>=todayHours.start&&minute<todayHours.end:minute>=todayHours.start))||
    (previousDayHours&&previousDayHours.end<=previousDayHours.start&&minute<previousDayHours.end)
  );
  const statusText=document.querySelector('#statusText');
  const statusIndicator=document.querySelector('#statusIndicator');
  statusText.textContent=isOpen?'Aberto agora':'Fechado';
  statusIndicator.className=isOpen?'status-open':'status-closed';
}
updateBusinessStatus();
setInterval(updateBusinessStatus,60000);
const sizes = [{name:'Pequeno',detail:'150 ml',price:12},{name:'Médio',detail:'300 ml',price:17},{name:'Grande',detail:'500 ml',price:25}];
const included = ['Amendoim triturado','Banana','Bis branco','Bis ao leite','Leite em pó','Farofa de paçoca','Granola','Leite condensado','Creme cookies and cream'];
const extras = [{name:'Chocoball',price:2.99},{name:'Confete',price:2.99},{name:'Stikadinho',price:3.99},{name:'Ovomaltine',price:3.99},{name:'Ouro Branco',price:4.99},{name:'Creme Bueno',price:4.99},{name:'Creme Leitinho',price:4.99},{name:'Creme Avelã',price:4.99},{name:'Creme de Amendoim',price:4.99}];
const CART_STORAGE_KEY = 'acai-urbano-sacola';
let selectedSize=null, selectedIncluded=[], selectedExtras=[], cart=[];
try { cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []; } catch { cart = []; }
const money=value=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const sizeRoot=document.querySelector('#sizes'),includedRoot=document.querySelector('#included'),extrasRoot=document.querySelector('#extras');
const pickupStoreInput=document.querySelector('#pickupStore');
const deliveryOptionInput=document.querySelector('#deliveryOption');
const deliveryFields=document.querySelector('#deliveryFields');
const deliveryAddressInputs=['#deliveryStreet','#deliveryNumber','#deliveryNeighborhood'].map(selector=>document.querySelector(selector));
const paymentMethodInput=document.querySelector('#paymentMethod');
const cashChangeFields=document.querySelector('#cashChangeFields');
const cashChangeChoiceInput=document.querySelector('#cashChangeChoice');
const cashChangeAmountField=document.querySelector('#cashChangeAmountField');
const cashChangeAmountInput=document.querySelector('#cashChangeAmount');
function updateFulfillmentFields(){
  const isDelivery=deliveryOptionInput.checked;
  deliveryFields.hidden=!isDelivery;
  deliveryAddressInputs.forEach(input=>input.required=isDelivery);
  document.querySelector('#cartTotalLabel').textContent=isDelivery?'Subtotal':'Total';
}
function updatePaymentFields(){
  const isCash=paymentMethodInput.value==='cash';
  const needsChange=cashChangeChoiceInput.value==='yes';
  cashChangeFields.hidden=!isCash;
  cashChangeChoiceInput.required=isCash;
  cashChangeAmountField.hidden=!isCash||!needsChange;
  cashChangeAmountInput.required=isCash&&needsChange;
}
document.querySelectorAll('input[name="fulfillment"]').forEach(input=>input.addEventListener('change',updateFulfillmentFields));
paymentMethodInput.addEventListener('change',updatePaymentFields);
cashChangeChoiceInput.addEventListener('change',updatePaymentFields);
function syncIncludedOptions(){
  [...includedRoot.children].forEach(button=>{
    const name=button.querySelector('span').textContent;
    button.classList.toggle('active',selectedIncluded.includes(name));
  });
}
function getIncludedLimit(){
  if(selectedSize===null) return 3;
  return sizes[selectedSize].name === 'Pequeno' ? 2 : 3;
}

sizes.forEach((size,i)=>{const button=document.createElement('button');button.type='button';button.className='size-card';button.innerHTML=`<strong>${size.name}</strong><span>${size.detail}</span><b>${money(size.price)}</b>`;button.onclick=()=>{selectedSize=i;const limit=getIncludedLimit();if(selectedIncluded.length>limit){selectedIncluded=selectedIncluded.slice(0,limit);syncIncludedOptions()};[...sizeRoot.children].forEach(x=>x.classList.remove('active'));button.classList.add('active');updateSelectionInfo()};sizeRoot.append(button)});
function calculateCurrentTotal(){
  if(selectedSize===null) return 0;
  const size=sizes[selectedSize];
  const selectedExtraData=extras.filter(item=>selectedExtras.includes(item.name));
  return size.price + selectedExtraData.reduce((sum,item)=>sum+item.price,0);
}
function updateSelectionInfo(){
  const includedLimit=getIncludedLimit();
  document.querySelector('#includedCount').textContent=`${selectedIncluded.length}/${includedLimit}`;
  document.querySelector('#extrasCount').textContent=`${selectedExtras.length}`;
  document.querySelector('#currentTotal').textContent=money(calculateCurrentTotal());
  document.querySelector('#addToCart').disabled=selectedSize===null;
}
function addOption(root,item,type){
  const name=typeof item==='string'?item:item.name,
        price=typeof item==='string'?null:item.price;
  const button=document.createElement('button');
  button.type='button';
  button.className='option';
  button.innerHTML=`<span>${name}</span>${price?`<small>+ ${money(price)}</small>`:''}<i class="check">✓</i>`;

  button.onclick=()=>{
    const array=type==='included'?selectedIncluded:selectedExtras;
    const pos=array.indexOf(name);

    if(type==='included'){
      if(pos>=0){
        array.splice(pos,1);
        button.classList.remove('active');
      }else{
        const limit=getIncludedLimit();
        if(array.length>=limit){
          showToast(limit===2?'Açaí pequeno aceita até 2 complementos grátis.':'Você pode escolher até 3 complementos grátis.','error');
          return;
        }
        array.push(name);
        button.classList.add('active');
      }
    }else{
      if(pos>=0){
        array.splice(pos,1);
        button.classList.remove('active');
      }else{
        array.push(name);
        button.classList.add('active');
      }
    }

    updateSelectionInfo();
  };

  root.append(button);
}

included.forEach(item=>addOption(includedRoot,item,'included'));
extras.forEach(item=>addOption(extrasRoot,item,'extra'));
function currentOrder(){
  if(selectedSize===null) return null;
  const size=sizes[selectedSize],selectedExtraData=extras.filter(item=>selectedExtras.includes(item.name));
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name: `Açaí ${size.name}`,
    detail: size.detail,
    included: [...selectedIncluded],
    extras: selectedExtraData,
    note: document.querySelector('#notes').value.trim(),
    qty: 1,
    price: size.price + selectedExtraData.reduce((sum,item)=>sum+item.price,0)
  };
}
function persistCart(){try{localStorage.setItem(CART_STORAGE_KEY,JSON.stringify(cart))}catch{}}
function renderCart(){
  persistCart();
  const root=document.querySelector('#cartItems');
  const count=cart.reduce((sum,item)=>sum+item.qty,0);
  const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  const quickButton=document.querySelector('#sendOrderQuick');
  const expandedButton=document.querySelector('#sendOrder');
  document.querySelector('#cartCount').textContent=count;
  document.querySelector('#cartTotal').textContent=money(total);
  const disabled=!cart.length;
  quickButton.disabled=disabled;
  expandedButton.disabled=disabled;
  if(!cart.length){
    root.innerHTML='<p class="empty">Sua sacola está vazia.<br>Monte um açaí e adicione aqui.</p>';
    return;
  }
  root.innerHTML=cart.map(item=>`<article class="cart-item"><div class="cart-item-head"><div><strong>${item.name}</strong><small>${item.detail}</small></div><button class="remove" data-id="${item.id}" aria-label="Remover">×</button></div><p>${item.included.length?item.included.join(', '):'Sem complementos'}${item.extras.length?`<br><b>Extras:</b> ${item.extras.map(extra=>extra.name).join(', ')}`:''}${item.note?`<br><b>Obs.:</b> ${item.note}`:''}</p><div class="cart-bottom"><div class="quantity"><button data-action="minus" data-id="${item.id}" aria-label="Diminuir">−</button><span>${item.qty}</span><button data-action="plus" data-id="${item.id}" aria-label="Aumentar">+</button></div><strong>${money(item.price*item.qty)}</strong></div></article>`).join('');
}
function resetBuilder(){
  selectedSize=null;
  selectedIncluded=[];
  selectedExtras=[];
  [...sizeRoot.children,...includedRoot.children,...extrasRoot.children].forEach(button=>button.classList.remove('active'));
  document.querySelector('#notes').value='';
  updateSelectionInfo();
}
function validateFulfillment(){
  if(!pickupStoreInput.checked&&!deliveryOptionInput.checked){
    showToast('Escolha entre entrega e retirada na loja.','error');
    return false;
  }
  if(deliveryOptionInput.checked){
    const missingAddress=deliveryAddressInputs.find(input=>!input.value.trim());
    if(missingAddress){
      showToast('Informe a rua, o número e o bairro para a entrega.','error');
      missingAddress.focus();
      return false;
    }
  }
  return true;
}
function validatePayment(){
  if(!paymentMethodInput.value){
    showToast('Selecione uma forma de pagamento.','error');
    paymentMethodInput.focus();
    return false;
  }
  if(paymentMethodInput.value==='cash'){
    if(!cashChangeChoiceInput.value){
      showToast('Informe se vai precisar de troco.','error');
      cashChangeChoiceInput.focus();
      return false;
    }
    if(cashChangeChoiceInput.value==='yes'&&!(Number(cashChangeAmountInput.value)>0)){
      showToast('Informe o valor para o qual precisa de troco.','error');
      cashChangeAmountInput.focus();
      return false;
    }
  }
  return true;
}
document.querySelector('#addToCart').onclick=event=>{event.stopPropagation();const order=currentOrder();if(!order){showToast('Escolha o tamanho do seu açaí primeiro.','error');return}if(!validateFulfillment())return;cart.push(order);renderCart();resetBuilder();toggleCart(false);showToast('Açaí adicionado à sua sacola!','success')};
document.querySelector('#cartItems').onclick=event=>{const button=event.target.closest('button[data-id]');if(!button)return;event.stopPropagation();const item=cart.find(x=>x.id===button.dataset.id);if(!item)return;if(button.classList.contains('remove'))cart=cart.filter(x=>x.id!==item.id);else if(button.dataset.action==='plus')item.qty++;else if(button.dataset.action==='minus')item.qty>1?item.qty--:cart=cart.filter(x=>x.id!==item.id);renderCart()};
function showToast(message,type='error'){
  const toast=document.querySelector('#toast');
  const toastText=toast.querySelector('span');
  toastText.textContent=message;
  toast.classList.remove('success','error');
  toast.classList.add('show',type);

  clearTimeout(toast._timer);
  toast._timer=setTimeout(()=>{
    toast.classList.remove('show');
  },6000);
}
function toggleCart(force){const summary=document.querySelector('.summary'),open=typeof force==='boolean'?force:!summary.classList.contains('expanded');summary.classList.toggle('expanded',open);document.querySelector('#cartToggle').setAttribute('aria-expanded',open)}
document.querySelector('#cartToggle').onclick=()=>toggleCart();document.querySelector('#closeCart').onclick=()=>toggleCart(false);
document.addEventListener('click',event=>{const summary=document.querySelector('.summary');if(summary.classList.contains('expanded')&&!summary.contains(event.target))toggleCart(false)});
function handleSendOrder(){
  if(!cart.length){showToast('Sua sacola está vazia.','error');return}
  if(!validateFulfillment()||!validatePayment())return;

  const now=new Date();
  const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  const quantity=cart.reduce((sum,item)=>sum+item.qty,0);
  const orderCode=`${String(now.getDate()).padStart(2,'0')}${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getTime()).slice(-4)}`;
  const date=now.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
  const divider='────────────────────────';
  const lines=cart.map((item,index)=>{
    const details=[
      `${index+1}. ${item.qty}x ${item.name.toUpperCase()} — ${money(item.price*item.qty)}`,
      `   ${item.detail}`,
      item.included.length?`   GRÁTIS: ${item.included.join(', ')}`:'',
      item.extras.length?`   EXTRAS: ${item.extras.map(x=>x.name).join(', ')}`:'',
      item.note?`   OBS: ${item.note}`:''
    ].filter(Boolean);
    return details.join('\n');
  }).join(`\n${divider}\n`);
  const isDelivery=deliveryOptionInput.checked;
  const paymentLabels={pix:'PIX',cash:'Dinheiro',credit:'Cartão de crédito',debit:'Cartão de débito'};
  const address=deliveryAddressInputs.map(input=>input.value.trim()).join(', ');
  const paymentDetails=paymentMethodInput.value==='cash'&&cashChangeChoiceInput.value==='yes'
    ? `DINHEIRO — TROCO PARA: ${money(Number(cashChangeAmountInput.value))}`
    : paymentLabels[paymentMethodInput.value];
  const destination=isDelivery
    ? `ENDEREÇO DE ENTREGA: ${address}`
    : 'RETIRADA NO LOCAL: Clóvis Beviláqua, 451 - Simões Lopes, Pelotas/RS';
  const totals=isDelivery
    ? `SUBTOTAL DOS PRODUTOS: ${money(total)}\nTAXA DE ENTREGA: A CONSULTAR\nTOTAL FINAL: A CONFIRMAR PELO WHATSAPP`
    : `TOTAL: ${money(total)}`;
  const paymentFollowUp=paymentMethodInput.value==='pix'
    ? 'Após confirmar o total, enviar a chave PIX pelo WhatsApp.'
    : 'A loja confirmará o pedido pelo WhatsApp.';
  const deliveryFollowUp=isDelivery
    ? 'Aguardamos a consulta da taxa de entrega e a confirmação do total final.'
    : '';
  const message=`*AÇAÍ URBANO — NOVO PEDIDO*\n\n\`\`\`\nPEDIDO #${orderCode}\n${date}\n${divider}\nTIPO: ${isDelivery?'ENTREGA':'RETIRADA NO LOCAL'}\n${destination}\nPAGAMENTO: ${paymentDetails}\n${divider}\n${lines}\n${divider}\nITENS: ${quantity}\n${totals}\n${divider}\n\`\`\`\n${deliveryFollowUp?`*${deliveryFollowUp}*\n`:''}*${paymentFollowUp}*`;

  cart=[];
  localStorage.removeItem(CART_STORAGE_KEY);
  document.querySelectorAll('input[name="fulfillment"]').forEach(input=>input.checked=false);
  deliveryAddressInputs.forEach(input=>input.value='');
  paymentMethodInput.value='';
  cashChangeChoiceInput.value='';
  cashChangeAmountInput.value='';
  updateFulfillmentFields();
  updatePaymentFields();
  renderCart();
  toggleCart(false);
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,'_blank');
}

function openInfoModal(){
  const modal=document.querySelector('#infoModal');
  if(!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}

function closeInfoModal(){
  const modal=document.querySelector('#infoModal');
  if(!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

const infoIcon=document.querySelector('[data-open-modal]');
if(infoIcon){
  infoIcon.addEventListener('click',event=>{
    event.preventDefault();
    openInfoModal();
  });
}

document.querySelector('#closeInfoModal')?.addEventListener('click',closeInfoModal);
document.querySelector('#infoModal')?.addEventListener('click',event=>{
  if(event.target===event.currentTarget) closeInfoModal();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape') closeInfoModal();
});

['#sendOrder', '#sendOrderQuick'].forEach(selector => {
  const button=document.querySelector(selector);
  if(button) button.onclick=handleSendOrder;
});
updateFulfillmentFields();
updatePaymentFields();
updateSelectionInfo();renderCart();
