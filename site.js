(() => {
  const root = document.querySelector('#knowledge-graph');
  if (!root) return;
  const nodes = [
    { id:'home', label:'masa-zehn', type:'topic', x:50, y:48 },
    { id:'products', label:'Products', type:'topic', href:'./products/index.html', x:16, y:17 },
    { id:'solver', label:'Hit & Blow Solver', type:'product', href:'./products/hit-blow/index.html', x:8, y:48 },
    { id:'notes', label:'Notes', type:'topic', href:'./notes/index.html', x:48, y:14 },
    { id:'languages', label:'Languages', type:'topic', href:'./notes/languages/index.html', x:69, y:28 },
    { id:'bahasa', label:'インドネシア語', type:'note', href:'./notes/languages/indonesian/index.html', x:84, y:49 },
    { id:'vocabulary', label:'単語と語源', type:'note', href:'./notes/languages/indonesian/vocabulary/index.html', x:72, y:75 },
    { id:'affixes', label:'接頭辞・接尾辞', type:'note', href:'./notes/languages/indonesian/affixes/index.html', x:92, y:78 },
    { id:'radio', label:'アマチュア無線', type:'note', href:'./notes/radio/amateur-radio/index.html', x:43, y:80 },
    { id:'journals', label:'Journals', type:'topic', href:'./journals/index.html', x:17, y:82 }
  ];
  const edges = [['home','products'],['products','solver'],['home','notes'],['notes','languages'],['languages','bahasa'],['bahasa','vocabulary'],['bahasa','affixes'],['notes','radio'],['home','journals']];
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('aria-hidden','true');
  svg.innerHTML = '<defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#aaa99f"/></marker></defs>';
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
