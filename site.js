(() => {
  const root = document.querySelector('#knowledge-graph');
  if (!root) return;
  const nodes = [
    { id:'home', label:'masa-zehn', type:'topic', x:50, y:48 },
    { id:'solver', label:'Hit & Blow Solver', type:'product', href:'./pages/hit_blow/index.html', x:20, y:23 },
    { id:'radio', label:'アマチュア無線', type:'note', href:'./pages/ham.html', x:78, y:22 },
    { id:'bahasa', label:'インドネシア語', type:'note', href:'./pages/languages/bahasa_indonesia/index.html', x:77, y:75 },
    { id:'info', label:'相互情報量', type:'topic', x:22, y:73 },
    { id:'engineering', label:'Engineering', type:'topic', x:49, y:13 },
    { id:'travel', label:'Travel', type:'topic', x:51, y:84 }
  ];
  const edges = [['home','solver'],['home','radio'],['home','bahasa'],['solver','info'],['info','engineering'],['radio','engineering'],['bahasa','travel']];
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('aria-hidden','true');
  svg.innerHTML = '<defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#56604d"/></marker></defs>';
  edges.forEach(([from,to]) => {
    const a=nodes.find(n=>n.id===from), b=nodes.find(n=>n.id===to);
    const line=document.createElementNS(ns,'line');
    line.setAttribute('x1',`${a.x}%`); line.setAttribute('y1',`${a.y}%`); line.setAttribute('x2',`${b.x}%`); line.setAttribute('y2',`${b.y}%`); line.setAttribute('class','graph-edge'); svg.appendChild(line);
  });
  root.appendChild(svg);
  nodes.forEach(node => {
    const el=document.createElement(node.href?'a':'span');
    el.className='graph-node'; el.dataset.type=node.type; el.textContent=node.label;
    el.style.left=`${node.x}%`; el.style.top=`${node.y}%`;
    if(node.href) el.href=node.href;
    root.appendChild(el);
  });
})();
