import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  ContactShadows,
  Sky,
  Text,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { create } from "zustand";

/* =========================================================
   BSS WORLD — 3D SMART CITY
   Complete single App.jsx
   No GLB / GLTF required
========================================================= */

const useStore = create((set) => ({
  timeOfDay: "day",
  setTimeOfDay: (v) => set({ timeOfDay: v }),

  trafficDensity: 0.42,
  setTrafficDensity: (v) => set({ trafficDensity: v }),

  trafficMode: "AI",
  setTrafficMode: (v) => set({ trafficMode: v }),

  selectedSystem: null,
  setSelectedSystem: (v) => set({ selectedSystem: v }),

  emergency: false,
  setEmergency: (v) => set({ emergency: v }),

  logs: [
    "AI Traffic Management initialized.",
    "Vertical Farming system online.",
    "Water filtration network connected.",
    "Waste management network online.",
  ],
  addLog: (message) =>
    set((state) => ({
      logs: [message, ...state.logs].slice(0, 12),
    })),
}));

/* =========================================================
   COLORS / MATERIALS
========================================================= */

const COLORS = {
  ground: "#07131b",
  road: "#101820",
  roadLine: "#38c9ff",
  building: "#16354b",
  glass: "#25bce9",
  blue: "#148bd0",
  cyan: "#42dcff",
  green: "#2dcc78",
  darkGreen: "#12633f",
  water: "#168ed0",
  white: "#e7f8ff",
  yellow: "#ffd166",
  red: "#ff3b4d",
  orange: "#ff9f43",
};

/* =========================================================
   GENERIC BUILDING
========================================================= */

function SmartBuilding({
  name,
  position = [0, 0, 0],
  size = [10, 10, 10],
  color = COLORS.building,
  windows = true,
  label = true,
  onClick,
}) {
  const [w, h, d] = size;

  return (
    <group position={position} onClick={onClick}>
      <mesh
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          metalness={0.45}
          roughness={0.42}
        />
      </mesh>

      {windows &&
        Array.from({ length: Math.max(1, Math.floor(h / 3)) }).map(
          (_, row) => (
            <group key={row}>
              {Array.from({
                length: Math.max(2, Math.floor(w / 3)),
              }).map((__, col) => (
                <mesh
                  key={col}
                  position={[
                    -w / 2 + 1.5 + col * 3,
                    2 + row * 3,
                    d / 2 + 0.03,
                  ]}
                >
                  <boxGeometry args={[1.25, 1.2, 0.08]} />
                  <meshStandardMaterial
                    color="#7ddcff"
                    emissive="#123c50"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              ))}
            </group>
          )
        )}

      {label && (
        <Text
          position={[0, h + 2, 0]}
          fontSize={0.7}
          color={COLORS.cyan}
          anchorX="center"
        >
          {name}
        </Text>
      )}
    </group>
  );
}

/* =========================================================
   ROAD
========================================================= */

function Road({ position, size }) {
  const [w, d] = size;

  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[w, 0.15, d]} />
        <meshStandardMaterial color={COLORS.road} roughness={0.9} />
      </mesh>

      {w > d ? (
        <>
          {Array.from({ length: Math.floor(w / 7) }).map((_, i) => (
            <mesh
              key={i}
              position={[-w / 2 + 4 + i * 7, 0.1, 0]}
            >
              <boxGeometry args={[3.2, 0.03, 0.16]} />
              <meshBasicMaterial color={COLORS.roadLine} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {Array.from({ length: Math.floor(d / 7) }).map((_, i) => (
            <mesh
              key={i}
              position={[0, 0.1, -d / 2 + 4 + i * 7]}
            >
              <boxGeometry args={[0.16, 0.03, 3.2]} />
              <meshBasicMaterial color={COLORS.roadLine} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/* =========================================================
   TRAFFIC LIGHT
========================================================= */

function TrafficLight({ position, rotation = [0, 0, 0] }) {
  const [state, setState] = useState("green");

  useEffect(() => {
    const loop = setInterval(() => {
      setState((old) => {
        if (old === "green") return "yellow";
        if (old === "yellow") return "red";
        return "green";
      });
    }, 5000);

    return () => clearInterval(loop);
  }, []);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5, 8]} />
        <meshStandardMaterial color="#26343c" />
      </mesh>

      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[0.8, 2.5, 0.45]} />
        <meshStandardMaterial color="#080d11" />
      </mesh>

      {[
        ["red", COLORS.red, 5.7],
        ["yellow", COLORS.yellow, 5.05],
        ["green", COLORS.green, 4.4],
      ].map(([name, color, y]) => (
        <mesh key={name} position={[0, y, 0.25]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={state === name ? 2 : 0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================
   VEHICLE
========================================================= */

function Vehicle({
  start = [0, 0, 0],
  axis = "x",
  speed = 2,
  color = COLORS.blue,
  emergency = false,
  index = 0,
}) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    if (axis === "x") {
      ref.current.position.x += speed * delta;

      if (ref.current.position.x > 105) {
        ref.current.position.x = -105;
      }
    } else {
      ref.current.position.z += speed * delta;

      if (ref.current.position.z > 105) {
        ref.current.position.z = -105;
      }
    }
  });

  return (
    <group
      ref={ref}
      position={start}
      rotation={[0, axis === "x" ? 0 : Math.PI / 2, 0]}
    >
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[3, 0.8, 1.5]} />
        <meshStandardMaterial
          color={emergency ? "#f4f4f4" : color}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.5, 0.45, 1.15]} />
        <meshStandardMaterial
          color={emergency ? "#eeeeee" : "#182a38"}
          transparent
          opacity={0.85}
        />
      </mesh>

      {[-1, 1].map((x) =>
        [-0.62, 0.62].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, 0.25, z]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.27, 0.27, 0.2, 12]} />
            <meshStandardMaterial color="#101010" />
          </mesh>
        ))
      )}

      {emergency && (
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[0.65, 0.15, 0.25]} />
          <meshStandardMaterial
            color={COLORS.red}
            emissive={COLORS.red}
            emissiveIntensity={2}
          />
        </mesh>
      )}

      <Text
        position={[0, 1.9, 0]}
        fontSize={0.25}
        color={emergency ? "#ff4d5e" : COLORS.cyan}
      >
        {emergency ? "AMBULANCE" : `AI-${index + 1}`}
      </Text>
    </group>
  );
}

/* =========================================================
   VERTICAL FARM
========================================================= */

function VerticalFarm({ onClick }) {
  const layers = Array.from({ length: 7 });

  return (
    <group position={[-70, 0, -35]} onClick={onClick}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[38, 3, 34]} />
        <meshStandardMaterial color={COLORS.darkGreen} />
      </mesh>

      <Text position={[0, 5, 0]} fontSize={1} color={COLORS.green}>
        VERTICAL FARM
      </Text>

      {[-12, 0, 12].map((x) => (
        <group key={x} position={[x, 4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[9, 32, 26]} />
            <meshStandardMaterial
              color="#1d5662"
              transparent
              opacity={0.65}
              metalness={0.25}
            />
          </mesh>

          {layers.map((_, i) => (
            <mesh
              key={i}
              position={[0, 3 + i * 4, 13.1]}
            >
              <boxGeometry args={[7.5, 0.5, 1.5]} />
              <meshStandardMaterial
                color={COLORS.green}
                emissive="#0b3b25"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}

      <Html position={[0, 37, 0]} center>
        <div className="world-tag">CROP PRODUCTION • 320 KG/DAY</div>
      </Html>
    </group>
  );
}

/* =========================================================
   WATER FILTRATION
========================================================= */

function WaterFiltration({ onClick }) {
  return (
    <group position={[-70, 0, 48]} onClick={onClick}>
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[35, 8, 25]} />
        <meshStandardMaterial color="#123d52" />
      </mesh>

      {[-12, 0, 12].map((x) => (
        <group key={x}>
          <mesh position={[x, 8, 0]}>
            <cylinderGeometry args={[4, 4, 8, 24]} />
            <meshStandardMaterial
              color={COLORS.water}
              transparent
              opacity={0.7}
            />
          </mesh>

          <mesh position={[x, 12, 0]}>
            <cylinderGeometry args={[4.2, 4.2, 0.5, 24]} />
            <meshStandardMaterial color="#d7f5ff" />
          </mesh>
        </group>
      ))}

      <Text position={[0, 14, 0]} fontSize={0.9} color={COLORS.cyan}>
        SMART WATER FILTRATION
      </Text>

      <Html position={[0, 17, 0]} center>
        <div className="world-tag">QUALITY 94% • EFFICIENCY 91%</div>
      </Html>
    </group>
  );
}

/* =========================================================
   WASTE MANAGEMENT
========================================================= */

function WasteCenter({ onClick }) {
  return (
    <group position={[-70, 0, 78]} onClick={onClick}>
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[40, 10, 26]} />
        <meshStandardMaterial color="#17262a" />
      </mesh>

      {[-12, 0, 12].map((x, i) => (
        <mesh key={i} position={[x, 11, 0]}>
          <cylinderGeometry args={[4, 4, 8, 20]} />
          <meshStandardMaterial
            color={i === 0 ? COLORS.green : COLORS.blue}
            metalness={0.5}
          />
        </mesh>
      ))}

      <Text position={[0, 17, 0]} fontSize={0.9} color={COLORS.green}>
        WASTE + RECYCLING
      </Text>

      <Text position={[0, 14, 0]} fontSize={0.5} color="#c9edf5">
        ORGANIC • RECYCLABLE • GENERAL
      </Text>
    </group>
  );
}

/* =========================================================
   FOOD CENTER
========================================================= */

function FoodCenter({ onClick }) {
  return (
    <group position={[-70, 0, -2]} onClick={onClick}>
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[32, 10, 22]} />
        <meshStandardMaterial color="#204d61" />
      </mesh>

      <mesh position={[0, 11, 0]}>
        <boxGeometry args={[28, 1, 18]} />
        <meshStandardMaterial color={COLORS.green} />
      </mesh>

      <Text position={[0, 13, 0]} fontSize={0.8} color={COLORS.cyan}>
        FOOD MANAGEMENT
      </Text>

      <Text position={[0, 11.8, 0]} fontSize={0.45} color="#dffaff">
        STORAGE • DISTRIBUTION • DEMAND
      </Text>
    </group>
  );
}

/* =========================================================
   TREES
========================================================= */

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.45, 0.65, 4, 8]} />
        <meshStandardMaterial color="#68412c" />
      </mesh>

      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[2.2, 12, 10]} />
        <meshStandardMaterial color="#22834f" />
      </mesh>
    </group>
  );
}

/* =========================================================
   STREET LIGHT
========================================================= */

function StreetLight({ position }) {
  const timeOfDay = useStore((s) => s.timeOfDay);
  const on = timeOfDay === "night";

  return (
    <group position={position}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
        <meshStandardMaterial color="#52616b" />
      </mesh>

      <mesh position={[0, 6, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial
          color={on ? "#fff3ad" : "#4c5960"}
          emissive={on ? "#fff3ad" : "#000000"}
          emissiveIntensity={on ? 2 : 0}
        />
      </mesh>

      {on && (
        <pointLight
          position={[0, 6, 0]}
          intensity={0.7}
          distance={12}
          color="#fff1ad"
        />
      )}
    </group>
  );
}

/* =========================================================
   CONTROL CENTER
========================================================= */

function ControlCenter({ onClick }) {
  return (
    <group position={[0, 0, 0]} onClick={onClick}>
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[12, 14, 16, 8]} />
        <meshStandardMaterial
          color="#102c40"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 17, 0]}>
        <sphereGeometry args={[6, 24, 24]} />
        <meshStandardMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.55}
          emissive={COLORS.cyan}
          emissiveIntensity={0.6}
        />
      </mesh>

      <Text position={[0, 24, 0]} fontSize={1} color={COLORS.cyan}>
        SMART CITY CONTROL
      </Text>
    </group>
  );
}

/* =========================================================
   CITY
========================================================= */

function City() {
  const setSelectedSystem = useStore((s) => s.setSelectedSystem);

  const roads = useMemo(
    () => [
      [0, 0, [18, 220]],
      [0, 0, [220, 18]],
      [-55, 0, [10, 220]],
      [55, 0, [10, 220]],
      [0, -55, [220, 10]],
      [0, 55, [220, 10]],
      [0, -90, [220, 7]],
      [0, 90, [220, 7]],
    ],
    []
  );

  const trees = useMemo(() => {
    const arr = [];

    for (let x = -95; x <= 95; x += 19) {
      for (let z = -95; z <= 95; z += 19) {
        const nearRoad =
          Math.abs(x) < 10 ||
          Math.abs(z) < 10 ||
          Math.abs(x - 55) < 7 ||
          Math.abs(z - 55) < 7 ||
          Math.abs(x + 55) < 7 ||
          Math.abs(z + 55) < 7;

        if (!nearRoad) arr.push([x, 0, z]);
      }
    }

    return arr;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[230, 1, 230]} />
        <meshStandardMaterial color={COLORS.ground} />
      </mesh>

      {/* Roads */}
      {roads.map((r, i) => (
        <Road key={i} position={[r[0], 0, r[1]]} size={r[2]} />
      ))}

      {/* City borders */}
      <mesh position={[0, 1, -112]}>
        <boxGeometry args={[225, 2, 2]} />
        <meshStandardMaterial color="#0b5472" emissive="#073047" />
      </mesh>

      <mesh position={[0, 1, 112]}>
        <boxGeometry args={[225, 2, 2]} />
        <meshStandardMaterial color="#0b5472" emissive="#073047" />
      </mesh>

      <mesh position={[-112, 1, 0]}>
        <boxGeometry args={[2, 2, 225]} />
        <meshStandardMaterial color="#0b5472" emissive="#073047" />
      </mesh>

      <mesh position={[112, 1, 0]}>
        <boxGeometry args={[2, 2, 225]} />
        <meshStandardMaterial color="#0b5472" emissive="#073047" />
      </mesh>

      {/* School */}
      <SmartBuilding
        name="SMART SCHOOL"
        position={[0, 0, -82]}
        size={[38, 16, 25]}
        color="#1b6289"
        onClick={() => setSelectedSystem("school")}
      />

      {/* Hospital */}
      <SmartBuilding
        name="SMART HOSPITAL"
        position={[78, 0, -25]}
        size={[30, 22, 35]}
        color="#d7e9ed"
        onClick={() => setSelectedSystem("hospital")}
      />

      {/* Bank */}
      <SmartBuilding
        name="SMART BANK"
        position={[78, 0, 28]}
        size={[25, 14, 25]}
        color="#182c3b"
        onClick={() => setSelectedSystem("bank")}
      />

      {/* Residential */}
      {[-72, -45, 45, 72].map((x) =>
        [70, 90].map((z) => (
          <SmartBuilding
            key={`${x}-${z}`}
            name="SMART HOME"
            position={[x, 0, z]}
            size={[15, 9, 13]}
            color="#24455a"
          />
        ))
      )}

      {/* Systems */}
      <VerticalFarm
        onClick={() => setSelectedSystem("farm")}
      />

      <FoodCenter
        onClick={() => setSelectedSystem("food")}
      />

      <WaterFiltration
        onClick={() => setSelectedSystem("water")}
      />

      <WasteCenter
        onClick={() => setSelectedSystem("waste")}
      />

      <ControlCenter
        onClick={() => setSelectedSystem("control")}
      />

      {/* Traffic signals */}
      <TrafficLight position={[-9, 0, -9]} />
      <TrafficLight position={[9, 0, -9]} rotation={[0, Math.PI, 0]} />
      <TrafficLight position={[-9, 0, 9]} rotation={[0, Math.PI, 0]} />
      <TrafficLight position={[9, 0, 9]} />

      <TrafficLight position={[-55, 0, -9]} />
      <TrafficLight position={[55, 0, 9]} />
      <TrafficLight position={[-9, 0, 55]} rotation={[0, Math.PI / 2, 0]} />
      <TrafficLight position={[9, 0, -55]} rotation={[0, Math.PI / 2, 0]} />

      {/* Trees */}
      {trees.map((p, i) => (
        <Tree key={i} position={p} />
      ))}

      {/* Street lights */}
      {[
        [-25, 0, -12],
        [25, 0, -12],
        [-25, 0, 12],
        [25, 0, 12],
        [-12, 0, -25],
        [12, 0, -25],
        [-12, 0, 25],
        [12, 0, 25],
        [-45, 0, -45],
        [45, 0, -45],
        [-45, 0, 45],
        [45, 0, 45],
      ].map((p, i) => (
        <StreetLight key={i} position={p} />
      ))}

      {/* City title */}
      <Text
        position={[0, 35, -105]}
        fontSize={2}
        color={COLORS.cyan}
        anchorX="center"
      >
        BSS WORLD
      </Text>

      <Text
        position={[0, 32, -105]}
        fontSize={0.8}
        color="#d9f6ff"
        anchorX="center"
      >
        3D SMART CITY
      </Text>

      <Sparkles
        count={100}
        scale={[180, 80, 180]}
        size={0.6}
        speed={0.15}
        color={COLORS.cyan}
      />
    </group>
  );
}

/* =========================================================
   VEHICLE SYSTEM
========================================================= */

function TrafficSystem() {
  const vehicles = useMemo(() => {
    const list = [];

    for (let i = 0; i < 28; i++) {
      list.push({
        id: i,
        start:
          i % 2 === 0
            ? [-105 + i * 6, 0.3, -4]
            : [-4, 0.3, -105 + i * 6],
        axis: i % 2 === 0 ? "x" : "z",
        speed: 4 + (i % 4),
        color: [
          "#168bd0",
          "#ffffff",
          "#2dcc78",
          "#ffb347",
          "#b96cff",
        ][i % 5],
        emergency: i === 3,
      });
    }

    return list;
  }, []);

  return (
    <group>
      {vehicles.map((v) => (
        <Vehicle key={v.id} {...v} />
      ))}
    </group>
  );
}

/* =========================================================
   UI
========================================================= */

function Dashboard() {
  const trafficDensity = useStore((s) => s.trafficDensity);
  const setTrafficDensity = useStore(
    (s) => s.setTrafficDensity
  );

  const timeOfDay = useStore((s) => s.timeOfDay);
  const setTimeOfDay = useStore((s) => s.setTimeOfDay);

  const setSelectedSystem = useStore(
    (s) => s.setSelectedSystem
  );

  const addLog = useStore((s) => s.addLog);

  const emergency = useStore((s) => s.emergency);
  const setEmergency = useStore((s) => s.setEmergency);

  const [vehicles, setVehicles] = useState(28);
  const [water, setWater] = useState(94);
  const [food, setFood] = useState(87);
  const [waste, setWaste] = useState(91);
  const [harvest, setHarvest] = useState(320);
  const [efficiency, setEfficiency] = useState(88);

  useEffect(() => {
    const timer = setInterval(() => {
      const randomTraffic = 20 + Math.floor(Math.random() * 28);

      setVehicles(randomTraffic);
      setWater(92 + Math.floor(Math.random() * 5));
      setFood(82 + Math.floor(Math.random() * 10));
      setWaste(88 + Math.floor(Math.random() * 7));
      setHarvest(300 + Math.floor(Math.random() * 50));
      setEfficiency(82 + Math.floor(Math.random() * 15));

      const levels = ["LOW", "MODERATE", "HEAVY"];
      const level =
        trafficDensity < 0.3
          ? levels[0]
          : trafficDensity < 0.65
          ? levels[1]
          : levels[2];

      addLog(`AI traffic status: ${level}`);
    }, 3500);

    return () => clearInterval(timer);
  }, [trafficDensity, addLog]);

  const trafficStatus =
    trafficDensity < 0.3
      ? "LOW"
      : trafficDensity < 0.65
      ? "MODERATE"
      : "HEAVY";

  return (
    <div className="ui">
      <div className="topbar glass">
        <div>
          <div className="brand">BSS WORLD</div>
          <div className="subtitle">
            3D SMART CITY • BEACONHOUSE SCHOOL SYSTEM
          </div>
        </div>

        <div className="status-row">
          <span className="status online">● AI ONLINE</span>
          <span className="status">
            TRAFFIC: {trafficStatus}
          </span>
          <span className="status">
            {timeOfDay.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="left-panel glass">
        <h3>SMART CITY LIVE</h3>

        <Metric label="Vehicles" value={vehicles} />
        <Metric
          label="Average Speed"
          value={`${Math.max(
            18,
            48 - Math.floor(trafficDensity * 25)
          )} km/h`}
        />
        <Metric label="Efficiency" value={`${efficiency}%`} />
        <Metric label="Food Storage" value="1,240 kg" />
        <Metric label="Water Quality" value={`${water}%`} />
        <Metric label="Waste Processed" value={`${waste}%`} />

        <div className="system-button-list">
          <button onClick={() => setSelectedSystem("traffic")}>
            AI TRAFFIC
          </button>

          <button onClick={() => setSelectedSystem("farm")}>
            VERTICAL FARM
          </button>

          <button onClick={() => setSelectedSystem("food")}>
            FOOD MANAGEMENT
          </button>

          <button onClick={() => setSelectedSystem("water")}>
            WATER FILTRATION
          </button>

          <button onClick={() => setSelectedSystem("waste")}>
            WASTE MANAGEMENT
          </button>
        </div>
      </div>

      <div className="right-panel glass">
        <h3>AI CONTROL CENTER</h3>

        <SystemCard
          title="AI TRAFFIC MANAGEMENT"
          value={`${Math.round(
            trafficDensity * 100
          )}%`}
        />

        <SystemCard
          title="VERTICAL FARMING"
          value={`${harvest} KG/DAY`}
        />

        <SystemCard
          title="FOOD MANAGEMENT"
          value={`${food}% SUPPLY`}
        />

        <SystemCard
          title="WATER FILTRATION"
          value={`${water}% QUALITY`}
        />

        <SystemCard
          title="WASTE + RECYCLING"
          value={`${waste}% PROCESSED`}
        />

        <div className="control-section">
          <div className="small-title">
            TRAFFIC DENSITY
          </div>

          <input
            type="range"
            min="0.1"
            max="0.95"
            step="0.01"
            value={trafficDensity}
            onChange={(e) =>
              setTrafficDensity(Number(e.target.value))
            }
          />
        </div>

        <button
          className="emergency-button"
          onClick={() => {
            const next = !emergency;
            setEmergency(next);
            addLog(
              next
                ? "EMERGENCY VEHICLE PRIORITY ACTIVATED."
                : "Emergency priority cleared."
            );
          }}
        >
          {emergency
            ? "EMERGENCY PRIORITY ACTIVE"
            : "ACTIVATE EMERGENCY PRIORITY"}
        </button>

        <button
          onClick={() => {
            const next =
              timeOfDay === "day" ? "night" : "day";

            setTimeOfDay(next);

            addLog(
              next === "night"
                ? "Night mode activated. Street lights online."
                : "Day mode activated."
            );
          }}
        >
          DAY / NIGHT
        </button>
      </div>

      <div className="bottom-controls">
        <button
          onClick={() => setSelectedSystem("traffic")}
        >
          SEE TRAFFIC LIVE
        </button>

        <button
          onClick={() => setSelectedSystem("control")}
        >
          CONTROL CENTER
        </button>

        <button
          onClick={() => setSelectedSystem("school")}
        >
          SCHOOL
        </button>

        <button
          onClick={() => setSelectedSystem("hospital")}
        >
          HOSPITAL
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function SystemCard({ title, value }) {
  return (
    <div className="system-card">
      <div>{title}</div>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   POPUP
========================================================= */

function InformationPanel() {
  const selected = useStore((s) => s.selectedSystem);
  const setSelected = useStore(
    (s) => s.setSelectedSystem
  );

  if (!selected) return null;

  const data = {
    traffic: {
      title: "AI TRAFFIC MANAGEMENT",
      body: `
        <b>4 Entry Routes:</b> ACTIVE<br/>
        <b>Traffic Signals:</b> AI CONTROLLED<br/>
        <b>Congestion Detection:</b> ACTIVE<br/>
        <b>Emergency Priority:</b> READY<br/>
        <b>Alternative Routes:</b> AVAILABLE<br/><br/>
        The AI monitors vehicle density and adjusts
        traffic flow dynamically.
      `,
    },

    farm: {
      title: "VERTICAL FARMING",
      body: `
        <b>Crop Health:</b> 94%<br/>
        <b>Daily Production:</b> 320 kg<br/>
        <b>Water Usage:</b> 32%<br/>
        <b>Energy Usage:</b> 41%<br/>
        <b>Food Storage:</b> 1,240 kg<br/><br/>
        Farm production supplies the city's food-management network.
      `,
    },

    food: {
      title: "FOOD MANAGEMENT",
      body: `
        <b>Production:</b> 320 kg/day<br/>
        <b>Storage:</b> 1,240 kg<br/>
        <b>Supply:</b> 87%<br/>
        <b>Active Deliveries:</b> 8<br/>
        <b>Food Waste:</b> 125 kg<br/><br/>
        Food delivery routes are connected to AI traffic.
      `,
    },

    water: {
      title: "SMART WATER FILTRATION",
      body: `
        <b>Water Input:</b> 12,500 L<br/>
        <b>Filtered:</b> 10,800 L<br/>
        <b>Recycled:</b> 8,900 L<br/>
        <b>Water Quality:</b> 94%<br/>
        <b>Efficiency:</b> 91%<br/><br/>
        Treated water is supplied to the city and vertical farm.
      `,
    },

    waste: {
      title: "WASTE MANAGEMENT",
      body: `
        <b>Collection:</b> ACTIVE<br/>
        <b>Recycling:</b> 91%<br/>
        <b>Organic:</b> COMPOST<br/>
        <b>Recyclables:</b> PROCESSING<br/>
        <b>General Waste:</b> CONTROLLED<br/><br/>
        Waste vehicles use smart routing to reach the processing center.
      `,
    },

    control: {
      title: "SMART CITY CONTROL CENTER",
      body: `
        <b>AI Traffic:</b> ONLINE<br/>
        <b>Vertical Farming:</b> ACTIVE<br/>
        <b>Food Management:</b> ACTIVE<br/>
        <b>Water Filtration:</b> ACTIVE<br/>
        <b>Waste Management:</b> ACTIVE<br/>
        <b>Recycling:</b> ACTIVE
      `,
    },

    school: {
      title: "SMART SCHOOL",
      body: `
        <b>Traffic Priority:</b> ACTIVE<br/>
        <b>Food Demand:</b> MONITORED<br/>
        <b>Waste:</b> SMART COLLECTION<br/>
        <b>Water:</b> RECYCLED SUPPLY<br/><br/>
        School mobility and resource demand are connected to the smart-city system.
      `,
    },

    hospital: {
      title: "SMART HOSPITAL",
      body: `
        <b>Emergency Priority:</b> ACTIVE<br/>
        <b>Food Supply:</b> MONITORED<br/>
        <b>Water Supply:</b> PRIORITIZED<br/>
        <b>Traffic Route:</b> AI CONTROLLED<br/><br/>
        Emergency vehicles receive traffic priority when required.
      `,
    },

    bank: {
      title: "SMART BANK",
      body: `
        <b>Security:</b> ACTIVE<br/>
        <b>Energy Monitoring:</b> ACTIVE<br/>
        <b>Smart Services:</b> ONLINE
      `,
    },
  };

  const current = data[selected] || data.control;

  return (
    <div className="popup glass">
      <button
        className="close"
        onClick={() => setSelected(null)}
      >
        ×
      </button>

      <h2>{current.title}</h2>

      <div
        dangerouslySetInnerHTML={{
          __html: current.body,
        }}
      />
    </div>
  );
}

/* =========================================================
   GLOBAL CSS
========================================================= */

function InterfaceStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      html,
      body,
      #root {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        font-family:
          Inter,
          Segoe UI,
          Arial,
          sans-serif;
        background: #02070c;
      }

      canvas {
        display: block;
      }

      .ui {
        position: fixed;
        inset: 0;
        pointer-events: none;
        color: #eaf9ff;
      }

      .glass {
        background:
          linear-gradient(
            145deg,
            rgba(4, 17, 27, 0.9),
            rgba(3, 10, 18, 0.76)
          );

        border: 1px solid rgba(65, 202, 255, 0.25);
        box-shadow:
          0 18px 50px rgba(0, 0, 0, 0.42),
          0 0 30px rgba(0, 174, 255, 0.06);

        backdrop-filter: blur(14px);
        border-radius: 14px;
      }

      .topbar {
        position: absolute;
        left: 14px;
        right: 14px;
        top: 14px;
        min-height: 65px;
        padding: 12px 16px;

        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .brand {
        font-size: 19px;
        font-weight: 900;
        letter-spacing: 3px;
        color: #e8fbff;
      }

      .subtitle {
        margin-top: 4px;
        font-size: 9px;
        letter-spacing: 1.5px;
        color: #62cefa;
      }

      .status-row {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .status {
        padding: 7px 10px;
        border-radius: 999px;
        border: 1px solid rgba(82, 205, 255, 0.22);
        background: rgba(7, 25, 37, 0.75);
        font-size: 10px;
        letter-spacing: .6px;
      }

      .online {
        color: #54f0a0;
      }

      .left-panel {
        position: absolute;
        left: 14px;
        top: 94px;
        width: 255px;
        padding: 13px;
        pointer-events: auto;
      }

      .right-panel {
        position: absolute;
        right: 14px;
        top: 94px;
        width: 285px;
        max-height: calc(100vh - 170px);
        overflow-y: auto;
        padding: 13px;
        pointer-events: auto;
      }

      h3 {
        margin: 0 0 11px;
        font-size: 11px;
        letter-spacing: 1.5px;
        color: #8bdfff;
      }

      .metric {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255,255,255,.06);
        font-size: 11px;
        color: #9fb7c3;
      }

      .metric b {
        color: #f0fbff;
      }

      .system-card {
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 9px;
        background: rgba(255,255,255,.035);
        border: 1px solid rgba(255,255,255,.055);
        font-size: 9px;
        color: #8daeba;
        letter-spacing: .7px;
      }

      .system-card strong {
        display: block;
        margin-top: 5px;
        color: #55d8ff;
        font-size: 13px;
      }

      .system-button-list {
        display: grid;
        gap: 6px;
        margin-top: 12px;
      }

      button {
        pointer-events: auto;
        border: 1px solid rgba(68, 203, 255, .25);
        background: rgba(5, 25, 37, .9);
        color: #dff8ff;
        border-radius: 8px;
        padding: 9px 10px;
        cursor: pointer;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .6px;
        transition: .2s ease;
      }

      button:hover {
        background: rgba(13, 67, 91, .95);
        border-color: rgba(68, 203, 255, .6);
        transform: translateY(-1px);
      }

      .control-section {
        margin-top: 12px;
      }

      .small-title {
        font-size: 9px;
        color: #86aeba;
        margin-bottom: 5px;
      }

      input[type="range"] {
        width: 100%;
        accent-color: #2fc9ff;
      }

      .emergency-button {
        width: 100%;
        margin: 7px 0;
      }

      .bottom-controls {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
        justify-content: center;
        pointer-events: auto;
      }

      .popup {
        pointer-events: auto;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(440px, 88vw);
        padding: 20px;
        font-size: 12px;
        line-height: 1.75;
        color: #bdd3dd;
      }

      .popup h2 {
        margin: 0 0 13px;
        font-size: 17px;
        color: #83ddff;
        letter-spacing: 1px;
      }

      .popup b {
        color: #f1fbff;
      }

      .close {
        float: right;
        padding: 5px 9px;
      }

      .world-tag {
        white-space: nowrap;
        padding: 5px 9px;
        border: 1px solid rgba(64, 205, 255, .35);
        border-radius: 7px;
        background: rgba(2, 13, 21, .8);
        color: #a9eaff;
        font-size: 9px;
        letter-spacing: .5px;
      }

      @media(max-width:900px) {
        .left-panel {
          width: 210px;
        }

        .right-panel {
          width: 225px;
        }

        .subtitle {
          display: none;
        }
      }

      @media(max-width:700px) {
        .left-panel,
        .right-panel {
          display: none;
        }

        .topbar {
          left: 8px;
          right: 8px;
        }

        .brand {
          font-size: 14px;
        }

        .status-row {
          display: none;
        }
      }
    `}</style>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay);

  return (
    <>
      <InterfaceStyles />

      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#02070c",
        }}
      >
        <Canvas
          shadows
          camera={{
            position: [105, 100, 105],
            fov: 50,
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.6]}
        >
          <color
            attach="background"
            args={[
              timeOfDay === "night"
                ? "#01040a"
                : "#06121d",
            ]}
          />

          <fog
            attach="fog"
            args={[
              timeOfDay === "night"
                ? "#01040a"
                : "#06121d",
              120,
              330,
            ]}
          />

          <Sky
            sunPosition={
              timeOfDay === "night"
                ? [-100, -20, -100]
                : [100, 80, 100]
            }
            turbidity={7}
            rayleigh={1.5}
          />

          <ambientLight
            intensity={timeOfDay === "night" ? 0.2 : 0.65}
            color="#7eb8d4"
          />

          <directionalLight
            position={[80, 120, 70]}
            intensity={timeOfDay === "night" ? 0.35 : 2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          <Suspense fallback={null}>
            <City />
            <TrafficSystem />

            <ContactShadows
              position={[0, -0.05, 0]}
              opacity={0.5}
              scale={230}
              blur={2}
              far={100}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={20}
            maxDistance={280}
            maxPolarAngle={Math.PI / 2.08}
            target={[0, 0, 0]}
          />
        </Canvas>

        <Dashboard />
        <InformationPanel />
      </div>
    </>
  );
}
