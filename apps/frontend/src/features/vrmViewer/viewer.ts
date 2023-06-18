import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { buildUrl } from "@/utils/buildUrl";
import html2canvas from "html2canvas";
import { createChart } from 'lightweight-charts';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Model } from "./model";

const html2texture = async (htmlElement: HTMLElement): Promise<THREE.Texture> => {
  const canvas = await html2canvas(htmlElement);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const formatYYYYMMDD = (date: Date): string => {
 return date.toISOString().split('T')[0]
}

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export class Viewer {
  public isReady: boolean;
  public model?: Model;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;

  constructor() {
    this.isReady = false;

    // scene
    const scene = new THREE.Scene();
    this._scene = scene;

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // 部屋の読み込み
    loader.load(buildUrl("/room.glb"), (room) => {
      // room scaleを小さくする
      const roomScale = 0.13;
      room.scene.scale.set(roomScale, roomScale, roomScale);

      room.scene.position.z = 1.2;
      room.scene.position.y = 0.2;
      scene.add(room.scene);
    });

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // Disable frustum culling
      this.model.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      this._scene.add(this.model.vrm.scene);

      const vrma = await loadVRMAnimation(buildUrl("/idle_loop.vrma"));
      if (vrma) this.model.loadAnimation(vrma);

      // HACK: アニメーションの原点がずれているので再生後にカメラ位置を調整する
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene.remove(this.model.vrm.scene);
      this.model?.unLoadVrm();
    }
  }

  /**
   * Reactで管理しているCanvasを後から設定する
   */
  public setup(canvas: HTMLCanvasElement) {
    const parentElement = canvas.parentElement;
    const width = parentElement?.clientWidth || canvas.width;
    const height = parentElement?.clientHeight || canvas.height;
    // renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // camera
    this._camera = new THREE.PerspectiveCamera(45.0, width / height, 0.1, 50.0);
    this._camera.position.set(0, 1.3, 1.5);
    this._cameraControls?.target.set(0, 1.3, 0);
    this._cameraControls?.update();
    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._cameraControls.screenSpacePanning = true;
    this._cameraControls.update();

    // chart
    const chartElement = document.createElement("div");
    chartElement.style.width = "200px";
    chartElement.style.height = "100px";
    // display none的な感じで表示されないけど、スクショできる
    chartElement.style.clipPath = "inset(0 100% 0 0)";
    const chartOptions = { layout: { textColor: 'white', background: {color: '#141414'}}, width: 200, height: 100, timeScale: { timeVisible: true, secondsVisible: false } };

    const chart = createChart(chartElement, chartOptions);
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });

    chartElement.style.border = "solid 1px black";

    document.body.appendChild(chartElement);

    // 今日の日付
    let datetimeStr = formatYYYYMMDD(new Date());

    setInterval(() => {
      // TODO: APIでいい感じの価格データを取得する

      // 100~300のランダムな値を生成
      const random = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
      const open = Math.floor(Math.random() * (random - 100 + 1)) + 100;
      const close = Math.floor(Math.random() * (random - 100 + 1)) + 100;
      const high = Math.floor(Math.random() * (random - 100 + 1)) + 100;
      const low = Math.floor(Math.random() * (random - 100 + 1)) + 100;
      const date = new Date(datetimeStr);
      date.setDate(date.getDate() + 1);
      datetimeStr = formatYYYYMMDD(date);
      
      candlestickSeries.update({ time: datetimeStr, open, close, high, low });
      // グラフがレンダリングされた後じゃないと何も映らないので遅らせる
      setTimeout(() => {
        html2texture(chartElement).then((texture) => {
          // 色が白っぽくなるので調整
          texture.encoding = THREE.sRGBEncoding;
          const material = new THREE.MeshBasicMaterial({map: texture});
          const geometry = new THREE.PlaneGeometry(2, 1);
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(-1.7, 1, 1);
          mesh.rotation.y = Math.PI / 2;

          this._scene.add(mesh);
        });
      }, 1000);
    }, 2000);

    window.addEventListener("resize", () => {
      this.resize();
    });
    this.isReady = true;
    this.update();
  }

  /**
   * canvasの親要素を参照してサイズを変更する
   */
  public resize() {
    if (!this._renderer) return;

    const parentElement = this._renderer.domElement.parentElement;
    if (!parentElement) return;

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(
      parentElement.clientWidth,
      parentElement.clientHeight
    );

    if (!this._camera) return;
    this._camera.aspect =
      parentElement.clientWidth / parentElement.clientHeight;
    this._camera.updateProjectionMatrix();
  }

  /**
   * VRMのheadノードを参照してカメラ位置を調整する
   */
  public resetCamera() {
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");

    if (headNode) {
      const headWPos = headNode.getWorldPosition(new THREE.Vector3());
      this._camera?.position.set(
        this._camera.position.x,
        headWPos.y,
        this._camera.position.z
      );
      this._cameraControls?.target.set(headWPos.x, headWPos.y, headWPos.z);
      this._cameraControls?.update();
    }
  }

  public update = () => {
    requestAnimationFrame(this.update);
    const delta = this._clock.getDelta();
    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }

    if (this._renderer && this._camera) {
      this._renderer.render(this._scene, this._camera);
    }
  };
}
