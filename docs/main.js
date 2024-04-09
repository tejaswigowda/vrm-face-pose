/* global THREE, THREE_VRM, loadMixamoAnimation */

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
camera.position.set(0.0, 1.0, 5.0);

// camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0.0, 1.0, 0.0);
controls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

const defaultModelUrl = './model.vrm';

// gltf and vrm
let currentVrm = undefined;
let currentAnimationUrl = undefined;
let currentMixer = undefined;

function loadVRM(modelUrl) {
  const loader = new THREE.GLTFLoader();
  loader.crossOrigin = 'anonymous';

  loader.register((parser) => {
    return new THREE_VRM.VRMLoaderPlugin(parser);
  });

  loader.load(
    // URL of the VRM you want to load
    modelUrl,

    // called when the resource is loaded
    (gltf) => {
      const vrm = gltf.userData.vrm;
      if (currentVrm) {
        scene.remove(currentVrm.scene);
        THREE_VRM.VRMUtils.deepDispose(currentVrm.scene);
      }

      // put the model to the scene
      currentVrm = vrm;
      scene.add(vrm.scene);

      // rotate if the VRM is VRM0.0
      THREE_VRM.VRMUtils.rotateVRM0(vrm);

      console.log(vrm);
    },

    // called while loading is progressing
    (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

    // called when loading has errors
    (error) => console.error(error),
  );
}
loadVRM(defaultModelUrl);

// helpers
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// animate
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (currentMixer) {
    // アニメーションが読み込まれていれば
    currentMixer.update(deltaTime); // アニメーションをアップデート
  }

  if (currentVrm) {
    currentVrm.update(deltaTime);
  }

  renderer.render(scene, camera);
}

animate();

// file input

// dnd handler
window.addEventListener('dragover', function (event) {
  event.preventDefault();
});

window.addEventListener('drop', function (event) {
  event.preventDefault();

  // read given file then convert it to blob url
  const files = event.dataTransfer.files;
  if (!files) {
    return;
  }
  const file = files[0];
  if (!file) {
    return;
  }

  const fileType = file.name.split('.').pop();
  console.log(fileType);
  const blob = new Blob([file], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  if (fileType === 'bvh') {
    currentAnimationUrl = url;
    currentMixer = new THREE.AnimationMixer(currentVrm.scene); // vrmのAnimationMixerを作る
    loadBVHAnimation(url, currentVrm).then((clip) => {
      const action = currentMixer.clipAction(clip); // アニメーションをアクションに変換
      action.play(); // アニメーションを再生
    });
  } else {
    loadVRM(url);
  }
});


function loadBVHAnimation(url, vrm) {
  
}

const mixamoVRMRigMap = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
  mixamorigLeftHandThumb2: 'leftThumbProximal',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandThumb1: 'rightThumbMetacarpal',
  mixamorigRightHandThumb2: 'rightThumbProximal',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes',
};