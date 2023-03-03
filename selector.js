import * as THREE from 'three'; //importanción de los modulos principales
import { OrbitControls } from 'OrbitControls'; // importacion de controles
import { GLTFLoader } from 'GLTFLoader';// importacion de Loader para .glb y .gltf


function main(){
  //Variables para generar la escena de treejs
  const canvas = document.querySelector('#c'); // objeto de html que mostrará la escena
  const renderer = new THREE.WebGLRenderer({canvas}); //instancia del render de treejs

  const loader = new GLTFLoader();
  const cameraPrincipal = cameras(75, 2, 0.1, 10);//instancia de camara principal
  const scene = new THREE.Scene();// instancia de la escena
  scene.background = new THREE.Color(0x555555);

  {
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 0, 20, 10 );
    scene.add( dirLight );

    const dirLight2 = new THREE.DirectionalLight( 0xffffff );
    dirLight2.position.set( 0, -.5, -.5 );
    scene.add( dirLight2 );
  }

  const Objetos = geometries(); //Genera las geometrias en una lista

  //Raycast
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let INTERSECTED;

  //Variables Animaciones
  const mixers = [];
  let pausa = true;
  const clock = new THREE.Clock(); 
  
  // controles orbitales
  const controls = new OrbitControls( cameraPrincipal, renderer.domElement );
  controls.enableDamping = true; //Movimiento de camara suave
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 1;
	controls.maxDistance = 5;
	controls.maxPolarAngle = Math.PI ;

  const cambio = document.getElementById('test');// instancia del boton en el html
  const pa = document.querySelector('.pause');
  cambio.addEventListener('click',() =>{//Capturamos el clic del boton para pruebas
      console.log('Pausando');
      pa.classList.toggle('active');
      pausa = !pausa;
  })

  canvas.addEventListener('mousemove',(e)=>{
    onPoniterData(e);
  })

  canvas.addEventListener('click', (e)=>{
    onPoniterData(e);
    onClickMap();    
  })

  function cameras(fov=75, aspect=2, near=0.1, far=5, position = [0, 0, 3.5]){// función genera cámaras 
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far, position = [0, 0, 3.5]);
    camera.position.set(position[0], position[1], position[2]);
    return camera;
  }

  function geometries(){// Geometrías para dibujar en la escena
    const objets = [];

    /* const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(0,-.5,-.5);
    scene.add( cube ); */

    loader.load( 'Modelos/relogCarcasaF.glb',
    function ( gltf ) {
      gltf.scene.position.set(0, -1.5 ,0);
      gltf.scene.scale.set(10, 10, 10);
      getAnimations(gltf.scene, gltf.animations,10)
      Objetos.push(gltf.scene);
	    scene.add( gltf.scene );
    }, undefined, function ( error ) {
	        console.error( error );
        } 
  );

  loader.load( 'Modelos/Mecanismo.glb',
    function ( gltf ) {
      gltf.scene.position.set(0, -1.5 ,0);
      gltf.scene.scale.set(10, 10, 10);
      getAnimations(gltf.scene, gltf.animations, 10)
      Objetos.push(gltf.scene);
	    scene.add( gltf.scene );
    }, undefined, function ( error ) {
	        console.error( error );
        } 
  );
    return objets;
  }

  function getAnimations(model, animations, d){
    const mixer = new THREE.AnimationMixer( model );
		mixer.clipAction( animations[ 0 ] ).setDuration( d ).play();
		mixers.push( mixer );
  }

  function onPoniterData(e){
    pointer.x = ( e.offsetX / canvas.clientWidth ) * 2 - 1;
    pointer.y = - ( e.offsetY / canvas.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, cameraPrincipal );
  }


  function onClickMap(){
    const intersects = raycaster.intersectObjects( Objetos );
    if (intersects.length > 0) {
      const selected = intersects[0].object.parent;
      if (selected.name != 'Esqueleto') {
        document.querySelector('.contenido').innerHTML=intersects[0].object.parent.name; 
      }else{
        document.querySelector('.contenido').innerHTML=intersects[0].object.name;
      }
      
    }
  }

  function Animations(){ //Animaciones para los objetos en la escena
    const delta = clock.getDelta();
		if (pausa) {
      for ( let i = 0; i < mixers.length; i ++ ) {
        if ( mixers[i] ) mixers[i].update( delta );
      } 
    }
  }


  function resizeRendererToDisplaySize(renderer) { // Restablece el tamaño de los objetos en la escena
    //De acuerdo al tamaño del contenedor de la escena en el html
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) { //dibuja la escena
    time *= 0.001;  // conviete el tiempo a segundos
    
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        cameraPrincipal.aspect = canvas.clientWidth / canvas.clientHeight;
        cameraPrincipal.updateProjectionMatrix();
    }
  
    renderer.render(scene, cameraPrincipal);

    requestAnimationFrame(render);
    Animations();
    controls.update();
  }
  requestAnimationFrame(render);
}
main();

