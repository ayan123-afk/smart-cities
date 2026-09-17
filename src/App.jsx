import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
   FULL SINGLE-FILE APP
   No GLB / GLTF required
========================================================= */

const useStore = create((set) => ({
  timeOfDay: "day",
  setTimeOfDay: (v) => set({ timeOfDay: v }),

  trafficDensity: 0.48,
  setTrafficDensity: (v) => set({ trafficDensity: v }),

  trafficMode: "AI",
  setTrafficMode: (v) => set({ trafficMode: v }),

  selectedSystem: null,
  setSelectedSystem: (v) => set({ selectedSystem: v }),

  emergency: false,
  setEmergency: (v) => set({ emergency: v }),

  logs: [
    "AI Traffic Management initialized.",
    "4 entry routes connected.",
    "Vertical Farming network online.",
    "Water filtration network connected.",
    "Waste management network online.",
  ],

  addLog: (message) =>
    set((state) => ({
      logs: [message, ...state.logs].slice(0, 14),
    })),
}));

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  ground: "#07131b",
  road: "#111a21",
  roadEdge: "#24333c",
  roadLine: "#43d7ff",

  building: "#163b52",
  building2: "#1b516c",
  glass: "#28c5ed",

  blue: "#1599df",
  cyan: "#4ce1ff",

  green: "#2dcc78",
  darkGreen: "#0d5135",

  water: "#138bd1",

  white: "#e9faff",
  yellow: "#ffd166",
  red: "#ff3d50",
  orange: "#ff9f43",
  purple: "#a96cff",

  solar: "#142d50",
};

/* =========================================================
   GENERIC SMART BUILDING
========================================================= */

function SmartBuilding({
  name,
  position = [0, 0, 0],
  size = [10, 10, 10],
  color = COLORS.building,
  windows = true,
  label = true,
  rooftop = false,
  onClick,
}) {
  const [w, h, d] = size;

  const rows = Math.max(1, Math.floor(h / 3));
  const cols = Math.max(2, Math.floor(w / 3));

  return (
    <group position={position} onClick={onClick}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          metalness={0.42}
          roughness={0.4}
        />
      </mesh>

      {windows &&
        Array.from({ length: rows }).map((_, row) => (
          <group key={`row-${row}`}>
            {Array.from({ length: cols }).map((__, col) => (
              <mesh
                key={`window-${row}-${col}`}
                position={[
                  -w / 2 + 1.5 + col * 3,
                  2 + row * 3,
                  d / 2 + 0.035,
                ]}
              >
                <boxGeometry args={[1.25, 1.15, 0.08]} />
                <meshStandardMaterial
                  color="#72dfff"
                  emissive="#0d465c"
                  emissiveIntensity={0.45}
                />
              </mesh>
            ))}
          </group>
        ))}

      {rooftop && (
        <>
          <mesh position={[0, h + 0.7, 0]}>
            <boxGeometry args={[w * 0.82, 0.35, d * 0.82]} />
            <meshStandardMaterial color="#263d49" />
          </mesh>

          {[-0.3, 0, 0.3].map((x, i) => (
            <mesh
              key={i}
              position={[x * w, h + 1.0, 0]}
              rotation={[-0.35, 0, 0]}
            >
              <boxGeometry args={[w * 0.18, 0.08, d * 0.22]} />
              <meshStandardMaterial
                color={COLORS.solar}
                metalness={0.65}
                roughness={0.2}
              />
            </mesh>
          ))}
        </>
      )}

      {label && (
        <Text
          position={[0, h + (rooftop ? 2.3 : 1.8), 0]}
          fontSize={0.62}
          color={COLORS.cyan}
          anchorX="center"
          outlineWidth={0.025}
          outlineColor="#021017"
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

function Road({ position, size, lanes = 2 }) {
  const [w, d] = size;
  const horizontal = w > d;

  const length = horizontal ? w : d;
  const marks = Math.floor(length / 8);

  return (
    <group position={position}>
      {/* Road */}
      <mesh receiveShadow>
        <boxGeometry args={[w, 0.18, d]} />
        <meshStandardMaterial
          color={COLORS.road}
          roughness={0.9}
        />
      </mesh>

      {/* Road edges */}
      {horizontal ? (
        <>
          <mesh position={[0, 0.12, -d / 2 + 0.35]}>
            <boxGeometry args={[w, 0.05, 0.25]} />
            <meshBasicMaterial color={COLORS.roadLine} />
          </mesh>

          <mesh position={[0, 0.12, d / 2 - 0.35]}>
            <boxGeometry args={[w, 0.05, 0.25]} />
            <meshBasicMaterial color={COLORS.roadLine} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-w / 2 + 0.35, 0.12, 0]}>
            <boxGeometry args={[0.25, 0.05, d]} />
            <meshBasicMaterial color={COLORS.roadLine} />
          </mesh>

          <mesh position={[w / 2 - 0.35, 0.12, 0]}>
            <boxGeometry args={[0.25, 0.05, d]} />
            <meshBasicMaterial color={COLORS.roadLine} />
          </mesh>
        </>
      )}

      {/* Center lane */}
      {Array.from({ length: marks }).map((_, i) => {
        const offset = -length / 2 + 4 + i * 8;

        return horizontal ? (
          <mesh
            key={i}
            position={[offset, 0.13, 0]}
          >
            <boxGeometry args={[3.5, 0.025, 0.12]} />
            <meshBasicMaterial color="#d9edf3" />
          </mesh>
        ) : (
          <mesh
            key={i}
            position={[0, 0.13, offset]}
          >
            <boxGeometry args={[0.12, 0.025, 3.5]} />
            <meshBasicMaterial color="#d9edf3" />
          </mesh>
        );
      })}

      {/* Divider */}
      {lanes >= 4 && (
        <mesh
          position={[
            horizontal ? 0 : 0,
            0.14,
            horizontal ? 0 : 0,
          ]}
        >
          <boxGeometry
            args={
              horizontal
                ? [w, 0.025, 0.08]
                : [0.08, 0.025, d]
            }
          />
          <meshBasicMaterial color="#f3f7f8" />
        </mesh>
      )}
    </group>
  );
}

/* =========================================================
   PEDESTRIAN CROSSING
========================================================= */

function Crosswalk({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={i}
          position={[-6 + i * 2, 0.15, 0]}
        >
          <boxGeometry args={[1, 0.04, 5]} />
          <meshBasicMaterial color="#e9f8ff" />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================
   TRAFFIC LIGHT
========================================================= */

function TrafficLight({
  position,
  rotation = [0, 0, 0],
  intersection = "main",
}) {
  const trafficDensity = useStore((s) => s.trafficDensity);
  const emergency = useStore((s) => s.emergency);

  const [state, setState] = useState("green");

  useEffect(() => {
    if (emergency) {
      setState("green");
      return;
    }

    const baseTime =
      trafficDensity > 0.7 ? 3500 : 5000;

    const loop = setInterval(() => {
      setState((old) => {
        if (old === "green") return "yellow";
        if (old === "yellow") return "red";
        return "green";
      });
    }, baseTime);

    return () => clearInterval(loop);
  }, [trafficDensity, emergency]);

  return (
    <group
      position={position}
      rotation={rotation}
      userData={{ intersection }}
    >
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5, 8]} />
        <meshStandardMaterial color="#26343c" />
      </mesh>

      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[0.85, 2.6, 0.5]} />
        <meshStandardMaterial color="#080d11" />
      </mesh>

      {[
        ["red", COLORS.red, 5.75],
        ["yellow", COLORS.yellow, 5.1],
        ["green", COLORS.green, 4.45],
      ].map(([name, color, y]) => (
        <mesh
          key={name}
          position={[0, y, 0.28]}
        >
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={
              state === name || emergency
                ? 2.4
                : 0.08
            }
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
  lane = 0,
}) {
  const ref = useRef();

  const trafficDensity = useStore(
    (s) => s.trafficDensity
  );

  const globalEmergency = useStore(
    (s) => s.emergency
  );

  const signalState =
    trafficDensity > 0.72
      ? index % 3 === 0
        ? "red"
        : "green"
      : index % 4 === 0
      ? "yellow"
      : "green";

  useFrame((_, delta) => {
    if (!ref.current) return;

    const isEmergency =
      emergency || globalEmergency;

    let actualSpeed = speed;

    if (!isEmergency && signalState === "red") {
      actualSpeed = 0;
    } else if (
      !isEmergency &&
      signalState === "yellow"
    ) {
      actualSpeed = speed * 0.35;
    }

    if (trafficDensity > 0.75) {
      actualSpeed *= 0.72;
    }

    if (axis === "x") {
      ref.current.position.x +=
        actualSpeed * delta;

      if (ref.current.position.x > 112) {
        ref.current.position.x = -112;
      }
    } else {
      ref.current.position.z +=
        actualSpeed * delta;

      if (ref.current.position.z > 112) {
        ref.current.position.z = -112;
      }
    }
  });

  return (
    <group
      ref={ref}
      position={start}
      rotation={[
        0,
        axis === "x" ? 0 : Math.PI / 2,
        0,
      ]}
    >
      {/* Car body */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[3, 0.8, 1.45]} />
        <meshStandardMaterial
          color={
            emergency
              ? "#f3f5f6"
              : color
          }
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[1.55, 0.45, 1.08]} />
        <meshStandardMaterial
          color={
            emergency
              ? "#d9e7eb"
              : "#162d3b"
          }
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Wheels */}
      {[-1, 1].map((x) =>
        [-0.6, 0.6].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, 0.25, z]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry
              args={[0.27, 0.27, 0.2, 12]}
            />
            <meshStandardMaterial color="#090b0d" />
          </mesh>
        ))
      )}

      {/* Emergency lights */}
      {emergency && (
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[0.7, 0.13, 0.24]} />
          <meshStandardMaterial
            color={COLORS.red}
            emissive={COLORS.red}
            emissiveIntensity={3}
          />
        </mesh>
      )}

      <Text
        position={[0, 1.9, 0]}
        fontSize={0.23}
        color={
          emergency
            ? "#ff5968"
            : COLORS.cyan
        }
      >
        {emergency
          ? "AMBULANCE"
          : `AI-${index + 1}`}
      </Text>
    </group>
  );
}

/* =========================================================
   VERTICAL FARM TOWER
========================================================= */

function FarmTower({
  position,
  height = 32,
  name = "FARM TOWER",
}) {
  const levels = Math.floor(height / 4);

  return (
    <group position={position}>
      <mesh
        position={[0, height / 2, 0]}
        castShadow
      >
        <boxGeometry args={[10, height, 12]} />
        <meshStandardMaterial
          color="#173f4b"
          transparent
          opacity={0.72}
          metalness={0.3}
          roughness={0.25}
        />
      </mesh>

      {/* Green crop floors */}
      {Array.from({ length: levels }).map(
        (_, i) => (
          <group key={i}>
            <mesh
              position={[
                0,
                2.2 + i * 4,
                6.15,
              ]}
            >
              <boxGeometry
                args={[8.7, 0.48, 1.2]}
              />
              <meshStandardMaterial
                color={COLORS.green}
                emissive="#0c4c2d"
                emissiveIntensity={0.45}
              />
            </mesh>

            {[-3, 0, 3].map((x) => (
              <mesh
                key={x}
                position={[
                  x,
                  2.75 + i * 4,
                  5.95,
                ]}
              >
                <sphereGeometry
                  args={[0.28, 8, 8]}
                />
                <meshStandardMaterial
                  color="#52e68c"
                />
              </mesh>
            ))}
          </group>
        )
      )}

      {/* Rooftop greenhouse */}
      <mesh position={[0, height + 1.2, 0]}>
        <boxGeometry args={[8, 2, 9]} />
        <meshStandardMaterial
          color="#61d9c0"
          transparent
          opacity={0.45}
        />
      </mesh>

      <Text
        position={[0, height + 4, 0]}
        fontSize={0.65}
        color={COLORS.green}
        anchorX="center"
      >
        {name}
      </Text>
    </group>
  );
}

/* =========================================================
   VERTICAL FARM DISTRICT
========================================================= */

function VerticalFarm({ onClick }) {
  return (
    <group
      position={[-62, 0, -35]}
      onClick={onClick}
    >
      {/* District base */}
      <mesh position={[0, 0.7, 0]} receiveShadow>
        <boxGeometry args={[48, 1.4, 40]} />
        <meshStandardMaterial
          color={COLORS.darkGreen}
        />
      </mesh>

      <FarmTower
        position={[-13, 0, 0]}
        height={34}
        name="CROP TOWER A"
      />

      <FarmTower
        position={[0, 0, 0]}
        height={42}
        name="CROP TOWER B"
      />

      <FarmTower
        position={[13, 0, 0]}
        height={36}
        name="CROP TOWER C"
      />

      <FarmTower
        position={[0, 0, 0]}
        height={0}
        name=""
      />

      <Text
        position={[0, 48, 0]}
        fontSize={1}
        color={COLORS.green}
        anchorX="center"
      >
        VERTICAL FARMING DISTRICT
      </Text>

      <Html position={[0, 51, 0]} center>
        <div className="world-tag">
          LIVE CROPS • 320 KG/DAY • 94% HEALTH
        </div>
      </Html>
    </group>
  );
}

/* =========================================================
   WATER FILTRATION
========================================================= */

function WaterFiltration({ onClick }) {
  return (
    <group
      position={[-70, 0, 55]}
      onClick={onClick}
    >
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[38, 8, 25]} />
        <meshStandardMaterial color="#123d52" />
      </mesh>

      {/* tanks */}
      {[-12, 0, 12].map((x, i) => (
        <group key={x}>
          <mesh position={[x, 8, 0]}>
            <cylinderGeometry
              args={[4, 4, 8, 24]}
            />
            <meshStandardMaterial
              color={
                i === 1
                  ? COLORS.water
                  : "#216b8c"
              }
              transparent
              opacity={0.75}
            />
          </mesh>

          <mesh position={[x, 12.1, 0]}>
            <cylinderGeometry
              args={[4.2, 4.2, 0.4, 24]}
            />
            <meshStandardMaterial color="#d9f5ff" />
          </mesh>
        </group>
      ))}

      {/* pipeline */}
      <mesh position={[0, 2, 14]}>
        <boxGeometry args={[34, 0.5, 0.5]} />
        <meshStandardMaterial color="#42cfff" />
      </mesh>

      <Text
        position={[0, 14, 0]}
        fontSize={0.8}
        color={COLORS.cyan}
      >
        SMART WATER FILTRATION
      </Text>

      <Html position={[0, 17, 0]} center>
        <div className="world-tag">
          QUALITY 94% • RECYCLED WATER
        </div>
      </Html>
    </group>
  );
}

/* =========================================================
   WASTE MANAGEMENT
========================================================= */

function WasteCenter({ onClick }) {
  return (
    <group
      position={[-68, 0, 84]}
      onClick={onClick}
    >
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[42, 10, 25]} />
        <meshStandardMaterial color="#17282d" />
      </mesh>

      {[
        ["ORGANIC", COLORS.green],
        ["RECYCLING", COLORS.blue],
        ["GENERAL", COLORS.orange],
      ].map(([label, color], i) => (
        <group
          key={label}
          position={[-12 + i * 12, 0, 0]}
        >
          <mesh position={[0, 11, 0]}>
            <cylinderGeometry
              args={[3.7, 3.7, 7, 20]}
            />
            <meshStandardMaterial
              color={color}
              metalness={0.35}
            />
          </mesh>

          <Text
            position={[0, 15.5, 0]}
            fontSize={0.4}
            color={color}
          >
            {label}
          </Text>
        </group>
      ))}

      <Text
        position={[0, 18, 0]}
        fontSize={0.9}
        color={COLORS.green}
      >
        SMART WASTE + RECYCLING
      </Text>
    </group>
  );
}

/* =========================================================
   FOOD CENTER
========================================================= */

function FoodCenter({ onClick }) {
  return (
    <group
      position={[-65, 0, 5]}
      onClick={onClick}
    >
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[30, 10, 22]} />
        <meshStandardMaterial color="#244e61" />
      </mesh>

      <mesh position={[0, 10.8, 0]}>
        <boxGeometry args={[26, 0.8, 18]} />
        <meshStandardMaterial color={COLORS.green} />
      </mesh>

      {/* storage tanks */}
      {[-8, 0, 8].map((x) => (
        <mesh key={x} position={[x, 12, 0]}>
          <cylinderGeometry args={[2, 2, 3, 16]} />
          <meshStandardMaterial color="#d9f6ff" />
        </mesh>
      ))}

      <Text
        position={[0, 14.5, 0]}
        fontSize={0.75}
        color={COLORS.cyan}
      >
        FOOD MANAGEMENT
      </Text>

      <Text
        position={[0, 13.1, 0]}
        fontSize={0.42}
        color="#dffaff"
      >
        STORAGE • DISTRIBUTION • DEMAND
      </Text>
    </group>
  );
}

/* =========================================================
   ENERGY CENTER
========================================================= */

function EnergyCenter({ onClick }) {
  return (
    <group
      position={[62, 0, 72]}
      onClick={onClick}
    >
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[32, 10, 22]} />
        <meshStandardMaterial color="#19384c" />
      </mesh>

      {/* solar panels */}
      {[-9, 0, 9].map((x) => (
        <mesh
          key={x}
          position={[x, 11, 0]}
          rotation={[-0.35, 0, 0]}
        >
          <boxGeometry args={[7, 0.15, 10]} />
          <meshStandardMaterial
            color={COLORS.solar}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}

      <Text
        position={[0, 14, 0]}
        fontSize={0.8}
        color={COLORS.yellow}
      >
        SMART ENERGY CENTER
      </Text>

      <Html position={[0, 16, 0]} center>
        <div className="world-tag">
          SOLAR • STORAGE • GRID
        </div>
      </Html>
    </group>
  );
}

/* =========================================================
   PARK
========================================================= */

function Park({ position, size = [30, 22] }) {
  const [w, d] = size;

  const trees = useMemo(() => {
    const result = [];

    for (let x = -w / 2 + 4; x < w / 2; x += 7) {
      for (let z = -d / 2 + 4; z < d / 2; z += 7) {
        result.push([x, 0, z]);
      }
    }

    return result;
  }, [w, d]);

  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[w, 0.5, d]} />
        <meshStandardMaterial color="#0c4c34" />
      </mesh>

      {trees.map((p, i) => (
        <Tree key={i} position={p} scale={0.7} />
      ))}

      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[3, 0.08, d * 0.7]} />
        <meshStandardMaterial color="#7bcf91" />
      </mesh>

      <Text
        position={[0, 4, 0]}
        fontSize={0.55}
        color="#8af2b2"
      >
        SMART GREEN PARK
      </Text>
    </group>
  );
}

/* =========================================================
   TREE
========================================================= */

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry
          args={[0.42, 0.62, 4, 8]}
        />
        <meshStandardMaterial color="#68412c" />
      </mesh>

      <mesh position={[0, 5, 0]}>
        <sphereGeometry
          args={[2.2, 12, 10]}
        />
        <meshStandardMaterial color="#23834f" />
      </mesh>
    </group>
  );
}

/* =========================================================
   STREET LIGHT
========================================================= */

function StreetLight({ position }) {
  const timeOfDay = useStore(
    (s) => s.timeOfDay
  );

  const on = timeOfDay === "night";

  return (
    <group position={position}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry
          args={[0.08, 0.1, 6, 8]}
        />
        <meshStandardMaterial color="#52616b" />
      </mesh>

      <mesh position={[0, 6, 0]}>
        <sphereGeometry
          args={[0.22, 10, 10]}
        />
        <meshStandardMaterial
          color={
            on ? "#fff3ad" : "#4c5960"
          }
          emissive={
            on ? "#fff3ad" : "#000000"
          }
          emissiveIntensity={on ? 2 : 0}
        />
      </mesh>

      {on && (
        <pointLight
          position={[0, 6, 0]}
          intensity={0.8}
          distance={13}
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
    <group
      position={[0, 0, 0]}
      onClick={onClick}
    >
      <mesh position={[0, 7, 0]} castShadow>
        <cylinderGeometry
          args={[13, 15, 14, 8]}
        />
        <meshStandardMaterial
          color="#102c40"
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, 15, 0]}>
        <sphereGeometry
          args={[6, 24, 24]}
        />
        <meshStandardMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.52}
          emissive={COLORS.cyan}
          emissiveIntensity={0.75}
        />
      </mesh>

      {/* radar rings */}
      {[8, 10, 12].map((r) => (
        <mesh
          key={r}
          position={[0, 15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[r, 0.06, 8, 48]} />
          <meshBasicMaterial color="#37d9ff" />
        </mesh>
      ))}

      <Text
        position={[0, 23, 0]}
        fontSize={0.9}
        color={COLORS.cyan}
      >
        SMART CITY CONTROL
      </Text>
    </group>
  );
}

/* =========================================================
   POLICE / FIRE / RESEARCH
========================================================= */

function SpecialBuildings({ setSelectedSystem }) {
  return (
    <>
      <SmartBuilding
        name="POLICE HQ"
        position={[78, 0, 62]}
        size={[22, 12, 18]}
        color="#254a63"
        rooftop
        onClick={() =>
          setSelectedSystem("police")
        }
      />

      <SmartBuilding
        name="FIRE STATION"
        position={[48, 0, 84]}
        size={[25, 10, 18]}
        color="#6c2931"
        rooftop
        onClick={() =>
          setSelectedSystem("fire")
        }
      />

      <SmartBuilding
        name="RESEARCH CENTER"
        position={[40, 0, -76]}
        size={[28, 17, 22]}
        color="#284c68"
        rooftop
        onClick={() =>
          setSelectedSystem("research")
        }
      />

      <SmartBuilding
        name="COMMERCIAL HUB"
        position={[72, 0, -72]}
        size={[32, 16, 22]}
        color="#3d426c"
        rooftop
        onClick={() =>
          setSelectedSystem("commercial")
        }
      />
    </>
  );
}

/* =========================================================
   CITY
========================================================= */

function City() {
  const setSelectedSystem = useStore(
    (s) => s.setSelectedSystem
  );

  const roads = useMemo(
    () => [
      // Main horizontal highways
      [[0, 0, -55], [220, 14]],
      [[0, 0, 55], [220, 14]],

      // Main vertical highways
      [[-55, 0, 0], [14, 220]],
      [[55, 0, 0], [14, 220]],

      // Central boulevard
      [[0, 0, 0], [20, 220]],
      [[0, 0, 0], [220, 20]],

      // outer ring roads
      [[0, 0, -91], [220, 7]],
      [[0, 0, 91], [220, 7]],
      [[-91, 0, 0], [7, 220]],
      [[91, 0, 0], [7, 220]],
    ],
    []
  );

  const trees = useMemo(() => {
    const arr = [];

    for (let x = -96; x <= 96; x += 16) {
      for (let z = -96; z <= 96; z += 16) {
        const nearRoad =
          Math.abs(x) < 13 ||
          Math.abs(z) < 13 ||
          Math.abs(x - 55) < 10 ||
          Math.abs(x + 55) < 10 ||
          Math.abs(z - 55) < 10 ||
          Math.abs(z + 55) < 10;

        const specialZone =
          x < -35 && z < 0;

        if (!nearRoad && !specialZone) {
          arr.push([x, 0, z]);
        }
      }
    }

    return arr;
  }, []);

  return (
    <group>
      {/* =====================================================
          GROUND
      ===================================================== */}

      <mesh
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <boxGeometry args={[230, 1, 230]} />
        <meshStandardMaterial
          color={COLORS.ground}
        />
      </mesh>

      {/* =====================================================
          ROADS
      ===================================================== */}

      {roads.map((r, i) => (
        <Road
          key={i}
          position={r[0]}
          size={r[1]}
          lanes={i < 6 ? 4 : 2}
        />
      ))}

      {/* =====================================================
          4 ENTRY ROUTES
      ===================================================== */}

      <Text
        position={[0, 2, -108]}
        fontSize={0.7}
        color={COLORS.cyan}
      >
        NORTH ENTRY • AI GATE
      </Text>

      <Text
        position={[0, 2, 108]}
        fontSize={0.7}
        color={COLORS.cyan}
      >
        SOUTH ENTRY • AI GATE
      </Text>

      <Text
        position={[-108, 2, 0]}
        fontSize={0.7}
        color={COLORS.cyan}
        rotation={[0, Math.PI / 2, 0]}
      >
        WEST ENTRY • AI GATE
      </Text>

      <Text
        position={[108, 2, 0]}
        fontSize={0.7}
        color={COLORS.cyan}
        rotation={[0, -Math.PI / 2, 0]}
      >
        EAST ENTRY • AI GATE
      </Text>

      {/* =====================================================
          CITY BORDER
      ===================================================== */}

      <mesh position={[0, 1, -112]}>
        <boxGeometry args={[225, 2, 2]} />
        <meshStandardMaterial
          color="#0b5472"
          emissive="#073047"
        />
      </mesh>

      <mesh position={[0, 1, 112]}>
        <boxGeometry args={[225, 2, 2]} />
        <meshStandardMaterial
          color="#0b5472"
          emissive="#073047"
        />
      </mesh>

      <mesh position={[-112, 1, 0]}>
        <boxGeometry args={[2, 2, 225]} />
        <meshStandardMaterial
          color="#0b5472"
          emissive="#073047"
        />
      </mesh>

      <mesh position={[112, 1, 0]}>
        <boxGeometry args={[2, 2, 225]} />
        <meshStandardMaterial
          color="#0b5472"
          emissive="#073047"
        />
      </mesh>

      {/* =====================================================
          CROSSWALKS
      ===================================================== */}

      <Crosswalk position={[0, 0, -12]} />
      <Crosswalk
        position={[0, 0, 12]}
        rotation={[0, Math.PI, 0]}
      />

      <Crosswalk
        position={[-12, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      <Crosswalk
        position={[12, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* =====================================================
          SCHOOL
      ===================================================== */}

      <SmartBuilding
        name="SMART SCHOOL"
        position={[0, 0, -82]}
        size={[38, 16, 25]}
        color="#1b6289"
        rooftop
        onClick={() =>
          setSelectedSystem("school")
        }
      />

      {/* =====================================================
          HOSPITAL
      ===================================================== */}

      <SmartBuilding
        name="SMART HOSPITAL"
        position={[76, 0, -25]}
        size={[30, 22, 35]}
        color="#cfe6eb"
        rooftop
        onClick={() =>
          setSelectedSystem("hospital")
        }
      />

      {/* =====================================================
          BANK
      ===================================================== */}

      <SmartBuilding
        name="SMART BANK"
        position={[78, 0, 25]}
        size={[25, 14, 25]}
        color="#182c3b"
        rooftop
        onClick={() =>
          setSelectedSystem("bank")
        }
      />

      {/* =====================================================
          RESIDENTIAL SMART HOMES
      ===================================================== */}

      {[-75, -55, 55, 75].map((x) =>
        [72, 90].map((z) => (
          <SmartBuilding
            key={`${x}-${z}`}
            name="SMART HOME"
            position={[x, 0, z]}
            size={[14, 9, 13]}
            color="#244b60"
            rooftop
          />
        ))
      )}

      {/* More residential towers */}
      <SmartBuilding
        name="SMART RESIDENCES"
        position={[72, 0, 74]}
        size={[24, 22, 18]}
        color="#2b5770"
        rooftop
      />

      {/* =====================================================
          SPECIAL BUILDINGS
      ===================================================== */}

      <SpecialBuildings
        setSelectedSystem={setSelectedSystem}
      />

      {/* =====================================================
          SYSTEMS
      ===================================================== */}

      <VerticalFarm
        onClick={() =>
          setSelectedSystem("farm")
        }
      />

      <FoodCenter
        onClick={() =>
          setSelectedSystem("food")
        }
      />

      <WaterFiltration
        onClick={() =>
          setSelectedSystem("water")
        }
      />

      <WasteCenter
        onClick={() =>
          setSelectedSystem("waste")
        }
      />

      <EnergyCenter
        onClick={() =>
          setSelectedSystem("energy")
        }
      />

      <ControlCenter
        onClick={() =>
          setSelectedSystem("control")
        }
      />

      {/* =====================================================
          PARKS
      ===================================================== */}

      <Park
        position={[35, 0, 38]}
        size={[32, 24]}
      />

      <Park
        position={[-35, 0, 35]}
        size={[28, 22]}
      />

      {/* =====================================================
          TRAFFIC LIGHTS
      ===================================================== */}

      <TrafficLight position={[-10, 0, -10]} />

      <TrafficLight
        position={[10, 0, -10]}
        rotation={[0, Math.PI, 0]}
      />

      <TrafficLight
        position={[-10, 0, 10]}
        rotation={[0, Math.PI, 0]}
      />

      <TrafficLight
        position={[10, 0, 10]}
      />

      <TrafficLight
        position={[-55, 0, -10]}
        intersection="west"
      />

      <TrafficLight
        position={[55, 0, 10]}
        intersection="east"
      />

      <TrafficLight
        position={[-10, 0, 55]}
        rotation={[0, Math.PI / 2, 0]}
        intersection="south"
      />

      <TrafficLight
        position={[10, 0, -55]}
        rotation={[0, Math.PI / 2, 0]}
        intersection="north"
      />

      {/* =====================================================
          TREES
      ===================================================== */}

      {trees.map((p, i) => (
        <Tree key={i} position={p} />
      ))}

      {/* =====================================================
          STREET LIGHTS
      ===================================================== */}

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

        [-80, 0, -55],
        [80, 0, -55],
        [-80, 0, 55],
        [80, 0, 55],
      ].map((p, i) => (
        <StreetLight
          key={i}
          position={p}
        />
      ))}

      {/* =====================================================
          CITY TITLE
      ===================================================== */}

      <Text
        position={[0, 35, -106]}
        fontSize={2}
        color={COLORS.cyan}
        anchorX="center"
      >
        BSS WORLD
      </Text>

      <Text
        position={[0, 32, -106]}
        fontSize={0.8}
        color="#d9f6ff"
        anchorX="center"
      >
        3D SMART CITY
      </Text>

      <Sparkles
        count={110}
        scale={[180, 80, 180]}
        size={0.6}
        speed={0.15}
        color={COLORS.cyan}
      />
    </group>
  );
}

/* =========================================================
   TRAFFIC SYSTEM
========================================================= */

function TrafficSystem() {
  const vehicles = useMemo(() => {
    const list = [];

    for (let i = 0; i < 36; i++) {
      const horizontal = i % 2 === 0;

      const lane =
        i % 4 === 0
          ? -4
          : 4;

      list.push({
        id: i,

        start: horizontal
          ? [
              -110 + (i * 13) % 220,
              0.3,
              i % 4 < 2
                ? -4
                : 4,
            ]
          : [
              i % 4 < 2
                ? -4
                : 4,
              0.3,
              -110 + (i * 11) % 220,
            ],

        axis: horizontal ? "x" : "z",

        speed: 3.5 + (i % 5),

        color: [
          "#168bd0",
          "#ffffff",
          "#2dcc78",
          "#ffb347",
          "#b96cff",
          "#43d7ff",
        ][i % 6],

        emergency: i === 4,

        lane,
      });
    }

    return list;
  }, []);

  return (
    <group>
      {vehicles.map((v) => (
        <Vehicle
          key={v.id}
          {...v}
        />
      ))}
    </group>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const trafficDensity = useStore(
    (s) => s.trafficDensity
  );

  const setTrafficDensity = useStore(
    (s) => s.setTrafficDensity
  );

  const timeOfDay = useStore(
    (s) => s.timeOfDay
  );

  const setTimeOfDay = useStore(
    (s) => s.setTimeOfDay
  );

  const setSelectedSystem = useStore(
    (s) => s.setSelectedSystem
  );

  const addLog = useStore(
    (s) => s.addLog
  );

  const emergency = useStore(
    (s) => s.emergency
  );

  const setEmergency = useStore(
    (s) => s.setEmergency
  );

  const logs = useStore((s) => s.logs);

  const [vehicles, setVehicles] =
    useState(36);

  const [water, setWater] = useState(94);
  const [food, setFood] = useState(87);
  const [waste, setWaste] = useState(91);
  const [harvest, setHarvest] =
    useState(320);
  const [efficiency, setEfficiency] =
    useState(88);

  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles(
        24 + Math.floor(
          trafficDensity * 28
        )
      );

      setWater(
        92 + Math.floor(Math.random() * 5)
      );

      setFood(
        82 + Math.floor(Math.random() * 10)
      );

      setWaste(
        88 + Math.floor(Math.random() * 7)
      );

      setHarvest(
        300 + Math.floor(Math.random() * 50)
      );

      setEfficiency(
        82 + Math.floor(Math.random() * 15)
      );

      const level =
        trafficDensity < 0.3
          ? "LOW"
          : trafficDensity < 0.65
          ? "MODERATE"
          : "HEAVY";

      addLog(
        `AI traffic status: ${level}`
      );
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
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="topbar glass">
        <div>
          <div className="brand">
            BSS WORLD
          </div>

          <div className="subtitle">
            3D SMART CITY • BEACONHOUSE SCHOOL
            SYSTEM
          </div>
        </div>

        <div className="status-row">
          <span className="status online">
            ● AI ONLINE
          </span>

          <span className="status">
            TRAFFIC: {trafficStatus}
          </span>

          <span className="status">
            4 ENTRY ROUTES
          </span>

          <span className="status">
            {timeOfDay.toUpperCase()}
          </span>
        </div>
      </div>

      {/* =====================================================
          LEFT PANEL
      ===================================================== */}

      <div className="left-panel glass">
        <h3>
          SMART CITY LIVE
        </h3>

        <Metric
          label="Vehicles"
          value={vehicles}
        />

        <Metric
          label="Average Speed"
          value={`${Math.max(
            18,
            48 -
              Math.floor(
                trafficDensity * 25
              )
          )} km/h`}
        />

        <Metric
          label="Efficiency"
          value={`${efficiency}%`}
        />

        <Metric
          label="Food Production"
          value={`${harvest} kg/day`}
        />

        <Metric
          label="Water Quality"
          value={`${water}%`}
        />

        <Metric
          label="Waste Processed"
          value={`${waste}%`}
        />

        <div className="system-button-list">
          <button
            onClick={() =>
              setSelectedSystem(
                "traffic"
              )
            }
          >
            AI TRAFFIC
          </button>

          <button
            onClick={() =>
              setSelectedSystem(
                "farm"
              )
            }
          >
            VERTICAL FARMING
          </button>

          <button
            onClick={() =>
              setSelectedSystem(
                "food"
              )
            }
          >
            FOOD MANAGEMENT
          </button>

          <button
            onClick={() =>
              setSelectedSystem(
                "water"
              )
            }
          >
            WATER FILTRATION
          </button>

          <button
            onClick={() =>
              setSelectedSystem(
                "waste"
              )
            }
          >
            WASTE MANAGEMENT
          </button>

          <button
            onClick={() =>
              setSelectedSystem(
                "energy"
              )
            }
          >
            SMART ENERGY
          </button>
        </div>
      </div>

      {/* =====================================================
          RIGHT PANEL
      ===================================================== */}

      <div className="right-panel glass">
        <h3>
          AI CONTROL CENTER
        </h3>

        <SystemCard
          title="AI TRAFFIC MANAGEMENT"
          value={`${Math.round(
            trafficDensity * 100
          )}% LOAD`}
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

        <SystemCard
          title="EMERGENCY NETWORK"
          value={
            emergency
              ? "PRIORITY ACTIVE"
              : "READY"
          }
        />

        {/* traffic slider */}
        <div className="control-section">
          <div className="small-title">
            AI TRAFFIC DENSITY
          </div>

          <input
            type="range"
            min="0.1"
            max="0.95"
            step="0.01"
            value={trafficDensity}
            onChange={(e) =>
              setTrafficDensity(
                Number(e.target.value)
              )
            }
          />
        </div>

        {/* Emergency */}
        <button
          className="emergency-button"
          onClick={() => {
            const next = !emergency;

            setEmergency(next);

            addLog(
              next
                ? "EMERGENCY PRIORITY ACTIVATED — HOSPITAL ROUTE CLEARED."
                : "Emergency priority cleared."
            );
          }}
        >
          {emergency
            ? "EMERGENCY PRIORITY ACTIVE"
            : "ACTIVATE EMERGENCY PRIORITY"}
        </button>

        {/* Day / night */}
        <button
          onClick={() => {
            const next =
              timeOfDay === "day"
                ? "night"
                : "day";

            setTimeOfDay(next);

            addLog(
              next === "night"
                ? "Night mode activated. Smart street lights online."
                : "Day mode activated."
            );
          }}
        >
          DAY / NIGHT
        </button>

        {/* Logs */}
        <div className="logs">
          <div className="small-title">
            SYSTEM LOG
          </div>

          {logs.slice(0, 5).map(
            (log, i) => (
              <div
                className="log"
                key={i}
              >
                {log}
              </div>
            )
          )}
        </div>
      </div>

      {/* =====================================================
          BOTTOM CONTROLS
      ===================================================== */}

      <div className="bottom-controls">
        <button
          onClick={() =>
            setSelectedSystem(
              "traffic"
            )
          }
        >
          SEE TRAFFIC LIVE
        </button>

        <button
          onClick={() =>
            setSelectedSystem(
              "control"
            )
          }
        >
          CONTROL CENTER
        </button>

        <button
          onClick={() =>
            setSelectedSystem(
              "school"
            )
          }
        >
          SCHOOL
        </button>

        <button
          onClick={() =>
            setSelectedSystem(
              "hospital"
            )
          }
        >
          HOSPITAL
        </button>

        <button
          onClick={() =>
            setSelectedSystem(
              "research"
            )
          }
        >
          RESEARCH
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   METRIC
========================================================= */

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

/* =========================================================
   SYSTEM CARD
========================================================= */

function SystemCard({ title, value }) {
  return (
    <div className="system-card">
      <div>{title}</div>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   INFORMATION PANEL
========================================================= */

function InformationPanel() {
  const selected = useStore(
    (s) => s.selectedSystem
  );

  const setSelected = useStore(
    (s) => s.setSelectedSystem
  );

  if (!selected) return null;

  const data = {
    traffic: {
      title:
        "AI TRAFFIC MANAGEMENT",

      body: `
        <b>4 Entry Routes:</b> ACTIVE<br/>
        <b>Traffic Signals:</b> AI CONTROLLED<br/>
        <b>Congestion Detection:</b> ACTIVE<br/>
        <b>Emergency Priority:</b> READY<br/>
        <b>Alternative Routes:</b> AVAILABLE<br/>
        <b>AI Vehicle Network:</b> 36 VEHICLES<br/><br/>
        The AI monitors vehicle density and dynamically controls traffic flow. Emergency vehicles receive priority when required.
      `,
    },

    farm: {
      title:
        "VERTICAL FARMING DISTRICT",

      body: `
        <b>Crop Towers:</b> 4<br/>
        <b>Crop Health:</b> 94%<br/>
        <b>Daily Production:</b> 320 kg<br/>
        <b>Water Usage:</b> 32%<br/>
        <b>Energy Usage:</b> 41%<br/>
        <b>Food Storage:</b> 1,240 kg<br/><br/>
        Multi-level farming allows crops to grow vertically while reducing land and water requirements.
      `,
    },

    food: {
      title:
        "FOOD MANAGEMENT",

      body: `
        <b>Production:</b> 320 kg/day<br/>
        <b>Storage:</b> 1,240 kg<br/>
        <b>Supply:</b> 87%<br/>
        <b>Active Deliveries:</b> 8<br/>
        <b>Food Waste:</b> 125 kg<br/><br/>
        Food distribution is connected to the vertical farms and AI traffic network.
      `,
    },

    water: {
      title:
        "SMART WATER FILTRATION",

      body: `
        <b>Water Input:</b> 12,500 L<br/>
        <b>Filtered:</b> 10,800 L<br/>
        <b>Recycled:</b> 8,900 L<br/>
        <b>Water Quality:</b> 94%<br/>
        <b>Efficiency:</b> 91%<br/><br/>
        Treated water is supplied to homes, public facilities and the vertical farming district.
      `,
    },

    waste: {
      title:
        "SMART WASTE MANAGEMENT",

      body: `
        <b>Collection:</b> ACTIVE<br/>
        <b>Recycling:</b> 91%<br/>
        <b>Organic:</b> COMPOST<br/>
        <b>Recyclables:</b> PROCESSING<br/>
        <b>General Waste:</b> CONTROLLED<br/><br/>
        Smart routing directs waste collection vehicles toward the appropriate processing zone.
      `,
    },

    energy: {
      title:
        "SMART ENERGY CENTER",

      body: `
        <b>Solar Network:</b> ONLINE<br/>
        <b>Energy Storage:</b> ACTIVE<br/>
        <b>Smart Grid:</b> CONNECTED<br/>
        <b>Building Monitoring:</b> ACTIVE<br/><br/>
        Solar generation supports the city's buildings and smart infrastructure.
      `,
    },

    control: {
      title:
        "SMART CITY CONTROL CENTER",

      body: `
        <b>AI Traffic:</b> ONLINE<br/>
        <b>Vertical Farming:</b> ACTIVE<br/>
        <b>Food Management:</b> ACTIVE<br/>
        <b>Water Filtration:</b> ACTIVE<br/>
        <b>Waste Management:</b> ACTIVE<br/>
        <b>Energy Network:</b> ACTIVE<br/>
        <b>Emergency Network:</b> READY
      `,
    },

    school: {
      title:
        "SMART SCHOOL",

      body: `
        <b>Traffic Priority:</b> ACTIVE<br/>
        <b>Food Demand:</b> MONITORED<br/>
        <b>Waste:</b> SMART COLLECTION<br/>
        <b>Water:</b> RECYCLED SUPPLY<br/>
        <b>Solar:</b> ROOFTOP SYSTEM<br/><br/>
        School mobility and resource demand are connected to the smart-city network.
      `,
    },

    hospital: {
      title:
        "SMART HOSPITAL",

      body: `
        <b>Emergency Priority:</b> ACTIVE<br/>
        <b>Food Supply:</b> MONITORED<br/>
        <b>Water Supply:</b> PRIORITIZED<br/>
        <b>Traffic Route:</b> AI CONTROLLED<br/>
        <b>Ambulance Network:</b> CONNECTED<br/><br/>
        Emergency routes receive priority when an ambulance requires rapid access.
      `,
    },

    bank: {
      title:
        "SMART BANK",

      body: `
        <b>Security:</b> ACTIVE<br/>
        <b>Energy Monitoring:</b> ACTIVE<br/>
        <b>Smart Services:</b> ONLINE<br/>
        <b>Solar Monitoring:</b> ACTIVE
      `,
    },

    police: {
      title:
        "POLICE HEADQUARTERS",

      body: `
        <b>City Security:</b> ACTIVE<br/>
        <b>Smart Surveillance:</b> ONLINE<br/>
        <b>Traffic Coordination:</b> CONNECTED<br/>
        <b>Emergency Network:</b> READY
      `,
    },

    fire: {
      title:
        "SMART FIRE STATION",

      body: `
        <b>Emergency Vehicles:</b> READY<br/>
        <b>Hospital Route:</b> CONNECTED<br/>
        <b>Traffic Priority:</b> AVAILABLE<br/>
        <b>Response Network:</b> ONLINE
      `,
    },

    research: {
      title:
        "RESEARCH + INNOVATION CENTER",

      body: `
        <b>Smart City Research:</b> ACTIVE<br/>
        <b>Technology Labs:</b> ONLINE<br/>
        <b>Environmental Monitoring:</b> ACTIVE<br/>
        <b>Innovation Network:</b> CONNECTED
      `,
    },

    commercial: {
      title:
        "SMART COMMERCIAL HUB",

      body: `
        <b>Retail Network:</b> ONLINE<br/>
        <b>Food Demand:</b> CONNECTED<br/>
        <b>Traffic:</b> AI CONTROLLED<br/>
        <b>Energy:</b> SMART MONITORED
      `,
    },
  };

  const current =
    data[selected] || data.control;

  return (
    <div className="popup glass">
      <button
        className="close"
        onClick={() =>
          setSelected(null)
        }
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
            rgba(4, 17, 27, 0.92),
            rgba(3, 10, 18, 0.78)
          );

        border:
          1px solid
          rgba(65, 202, 255, 0.25);

        box-shadow:
          0 18px 50px
          rgba(0, 0, 0, 0.42),
          0 0 30px
          rgba(0, 174, 255, 0.06);

        backdrop-filter: blur(14px);

        border-radius: 14px;
      }

      .topbar {
        position: absolute;
        left: 14px;
        right: 14px;
        top: 14px;

        min-height: 65px;

        padding:
          12px 16px;

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
        padding:
          7px 10px;

        border-radius: 999px;

        border:
          1px solid
          rgba(82, 205, 255, 0.22);

        background:
          rgba(7, 25, 37, 0.75);

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

        width: 290px;

        max-height:
          calc(100vh - 170px);

        overflow-y: auto;

        padding: 13px;

        pointer-events: auto;
      }

      h3 {
        margin:
          0 0 11px;

        font-size: 11px;

        letter-spacing:
          1.5px;

        color:
          #8bdfff;
      }

      .metric {
        display: flex;
        justify-content: space-between;
        gap: 10px;

        padding: 8px 0;

        border-bottom:
          1px solid
          rgba(255,255,255,.06);

        font-size: 11px;

        color:
          #9fb7c3;
      }

      .metric b {
        color:
          #f0fbff;
      }

      .system-card {
        padding: 10px;

        margin-bottom: 8px;

        border-radius: 9px;

        background:
          rgba(255,255,255,.035);

        border:
          1px solid
          rgba(255,255,255,.055);

        font-size: 9px;

        color:
          #8daeba;

        letter-spacing:
          .7px;
      }

      .system-card strong {
        display: block;

        margin-top: 5px;

        color:
          #55d8ff;

        font-size: 13px;
      }

      .system-button-list {
        display: grid;

        gap: 6px;

        margin-top: 12px;
      }

      button {
        pointer-events: auto;

        border:
          1px solid
          rgba(68, 203, 255, .25);

        background:
          rgba(5, 25, 37, .9);

        color:
          #dff8ff;

        border-radius: 8px;

        padding:
          9px 10px;

        cursor: pointer;

        font-size: 9px;

        font-weight: 800;

        letter-spacing: .6px;

        transition:
          .2s ease;
      }

      button:hover {
        background:
          rgba(13, 67, 91, .95);

        border-color:
          rgba(68, 203, 255, .6);

        transform:
          translateY(-1px);
      }

      .control-section {
        margin-top: 12px;
      }

      .small-title {
        font-size: 9px;

        color:
          #86aeba;

        margin-bottom: 5px;
      }

      input[type="range"] {
        width: 100%;
        accent-color:
          #2fc9ff;
      }

      .emergency-button {
        width: 100%;
        margin: 7px 0;
      }

      .logs {
        margin-top: 12px;

        border-top:
          1px solid
          rgba(255,255,255,.06);

        padding-top: 10px;
      }

      .log {
        font-size: 8px;

        line-height: 1.45;

        padding: 5px 0;

        color:
          #76919c;

        border-bottom:
          1px solid
          rgba(255,255,255,.035);
      }

      .bottom-controls {
        position: absolute;

        bottom: 14px;

        left: 50%;

        transform:
          translateX(-50%);

        display: flex;

        gap: 7px;

        flex-wrap: wrap;

        justify-content:
          center;

        pointer-events: auto;
      }

      .popup {
        pointer-events: auto;

        position: absolute;

        left: 50%;
        top: 50%;

        transform:
          translate(-50%, -50%);

        width:
          min(470px, 88vw);

        padding: 20px;

        font-size: 12px;

        line-height: 1.75;

        color:
          #bdd3dd;

        z-index: 20;
      }

      .popup h2 {
        margin:
          0 0 13px;

        font-size: 17px;

        color:
          #83ddff;

        letter-spacing:
          1px;
      }

      .popup b {
        color:
          #f1fbff;
      }

      .close {
        float: right;

        padding:
          5px 9px;

        font-size:
          15px;
      }

      .world-tag {
        white-space: nowrap;

        padding:
          5px 9px;

        border:
          1px solid
          rgba(64, 205, 255, .35);

        border-radius: 7px;

        background:
          rgba(2, 13, 21, .8);

        color:
          #a9eaff;

        font-size: 9px;

        letter-spacing:
          .5px;
      }

      @media(max-width:1100px) {
        .left-panel {
          width: 220px;
        }

        .right-panel {
          width: 245px;
        }

        .status-row {
          max-width: 420px;
        }
      }

      @media(max-width:900px) {
        .left-panel,
        .right-panel {
          transform: scale(.88);
          transform-origin: top;
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

        .bottom-controls {
          width: 95%;
        }
      }
    `}</style>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const timeOfDay = useStore(
    (s) => s.timeOfDay
  );

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
            position: [
              125,
              115,
              125,
            ],
            fov: 50,
          }}
          gl={{
            antialias: true,
            powerPreference:
              "high-performance",
          }}
          dpr={[1, 1.35]}
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
              340,
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
            intensity={
              timeOfDay === "night"
                ? 0.22
                : 0.65
            }
            color="#7eb8d4"
          />

          <directionalLight
            position={[
              80,
              120,
              70,
            ]}
            intensity={
              timeOfDay === "night"
                ? 0.35
                : 2
            }
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          <Suspense fallback={null}>
            <City />
            <TrafficSystem />

            <ContactShadows
              position={[
                0,
                -0.05,
                0,
              ]}
              opacity={0.5}
              scale={230}
              blur={2}
              far={100}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={25}
            maxDistance={285}
            maxPolarAngle={
              Math.PI / 2.08
            }
            target={[
              0,
              5,
              0,
            ]}
          />
        </Canvas>

        <Dashboard />

        <InformationPanel />
      </div>
    </>
  );
}
