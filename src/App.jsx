import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';

const useStore = create((set) => ({
  alert: null,
  setAlert: (a) => set({ alert: a }),
  focus: null,
  setFocus: (f) => set({ focus: f }),
  timeOfDay: 'day',
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  trafficDensity: 'medium',
  setTrafficDensity: (d) => set({ trafficDensity: d }),
  streetLightsOn: false,
  setStreetLightsOn: (s) => set({ streetLightsOn: s }),
  wasteBins: {},
  updateWasteBin: (id, level) => set((state) => ({
    wasteBins: { ...state.wasteBins, [id]: level }
  })),
  alertWasteManagement: false,
  setAlertWasteManagement: (alert) => set({ alertWasteManagement: alert }),
  emergencyAlarm: false,
  setEmergencyAlarm: (alarm) => set({ emergencyAlarm: alarm }),
  wasteProcessing: {
    isProcessing: false,
    processTime: 0,
    recycledWaste: 0,
    reducedWaste: 0,
    reusedWaste: 0
  },
  setWasteProcessing: (processing) => set({ wasteProcessing: processing }),
  showCityControl: false,
  setShowCityControl: (show) => set({ showCityControl: show }),
  truckStatus: 'idle',
  setTruckStatus: (status) => set({ truckStatus: status }),
  currentBinTarget: null,
  setCurrentBinTarget: (target) => set({ currentBinTarget: target }),
  collectedWaste: 0,
  setCollectedWaste: (waste) => set({ collectedWaste: waste }),
  gardenSensors: {
    soilMoisture: 65,
    temperature: 24,
    humidity: 45,
    waterLevel: 80,
    isWatering: false
  },
  setGardenSensors: (sensors) => set({ gardenSensors: sensors }),
  monitoringDrones: {
    active: true,
    wasteDetected: false,
    currentPosition: [0, 0, 0]
  },
  setMonitoringDrones: (drones) => set({ monitoringDrones: drones }),
  waterPlant: {
    isProcessing: false,
    processTime: 0,
    waterQuality: 95,
    filteredWater: 0,
    efficiency: 85
  },
  setWaterPlant: (plant) => set({ waterPlant: plant })
}));

/* ----- DUBAI STYLE SKYSCRAPER ----- */
function DubaiSkyscraper({ position = [0, 0, 0], height = 30, color = "#c0c0c0", name = "Dubai Tower", style = "burj" }) {
  const setFocus = useStore((s) => s.setFocus);
  const timeOfDay = useStore((s) => s.timeOfDay);

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: height / 2,
      z: position[2],
      lookAt: { x: position[0], y: 0, z: position[2] }
    });
  };

  // Different building styles
  const getBuildingGeometry = () => {
    switch(style) {
      case 'burj':
        return <cylinderGeometry args={[2, 4, height, 8]} />;
      case 'twist':
        return <torusKnotGeometry args={[3, 0.8, 100, 16, 2, 3]} />;
      case 'spiral':
        return <coneGeometry args={[3, height, 8]} />;
      case 'cubic':
        return <boxGeometry args={[5, height, 5]} />;
      default:
        return <cylinderGeometry args={[3, 4, height, 8]} />;
    }
  };

  return (
    <group position={position}>
      {/* Main Tower */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        {getBuildingGeometry()}
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2} 
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Glass Windows - Night Lighting */}
      {Array.from({ length: Math.floor(height / 3) }).map((_, floor) => (
        <mesh key={floor} position={[0, -height/2 + (floor * 3) + 3, 2.5]} castShadow>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial
            color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"}
            transparent
            opacity={timeOfDay === 'night' ? 0.9 : 0.7}
            emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
            emissiveIntensity={timeOfDay === 'night' ? 0.8 : 0}
          />
        </mesh>
      ))}

      {/* Dubai Style Golden Top */}
      <mesh position={[0, height/2 + 1, 0]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
      </mesh>

      {/* Spire */}
      <mesh position={[0, height/2 + 3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.5, 6, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
      </mesh>

      <Text
        position={[0, height/2 + 6, 0]}
        fontSize={0.5}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      {timeOfDay === 'night' && (
        <pointLight position={[0, height/2, 0]} intensity={0.5} color="#d4af37" distance={10} />
      )}
    </group>
  );
}

/* ----- DUBAI PALM TREE ----- */
function PalmTree({ position = [0, 0, 0], height = 2 }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, height/2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, height, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>

      {/* Leaves */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <mesh
          key={angle}
          position={[0, height + 0.2, 0]}
          rotation={[0, 0, angle * Math.PI / 180]}
          castShadow
        >
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[1.2, 0.1, 0.3]} />
            <meshStandardMaterial color="#27ae60" roughness={0.6} />
          </mesh>
        </mesh>
      ))}

      {/* Coconut */}
      <mesh position={[0, height - 0.1, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
}

/* ----- DUBAI LUXURY CAR ----- */
function LuxuryCar({ position = [0, 0, 0], color = "#d4af37" }) {
  return (
    <group position={position}>
      {/* Car Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.6, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Car Roof */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.5, 0.4, 1]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} transparent opacity={0.8} />
      </mesh>

      {/* Wheels */}
      {[-1, 1].map((x) => (
        <group key={x} position={[x, -0.3, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[-1.25, 0, 0.5]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>

      <Text position={[0, 1, 0]} fontSize={0.3} color="#d4af37" anchorX="center">
        ✨
      </Text>
    </group>
  );
}

/* ----- DUBAI MALL ----- */
function DubaiMall({ position = [0, 0, 0] }) {
  const timeOfDay = useStore((s) => s.timeOfDay);

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[20, 10, 15]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Glass Facade */}
      <mesh position={[0, 5, 7.6]} castShadow>
        <boxGeometry args={[18, 8, 0.2]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} metalness={0.8} />
      </mesh>

      {/* Golden Entrance */}
      <mesh position={[0, 2, 7.7]} castShadow>
        <boxGeometry args={[8, 4, 0.3]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
      </mesh>

      {/* Fountain */}
      <group position={[0, -2, 10]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[3, 4, 1, 32]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
        </mesh>

        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.5, 0.5, Math.sin(angle) * 1.5]} castShadow>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#3498db" emissiveIntensity={0.5} />
            </mesh>
          );
        })}
      </group>

      <Text position={[0, 8, 0]} fontSize={0.8} color="#d4af37" anchorX="center">
        🏬 Dubai Mall
      </Text>

      {timeOfDay === 'night' && (
        <pointLight position={[0, 5, 0]} intensity={1} color="#d4af37" distance={15} />
      )}
    </group>
  );
}

/* ----- ENHANCED STREET LIGHTS ----- */
function StreetLight({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const timeOfDay = useStore((s) => s.timeOfDay);
  const streetLightsOn = useStore((s) => s.streetLightsOn);

  const isOn = streetLightsOn || timeOfDay === 'night';

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} />
      </mesh>

      <mesh position={[0, 6, 0.5]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} />
      </mesh>

      <mesh position={[0, 6, 0.8]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color={isOn ? "#ffffcc" : "#666666"}
          emissive={isOn ? "#ffff99" : "#000000"}
          emissiveIntensity={isOn ? 1 : 0}
        />
      </mesh>

      {isOn && (
        <pointLight
          position={[0, 6, 0.8]}
          intensity={0.8}
          distance={15}
          color="#ffffcc"
          castShadow
        />
      )}
    </group>
  );
}

/* ----- ENHANCED STREET LIGHT SYSTEM ----- */
function StreetLightSystem() {
  const lightPositions = [
    ...Array.from({ length: 20 }).map((_, i) => [-50 + i * 5, 0, 0]),
    ...Array.from({ length: 20 }).map((_, i) => [0, 0, -50 + i * 5]),
    ...Array.from({ length: 16 }).map((_, i) => [-40 + i * 5, 0, -25]),
    ...Array.from({ length: 16 }).map((_, i) => [-40 + i * 5, 0, 25]),
    ...Array.from({ length: 16 }).map((_, i) => [-25, 0, -40 + i * 5]),
    ...Array.from({ length: 16 }).map((_, i) => [25, 0, -40 + i * 5]),
    [15, 0, 15], [-15, 0, 15], [0, 0, 0], [-8, 0, -2], [8, 0, -6],
    [10, 0, 25], [-10, 0, 25], [0, 0, 20],
    [-30, 0, 15], [30, 0, -15], [-25, 0, 25], [25, 0, -25],
    [-20, 0, -30], [20, 0, 30], [-10, 0, -25], [10, 0, 25],
    [-35, 0, -35], [35, 0, 35], [-35, 0, 35], [35, 0, -35],
    [0, 0, -45], [0, 0, 45], [-45, 0, 0], [45, 0, 0]
  ];

  return (
    <group>
      {lightPositions.map((pos, index) => (
        <StreetLight key={index} position={pos} />
      ))}
    </group>
  );
}

/* ----- DUBAI CITY LAYOUT ----- */
function DubaiCityLayout() {
  return (
    <group>
      {/* DUBAI DOWNTOWN - Burj Khalifa Area */}
      <group position={[0, 0, 0]}>
        {/* Burj Khalifa - World's Tallest Building */}
        <DubaiSkyscraper position={[0, 0, 0]} height={60} color="#c0c0c0" name="Burj Khalifa" style="burj" />
        
        {/* Surrounding Towers */}
        <DubaiSkyscraper position={[15, 0, 15]} height={35} color="#a0a0a0" name="Address Hotel" style="cubic" />
        <DubaiSkyscraper position={[-15, 0, 15]} height={40} color="#b0b0b0" name="EMAAR Tower" style="spiral" />
        <DubaiSkyscraper position={[15, 0, -15]} height={30} color="#909090" name="Dubai Mall Hotel" style="twist" />
        <DubaiSkyscraper position={[-15, 0, -15]} height={45} color="#a8a8a8" name="Fountain Views" style="cubic" />
      </group>

      {/* DUBAI MARINA - Waterfront */}
      <group position={[50, 0, 20]}>
        <DubaiSkyscraper position={[0, 0, 0]} height={35} color="#4a90d9" name="Marina Tower 1" style="twist" />
        <DubaiSkyscraper position={[20, 0, 10]} height={30} color="#5a9fe9" name="Marina Tower 2" style="spiral" />
        <DubaiSkyscraper position={[10, 0, 25]} height={40} color="#6aaaf9" name="Marina Crown" style="cubic" />
        <DubaiSkyscraper position={[-15, 0, 15]} height={25} color="#7abaff" name="Marina Residence" style="burj" />

        {/* Water Fountain */}
        <mesh position={[0, -1, 0]} receiveShadow>
          <circleGeometry args={[15, 32]} />
          <meshStandardMaterial color="#2980b9" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* PALM JUMEIRAH - Luxury Island */}
      <group position={[-40, 0, 40]}>
        {/* Palm Trunk */}
        <DubaiSkyscraper position={[0, 0, 0]} height={15} color="#8b4513" name="Palm Jumeirah" style="cubic" />
        
        {/* Palm Leaves */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = angle * Math.PI / 180;
          const x = Math.cos(rad) * 25;
          const z = Math.sin(rad) * 25;
          
          return (
            <group key={angle} position={[x, 0, z]} rotation={[0, -angle * Math.PI / 180, 0]}>
              <DubaiSkyscraper position={[0, 0, 0]} height={10} color="#f0e6d3" name="Villa" style="cubic" />
              <DubaiSkyscraper position={[8, 0, 0]} height={8} color="#e8dcc8" name="Beach House" style="cubic" />
              <PalmTree position={[4, 0, 0]} height={2} />
            </group>
          );
        })}
      </group>

      {/* DUBAI INTERNATIONAL FINANCIAL CENTER (DIFC) */}
      <group position={[30, 0, -30]}>
        <DubaiSkyscraper position={[0, 0, 0]} height={40} color="#1a1a2e" name="DIFC Tower 1" style="spiral" />
        <DubaiSkyscraper position={[15, 0, 5]} height={35} color="#2a2a3e" name="DIFC Tower 2" style="twist" />
        <DubaiSkyscraper position={[-10, 0, 10]} height={30} color="#3a3a4e" name="Gate Avenue" style="cubic" />
      </group>

      {/* DUBAI MALL */}
      <DubaiMall position={[-20, 0, -20]} />

      {/* Public Transport */}
      <LuxuryCar position={[10, 0, 5]} color="#d4af37" />
      <LuxuryCar position={[-10, 0, 5]} color="#e74c3c" />
      <LuxuryCar position={[5, 0, -10]} color="#3498db" />
      <LuxuryCar position={[-5, 0, -10]} color="#2ecc71" />

      {/* Palm Trees */}
      <PalmTree position={[25, 0, 25]} />
      <PalmTree position={[-25, 0, 25]} />
      <PalmTree position={[25, 0, -25]} />
      <PalmTree position={[-25, 0, -25]} />

      {/* Street Lights */}
      <StreetLightSystem />

      {/* Global Map Markers */}
      <Sparkles count={200} scale={[100, 100, 100]} size={1} speed={0.3} color="#d4af37" />
    </group>
  );
}

/* ----- MAIN APP COMPONENT ----- */
export default function App() {
  const { focus, setFocus } = useStore();
  const controlsRef = useRef();

  useEffect(() => {
    if (focus && controlsRef.current) {
      const { x, y, z, lookAt } = focus;
      controlsRef.current.target.set(lookAt.x, lookAt.y, lookAt.z);
      controlsRef.current.object.position.set(x, y, z);
    }
  }, [focus]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%)' }}>
      <Canvas
        shadows
        camera={{ position: [50, 40, 50], fov: 60 }}
        style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%)' }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} color="#4466aa" />
        <directionalLight
          position={[50, 50, 50]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Suspense fallback={null}>
          <DubaiCityLayout />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.6} scale={100} blur={2} />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={150}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
