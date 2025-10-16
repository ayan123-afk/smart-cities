import React, { useRef, useState, useEffect, useFrame } from 'react';
import { Canvas, useThree, extend, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Html, Text, Sky, ContactShadows, Sparkles, Float, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Types
interface BuildingProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

interface VerticalGardenProps extends BuildingProps {
  height?: number;
  width?: number;
}

interface ParkingProps extends BuildingProps {
  initialCars?: number;
  totalSpots?: number;
}

// Main City Component
export default function SmartCity(): JSX.Element {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'hidden'
    }}>
      <Canvas
        shadows
        camera={{ position: [100, 80, 100], fov: 60 }}
        style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Sky sunPosition={[100, 20, 100]} />
        
        <CityLayout />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={200}
        />
        <ContactShadows position={[0, -1, 0]} opacity={0.8} scale={200} blur={2} far={10} />
        <FloatingParticles />
        <AnimatedBirds />
      </Canvas>
    </div>
  );
}

// Floating Particles for Ambiance
function FloatingParticles(): JSX.Element {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = Math.random() * 50 + 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

    colors[i * 3] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 2] = Math.random() * 0.5 + 0.5;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={1} vertexColors transparent opacity={0.6} />
    </points>
  );
}

// Animated Birds
function AnimatedBirds(): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 10;
      groupRef.current.position.z = Math.cos(state.clock.getElapsedTime() * 0.3) * 10;
    }
  });

  return (
    <group ref={groupRef} position={[0, 60, 0]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[i * 3 - 6, Math.sin(i) * 2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.5, 2, 3]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  );
}

// Main City Layout
function CityLayout(): JSX.Element {
  return (
    <group>
      {/* Enhanced Ground with Textures */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[400, 400, 50, 50]} />
        <meshStandardMaterial 
          color="#2ecc71" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Ground Grid */}
      <gridHelper args={[400, 40, '#27ae60', '#27ae60']} position={[0, -1.9, 0]} />

      {/* Educational District - Top Left */}
      <ModernSchool position={[-120, 0, 120]} />
      <Library position={[-150, 0, 80]} />
      <College position={[-80, 0, 150]} />
      <Playground position={[-100, 0, 90]} />
      
      {/* Medical District - Top Right */}
      <ModernHospital position={[120, 0, 120]} />
      <MedicalCenter position={[150, 0, 80]} />
      <Pharmacy position={[80, 0, 150]} />
      <AmbulanceBay position={[140, 0, 140]} />
      
      {/* Cultural District - Bottom Left */}
      <CulturalCenter position={[-120, 0, -120]} />
      <Museum position={[-150, 0, -80]} />
      <ArtGallery position={[-80, 0, -150]} />
      <SculptureGarden position={[-100, 0, -100]} />
      
      {/* Technology District - Bottom Right */}
      <CloudDataCenter position={[120, 0, -120]} />
      <TechPark position={[150, 0, -80]} />
      <ResearchCenter position={[80, 0, -150]} />
      <SatelliteDish position={[140, 0, -140]} />
      
      {/* Central Business District */}
      <ShoppingMall position={[0, 0, 0]} />
      <OfficeTower position={[-40, 0, -40]} />
      <BusinessCenter position={[40, 0, 40]} />
      <Fountain position={[10, 0, -10]} />
      
      {/* Infrastructure */}
      <WaterFilteringCenter position={[0, 0, 120]} />
      <PowerPlant position={[0, 0, -120]} />
      <TransportHub position={[120, 0, 0]} />
      <SolarFarm position={[-120, 0, 0]} />
      
      {/* Residential Areas */}
      <ResidentialComplex position={[-120, 0, 40]} />
      <ResidentialComplex position={[120, 0, -40]} />
      <ResidentialComplex position={[-40, 0, 120]} />
      <ResidentialComplex position={[40, 0, -120]} />
      
      {/* Enhanced Roads */}
      <RoadSystem />
      
      {/* Parks and Green Spaces */}
      <CentralPark position={[0, 0, 60]} />
      <CityPark position={[60, 0, 0]} />
      <CityPark position={[-60, 0, 0]} />
      <CityPark position={[0, 0, -60]} />

      {/* City Lights */}
      <CityLights />
    </group>
  );
}

// MODERN SCHOOL BUILDING - Enhanced with Vertical Gardens
function ModernSchool({ position }: BuildingProps): JSX.Element {
  const [time, setTime] = useState<number>(0);
  const [studentsCount, setStudentsCount] = useState<number>(1500);
  
  useFrame((state) => {
    setTime(state.clock.getElapsedTime());
    
    // Animate student count
    if (Math.random() < 0.01) {
      setStudentsCount(prev => prev + (Math.random() < 0.5 ? 1 : -1));
    }
  });

  return (
    <group position={position}>
      {/* Main School Building */}
      <mesh castShadow receiveShadow position={[0, 15, 0]}>
        <boxGeometry args={[35, 30, 25]} />
        <meshStandardMaterial 
          color="#3498db" 
          metalness={0.3} 
          roughness={0.7} 
        />
      </mesh>

      {/* Glass Facade with Animation */}
      <mesh position={[0, 15, 12.6]}>
        <boxGeometry args={[33, 28, 0.2]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3 + Math.sin(time * 2) * 0.1}
        />
      </mesh>

      {/* VERTICAL GARDENS - Both Sides */}
      <VerticalGarden position={[17.6, 15, 0]} height={30} width={25} />
      <VerticalGarden position={[-17.6, 15, 0]} height={30} width={25} rotation={[0, Math.PI, 0]} />

      {/* Green Roof with Animated Grass */}
      <mesh position={[0, 30.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[35, 25]} />
        <meshStandardMaterial 
          color="#27ae60"
          roughness={0.9}
        />
      </mesh>

      {/* Solar Panels on Roof */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-12 + i * 5, 30.2, 0]} rotation={[Math.PI / 6, 0, 0]}>
          <boxGeometry args={[4, 0.1, 3]} />
          <meshStandardMaterial 
            color="#2c3e50" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#f39c12"
            emissiveIntensity={Math.sin(time + i) * 0.1}
          />
        </mesh>
      ))}

      {/* Main Entrance */}
      <mesh position={[0, 8, 12.7]}>
        <boxGeometry args={[8, 16, 0.3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* School Name with Animation */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 32, 12.8]}
          fontSize={1.5}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          font="/fonts/Inter-Bold.woff"
        >
          🏫 GREEN VALLEY SCHOOL
        </Text>
      </Float>

      {/* Playground */}
      <PlaygroundArea position={[25, 0, 0]} />

      {/* Sports Court */}
      <SportsCourt position={[-25, 0, 0]} />

      {/* School Parking */}
      <SchoolParking position={[0, 0, -35]} initialCars={25} totalSpots={50} />

      {/* Interactive Info Display */}
      <Html position={[0, 40, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #3498db, #2980b9)',
          color: 'white',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          border: '3px solid #2c3e50',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '22px', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏫 Green Valley International School
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>📚 45 Classrooms</div>
              <div>👨‍🏫 68 Teachers</div>
              <div>👥 {studentsCount} Students</div>
              <div>🏢 5 Floors</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🌿 Vertical Gardens</div>
              <div>☀️ Solar Powered</div>
              <div>🏀 Sports Facilities</div>
              <div>⭐ Grade A+ Rated</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            fontSize: '13px',
            backdropFilter: 'blur(5px)'
          }}>
            <div>✅ Science & Computer Labs</div>
            <div>✅ Library & Auditorium</div>
            <div>✅ Cafeteria & Gym</div>
            <div>✅ Sustainable Campus</div>
          </div>
        </div>
      </Html>

      {/* Floating particles for ambiance */}
      <Sparkles 
        count={50} 
        scale={[50, 30, 50]} 
        size={2} 
        speed={0.3} 
        color="#3498db"
      />

      {/* Animated Learning Flag */}
      <AnimatedFlag position={[0, 35, -12]} />
    </group>
  );
}

// Animated Flag Component
function AnimatedFlag({ position }: BuildingProps): JSX.Element {
  const flagRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Flag Pole */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      
      {/* Flag */}
      <mesh ref={flagRef} position={[2, 9, 0]} castShadow>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      <Text position={[2, 9, 0.1]} fontSize={0.3} color="white" anchorX="center">
        🎓
      </Text>
    </group>
  );
}

// VERTICAL GARDEN COMPONENT - Reusable
function VerticalGarden({ 
  position, 
  height = 20, 
  width = 15, 
  rotation = [0, 0, 0] 
}: VerticalGardenProps): JSX.Element {
  const plantsPerRow = Math.floor(width / 1.2);
  const rows = Math.floor(height / 1.5);

  return (
    <group position={position} rotation={rotation}>
      {/* Green Wall Background */}
      <mesh receiveShadow>
        <boxGeometry args={[0.3, height, width]} />
        <meshStandardMaterial color="#27ae60" roughness={0.8} />
      </mesh>

      {/* Plants Grid */}
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: plantsPerRow }).map((_, col) => {
          const z = -width/2 + (col + 0.5) * (width / plantsPerRow);
          const y = -height/2 + (row + 0.5) * (height / rows);
          const plantSize = 0.3 + Math.random() * 0.2;
          const plantHeight = 0.4 + Math.random() * 0.3;
          
          return (
            <Float key={`${row}-${col}`} speed={1} rotationIntensity={0.5} floatIntensity={0.3}>
              <group position={[0.2, y, z]}>
                {/* Plant Stem */}
                <mesh castShadow position={[0, -0.1, 0]}>
                  <cylinderGeometry args={[0.05, 0.08, plantHeight, 6]} />
                  <meshStandardMaterial color="#388e3c" />
                </mesh>
                {/* Plant Leaves */}
                <mesh castShadow position={[0, plantHeight/2, 0]}>
                  <sphereGeometry args={[plantSize, 6, 6]} />
                  <meshStandardMaterial color="#4caf50" />
                </mesh>
              </group>
            </Float>
          );
        })
      )}
    </group>
  );
}

// Enhanced Playground Area
function PlaygroundArea({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      {/* Playground Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#82c91e" roughness={0.9} />
      </mesh>

      {/* Swing Set */}
      <SwingSet position={[5, 0, 5]} />
      
      {/* Slide */}
      <Slide position={[-5, 0, 8]} />
      
      {/* Seesaw */}
      <Seesaw position={[0, 0, -5]} />
      
      {/* Merry-go-round */}
      <MerryGoRound position={[8, 0, -8]} />
    </group>
  );
}

// Swing Set Component
function SwingSet({ position }: BuildingProps): JSX.Element {
  const swingRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (swingRef.current) {
      swingRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Swing Frame */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[6, 0.2, 0.2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Swing Seats */}
      <group ref={swingRef} position={[0, 1, 0]}>
        {[-2, 0, 2].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.8, 0.1, 1.5]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Slide Component
function Slide({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
    </group>
  );
}

// Seesaw Component
function Seesaw({ position }: BuildingProps): JSX.Element {
  const seesawRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (seesawRef.current) {
      seesawRef.current.rotation.z = Math.sin(state.clock.getElapsedTime()) * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh ref={seesawRef} castShadow>
        <boxGeometry args={[6, 0.2, 1]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
    </group>
  );
}

// Merry-Go-Round Component
function MerryGoRound({ position }: BuildingProps): JSX.Element {
  const merryRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (merryRef.current) {
      merryRef.current.rotation.y = state.clock.getElapsedTime();
    }
  });

  return (
    <group position={position} ref={merryRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.2, 16]} />
        <meshStandardMaterial color="#9b59b6" />
      </mesh>
    </group>
  );
}

// Enhanced Sports Court
function SportsCourt({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 18]} />
        <meshStandardMaterial color="#795548" roughness={0.8} />
      </mesh>

      {/* Basketball Hoop */}
      <BasketballHoop position={[0, 0, 8]} />
      
      {/* Tennis Net */}
      <TennisNet position={[0, 0, 0]} />
      
      {/* Running Track */}
      <RunningTrack position={[0, 0.1, 0]} />
    </group>
  );
}

// Basketball Hoop Component
function BasketballHoop({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <mesh position={[1.5, 3, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
    </group>
  );
}

// Tennis Net Component
function TennisNet({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[20, 0.1, 0.1]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
    </group>
  );
}

// Running Track Component
function RunningTrack({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[20, 25, 32]} />
        <meshStandardMaterial color="#c0392b" roughness={0.7} />
      </mesh>
    </group>
  );
}

// SCHOOL PARKING - Enhanced
function SchoolParking({ position, initialCars = 25, totalSpots = 50 }: ParkingProps): JSX.Element {
  const [parkedCars, setParkedCars] = useState<number>(initialCars);

  useFrame(() => {
    // Random car movement simulation
    if (Math.random() < 0.005) {
      setParkedCars(prev => {
        const change = Math.random() < 0.5 ? 1 : -1;
        return Math.max(10, Math.min(totalSpots, prev + change));
      });
    }
  });

  return (
    <group position={position}>
      {/* Parking Lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 35]} />
        <meshStandardMaterial color="#34495e" roughness={0.9} />
      </mesh>

      {/* Parking Grid Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[58, 33]} />
        <meshStandardMaterial color="#ecf0f1" transparent opacity={0.3} />
      </mesh>

      {/* Parking Spots */}
      {Array.from({ length: totalSpots }).map((_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const occupied = i < parkedCars;
        const x = -24 + col * 7;
        const z = -12 + row * 6;

        return (
          <group key={i} position={[x, 0.1, z]}>
            {/* Parking Spot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 4]} />
              <meshStandardMaterial 
                color={occupied ? "#e74c3c" : "#27ae60"} 
                transparent 
                opacity={0.7} 
              />
            </mesh>

            {/* Parked Car */}
            {occupied && (
              <ModernCar 
                position={[0, 0.5, 0]} 
                color={getRandomCarColor()}
              />
            )}

            {/* Spot Number */}
            <Text
              position={[0, 0.2, 1.8]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {i + 1}
            </Text>
          </group>
        );
      })}

      {/* Parking Sign */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 3, 0]}
          fontSize={0.8}
          color="#3498db"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          🅿️ SCHOOL PARKING
        </Text>
      </Float>

      {/* Live Parking Info */}
      <Html position={[0, 8, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          textAlign: 'center',
          minWidth: '220px',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🅿️ School Parking</h4>
          <div style={{ fontSize: '14px' }}>
            <div>🚗 Available: {totalSpots - parkedCars}</div>
            <div>🚙 Occupied: {parkedCars}</div>
            <div>📊 {Math.round((parkedCars / totalSpots) * 100)}% Full</div>
          </div>
          <div style={{ 
            marginTop: '8px', 
            padding: '5px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            Live updates every few seconds
          </div>
        </div>
      </Html>

      {/* Animated Entry/Exit Gates */}
      <ParkingGate position={[-30, 0, 0]} type="entry" />
      <ParkingGate position={[30, 0, 0]} type="exit" />
    </group>
  );
}

// Parking Gate Component
function ParkingGate({ position, type }: BuildingProps & { type: 'entry' | 'exit' }): JSX.Element {
  const gateRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (gateRef.current && Math.random() < 0.02) {
      // Simulate gate opening/closing
      gateRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 5) * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={gateRef} position={[0, 2, 0]} castShadow>
        <boxGeometry args={[0.5, 4, 0.1]} />
        <meshStandardMaterial color={type === 'entry' ? '#27ae60' : '#e74c3c'} />
      </mesh>
      <Text position={[0, 4, 0]} fontSize={0.3} color="white" anchorX="center">
        {type === 'entry' ? '⬆️ ENTRY' : '⬇️ EXIT'}
      </Text>
    </group>
  );
}

// MODERN HOSPITAL - Enhanced with Medical Features
function ModernHospital({ position }: BuildingProps): JSX.Element {
  const [patientCount, setPatientCount] = useState<number>(150);
  
  useFrame(() => {
    if (Math.random() < 0.005) {
      setPatientCount(prev => prev + (Math.random() < 0.5 ? 1 : -1));
    }
  });

  return (
    <group position={position}>
      {/* Main Hospital Building */}
      <mesh castShadow receiveShadow position={[0, 20, 0]}>
        <boxGeometry args={[40, 40, 30]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Red Cross Symbol */}
      <group position={[0, 20, 15.2]}>
        <mesh>
          <boxGeometry args={[8, 1.5, 0.4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI/2]}>
          <boxGeometry args={[8, 1.5, 0.4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>

      {/* Glass Windows */}
      {[0, 1, 2, 3].map(floor => (
        <group key={floor} position={[0, -15 + floor * 10, 15.1]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-16 + i * 4.5, 0, 0]}>
              <boxGeometry args={[3, 6, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Helipad on Roof */}
      <Helipad position={[0, 40.1, 0]} />

      {/* Hospital Name */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 45, 15.3]}
          fontSize={1.2}
          color="#e74c3c"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          🏥 CITY GENERAL HOSPITAL
        </Text>
      </Float>

      {/* Emergency Wing */}
      <mesh castShadow receiveShadow position={[20, 10, 0]}>
        <boxGeometry args={[15, 20, 20]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      {/* Hospital Parking */}
      <HospitalParking position={[0, 0, -35]} initialCars={35} totalSpots={60} />

      {/* Medical Info Display */}
      <Html position={[0, 50, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: 'white',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          border: '3px solid #c0392b',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold' }}>
            🏥 City General Hospital
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🛏️ 300 Beds</div>
              <div>👨‍⚕️ 120 Doctors</div>
              <div>👩‍⚕️ 200 Nurses</div>
              <div>🏢 8 Departments</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🚑 Emergency 24/7</div>
              <div>💊 Pharmacy</div>
              <div>🔬 Research Center</div>
              <div>🏆 JCI Accredited</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            fontSize: '13px',
            backdropFilter: 'blur(5px)'
          }}>
            <div>✅ Emergency & Trauma Care</div>
            <div>✅ Surgery & ICU Facilities</div>
            <div>✅ Maternity & Pediatrics</div>
            <div>✅ Cardiology & Neurology</div>
          </div>

          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            Current Patients: {patientCount}
          </div>
        </div>
      </Html>

      {/* Ambulance Area */}
      <AmbulanceBay position={[25, 0, 10]} />

      {/* Medical Helicopter */}
      <MedicalHelicopter position={[0, 45, 0]} />
    </group>
  );
}

// Helipad Component
function Helipad({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <Text position={[0, 0.2, 0]} fontSize={0.8} color="white" anchorX="center" rotation={[Math.PI/2, 0, 0]}>
        H
      </Text>
    </group>
  );
}

// Medical Helicopter Component
function MedicalHelicopter({ position }: BuildingProps): JSX.Element {
  const helicopterRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (helicopterRef.current) {
      helicopterRef.current.position.y = 45 + Math.sin(state.clock.getElapsedTime() * 2) * 2;
      helicopterRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={helicopterRef} position={position}>
        {/* Helicopter Body */}
        <mesh castShadow>
          <boxGeometry args={[3, 1, 4]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Red Cross */}
        <mesh position={[0, 0, 2.1]}>
          <boxGeometry args={[1.5, 0.6, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        {/* Rotor */}
        <mesh position={[0, 1, 0]} rotation={[0, 0, Date.now() * 0.01]}>
          <boxGeometry args={[6, 0.1, 0.5]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </Float>
  );
}

// HOSPITAL PARKING with Emergency Zones
function HospitalParking({ position, initialCars = 35, totalSpots = 60 }: ParkingProps): JSX.Element {
  const [parkedCars, setParkedCars] = useState<number>(initialCars);

  useFrame(() => {
    if (Math.random() < 0.008) {
      setParkedCars(prev => {
        const change = Math.random() < 0.5 ? 1 : -1;
        return Math.max(15, Math.min(totalSpots, prev + change));
      });
    }
  });

  return (
    <group position={position}>
      {/* Parking Lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 40]} />
        <meshStandardMaterial color="#34495e" roughness={0.9} />
      </mesh>

      {/* Emergency Parking Zone */}
      <mesh position={[-20, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#e74c3c" transparent opacity={0.7} />
      </mesh>
      <Text position={[-20, 0.2, 0]} fontSize={0.4} color="white" anchorX="center" fontWeight="bold">
        🚨 EMERGENCY ONLY
      </Text>

      {/* Doctor's Parking */}
      <mesh position={[20, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
      </mesh>
      <Text position={[20, 0.2, 0]} fontSize={0.4} color="white" anchorX="center" fontWeight="bold">
        👨‍⚕️ DOCTORS
      </Text>

      {/* Regular Parking Spots */}
      {Array.from({ length: totalSpots }).map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        const occupied = i < parkedCars;
        const x = -30 + col * 6;
        const z = -12 + row * 6;

        return (
          <group key={i} position={[x, 0.1, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 4]} />
              <meshStandardMaterial color={occupied ? "#95a5a6" : "#27ae60"} transparent opacity={0.7} />
            </mesh>

            {occupied && (
              <ModernCar 
                position={[0, 0.5, 0]} 
                color={getRandomCarColor()}
              />
            )}

            <Text position={[0, 0.2, 1.5]} fontSize={0.15} color="white" anchorX="center">
              {i + 1}
            </Text>
          </group>
        );
      })}

      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 3, 0]}
          fontSize={0.8}
          color="#e74c3c"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          🅿️ HOSPITAL PARKING
        </Text>
      </Float>
    </group>
  );
}

// Enhanced CULTURAL CENTER
function CulturalCenter({ position }: BuildingProps): JSX.Element {
  const [eventCount, setEventCount] = useState<number>(12);
  
  useFrame(() => {
    if (Math.random() < 0.002) {
      setEventCount(prev => prev + (Math.random() < 0.5 ? 1 : -1));
    }
  });

  return (
    <group position={position}>
      {/* Main Cultural Center Building */}
      <mesh castShadow receiveShadow position={[0, 12, 0]}>
        <boxGeometry args={[30, 24, 25]} />
        <meshStandardMaterial color="#8e44ad" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Artistic Facade */}
      <mesh position={[0, 12, 12.6]}>
        <boxGeometry args={[28, 22, 0.2]} />
        <meshStandardMaterial color="#9b59b6" transparent opacity={0.7} />
      </mesh>

      {/* Cultural Symbols */}
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <group position={[0, 12, 12.8]}>
          <Text fontSize={0.8} color="#f1c40f" anchorX="center" anchorY="middle">
            🎭🎵🎨
          </Text>
        </group>
      </Float>

      {/* Outdoor Amphitheater */}
      <Amphitheater position={[25, 0, 0]} />
      
      {/* Art Garden */}
      <ArtGarden position={[-25, 0, 0]} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 26, 12.8]}
          fontSize={1.2}
          color="#f1c40f"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          🎪 CULTURAL CENTER
        </Text>
      </Float>

      <Html position={[0, 30, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          minWidth: '320px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>🎪 City Cultural Center</h3>
          <div style={{fontSize: '14px'}}>
            <div>🎭 Theater & Performances</div>
            <div>🎨 Art Exhibitions</div>
            <div>🎵 Music Concerts</div>
            <div>💃 Dance Studios</div>
          </div>
          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            Upcoming Events: {eventCount}
          </div>
        </div>
      </Html>

      {/* Rotating Art Installation */}
      <RotatingArt position={[0, 15, -12]} />
    </group>
  );
}

// Amphitheater Component
function Amphitheater({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#d35400" roughness={0.8} />
      </mesh>
      
      {/* Stage */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[8, 2, 4]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      
      {/* Seating */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.5, -5 - i * 2]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[12 - i, 1, 1.5]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
      ))}
    </group>
  );
}

// Art Garden Component
function ArtGarden({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#27ae60" roughness={0.9} />
      </mesh>
      
      {/* Sculptures */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-8 + i * 4, 2, 0]} castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={getRandomColor()} />
        </mesh>
      ))}
    </group>
  );
}

// Rotating Art Installation
function RotatingArt({ position }: BuildingProps): JSX.Element {
  const artRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (artRef.current) {
      artRef.current.rotation.y = state.clock.getElapsedTime();
    }
  });

  return (
    <group ref={artRef} position={position}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[3, 0, 0]} rotation={[0, i * Math.PI / 3, 0]} castShadow>
          <boxGeometry args={[0.5, 4, 0.5]} />
          <meshStandardMaterial color={getRandomColor()} />
        </mesh>
      ))}
    </group>
  );
}

// Enhanced WATER FILTERING CENTER
function WaterFilteringCenter({ position }: BuildingProps): JSX.Element {
  const [waterLevel, setWaterLevel] = useState<number>(75);
  
  useFrame(() => {
    if (Math.random() < 0.01) {
      setWaterLevel(prev => Math.max(50, Math.min(100, prev + (Math.random() - 0.5) * 2));
    }
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[25, 16, 20]} />
        <meshStandardMaterial color="#3498db" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Animated Water Tanks */}
      <WaterTank position={[10, 12, 0]} waterLevel={waterLevel} />
      <WaterTank position={[-10, 12, 0]} waterLevel={waterLevel} />

      {/* Filtration System */}
      <FiltrationSystem position={[0, 4, 10]} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 20, 0]}
          fontSize={0.8}
          color="#3498db"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          💧 WATER FILTERING
        </Text>
      </Float>

      <Html position={[0, 25, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          minWidth: '250px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <h4>💧 Water Treatment Plant</h4>
          <div>Capacity: 5M liters/day</div>
          <div>Quality: 99.9% Pure</div>
          <div>Storage: {waterLevel}% Full</div>
        </div>
      </Html>

      {/* Water Particles */}
      <Sparkles 
        count={20} 
        scale={[30, 20, 25]} 
        size={2} 
        speed={0.5} 
        color="#3498db"
      />
    </group>
  );
}

// Water Tank Component
function WaterTank({ position, waterLevel }: BuildingProps & { waterLevel: number }): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[4, 4, 8, 16]} />
        <meshStandardMaterial color="#2980b9" transparent opacity={0.7} />
      </mesh>
      
      {/* Water Level */}
      <mesh position={[0, (waterLevel / 100) * 6 - 3, 0]} castShadow>
        <cylinderGeometry args={[3.8, 3.8, (waterLevel / 100) * 6, 16]} />
        <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Filtration System Component
function FiltrationSystem({ position }: BuildingProps): JSX.Element {
  const filterRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (filterRef.current) {
      filterRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group ref={filterRef} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[2, 2, 4, 16]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
    </group>
  );
}

// CLOUD DATA CENTER - Enhanced
function CloudDataCenter({ position }: BuildingProps): JSX.Element {
  const [time, setTime] = useState<number>(0);
  const [dataFlow, setDataFlow] = useState<number>(2000);
  
  useFrame((state) => {
    setTime(state.clock.getElapsedTime());
    
    if (Math.random() < 0.05) {
      setDataFlow(prev => prev + (Math.random() - 0.5) * 100);
    }
  });

  return (
    <group position={position}>
      {/* Main Data Center Building */}
      <mesh castShadow receiveShadow position={[0, 10, 0]}>
        <boxGeometry args={[35, 20, 25]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Server Racks Visualization */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-12 + i * 5, 5, 0]} castShadow>
          <boxGeometry args={[3, 10, 1]} />
          <meshStandardMaterial 
            color="#2c3e50"
            emissive="#00ff00"
            emissiveIntensity={Math.sin(time * 2 + i) * 0.3}
          />
        </mesh>
      ))}

      {/* Cooling Towers */}
      <CoolingTower position={[15, 8, 8]} />
      <CoolingTower position={[15, 8, -8]} />

      {/* Data Center Name */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 22, 0]}
          fontSize={1}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          ☁️ CLOUD DATA CENTER
        </Text>
      </Float>

      {/* Real-time Data Display */}
      <Html position={[0, 28, 0]} transform>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#00ff00',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 0 20px #00ff00',
          minWidth: '350px',
          fontFamily: 'monospace',
          border: '2px solid #00ff00',
          backdropFilter: 'blur(5px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>☁️ CITY CLOUD DATA CENTER</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            fontSize: '12px'
          }}>
            <div>
              <div>💾 Storage: 15 PB</div>
              <div>⚡ Processing: 25k CPUs</div>
              <div>🔒 Security: Level 5</div>
              <div>🔄 Uptime: 99.99%</div>
            </div>
            
            <div>
              <div>🌐 Connected: 50k Devices</div>
              <div>📊 Data Flow: {Math.round(dataFlow)} GB/s</div>
              <div>❄️ Cooling: -5°C</div>
              <div>🔋 Power: 10 MW</div>
            </div>
          </div>

          <div style={{ 
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(0, 255, 0, 0.1)',
            borderRadius: '5px',
            fontSize: '11px',
            textAlign: 'center'
          }}>
            {`>> REAL-TIME DATA SYNC: ${Math.floor(time * 10)} GB PROCESSED <<`}
          </div>
        </div>
      </Html>

      {/* Animated data particles */}
      <DataParticles count={30} />
    </group>
  );
}

// Cooling Tower Component
function CoolingTower({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[3, 4, 6, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.5} />
      </mesh>
      
      {/* Steam Effect */}
      <Sparkles 
        count={10} 
        scale={[4, 3, 4]} 
        size={2} 
        speed={1} 
        color="#ffffff"
      />
    </group>
  );
}

// Data Particles Component
function DataParticles({ count }: { count: number }): JSX.Element {
  return (
    <Sparkles 
      count={count} 
      scale={[40, 25, 30]} 
      size={3} 
      speed={0.5} 
      color="#00ff00"
    />
  );
}

// MODERN CAR DESIGN - Enhanced
function ModernCar({ position, color = "#e74c3c" }: BuildingProps & { color?: string }): JSX.Element {
  const carRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (carRef.current && Math.random() < 0.1) {
      // Slight car movement
      carRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 5) * 0.05;
    }
  });

  return (
    <group ref={carRef} position={position}>
      {/* Car Body */}
      <mesh castShadow>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.4, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.7, 0.2, 0.8]} />
        <meshStandardMaterial color="#2c3e50" transparent opacity={0.7} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0, 0.3, 0.51]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Wheels */}
      {[-0.6, 0.6].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.2, 0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[x, -0.2, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      ))}

      {/* Spoiler */}
      <mesh position={[0, 0.5, -0.51]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}

// Enhanced AMBULANCE BAY
function AmbulanceBay({ position }: BuildingProps): JSX.Element {
  const ambulanceRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ambulanceRef.current && Math.random() < 0.02) {
      // Simulate ambulance movement
      ambulanceRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 2) * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow position={[0, 2, 0]}>
        <boxGeometry args={[3, 2.5, 6]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      {/* Ambulance */}
      <group ref={ambulanceRef}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2.5, 1.5, 5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Red Cross */}
        <mesh position={[0, 1.5, 2.6]}>
          <boxGeometry args={[1, 0.8, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>
      
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 3, 0]} fontSize={0.3} color="white" anchorX="center">
          🚑 AMBULANCE
        </Text>
      </Float>

      {/* Emergency Lights */}
      <EmergencyLights position={[0, 2.5, 0]} />
    </group>
  );
}

// Emergency Lights Component
function EmergencyLights({ position }: BuildingProps): JSX.Element {
  const lightRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.rotation.y = state.clock.getElapsedTime() * 5;
    }
  });

  return (
    <group ref={lightRef} position={position}>
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Enhanced ROAD SYSTEM
function RoadSystem(): JSX.Element {
  return (
    <group>
      {/* Main Horizontal Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[400, 15]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.9} />
      </mesh>

      {/* Main Vertical Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[15, 400]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.9} />
      </mesh>

      {/* Road Markings */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-190 + i * 10, -1.88, 0]}>
          <planeGeometry args={[4, 0.5]} />
          <meshStandardMaterial color="#f1c40f" emissive="#f39c12" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Moving Cars on Roads */}
      <MovingCars />
    </group>
  );
}

// Moving Cars Component
function MovingCars(): JSX.Element {
  const carsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (carsRef.current) {
      carsRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 50;
      carsRef.current.position.z = Math.cos(state.clock.getElapsedTime() * 0.3) * 50;
    }
  });

  return (
    <group ref={carsRef}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ModernCar 
          key={i}
          position={[i * 10 - 35, 0.5, 0]}
          color={getRandomCarColor()}
        />
      ))}
    </group>
  );
}

// City Lights Component
function CityLights(): JSX.Element {
  return (
    <group>
      {/* Street Lights */}
      {Array.from({ length: 20 }).map((_, i) => (
        <StreetLight 
          key={i}
          position={[-180 + i * 20, 0, 8]}
        />
      ))}
      
      {/* Building Lights */}
      <pointLight position={[0, 30, 0]} intensity={0.5} color="#ffffff" />
      <pointLight position={[100, 40, 100]} intensity={0.3} color="#3498db" />
      <pointLight position={[-100, 35, -100]} intensity={0.4} color="#9b59b6" />
    </group>
  );
}

// Street Light Component
function StreetLight({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      {/* Light Pole */}
      <mesh castShadow position={[0, 5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      
      {/* Light */}
      <mesh position={[0, 10, 0]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f39c12" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Light Beam */}
      <pointLight position={[0, 9, 0]} intensity={0.8} color="#f1c40f" distance={20} />
    </group>
  );
}

// SUPPORTING BUILDINGS (Enhanced versions)

function Library({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[12, 12, 10]} />
        <meshStandardMaterial color="#8b4513" metalness={0.2} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 13, 0]} fontSize={0.5} color="#f39c12" anchorX="center">
          📚 LIBRARY
        </Text>
      </Float>
    </group>
  );
}

function College({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[15, 16, 12]} />
        <meshStandardMaterial color="#3498db" metalness={0.3} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 17, 0]} fontSize={0.5} color="#2c3e50" anchorX="center">
          🎓 COLLEGE
        </Text>
      </Float>
    </group>
  );
}

function MedicalCenter({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 5, 0]}>
        <boxGeometry args={[10, 10, 8]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 11, 0]} fontSize={0.4} color="white" anchorX="center">
          🏥 CLINIC
        </Text>
      </Float>
    </group>
  );
}

function Pharmacy({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 4, 0]}>
        <boxGeometry args={[8, 8, 6]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 9, 0]} fontSize={0.4} color="white" anchorX="center">
          💊 PHARMACY
        </Text>
      </Float>
    </group>
  );
}

function Museum({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 7, 0]}>
        <boxGeometry args={[14, 14, 11]} />
        <meshStandardMaterial color="#d35400" metalness={0.3} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 15, 0]} fontSize={0.5} color="#f39c12" anchorX="center">
          🏛️ MUSEUM
        </Text>
      </Float>
    </group>
  );
}

function ArtGallery({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[12, 12, 9]} />
        <meshStandardMaterial color="#9b59b6" metalness={0.3} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 13, 0]} fontSize={0.4} color="#ecf0f1" anchorX="center">
          🎨 GALLERY
        </Text>
      </Float>
    </group>
  );
}

function TechPark({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[16, 16, 13]} />
        <meshStandardMaterial color="#34495e" metalness={0.5} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 17, 0]} fontSize={0.5} color="#3498db" anchorX="center">
          💻 TECH PARK
        </Text>
      </Float>
    </group>
  );
}

function ResearchCenter({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 9, 0]}>
        <boxGeometry args={[18, 18, 14]} />
        <meshStandardMaterial color="#e67e22" metalness={0.3} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 19, 0]} fontSize={0.5} color="#2c3e50" anchorX="center">
          🔬 RESEARCH
        </Text>
      </Float>
    </group>
  );
}

function ShoppingMall({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 15, 0]}>
        <boxGeometry args={[50, 30, 40]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.2} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 32, 0]} fontSize={1.2} color="#ecf0f1" anchorX="center" fontWeight="bold">
          🛍️ CITY MALL
        </Text>
      </Float>
    </group>
  );
}

function OfficeTower({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 25, 0]}>
        <boxGeometry args={[12, 50, 12]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.5} roughness={0.3} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 52, 0]} fontSize={0.6} color="#2c3e50" anchorX="center">
          🏢 OFFICE
        </Text>
      </Float>
    </group>
  );
}

function BusinessCenter({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 12, 0]}>
        <boxGeometry args={[20, 24, 18]} />
        <meshStandardMaterial color="#f39c12" metalness={0.3} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 26, 0]} fontSize={0.7} color="#2c3e50" anchorX="center">
          💼 BUSINESS
        </Text>
      </Float>
    </group>
  );
}

function PowerPlant({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 10, 0]}>
        <boxGeometry args={[22, 20, 18]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.4} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 22, 0]} fontSize={0.6} color="#e74c3c" anchorX="center">
          ⚡ POWER PLANT
        </Text>
      </Float>
    </group>
  );
}

function TransportHub({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[25, 16, 20]} />
        <meshStandardMaterial color="#27ae60" metalness={0.3} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 18, 0]} fontSize={0.7} color="#2c3e50" anchorX="center">
          🚆 TRANSPORT
        </Text>
      </Float>
    </group>
  );
}

function ResidentialComplex({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[18, 12, 15]} />
        <meshStandardMaterial color="#e67e22" metalness={0.2} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 14, 0]} fontSize={0.5} color="#2c3e50" anchorX="center">
          🏠 RESIDENTIAL
        </Text>
      </Float>
    </group>
  );
}

function CentralPark({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[25, 32]} />
        <meshStandardMaterial color="#27ae60" roughness={0.9} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 2, 0]} fontSize={0.8} color="#2ecc71" anchorX="center">
          🌳 CENTRAL PARK
        </Text>
      </Float>
    </group>
  );
}

function CityPark({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#27ae60" roughness={0.9} />
      </mesh>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text position={[0, 1, 0]} fontSize={0.5} color="#2ecc71" anchorX="center">
          🌿 PARK
        </Text>
      </Float>
    </group>
  );
}

// NEW COMPONENTS

function Playground({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <PlaygroundArea position={[0, 0, 0]} />
    </group>
  );
}

function SculptureGarden({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      <ArtGarden position={[0, 0, 0]} />
    </group>
  );
}

function SatelliteDish({ position }: BuildingProps): JSX.Element {
  const dishRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (dishRef.current) {
      dishRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={dishRef} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <mesh position={[0, 2, 0]} rotation={[Math.PI / 4, 0, 0]} castShadow>
        <circleGeometry args={[3, 16]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} />
      </mesh>
    </group>
  );
}

function Fountain({ position }: BuildingProps): JSX.Element {
  const fountainRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (fountainRef.current) {
      fountainRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={fountainRef} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3, 4, 0.5, 16]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      {/* Water Jets */}
      <Sparkles 
        count={15} 
        scale={[2, 2, 2]} 
        size={1} 
        speed={2} 
        color="#3498db"
        position={[0, 2, 0]}
      />
    </group>
  );
}

function SolarFarm({ position }: BuildingProps): JSX.Element {
  return (
    <group position={position}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[-8 + (i % 5) * 4, 1, -8 + Math.floor(i / 5) * 4]} rotation={[Math.PI / 3, 0, 0]}>
          <boxGeometry args={[3, 0.1, 2]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <Text position={[0, 3, 0]} fontSize={0.6} color="#f39c12" anchorX="center">
        ☀️ SOLAR FARM
      </Text>
    </group>
  );
}

// HELPER FUNCTIONS
function getRandomCarColor(): string {
  const colors = [
    "#e74c3c", "#3498db", "#2ecc71", "#f39c12", 
    "#9b59b6", "#1abc9c", "#d35400", "#34495e",
    "#e67e22", "#27ae60", "#2980b9", "#8e44ad"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomColor(): string {
  const colors = [
    "#e74c3c", "#3498db", "#2ecc71", "#f39c12", 
    "#9b59b6", "#1abc9c", "#d35400", "#34495e"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
