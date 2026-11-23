import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export function BatteryTypeModel({
  url,
  x = 0,
  y = 0,
}: {
  url?: string | null;
  x?: number;
  y?: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    object = useRef<THREE.Object3D>();
  const [error, fail] = useState("");
  useEffect(() => {
    if (!host.current) return;
    let stopped = false;
    fail("");
    const container = host.current,
      scene = new THREE.Scene();
    scene.background = new THREE.Color("#eeeeee");
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(0, 1, 5);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      fail("WebGL недоступен");
      return;
    }
    container.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 4, 5);
    scene.add(light);
    const group = new THREE.Group();
    scene.add(group);
    object.current = group;
    group.rotation.set(x, y, 0);
    function fallback() {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 2.3, 32),
        new THREE.MeshStandardMaterial({ color: "#fc8507" }),
      );
      group.add(body);
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.15, 24),
        new THREE.MeshStandardMaterial({ color: "#999999" }),
      );
      cap.position.y = 1.2;
      group.add(cap);
    }
    if (url)
      new GLTFLoader().load(
        url,
        (g) => {
          if (stopped) return;
          const box = new THREE.Box3().setFromObject(g.scene),
            size = box.getSize(new THREE.Vector3());
          g.scene.position.sub(box.getCenter(new THREE.Vector3()));
          const normalized = new THREE.Group();
          normalized.add(g.scene);
          normalized.scale.setScalar(
            2.4 / Math.max(size.x, size.y, size.z, 0.01),
          );
          group.add(normalized);
        },
        undefined,
        () => {
          if (!stopped) {
            fail("Файл модели недоступен; показана модель по умолчанию");
            fallback();
          }
        },
      );
    else fallback();
    const resize = new ResizeObserver(() => {
      const w = container.clientWidth,
        h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resize.observe(container);
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
    return () => {
      stopped = true;
      resize.disconnect();
      renderer.setAnimationLoop(null);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          for (const m of Array.isArray(o.material)
            ? o.material
            : [o.material]) {
            for (const value of Object.values(m))
              if (value instanceof THREE.Texture) value.dispose();
            m.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      object.current = undefined;
    };
  }, [url]);
  useEffect(() => {
    object.current?.rotation.set(x, y, 0);
  }, [x, y, url]);
  return (
    <div>
      <div
        ref={host}
        className="batteryTypeModel"
        aria-label="3D модель аккумулятора"
      />
      {error && <p role="status">{error}</p>}
      <output>
        Углы: {x.toFixed(3)} / {y.toFixed(3)} рад
      </output>
    </div>
  );
}
