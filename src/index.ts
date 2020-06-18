import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { AmmoPhysics, PhysicsLoader, ExtendedMesh } from '@enable3d/ammo-physics'

const ThreeScene = () => {
  // scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // camera
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(10, 10, 20)

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  const div = document.getElementById('three-scene')
  if (div) div.appendChild(renderer.domElement)
  else console.error('div not found!')

  // dpr
  const DPR = window.devicePixelRatio
  // renderer.setPixelRatio(Math.max(1, DPR / 2))

  // handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // orbit controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 5, 0)
  camera.lookAt(0, 5, 0)

  // light
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
  scene.add(new THREE.AmbientLight(0x666666))
  const light = new THREE.DirectionalLight(0xdfebff, 1)
  light.position.set(50, 200, 100)
  light.position.multiplyScalar(1.3)

  // physics
  const physics = new AmmoPhysics(scene)
  physics.debug?.enable()

  // add ground
  const addGround = () => {
    const geometry = new THREE.BoxBufferGeometry(20, 1, 20)
    const material = new THREE.MeshLambertMaterial({ color: 0xc4c4c4 })
    const ground = new ExtendedMesh(geometry, material)
    scene.add(ground)
    // @ts-ignore
    physics.add.existing(ground, { collisionFlags: 1, mass: 0 })
  }

  // add box
  const addBox = (x, y, z, color, isKinematic = false) => {
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshLambertMaterial({ color })
    const box = new ExtendedMesh(geometry, material)
    box.position.set(x, y, z)
    scene.add(box)
    // @ts-ignore
    physics.add.existing(box)
    if (isKinematic) box.body.setCollisionFlags(2) // make it kinematic
    return box
  }

  // add sphere
  const addYellowSphere = () => {
    const geometry = new THREE.SphereBufferGeometry()
    const material = new THREE.MeshLambertMaterial({ color: 'yellow' })
    const sphere = new ExtendedMesh(geometry, material)
    sphere.position.set(0, 2, 5)
    scene.add(sphere)
    // @ts-ignore
    physics.add.existing(sphere)
  }

  // add green box
  const greenBox = addBox(0, 5, 0, 0x00ff00, true)
  //  add blue box
  addBox(0.05, 10, 0, 0x2194ce)
  // add ground
  addGround()
  // add yellow sphere
  addYellowSphere()

  // clock
  const clock = new THREE.Clock()

  // loop
  const animate = () => {
    greenBox.rotation.x += 0.01
    greenBox.rotation.y += 0.01
    // @ts-ignore
    greenBox.body.needUpdate = true // this is how you update kinematic bodies

    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()
    renderer.render(scene, camera)

    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

window.addEventListener('DOMContentLoaded', () => {
  PhysicsLoader('/assets/ammo', () => ThreeScene())
})
