const apiPath = 'https://assessing-floor-server.ykdev.ru'
let loading=false, loaded = false, file, url, imageWidth, imageHeight, poligons;
const placeholderOffset = 300;

// gui
const gui = new dat.GUI();
const control = {
  open: function(){
    let input = document.getElementById('addFile');
    if (!loaded) {  
      input.addEventListener('change', addFile, false);
      loaded = true;
    }
    input.click();
  },
  url: '',
  width: 80,
  fill: '#ff0000'
};
gui.add(control,'open');
gui.add(control,'url').onChange(addUrlFile);
gui.add(control,'width', 0, 300).onChange(editWidth);
gui.addColor(control, 'fill').onChange(editFill);

function editWidth() {
  const box = document.querySelector('.container');
  // box.setAttribute('style', `width: ${control.width}%`)
}

function editFill() {
  const elems = document.querySelectorAll('polygon')
  elems.forEach((item, index) => item.setAttribute('fill', control.fill));
}

function addFile(e) {
  console.log('addFile')
  file = e.target.files[0];
  url = URL.createObjectURL(file);
  const prefetchImage = new Image();
  prefetchImage.src = url;
  loading = true;
  turnLoading();
  prefetchImage.onload = () => {
    imageWidth = prefetchImage.width;
    imageHeight = prefetchImage.height;
    api(file, apiPath)
  }
}

function addUrlFile() {
  loading = true;
  turnLoading();
  fetch(control.url)
    .then(res => res.blob())
    .then(blob => {
      url = control.url
      let objectURL = URL.createObjectURL(blob);
      const prefetchImage = new Image();
      prefetchImage.src = objectURL;
      prefetchImage.onload = () => {
        imageWidth = prefetchImage.width;
        imageHeight = prefetchImage.height;
        api(blob, apiPath)
      }
    }).catch((e) => console.log(e));
}

function api(file, apiPath) {
  console.log('api')
  let Data = new FormData();
  Data.append('image', file);
  fetch(`${apiPath}/image`, {
    method: "POST",
    body: Data
  }).then(response => {
    if (response.status !== 200) {
      return Promise.reject();
    }
    return response.json();
  }).then((data) => {
      createImage(url)
      const points = data.data.map(flat => flat.join(' '));
      createSvg(points);
      loading = false;
      turnLoading()
  }).catch((e) => console.log(e));
}

function getNode(n, v) {
  console.log('getNode');
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v)
    n.setAttributeNS(null, p, v[p]);
  return n
}

function createSvg(points) {
  console.log('createSvg');
  const box = document.querySelector('.container')
  const hint = document.createElement('div');
  hint.innerHML = '';
  hint.classList.add('container__hint')
  box.appendChild(hint)
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('viewBox', `0 0 ${imageHeight} ${imageWidth}`)
  points.forEach((item, index) => svg.appendChild( getNode('polygon', { points:item, fill:control.fill, 'fill-opacity':'0.4' }) ))
  hint.appendChild(svg);
}

function createImage(src) {
  console.log('createImage');
  const box = document.querySelector('.container');
  // box.setAttribute('style', `width: ${control.width}%`)
  box.innerHTML = '';
  const image = document.createElement('img');
  if (src){
    image.setAttribute('src', src);
    image.setAttribute('height', imageHeight - placeholderOffset);
    image.setAttribute('width', imageWidth - placeholderOffset);
  } else {
    image.setAttribute(
      'src',
      `https://via.placeholder.com/${window.innerWidth - placeholderOffset}x${window.innerHeight - placeholderOffset}`
    );
    image.setAttribute('height', window.innerHeight - placeholderOffset);
    image.setAttribute('width', window.innerWidth - placeholderOffset);
  }
  
  image.onerror = function handleError() {
    console.log('Image could not be loaded');
    // 👇️ Can set image.src to a backup image here
    // image.src = 'backup-image.png'
    // 👇️ Or hide image
    // image.style.display = 'none';
  };
  image.onload = function handleImageLoaded() {
    console.log('image loaded successfully');
  };
  box.appendChild(image);
}
createImage()

function turnLoading() {
  const el = document.querySelector('.loading')
  if (loading) {
    el.setAttribute('style', 'display: block')
  } else {
    el.setAttribute('style', 'display: none')
  }
}
turnLoading()