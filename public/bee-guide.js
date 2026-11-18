import * as THREE from '/vendor/three.module.js';

// A deliberately small glTF reader for Nectra's single, texture-free bee model.
// Loading it locally keeps this concept self-contained and avoids a third-party viewer.
const componentTypes = {
  5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array,
  5125: Uint32Array, 5126: Float32Array,
};
const itemSizes = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4};

async function readBee(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('The bee model could not be loaded.');
  const source = await response.arrayBuffer();
  const view = new DataView(source);
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error('Invalid bee model.');
  const jsonLength = view.getUint32(12, true);
  const jsonOffset = 20;
  const data = JSON.parse(new TextDecoder().decode(new Uint8Array(source, jsonOffset, jsonLength)));
  const binOffset = jsonOffset + jsonLength + 8;

  const accessor = (index) => {
    const entry = data.accessors[index];
    const bufferView = data.bufferViews[entry.bufferView];
    const Type = componentTypes[entry.componentType];
    const length = entry.count * itemSizes[entry.type];
    const offset = binOffset + (bufferView.byteOffset || 0) + (entry.byteOffset || 0);
    return new Type(source, offset, length);
  };
  const materials = (data.materials || []).map((material) => {
    const pbr = material.pbrMetallicRoughness || {};
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color().fromArray(pbr.baseColorFactor || [0.79, 0.45, 0.1]),
      metalness: pbr.metallicFactor || 0,
      roughness: pbr.roughnessFactor ?? 0.72,
      side: THREE.DoubleSide,
    });
  });
  const meshes = (data.meshes || []).map((mesh) => {
    const group = new THREE.Group();
    mesh.primitives.forEach((primitive) => {
      const geometry = new THREE.BufferGeometry();
      const attrs = primitive.attributes || {};
      if (attrs.POSITION !== undefined) geometry.setAttribute('position', new THREE.BufferAttribute(accessor(attrs.POSITION), 3));
      if (attrs.NORMAL !== undefined) geometry.setAttribute('normal', new THREE.BufferAttribute(accessor(attrs.NORMAL), 3));
      if (attrs.TEXCOORD_0 !== undefined) geometry.setAttribute('uv', new THREE.BufferAttribute(accessor(attrs.TEXCOORD_0), 2));
      if (primitive.indices !== undefined) geometry.setIndex(new THREE.BufferAttribute(accessor(primitive.indices), 1));
      if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
      group.add(new THREE.Mesh(geometry, materials[primitive.material] || new THREE.MeshStandardMaterial({color: '#c99b53'})));
    });
    return group;
  });
  const nodes = (data.nodes || []).map((node) => {
    const object = node.mesh === undefined ? new THREE.Group() : meshes[node.mesh].clone(true);
    object.name = node.name || '';
    if (node.translation) object.position.fromArray(node.translation);
    if (node.rotation) object.quaternion.fromArray(node.rotation);
    if (node.scale) object.scale.fromArray(node.scale);
    return object;
  });
  (data.nodes || []).forEach((node, index) => node.children?.forEach((child) => nodes[index].add(nodes[child])));
  const root = new THREE.Group();
  (data.scenes?.[data.scene || 0]?.nodes || []).forEach((index) => root.add(nodes[index]));
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const centre = bounds.getCenter(new THREE.Vector3());
  root.position.sub(centre);
  // The supplied bee is a guide, never the product. Keep its real 3D form
  // small enough that it cannot obscure a jar, label, price or purchase action.
  root.scale.setScalar(0.38 / Math.max(size.x, size.y, size.z, 0.1));
  return root;
}

export function mountBeeGuide({hero, catalogue}) {
  if (!hero || !catalogue || matchMedia('(prefers-reduced-motion: reduce)').matches || !window.WebGLRenderingContext) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'bee-guide-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'low-power'});
  } catch {
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  scene.add(new THREE.HemisphereLight('#fff8e6', '#174434', 2.4));
  const key = new THREE.DirectionalLight('#fff0cd', 3.4);
  key.position.set(-3, 5, 7);
  scene.add(key);
  const bee = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.add(bee);
  scene.add(tilt);
  let beeModel, wing;
  readBee('/assets/bee.glb').then((model) => {
    beeModel = model;
    wing = model.getObjectByName('Plane');
    bee.add(model);
  }).catch(() => canvas.remove());

  const target = {x: innerWidth * 0.78, y: innerHeight * 0.57};
  const current = {...target};
  const setTarget = (x, y) => { target.x = Math.max(30, Math.min(innerWidth - 30, x)); target.y = Math.max(85, Math.min(innerHeight - 30, y)); };
  const updateFromScroll = () => {
    const collection = catalogue.getBoundingClientRect();
    const transition = THREE.MathUtils.clamp((innerHeight - collection.top) / Math.max(innerHeight * 0.72, 1), 0, 1);
    const heroTarget = {x: innerWidth * 0.79, y: Math.max(130, innerHeight * 0.57)};
    // The bee arrives at the catalogue's empty heading space, then waits
    // above the products. It must never fly across a label or price.
    const catalogueTarget = {x: innerWidth * 0.89, y: Math.max(105, collection.top + 54)};
    setTarget(
      THREE.MathUtils.lerp(heroTarget.x, catalogueTarget.x, transition),
      THREE.MathUtils.lerp(heroTarget.y, catalogueTarget.y, transition),
    );
    document.body.classList.toggle('bee-near-catalogue', transition > 0.18 && collection.bottom > 0);
  };
  window.addEventListener('scroll', updateFromScroll, {passive: true});
  window.addEventListener('resize', updateFromScroll, {passive: true});
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  updateFromScroll();
  const clock = new THREE.Clock();
  const animate = () => {
    if (!document.body.contains(canvas)) return;
    requestAnimationFrame(animate);
    updateFromScroll();
    const time = clock.getElapsedTime();
    current.x = THREE.MathUtils.lerp(current.x, target.x, 0.065);
    current.y = THREE.MathUtils.lerp(current.y, target.y, 0.065);
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const viewWidth = viewHeight * camera.aspect;
    bee.position.set((current.x / innerWidth - .5) * viewWidth, -((current.y / innerHeight - .5) * viewHeight), 0);
    bee.position.y += Math.sin(time * 2.35) * 0.055;
    tilt.rotation.set(Math.sin(time * 1.15) * .08, Math.cos(time * .9) * .17, -0.18 + Math.sin(time * 1.7) * .05);
    if (wing) wing.rotation.z = Math.sin(time * 21) * .26;
    if (beeModel) beeModel.rotation.y = Math.sin(time * .85) * .22;
    renderer.render(scene, camera);
  };
  animate();
}
