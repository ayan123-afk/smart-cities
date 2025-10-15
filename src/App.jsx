import React, { useRef, useState, useEffect, useFrame } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Html, Text, Sky, ContactShadows, Sparkles, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Main City Component
export default function SmartCity() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
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
      </Canvas>
    </div>
  );
}

// Main City Layout
function CityLayout() {
  return (
    <group>
      {/* GROUND */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>

      {/* SEPARATED BUILDINGS IN DIFFERENT AREAS */}
      
      {/* Educational District - Top Left */}
      <ModernSchool position={[-120, 0, 120]} />
      <Library position={[-150, 0, 80]} />
      <College position={[-80, 0, 150]} />
      
      {/* Medical District - Top Right */}
      <ModernHospital position={[120, 0, 120]} />
      <MedicalCenter position={[150, 0, 80]} />
      <Pharmacy position={[80, 0, 150]} />
      
      {/* Cultural District - Bottom Left */}
      <CulturalCenter position={[-120, 0, -120]} />
      <Museum position={[-150, 0, -80]} />
      <ArtGallery position={[-80, 0, -150]} />
      
      {/* Technology District - Bottom Right */}
      <CloudDataCenter position={[120, 0, -120]} />
      <TechPark position={[150, 0, -80]} />
      <ResearchCenter position={[80, 0, -150]} />
      
      {/* Central Business District */}
      <ShoppingMall position={[0, 0, 0]} />
      <OfficeTower position={[-40, 0, -40]} />
      <BusinessCenter position={[40, 0, 40]} />
      
      {/* Infrastructure */}
      <WaterFilteringCenter position={[0, 0, 120]} />
      <PowerPlant position={[0, 0, -120]} />
      <TransportHub position={[120, 0, 0]} />
      
      {/* Residential Areas */}
      <ResidentialComplex position={[-120, 0, 40]} />
      <ResidentialComplex position={[120, 0, -40]} />
      <ResidentialComplex position={[-40, 0, 120]} />
      <ResidentialComplex position={[40, 0, -120]} />
      
      {/* Roads */}
      <RoadSystem />
      
      {/* Parks and Green Spaces */}
      <CentralPark position={[0, 0, 60]} />
      <CityPark position={[60, 0, 0]} />
      <CityPark position={[-60, 0, 0]} />
      <CityPark position={[0, 0, -60]} />
    </group>
  );
}

// MODERN SCHOOL BUILDING - Enhanced with Vertical Gardens
function ModernSchool({ position }) {
  const [time, setTime] = useState(0);
  
  useFrame((state) => {
    setTime(state.clock.getElapsedTime());
  });

  return (
    <group position={position}>
      {/* Main School Building */}
      <mesh castShadow receiveShadow position={[0, 15, 0]}>
        <boxGeometry args={[35, 30, 25]} />
        <meshStandardMaterial color="#3498db" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Glass Facade */}
      <mesh position={[0, 15, 12.6]}>
        <boxGeometry args={[33, 28, 0.2]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} />
      </mesh>

      {/* VERTICAL GARDENS - Both Sides */}
      <VerticalGarden position={[17.6, 15, 0]} height={30} width={25} />
      <VerticalGarden position={[-17.6, 15, 0]} height={30} width={25} rotation={[0, Math.PI, 0]} />

      {/* Green Roof */}
      <mesh position={[0, 30.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[35, 25]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

      {/* Solar Panels on Roof */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-12 + i * 5, 30.2, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[4, 0.1, 3]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Main Entrance */}
      <mesh position={[0, 8, 12.7]}>
        <boxGeometry args={[8, 16, 0.3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* School Name */}
      <Text
        position={[0, 32, 12.8]}
        fontSize={1.5}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🏫 GREEN VALLEY SCHOOL
      </Text>

      {/* Playground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, 0, 0]} receiveShadow>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#82c91e" />
      </mesh>

      {/* Sports Court */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 18]} />
        <meshStandardMaterial color="#795548" />
      </mesh>

      {/* School Parking */}
      <SchoolParking position={[0, 0, -35]} />

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
          border: '3px solid #2c3e50'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold' }}>
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
              <div>👥 1500 Students</div>
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
            fontSize: '13px'
          }}>
            <div>✅ Science & Computer Labs</div>
            <div>✅ Library & Auditorium</div>
            <div>✅ Cafeteria & Gym</div>
            <div>✅ Sustainable Campus</div>
          </div>
        </div>
      </Html>

      {/* Floating particles for ambiance */}
      <Sparkles count={50} scale={[50, 30, 50]} size={2} speed={0.3} />
    </group>
  );
}

// VERTICAL GARDEN COMPONENT - Reusable
function VerticalGarden({ position, height = 20, width = 15, rotation = [0, 0, 0] }) {
  const plantsPerRow = Math.floor(width / 1.2);
  const rows = Math.floor(height / 1.5);

  return (
    <group position={position} rotation={rotation}>
      {/* Green Wall Background */}
      <mesh receiveShadow>
        <boxGeometry args={[0.3, height, width]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

      {/* Plants Grid */}
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: plantsPerRow }).map((_, col) => {
          const z = -width/2 + (col + 0.5) * (width / plantsPerRow);
          const y = -height/2 + (row + 0.5) * (height / rows);
          const plantSize = 0.3 + Math.random() * 0.2;
          const plantHeight = 0.4 + Math.random() * 0.3;
          
          return (
            <group key={`${row}-${col}`} position={[0.2, y, z]}>
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
          );
        })
      )}
    </group>
  );
}

// SCHOOL PARKING
function SchoolParking({ position }) {
  const [parkedCars, setParkedCars] = useState(25);
  const totalSpots = 50;

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
        <meshStandardMaterial color="#34495e" />
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
              <planeGeometry args={[5, 4} />
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

      {/* Live Parking Info */}
      <Html position={[0, 8, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          textAlign: 'center',
          minWidth: '220px'
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
    </group>
  );
}

// MODERN HOSPITAL - Enhanced with Medical Features
function ModernHospital({ position }) {
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 40.1, 0]} receiveShadow>
        <circleGeometry args={[6, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <Text position={[0, 40.2, 0]} fontSize={0.8} color="white" anchorX="center" rotation={[Math.PI/2, 0, 0]}>
        H
      </Text>

      {/* Hospital Name */}
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

      {/* Emergency Wing */}
      <mesh castShadow receiveShadow position={[20, 10, 0]}>
        <boxGeometry args={[15, 20, 20]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      {/* Hospital Parking */}
      <HospitalParking position={[0, 0, -35]} />

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
          border: '3px solid #c0392b'
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
            fontSize: '13px'
          }}>
            <div>✅ Emergency & Trauma Care</div>
            <div>✅ Surgery & ICU Facilities</div>
            <div>✅ Maternity & Pediatrics</div>
            <div>✅ Cardiology & Neurology</div>
          </div>
        </div>
      </Html>

      {/* Ambulance Area */}
      <AmbulanceBay position={[25, 0, 10]} />
    </group>
  );
}

// HOSPITAL PARKING with Emergency Zones
function HospitalParking({ position }) {
  const [parkedCars, setParkedCars] = useState(35);
  const totalSpots = 60;

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
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Emergency Parking Zone */}
      <mesh position={[-20, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8} />
        <meshStandardMaterial color="#e74c3c" transparent opacity={0.7} />
      </mesh>
      <Text position={[-20, 0.2, 0]} fontSize={0.4} color="white" anchorX="center" fontWeight="bold">
        🚨 EMERGENCY ONLY
      </Text>

      {/* Doctor's Parking */}
      <mesh position={[20, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8} />
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
              <planeGeometry args={[4, 4} />
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
    </group>
  );
}

// CULTURAL CENTER - Enhanced with Artistic Features
function CulturalCenter({ position }) {
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
      <group position={[0, 12, 12.8]}>
        <Text fontSize={0.8} color="#f1c40f" anchorX="center" anchorY="middle">
          🎭🎵🎨
        </Text>
      </group>

      {/* Outdoor Amphitheater */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#d35400" />
      </mesh>

      {/* Art Garden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

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

      <Html position={[0, 30, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          minWidth: '320px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>🎪 City Cultural Center</h3>
          <div style={{fontSize: '14px'}}>
            <div>🎭 Theater & Performances</div>
            <div>🎨 Art Exhibitions</div>
            <div>🎵 Music Concerts</div>
            <div>💃 Dance Studios</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// WATER FILTERING CENTER
function WaterFilteringCenter({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[25, 16, 20]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>

      {/* Water Tanks */}
      <mesh position={[10, 12, 0]} castShadow>
        <cylinderGeometry args={[4, 4, 8, 16]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      <mesh position={[-10, 12, 0]} castShadow>
        <cylinderGeometry args={[4, 4, 8, 16]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>

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

      <Html position={[0, 25, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          minWidth: '250px',
          textAlign: 'center'
        }}>
          <h4>💧 Water Treatment Plant</h4>
          <div>Capacity: 5M liters/day</div>
          <div>Quality: 99.9% Pure</div>
        </div>
      </Html>
    </group>
  );
}

// CLOUD DATA CENTER - Where All City Data is Stored
function CloudDataCenter({ position }) {
  const [time, setTime] = useState(0);
  
  useFrame((state) => {
    setTime(state.clock.getElapsedTime());
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
      <mesh position={[15, 8, 8]} castShadow>
        <cylinderGeometry args={[3, 4, 6, 16]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <mesh position={[15, 8, -8]} castShadow>
        <cylinderGeometry args={[3, 4, 6, 16]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {/* Data Center Name */}
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
          border: '2px solid #00ff00'
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
              <div>📊 Data Flow: 2 TB/s</div>
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
      <Sparkles 
        count={30} 
        scale={[40, 25, 30]} 
        size={3} 
        speed={0.5} 
        color="#00ff00"
      />
    </group>
  );
}

// MODERN CAR DESIGN - Reusable Component
function ModernCar({ position, color = "#e74c3c" }) {
  return (
    <group position={position}>
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

// AMBULANCE BAY
function AmbulanceBay({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 2, 0]}>
        <boxGeometry args={[3, 2.5, 6]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      {/* Ambulance */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2.5, 1.5, 5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <Text position={[0, 3, 0]} fontSize={0.3} color="white" anchorX="center">
        🚑 AMBULANCE
      </Text>
    </group>
  );
}

// ROAD SYSTEM
function RoadSystem() {
  return (
    <group>
      {/* Main Horizontal Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[400, 15]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Main Vertical Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[15, 400]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Road Markings */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-190 + i * 10, -1.88, 0]}>
          <planeGeometry args={[4, 0.5]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>
      ))}
    </group>
  );
}

// SUPPORTING BUILDINGS (Simplified versions)

function Library({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[12, 12, 10]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <Text position={[0, 13, 0]} fontSize={0.5} color="#f39c12" anchorX="center">
        📚 LIBRARY
      </Text>
    </group>
  );
}

function College({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[15, 16, 12]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text position={[0, 17, 0]} fontSize={0.5} color="#2c3e50" anchorX="center">
        🎓 COLLEGE
      </Text>
    </group>
  );
}

function MedicalCenter({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 5, 0]}>
        <boxGeometry args={[10, 10, 8]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Text position={[0, 11, 0]} fontSize={0.4} color="white" anchorX="center">
        🏥 CLINIC
      </Text>
    </group>
  );
}

function Pharmacy({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 4, 0]}>
        <boxGeometry args={[8, 8, 6]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text position={[0, 9, 0]} fontSize={0.4} color="white" anchorX="center">
        💊 PHARMACY
      </Text>
    </group>
  );
}

function Museum({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 7, 0]}>
        <boxGeometry args={[14, 14, 11]} />
        <meshStandardMaterial color="#d35400" />
      </mesh>
      <Text position={[0, 15, 0]} fontSize={0.5} color="#f39c12" anchorX="center">
        🏛️ MUSEUM
      </Text>
    </group>
  );
}

function ArtGallery({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[12, 12, 9]} />
        <meshStandardMaterial color="#9b59b6" />
      </mesh>
      <Text position={[0, 13, 0]} fontSize={0.4} color="#ecf0f1" anchorX="center">
        🎨 GALLERY
      </Text>
    </group>
  );
}

function TechPark({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[16, 16, 13]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <Text position={[0, 17, 0]} fontSize={0.5} color="#3498db" anchorX="center">
        💻 TECH PARK
      </Text>
    </group>
  );
}

function ResearchCenter({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 9, 0]}>
        <boxGeometry args={[18, 18, 14]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      <Text position={[0, 19, 0]} fontSize={0.5} color="#2c3e50" anchorX="center">
        🔬 RESEARCH
      </Text>
    </group>
  );
}

function ShoppingMall({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 15, 0]}>
        <boxGeometry args={[50, 30, 40]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Text position={[0, 32, 0]} fontSize={1.2} color="#ecf0f1" anchorX="center" fontWeight="bold">
        🛍️ CITY MALL
      </Text>
    </group>
  );
}

function OfficeTower({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 25, 0]}>
        <boxGeometry args={[12, 50, 12]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.5} />
      </mesh>
      <Text position={[0, 52, 0]} fontSize={0.6} color="#2c3e50" anchorX="center">
        🏢 OFFICE
      </Text>
    </group>
  );
}

function BusinessCenter({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 12, 0]}>
        <boxGeometry args={[20, 24, 18]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      <Text position={[0, 26, 0]} fontSize={0.7} color="#2c3e50" anchorX="center">
        💼 BUSINESS
      </Text>
    </group>
  );
}

function PowerPlant({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 10, 0]}>
        <boxGeometry args={[22, 20, 18]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <Text position={[0, 22, 0]} fontSize={0.6} color="#e74c3c" anchorX="center">
        ⚡ POWER PLANT
      </Text>
    </group>
  );
}

function TransportHub({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[25, 16, 20]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text position={[0, 18, 0]} fontSize={0.7} color="#2c3e50" anchorX="center">
        🚆 TRANSPORT
      </Text>
    </group>
  );
}

function ResidentialComplex({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[18, 12, 15]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      <Text position={[0, 14, 0]} fontSize={0.5} color="#2c3e50" anchorX="center">
        🏠 RESIDENTIAL
      </Text>
    </group>
  );
}

function CentralPark({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[25, 32]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.8} color="#2ecc71" anchorX="center">
        🌳 CENTRAL PARK
      </Text>
    </group>
  );
}

function CityPark({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.5} color="#2ecc71" anchorX="center">
        🌿 PARK
      </Text>
    </group>
  );
}

// HELPER FUNCTIONS
function getRandomCarColor() {
  const colors = [
    "#e74c3c", "#3498db", "#2ecc71", "#f39c12", 
    "#9b59b6", "#1abc9c", "#d35400", "#34495e",
    "#e67e22", "#27ae60", "#2980b9", "#8e44ad"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
