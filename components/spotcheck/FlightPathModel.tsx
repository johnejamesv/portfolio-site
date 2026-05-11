"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Segment } from "./types";

type PathPoint = {
  x: number;
  y: number;
  z: number;
  altitude: number;
  label: string;
  gimbal: number;
  yaw: number;
};

type ModelView = "3d" | "topdown";

const FEET_PER_METER = 3.28084;
const SITE_MAX_HEIGHT_FT = 140;
const SITE_MAX_HEIGHT_M = SITE_MAX_HEIGHT_FT / FEET_PER_METER;
const SOURCE_ALTITUDE_REFERENCE_M = 60;
const VERTICAL_SCENE_UNITS = 46;
const DRONE_MARKER_COLOR = "#0284c7";
const DRONE_MARKER_DARK = "#075985";
const CAMERA_FRUSTUM_COLOR = "#0ea5e9";
const ABSOLUTE_ALTITUDE_DOMAIN: AltitudeDomain = {
  min: 0,
  maxMeters: SITE_MAX_HEIGHT_M,
  maxFeet: SITE_MAX_HEIGHT_FT,
  maxSceneY: VERTICAL_SCENE_UNITS,
  unitsPerMeter: VERTICAL_SCENE_UNITS / SITE_MAX_HEIGHT_M,
};

export function FlightPathModel({
  segment,
  className = "",
  embedded = false,
  heightClass = "h-[520px]",
}: {
  segment: Segment;
  className?: string;
  embedded?: boolean;
  heightClass?: string;
}) {
  const [view, setView] = useState<ModelView>("3d");
  const points = useMemo(() => makePathPoints(segment), [segment]);
  const altitude = getAltitudeStats(points);
  const altitudeDomain = ABSOLUTE_ALTITUDE_DOMAIN;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={embedded ? "text-sm font-medium text-gray-700" : "text-lg font-semibold"}>
            {embedded ? "3D Flight Path Model" : `Flight Path Visualization - ${segment.category}`}
          </h3>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-blue-600">
              Modeled Height: {metersToFeet(altitude.min).toFixed(0)}-{metersToFeet(altitude.max).toFixed(0)} ft
            </span>
            <span className="mx-2 text-gray-300">/</span>
            <span>{points.length} generated photo points</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>
              site scale 0-{altitudeDomain.maxFeet} ft ({altitudeDomain.maxMeters.toFixed(0)} m)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-md bg-gray-100 p-1 text-sm">
          <button
            className={`rounded px-3 py-1.5 font-medium ${
              view === "3d" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
            onClick={() => setView("3d")}
          >
            3D Flight Path
          </button>
          <button
            className={`rounded px-3 py-1.5 font-medium ${
              view === "topdown" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
            onClick={() => setView("topdown")}
          >
            2D Top-Down View
          </button>
        </div>
      </div>

      {view === "3d" ? (
        <div className={`${heightClass} overflow-hidden rounded-md bg-gray-50`}>
          <FlightPathCanvas points={points} />
        </div>
      ) : (
        <TopDownPath points={points} />
      )}

      <p className="text-center text-sm text-gray-500">
        {view === "3d"
          ? "Interactive 3D flight path. Drag to rotate, scroll to zoom."
          : "Bird's-eye view of the same generated flight path."}
      </p>
    </div>
  );
}

function FlightPathCanvas({ points }: { points: PathPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const altitudeDomain = ABSOLUTE_ALTITUDE_DOMAIN;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas;

    let disposed = false;
    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;
    const disposables: { dispose: () => void }[] = [];

    async function boot() {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed || !canvasEl.parentElement) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#f8fafc");

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(55, 48, 58);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.65;
      controls.target.set(0, altitudeDomain.maxSceneY * 0.35, 0);

      const group = new THREE.Group();
      scene.add(group);

      const ambient = new THREE.AmbientLight("#ffffff", 0.7);
      scene.add(ambient);
      const directional = new THREE.DirectionalLight("#ffffff", 1.2);
      directional.position.set(40, 60, 50);
      scene.add(directional);

      const grid = new THREE.GridHelper(90, 18, "#cbd5e1", "#e2e8f0");
      scene.add(grid);

      const mastPoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, altitudeDomain.maxSceneY, 0),
      ];
      const mastGeometry = new THREE.BufferGeometry().setFromPoints(mastPoints);
      const mastMaterial = new THREE.LineBasicMaterial({
        color: "#4b5563",
      });
      disposables.push(mastGeometry, mastMaterial);
      group.add(new THREE.Line(mastGeometry, mastMaterial));

      const topTickGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.2, altitudeDomain.maxSceneY, 0),
        new THREE.Vector3(2.2, altitudeDomain.maxSceneY, 0),
      ]);
      const tickMaterial = new THREE.LineBasicMaterial({ color: "#111827" });
      disposables.push(topTickGeometry, tickMaterial);
      group.add(new THREE.Line(topTickGeometry, tickMaterial));

      const label = makeHeightLabel(THREE, `${altitudeDomain.maxFeet} ft (${altitudeDomain.maxMeters.toFixed(0)} m)`);
      label.position.set(6.8, altitudeDomain.maxSceneY, 0);
      group.add(label);
      disposables.push({
        dispose: () => {
          label.material.map?.dispose();
          label.material.dispose();
        },
      });

      const vectors = toVectors(points, THREE, altitudeDomain);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(vectors);
      const lineMaterial = new THREE.LineBasicMaterial({ color: "#64748b", linewidth: 2 });
      disposables.push(lineGeometry, lineMaterial);
      group.add(new THREE.Line(lineGeometry, lineMaterial));

      getCameraCueIndices(points.length).forEach((pointIndex) => {
        const cue = makeCameraFrustum(THREE, vectors[pointIndex], points[pointIndex]);
        group.add(cue.object);
        disposables.push(...cue.disposables);
      });

      const droneTexture = makeDroneTexture(THREE);
      const droneMaterial = new THREE.SpriteMaterial({
        map: droneTexture,
        transparent: true,
      });
      disposables.push(droneTexture, droneMaterial);

      points.forEach((_, index) => {
        const drone = new THREE.Sprite(droneMaterial);
        drone.position.copy(vectors[index]);
        drone.scale.set(3.1, 3.1, 1);
        group.add(drone);
      });

      const resize = () => {
        if (!canvasEl.parentElement) return;
        const { clientWidth, clientHeight } = canvasEl.parentElement;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / Math.max(clientHeight, 1);
        camera.updateProjectionMatrix();
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvasEl.parentElement);
      resize();

      const render = () => {
        if (disposed) return;
        controls.update();
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      render();

      disposables.push({
        dispose: () => {
          controls.dispose();
          renderer.dispose();
        },
      });
    }

    boot();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      disposables.forEach((item) => item.dispose());
    };
  }, [points, altitudeDomain]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-label="3D flight path model" />;
}

function TopDownPath({ points }: { points: PathPoint[] }) {
  const bounds = getBounds(points);
  const path = points
    .map((point) => `${scale(point.x, bounds.minX, bounds.maxX, 8, 92)},${scale(point.y, bounds.minY, bounds.maxY, 92, 8)}`)
    .join(" ");

  return (
    <div className="h-96 rounded-md bg-gray-50 p-4">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <pattern id="spotcheck-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e5e7eb" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#spotcheck-grid)" rx="2" />
        <rect x="47" y="47" width="6" height="6" rx="1" fill="#4b5563" />
        <polyline points={path} fill="none" stroke="#2563eb" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
        {getCameraCueIndices(points.length).map((pointIndex) => (
          <polygon
            key={`camera-cue-${pointIndex}`}
            points={makeTopDownCameraCue(points[pointIndex], bounds)}
            fill={CAMERA_FRUSTUM_COLOR}
            fillOpacity="0.12"
            stroke={CAMERA_FRUSTUM_COLOR}
            strokeOpacity="0.35"
            strokeWidth="0.35"
          />
        ))}
        {points.map((point, index) => (
          <circle
            key={`${point.label}-${index}`}
            cx={scale(point.x, bounds.minX, bounds.maxX, 8, 92)}
            cy={scale(point.y, bounds.minY, bounds.maxY, 92, 8)}
            r="0.8"
            fill={DRONE_MARKER_COLOR}
          />
        ))}
      </svg>
    </div>
  );
}

function makePathPoints(segment: Segment): PathPoint[] {
  const count = Math.max(18, Math.min(72, Math.ceil(segment.photoCount / 4)));
  const totalRotation = segment.totalRotation ?? 0;
  const orbitLike = totalRotation >= 70;
  const photos = segment.samplePhotos.length > 0 ? segment.samplePhotos : [];

  return Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0 : index / (count - 1);
    const sample = photos.length > 0 ? photos[Math.round(t * (photos.length - 1))] : undefined;
    const baseAltitude = toSiteHeightMeters(sample?.altitude ?? segment.medianAltitude);
    const gimbal = sample?.gimbalPitch ?? segment.medianPitch;
    const label = sample?.fileName ?? `${segment.category}-${index + 1}`;

    if (orbitLike) {
      const angle = ((totalRotation || 360) * Math.PI * 2 * t) / 360;
      const radius = 22 + Math.sin(t * Math.PI * 4) * 1.6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return {
        x,
        y,
        z: clampSiteHeight(baseAltitude + Math.sin(t * Math.PI * 2) * 1.2),
        altitude: baseAltitude,
        gimbal,
        yaw: getCenterRelativeYaw(x, y, segment),
        label,
      };
    }

    if (segment.rawCategory.toLowerCase().includes("tower")) {
      const angle = Math.PI * 2.2 * t;
      const radius = 14 + Math.sin(t * Math.PI * 3) * 1.4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return {
        x,
        y,
        z: clampSiteHeight(toSiteHeightMeters(segment.medianAltitude) + (0.5 - t) * 16),
        altitude: baseAltitude,
        gimbal,
        yaw: getCenterRelativeYaw(x, y, segment),
        label,
      };
    }

    const x = (t - 0.5) * 46;
    const y = Math.sin(t * Math.PI * 3) * 8;
    return {
      x,
      y,
      z: clampSiteHeight(toSiteHeightMeters(segment.medianAltitude) + Math.sin(t * Math.PI) * 5),
      altitude: baseAltitude,
      gimbal,
      yaw: getCenterRelativeYaw(x, y, segment),
      label,
    };
  });
}

function toVectors(
  points: PathPoint[],
  THREE: typeof import("three"),
  altitudeDomain: AltitudeDomain,
) {
  return points.map((point) => {
    const y = clampSiteHeight(point.z) * altitudeDomain.unitsPerMeter;
    return new THREE.Vector3(point.x, y, point.y);
  });
}

function getAltitudeStats(points: PathPoint[]) {
  const values = points.map((point) => point.z);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

type AltitudeDomain = {
  min: 0;
  maxMeters: number;
  maxFeet: number;
  maxSceneY: number;
  unitsPerMeter: number;
};

function getBounds(points: PathPoint[]) {
  return {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

function scale(value: number, min: number, max: number, outMin: number, outMax: number) {
  if (max === min) return (outMin + outMax) / 2;
  return outMin + ((value - min) / (max - min)) * (outMax - outMin);
}

function toSiteHeightMeters(rawAltitudeMeters: number) {
  return clampSiteHeight(
    (Math.max(rawAltitudeMeters, 0) / SOURCE_ALTITUDE_REFERENCE_M) * SITE_MAX_HEIGHT_M,
  );
}

function clampSiteHeight(value: number) {
  return Math.min(Math.max(value, 0), SITE_MAX_HEIGHT_M);
}

function metersToFeet(value: number) {
  return value * FEET_PER_METER;
}

function getCameraCueIndices(count: number) {
  if (count <= 0) return [];
  return Array.from(new Set([0, 0.25, 0.5, 0.75, 1].map((t) => Math.round((count - 1) * t))));
}

function makeCameraFrustum(
  THREE: typeof import("three"),
  origin: import("three").Vector3,
  point: PathPoint,
) {
  const direction = cameraDirectionFromYawPitch(THREE, point.yaw, point.gimbal);
  const right = new THREE.Vector3(direction.z, 0, -direction.x);
  if (right.lengthSq() < 0.001) right.set(1, 0, 0);
  right.normalize();

  const up = new THREE.Vector3().crossVectors(right, direction);
  if (up.lengthSq() < 0.001) up.set(0, 1, 0);
  up.normalize();

  const farCenter = origin.clone().add(direction.clone().multiplyScalar(16));
  const halfWidth = 4.6;
  const halfHeight = 3.3;
  const corners = [
    farCenter.clone().add(right.clone().multiplyScalar(halfWidth)).add(up.clone().multiplyScalar(halfHeight)),
    farCenter.clone().add(right.clone().multiplyScalar(-halfWidth)).add(up.clone().multiplyScalar(halfHeight)),
    farCenter.clone().add(right.clone().multiplyScalar(-halfWidth)).add(up.clone().multiplyScalar(-halfHeight)),
    farCenter.clone().add(right.clone().multiplyScalar(halfWidth)).add(up.clone().multiplyScalar(-halfHeight)),
  ];

  const meshPositions = [
    ...vectorValues(origin), ...vectorValues(corners[0]), ...vectorValues(corners[1]),
    ...vectorValues(origin), ...vectorValues(corners[1]), ...vectorValues(corners[2]),
    ...vectorValues(origin), ...vectorValues(corners[2]), ...vectorValues(corners[3]),
    ...vectorValues(origin), ...vectorValues(corners[3]), ...vectorValues(corners[0]),
  ];
  const meshGeometry = new THREE.BufferGeometry();
  meshGeometry.setAttribute("position", new THREE.Float32BufferAttribute(meshPositions, 3));
  const meshMaterial = new THREE.MeshBasicMaterial({
    color: CAMERA_FRUSTUM_COLOR,
    depthWrite: false,
    opacity: 0.12,
    side: THREE.DoubleSide,
    transparent: true,
  });

  const edgePositions = [
    ...vectorValues(origin), ...vectorValues(corners[0]),
    ...vectorValues(origin), ...vectorValues(corners[1]),
    ...vectorValues(origin), ...vectorValues(corners[2]),
    ...vectorValues(origin), ...vectorValues(corners[3]),
    ...vectorValues(corners[0]), ...vectorValues(corners[1]),
    ...vectorValues(corners[1]), ...vectorValues(corners[2]),
    ...vectorValues(corners[2]), ...vectorValues(corners[3]),
    ...vectorValues(corners[3]), ...vectorValues(corners[0]),
  ];
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(edgePositions, 3));
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: CAMERA_FRUSTUM_COLOR,
    opacity: 0.34,
    transparent: true,
  });

  const object = new THREE.Group();
  object.add(new THREE.Mesh(meshGeometry, meshMaterial));
  object.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

  return {
    object,
    disposables: [meshGeometry, meshMaterial, edgeGeometry, edgeMaterial],
  };
}

function makeDroneTexture(THREE: typeof import("three")) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, 96, 96);
    context.strokeStyle = DRONE_MARKER_COLOR;
    context.fillStyle = DRONE_MARKER_COLOR;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(32, 32);
    context.lineTo(64, 64);
    context.moveTo(64, 32);
    context.lineTo(32, 64);
    context.stroke();

    context.lineWidth = 5;
    [[25, 25], [71, 25], [25, 71], [71, 71]].forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, 11, 0, Math.PI * 2);
      context.stroke();
    });

    context.fillStyle = DRONE_MARKER_DARK;
    roundRect(context, 37, 37, 22, 22, 6);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function cameraDirectionFromYawPitch(
  THREE: typeof import("three"),
  yawDegrees: number,
  pitchDegrees: number,
) {
  const yaw = degreesToRadians(yawDegrees);
  const pitch = degreesToRadians(Math.max(Math.min(pitchDegrees, 70), -89));
  const horizontal = Math.max(Math.cos(pitch), 0.42);
  const vertical = Math.sin(pitch);
  return new THREE.Vector3(
    Math.sin(yaw) * horizontal,
    vertical,
    Math.cos(yaw) * horizontal,
  ).normalize();
}

function makeTopDownCameraCue(point: PathPoint, bounds: ReturnType<typeof getBounds>) {
  const cx = scale(point.x, bounds.minX, bounds.maxX, 8, 92);
  const cy = scale(point.y, bounds.minY, bounds.maxY, 92, 8);
  const yaw = degreesToRadians(point.yaw);
  const dx = Math.sin(yaw);
  const dy = -Math.cos(yaw);
  const farX = cx + dx * 12;
  const farY = cy + dy * 12;
  const rightX = -dy;
  const rightY = dx;
  const halfWidth = 4;

  return [
    [cx, cy],
    [farX + rightX * halfWidth, farY + rightY * halfWidth],
    [farX - rightX * halfWidth, farY - rightY * halfWidth],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

function getCenterRelativeYaw(x: number, y: number, segment: Segment) {
  const outward = `${segment.category} ${segment.rawCategory}`.toLowerCase().includes("center out");
  const dx = outward ? x : -x;
  const dy = outward ? y : -y;
  return horizontalVectorToYaw(dx, dy);
}

function horizontalVectorToYaw(x: number, y: number) {
  if (Math.abs(x) < 0.001 && Math.abs(y) < 0.001) return 0;
  return normalizeDegrees((Math.atan2(x, y) * 180) / Math.PI);
}

function normalizeDegrees(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function vectorValues(vector: import("three").Vector3) {
  return [vector.x, vector.y, vector.z];
}

function makeHeightLabel(THREE: typeof import("three"), text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 72;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(255,255,255,0.92)";
    context.strokeStyle = "rgba(17,24,39,0.18)";
    context.lineWidth = 3;
    roundRect(context, 2, 2, 252, 68, 12);
    context.fill();
    context.stroke();
    context.fillStyle = "#111827";
    context.font = "600 26px system-ui, -apple-system, Segoe UI, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 128, 36);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(18, 5, 1);
  return sprite;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}
