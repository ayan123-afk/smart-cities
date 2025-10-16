import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

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
  // Water Plant State
  waterPlant: {
    isProcessing: false,
    processTime: 0,
    waterQuality: 95,
    filteredWater: 0,
    efficiency: 85
  },
  setWaterPlant: (plant) => set({ waterPlant: plant })
}))

/* ----- ENHANCED STREET LIGHTS ----- */
function StreetLight({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const streetLightsOn = useStore((s) => s.streetLightsOn)
  
  const isOn = streetLightsOn || timeOfDay === 'night'

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      <mesh position={[0, 6, 0.5]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#444444" />
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
  )
}

/* ----- ENHANCED STREET LIGHT SYSTEM ----- */
function StreetLightSystem() {
  const lightPositions = [
    // Main roads
    ...Array.from({ length: 20 }).map((_, i) => [-50 + i * 5, 0, 0]),
    ...Array.from({ length: 20 }).map((_, i) => [0, 0, -50 + i * 5]),
    ...Array.from({ length: 16 }).map((_, i) => [-40 + i * 5, 0, -25]),
    ...Array.from({ length: 16 }).map((_, i) => [-40 + i * 5, 0, 25]),
    ...Array.from({ length: 16 }).map((_, i) => [-25, 0, -40 + i * 5]),
    ...Array.from({ length: 16 }).map((_, i) => [25, 0, -40 + i * 5]),
    
    // District lighting
    [15, 0, 15], [-15, 0, 15], [0, 0, 0], [-8, 0, -2], [8, 0, -6],
    [10, 0, 25], [-10, 0, 25], [0, 0, 20],
    [-30, 0, 15], [30, 0, -15], [-25, 0, 25], [25, 0, -25],
    [-20, 0, -30], [20, 0, 30], [-10, 0, -25], [10, 0, 25],
    
    // New areas
    [-35, 0, -35], [35, 0, 35], [-35, 0, 35], [35, 0, -35],
    [0, 0, -45], [0, 0, 45], [-45, 0, 0], [45, 0, 0]
  ]

  return (
    <group>
      {lightPositions.map((pos, index) => (
        <StreetLight key={index} position={pos} />
      ))}
    </group>
  )
}

/* ----- ENHANCED BUILDING WITH NIGHT LIGHTS ----- */
function EnhancedBuilding({ 
  position = [0, 0, 0], 
  height = 12,
  color = "#4a6572", 
  name = "Premium Building",
  hasTurbine = false,
  hasSolar = true,
  windows = true
}) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: position[1] + height/2,
      z: position[2],
      lookAt: { x: position[0], y: position[1], z: position[2] }
    })
  }

  return (
    <group position={position}>
      {/* Main Building Structure */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[5, height, 5]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Enhanced Architectural Details */}
      <mesh position={[0, height/2 + 0.3, 0]} castShadow>
        <boxGeometry args={[5.4, 0.6, 5.4]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Corner Pillars */}
      {[[2.4, 2.4], [2.4, -2.4], [-2.4, 2.4], [-2.4, -2.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} castShadow>
          <boxGeometry args={[0.4, height + 0.6, 0.4]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.4} />
        </mesh>
      ))}

      {/* Enhanced Windows with Night Lighting */}
      {windows && (
        <group>
          {Array.from({ length: Math.floor(height / 3) }).map((_, floor) =>
            [-1.5, 0, 1.5].map((side, i) => (
              <group key={`${floor}-${side}`}>
                <mesh
                  position={[2.51, (floor * 3) - height/2 + 3, side * 1.2]}
                  castShadow
                >
                  <boxGeometry args={[0.02, 2, 1]} />
                  <meshStandardMaterial 
                    color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
                    transparent 
                    opacity={timeOfDay === 'night' ? 0.9 : 0.7}
                    emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
                    emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
                  />
                </mesh>
                <mesh position={[2.5, (floor * 3) - height/2 + 3, side * 1.2]} castShadow>
                  <boxGeometry args={[0.04, 2.1, 1.05]} />
                  <meshStandardMaterial color="#2c3e50" />
                </mesh>
              </group>
            ))
          )}
        </group>
      )}
      
      {hasSolar && (
        <group position={[0, height/2 + 0.8, 0]}>
          <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
          <SolarPanel position={[2.2, 0, 1.5]} rotation={[0, Math.PI/4, 0]} />
          <SolarPanel position={[-2.2, 0, 1.5]} rotation={[0, -Math.PI/4, 0]} />
        </group>
      )}

      {hasTurbine && (
        <WindTurbine position={[0, height/2, 0]} />
      )}

      <Text
        position={[0, height/2 + 2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {name}
      </Text>
    </group>
  )
}

/* ----- ENHANCED WATER FILTERING PLANT ----- */
function WaterFilteringPlant({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const waterPlant = useStore((s) => s.waterPlant)
  const setWaterPlant = useStore((s) => s.setWaterPlant)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const [waterParticles, setWaterParticles] = useState([])
  const [filterActive, setFilterActive] = useState(false)

  // Water processing simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterPlant(prev => {
        const shouldProcess = Math.random() > 0.7 && !prev.isProcessing
        const isProcessing = shouldProcess ? true : (prev.isProcessing && prev.processTime < 2)
        
        const newProcessTime = isProcessing ? prev.processTime + 0.5 : 0
        const newFilteredWater = isProcessing ? prev.filteredWater + 10 : prev.filteredWater
        const newWaterQuality = Math.max(80, Math.min(99, prev.waterQuality + (Math.random() - 0.5) * 5))
        
        if (isProcessing && !filterActive) {
          setFilterActive(true)
        } else if (!isProcessing && filterActive) {
          setFilterActive(false)
        }

        if (newProcessTime >= 2) {
          return {
            isProcessing: false,
            processTime: 0,
            waterQuality: newWaterQuality,
            filteredWater: newFilteredWater,
            efficiency: Math.max(75, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 3))
          }
        }

        return {
          ...prev,
          isProcessing,
          processTime: newProcessTime,
          waterQuality: newWaterQuality,
          filteredWater: newFilteredWater
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [setWaterPlant, filterActive])

  // Water particle effects
  useFrame((_, dt) => {
    if (filterActive && Math.random() < 0.3) {
      setWaterParticles(prev => [
        ...prev.slice(-10),
        { 
          id: Math.random(), 
          position: [Math.random() * 6 - 3, 8, Math.random() * 4 - 2],
          progress: 0,
          speed: 0.5 + Math.random() * 0.5
        }
      ])
    }

    setWaterParticles(prev => 
      prev.map(p => ({ 
        ...p, 
        progress: p.progress + dt * p.speed,
        position: [p.position[0], p.position[1] - dt * 2, p.position[2]]
      })).filter(p => p.progress < 3)
    )
  })

  function WaterParticle({ position, progress }) {
    return (
      <mesh position={position} castShadow>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial 
          color="#3498db" 
          transparent 
          opacity={1 - progress/3}
          emissive="#3498db"
          emissiveIntensity={0.3}
        />
      </mesh>
    )
  }

  function FilterTank({ position = [0, 0, 0], waterLevel = 0.7, isActive = false, label = "" }) {
    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, 3, 16]} />
          <meshStandardMaterial color="#34495e" transparent opacity={0.8} />
        </mesh>
        
        <mesh position={[0, (waterLevel * 2.8) - 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.95, 0.95, waterLevel * 2.7, 16]} />
          <meshStandardMaterial 
            color={isActive ? "#3498db" : "#2980b9"} 
            transparent 
            opacity={0.7}
            emissive={isActive ? "#3498db" : "#2980b9"}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.1, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>

        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>

        {isActive && (
          <pointLight 
            position={[0, 1, 0]} 
            color="#3498db"
            intensity={0.5}
            distance={3}
          />
        )}
      </group>
    )
  }

  function ProcessingPipe({ start, end, isActive = false }) {
    const pipeRef = useRef()
    const [particles, setParticles] = useState([])

    useFrame((_, dt) => {
      if (isActive && Math.random() < 0.4) {
        setParticles(prev => [
          ...prev.slice(-5),
          { id: Math.random(), progress: 0 }
        ])
      }

      setParticles(prev => 
        prev.map(p => ({ ...p, progress: p.progress + dt * 2 }))
          .filter(p => p.progress < 1)
      )
    })

    const direction = new THREE.Vector3().subVectors(end, start).normalize()
    const length = new THREE.Vector3().subVectors(end, start).length()

    return (
      <group>
        <mesh ref={pipeRef} position={start}>
          <cylinderGeometry args={[0.1, 0.1, length, 8]} />
          <meshStandardMaterial 
            color={isActive ? "#3498db" : "#7f8c8d"}
            emissive={isActive ? "#3498db" : "#000000"}
            emissiveIntensity={0.3}
          />
        </mesh>

        {particles.map(particle => {
          const particlePos = new THREE.Vector3().lerpVectors(start, end, particle.progress)
          return (
            <mesh key={particle.id} position={particlePos} castShadow>
              <sphereGeometry args={[0.06, 4, 4]} />
              <meshStandardMaterial 
                color="#3498db" 
                transparent 
                opacity={1 - particle.progress}
                emissive="#3498db"
                emissiveIntensity={0.5}
              />
            </mesh>
          )
        })}
      </group>
    )
  }

  return (
    <group position={position}>
      {/* Main Building */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 8,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[12, 6, 8]} />
        <meshStandardMaterial color="#3498db" roughness={0.6} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 3 }).map((_, floor) =>
        Array.from({ length: 4 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[-5, -2 + floor * 2, -3.9 + window * 2]}
            castShadow
          >
            <boxGeometry args={[0.1, 1.2, 1.5]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      {/* Roof */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[12.2, 0.3, 8.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Filter Tanks */}
      <FilterTank 
        position={[-3, 0, -2]} 
        waterLevel={0.8}
        isActive={waterPlant.isProcessing}
        label="INTAKE"
      />
      
      <FilterTank 
        position={[0, 0, 0]} 
        waterLevel={0.6}
        isActive={waterPlant.isProcessing}
        label="FILTER"
      />
      
      <FilterTank 
        position={[3, 0, 2]} 
        waterLevel={0.9}
        isActive={waterPlant.isProcessing}
        label="CLEAN"
      />

      {/* Processing Pipes */}
      <ProcessingPipe 
        start={[-3, 1, -2]}
        end={[0, 1, 0]}
        isActive={waterPlant.isProcessing}
      />
      
      <ProcessingPipe 
        start={[0, 1, 0]}
        end={[3, 1, 2]}
        isActive={waterPlant.isProcessing}
      />

      {/* Control Room */}
      <mesh position={[0, 2, -3.9]} castShadow>
        <boxGeometry args={[4, 2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {[0, 1].map(i => (
        <mesh key={i} position={[-1 + i * 2, 2, -3.89]} castShadow>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial 
            color={waterPlant.isProcessing ? "#00ff00" : "#ff4444"} 
            emissive={waterPlant.isProcessing ? "#00ff00" : "#ff4444"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Water Particles */}
      {waterParticles.map(particle => (
        <WaterParticle
          key={particle.id}
          position={particle.position}
          progress={particle.progress}
        />
      ))}

      {/* Chimney/Smokestack */}
      <mesh position={[4, 4, -2]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 4, 8]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {waterPlant.isProcessing && (
        <mesh position={[4, 6.5, -2]} castShadow>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial 
            color="#ecf0f1" 
            transparent 
            opacity={0.6}
            emissive="#ecf0f1"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      <Text
        position={[0, 4, 0]}
        fontSize={0.4}
        color="#3498db"
        anchorX="center"
        anchorY="middle"
      >
        💧 Water Plant
      </Text>

      <Html position={[0, 8, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #2980b9'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'white' }}>💧 Advanced Water Filtering Plant</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '12px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🔧 Status: <strong>{waterPlant.isProcessing ? 'PROCESSING' : 'STANDBY'}</strong></div>
              <div>💧 Quality: <strong>{Math.round(waterPlant.waterQuality)}%</strong></div>
              <div>📈 Efficiency: <strong>{Math.round(waterPlant.efficiency)}%</strong></div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>⏱️ Process: <strong>{Math.min(2, waterPlant.processTime).toFixed(1)}/2s</strong></div>
              <div>💦 Filtered: <strong>{waterPlant.filteredWater}L</strong></div>
              <div>🎯 Performance: <strong>{waterPlant.waterQuality > 90 ? 'EXCELLENT' : 'GOOD'}</strong></div>
            </div>
          </div>

          {waterPlant.isProcessing && (
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px', 
              borderRadius: '6px',
              marginBottom: '10px',
              animation: 'pulse 1s infinite'
            }}>
              <div style={{ fontWeight: 'bold', color: '#00ff00' }}>
                🔄 FILTERING WATER... {Math.round((waterPlant.processTime / 2) * 100)}%
              </div>
            </div>
          )}

          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <div><strong>🏭 Process Stages:</strong></div>
            <div>1. Intake → 2. Filtration → 3. Purification</div>
            <div>✅ Multi-stage filtering • ✅ Quality monitoring • ✅ Automated operation</div>
          </div>
        </div>
      </Html>

      {/* Workers */}
      <Person position={[2, 0, -1]} color="#2c3e50" speed={0.2} path={[
        [2, 0.5, -1], [1, 0.5, 0], [0, 0.5, 1], [-1, 0.5, 0], [-2, 0.5, -1]
      ]} />
      
      <group position={[-2, 0.5, 3]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          👨‍🔧
        </Text>
      </group>
    </group>
  )
}

/* ----- ENHANCED VERTICAL GARDEN BUILDING ----- */
function VerticalGardenBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const gardenSensors = useStore((s) => s.gardenSensors)
  const setGardenSensors = useStore((s) => s.setGardenSensors)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const [sensorData, setSensorData] = useState({
    soilMoisture: 65,
    temperature: 24,
    humidity: 45,
    waterLevel: 80,
    isWatering: false
  })

  const plantTypes = [
    { name: "🍋 Lemon", color: "#ffd700", height: 0.8, waterNeed: 70 },
    { name: "🍎 Apple", color: "#ff4444", height: 1.2, waterNeed: 65 },
    { name: "🍅 Tomato", color: "#ff6b6b", height: 0.6, waterNeed: 75 },
    { name: "🥕 Carrot", color: "#ff8c00", height: 0.4, waterNeed: 60 },
    { name: "🥬 Lettuce", color: "#90ee90", height: 0.3, waterNeed: 80 },
    { name: "🍓 Strawberry", color: "#ff69b4", height: 0.2, waterNeed: 70 },
    { name: "🌶️ Chili", color: "#ff0000", height: 0.5, waterNeed: 55 },
    { name: "🍇 Grapes", color: "#9370db", height: 1.0, waterNeed: 60 }
  ]

  // Simulate sensor data changes and automatic watering
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        const newMoisture = Math.max(20, Math.min(95, prev.soilMoisture - 0.5 + (Math.random() - 0.3)))
        const newTemp = Math.max(18, Math.min(32, prev.temperature + (Math.random() - 0.5)))
        const newHumidity = Math.max(30, Math.min(80, prev.humidity + (Math.random() - 0.4)))
        
        // Auto watering logic
        const shouldWater = newMoisture < 40 && prev.waterLevel > 10 && !prev.isWatering
        const isWatering = shouldWater ? true : (prev.isWatering && prev.waterLevel > 5)
        
        const newWaterLevel = isWatering ? 
          Math.max(0, prev.waterLevel - 0.8) : 
          Math.min(100, prev.waterLevel + 0.1) // Slow refill from rainwater
        
        const newMoistureAfterWatering = isWatering ? 
          Math.min(95, newMoisture + 2) : newMoisture

        const updatedData = {
          soilMoisture: newMoistureAfterWatering,
          temperature: newTemp,
          humidity: newHumidity,
          waterLevel: newWaterLevel,
          isWatering: isWatering
        }

        setGardenSensors(updatedData)
        return updatedData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [setGardenSensors])

  /* ----- SENSOR COMPONENTS ----- */
  function SoilMoistureSensor({ position = [0, 0, 0], moistureLevel = 65 }) {
    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
          <meshStandardMaterial color={moistureLevel > 60 ? "#27ae60" : moistureLevel > 30 ? "#f39c12" : "#e74c3c"} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.15]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <pointLight 
          position={[0, 0.25, 0]} 
          color={moistureLevel > 60 ? "#00ff00" : moistureLevel > 30 ? "#ffff00" : "#ff0000"}
          intensity={0.5}
          distance={0.5}
        />
      </group>
    )
  }

  function TemperatureSensor({ position = [0, 0, 0], temperature = 24 }) {
    const color = temperature > 28 ? "#e74c3c" : temperature > 22 ? "#f39c12" : "#3498db"
    
    return (
      <group position={position}>
        <mesh castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <pointLight 
          position={[0, 0, 0]} 
          color={color}
          intensity={0.3}
          distance={0.3}
        />
      </group>
    )
  }

  function WaterFlowSensor({ position = [0, 0, 0], isActive = false }) {
    const [flowParticles, setFlowParticles] = useState([])
    
    useEffect(() => {
      if (isActive) {
        const interval = setInterval(() => {
          setFlowParticles(prev => [
            ...prev.slice(-3),
            { id: Math.random(), progress: 0 }
          ])
        }, 300)
        return () => clearInterval(interval)
      }
    }, [isActive])

    useFrame((_, dt) => {
      setFlowParticles(prev => 
        prev.map(p => ({ ...p, progress: p.progress + dt * 2 }))
          .filter(p => p.progress < 1)
      )
    })

    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color={isActive ? "#3498db" : "#95a5a6"} />
        </mesh>
        
        {flowParticles.map(particle => (
          <mesh key={particle.id} position={[0, -0.2 + particle.progress * 0.4, 0]} castShadow>
            <sphereGeometry args={[0.03, 4, 4]} />
            <meshStandardMaterial color="#3498db" transparent opacity={1 - particle.progress} />
          </mesh>
        ))}
      </group>
    )
  }

  function WaterTank({ position = [0, 0, 0], waterLevel = 80 }) {
    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
          <meshStandardMaterial color="#34495e" transparent opacity={0.8} />
        </mesh>
        
        <mesh position={[0, (waterLevel/100 * 1.5) - 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, waterLevel/100 * 1.4, 16]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
        </mesh>
        
        <mesh position={[0, 0.76, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.05, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        <Text
          position={[0, 0, 0.7]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(waterLevel)}%
        </Text>
      </group>
    )
  }

  return (
    <group position={position}>
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 12,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[8, 20, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 4 }).map((_, floor) =>
        Array.from({ length: 3 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[4.01, -8 + floor * 4, -3 + window * 2]}
            castShadow
          >
            <boxGeometry args={[0.02, 2.5, 1.5]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      {[0, 1, 2, 3].map((side) => {
        const angle = (side / 4) * Math.PI * 2
        const offsetX = Math.cos(angle) * 4.1
        const offsetZ = Math.sin(angle) * 4.1
        const rotationY = angle + Math.PI

        return (
          <group key={side} position={[offsetX, 0, offsetZ]} rotation={[0, rotationY, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.2, 18, 7.8]} />
              <meshStandardMaterial color="#27ae60" />
            </mesh>

            {Array.from({ length: 6 }).map((_, level) => (
              <group key={level} position={[0.11, -7 + level * 3, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.1, 0.1, 7.6]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>

                {Array.from({ length: 8 }).map((_, plantIndex) => {
                  const plant = plantTypes[(level * 8 + plantIndex) % plantTypes.length]
                  const plantX = -3.5 + plantIndex * 1
                  const plantHealth = sensorData.soilMoisture > plant.waterNeed - 10 ? "healthy" : "needsWater"
                  
                  return (
                    <group key={plantIndex} position={[0, 0.2, plantX]}>
                      {/* Soil Moisture Sensor for each plant row */}
                      {plantIndex === 0 && (
                        <SoilMoistureSensor 
                          position={[0.15, -0.1, plantX]} 
                          moistureLevel={sensorData.soilMoisture}
                        />
                      )}
                      
                      {/* Water Flow Pipe */}
                      {plantIndex === 4 && (
                        <WaterFlowSensor 
                          position={[0.1, 0, plantX]}
                          isActive={sensorData.isWatering}
                        />
                      )}

                      <mesh castShadow>
                        <cylinderGeometry args={[0.05, 0.05, plant.height, 8]} />
                        <meshStandardMaterial 
                          color={plantHealth === "healthy" ? "#228b22" : "#e74c3c"} 
                        />
                      </mesh>
                      
                      <mesh position={[0, plant.height/2 + 0.1, 0]} castShadow>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color={plant.color} />
                      </mesh>
                      
                      <mesh position={[0, plant.height/2, 0.1]} castShadow rotation={[Math.PI/4, 0, 0]}>
                        <boxGeometry args={[0.2, 0.3, 0.02]} />
                        <meshStandardMaterial color={plantHealth === "healthy" ? "#32cd32" : "#ff6b6b"} />
                      </mesh>

                      {/* Water droplets when watering */}
                      {sensorData.isWatering && plantHealth === "needsWater" && (
                        <mesh position={[0, 0.1, 0]} castShadow>
                          <sphereGeometry args={[0.03, 4, 4]} />
                          <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
                        </mesh>
                      )}
                    </group>
                  )
                })}
              </group>
            ))}

            {/* Temperature Sensors on each side */}
            <TemperatureSensor 
              position={[0.08, 5, 3]}
              temperature={sensorData.temperature}
            />
            <TemperatureSensor 
              position={[0.08, 10, -3]}
              temperature={sensorData.temperature}
            />

            <mesh position={[0.05, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 18, 8]} />
              <meshStandardMaterial color="#3498db" />
            </mesh>

            {Array.from({ length: 6 }).map((_, level) => (
              <mesh key={level} position={[0.08, -8 + level * 3, 3.5]} castShadow>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#2980b9" />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Water Tank System */}
      <group position={[0, 2, 0]}>
        <WaterTank waterLevel={sensorData.waterLevel} />
        
        {/* Main Water Pipe */}
        <mesh position={[0, 1, 2.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        
        {/* Water Pump */}
        <mesh position={[0, 1, 4]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
          <meshStandardMaterial color={sensorData.isWatering ? "#e74c3c" : "#95a5a6"} />
        </mesh>
        
        {/* Pump Indicator Light */}
        <pointLight 
          position={[0, 1.3, 4]} 
          color={sensorData.isWatering ? "#00ff00" : "#ff0000"}
          intensity={0.5}
          distance={1}
        />
      </group>

      <group position={[0, 10.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.2, 8.2]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>

        {[-2, 0, 2].map((x) =>
          [-2, 0, 2].map((z) => (
            <group key={`${x}-${z}`} position={[x, 0.3, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.8, 0.8, 0.4, 16]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              
              <mesh position={[0, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.75, 0.75, 0.3, 16]} />
                <meshStandardMaterial color="#a67c52" />
              </mesh>

              <mesh position={[0, 1.2, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
                <meshStandardMaterial color="#228b22" />
              </mesh>
              
              <mesh position={[0, 2.5, 0]} castShadow>
                <sphereGeometry args={[0.8, 8, 8]} />
                <meshStandardMaterial color={plantTypes[(x + z + 4) % plantTypes.length].color} />
              </mesh>
            </group>
          ))
        )}

        <SolarPanel position={[3, 0.3, 3]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-3, 0.3, 3]} rotation={[0, -Math.PI/4, 0]} />
        <SolarPanel position={[3, 0.3, -3]} rotation={[0, 3*Math.PI/4, 0]} />
        <SolarPanel position={[-3, 0.3, -3]} rotation={[0, -3*Math.PI/4, 0]} />
      </group>

      <group position={[0, 12, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.5, 1.2, 2, 16]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
        </mesh>
        
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.6, 0.2, 16]} />
          <meshStandardMaterial color="#2980b9" />
        </mesh>

        <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      <Text
        position={[0, 11, 0]}
        fontSize={0.5}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        🏢 Smart Vertical Garden
      </Text>

      <Html position={[0, 15, 0]} transform>
        <div style={{
          background: 'rgba(39, 174, 96, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #229954'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '18px' }}>
            🌿 Smart Vertical Garden Building
          </h3>
          
          {/* Real-time Sensor Data */}
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>📊 Real-time Sensor Data</h4>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div>🌱 Soil Moisture: <strong>{Math.round(sensorData.soilMoisture)}%</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${sensorData.soilMoisture}%`, 
                    height: '100%', 
                    background: sensorData.soilMoisture > 60 ? '#27ae60' : sensorData.soilMoisture > 30 ? '#f39c12' : '#e74c3c',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <div>🌡️ Temperature: <strong>{Math.round(sensorData.temperature)}°C</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${(sensorData.temperature - 18) / 14 * 100}%`, 
                    height: '100%', 
                    background: sensorData.temperature > 28 ? '#e74c3c' : sensorData.temperature > 22 ? '#f39c12' : '#3498db',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <div>💧 Water Tank: <strong>{Math.round(sensorData.waterLevel)}%</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${sensorData.waterLevel}%`, 
                    height: '100%', 
                    background: sensorData.waterLevel > 30 ? '#3498db' : '#e74c3c',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <div>💨 Humidity: <strong>{Math.round(sensorData.humidity)}%</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${sensorData.humidity}%`, 
                    height: '100%', 
                    background: '#9b59b6',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>

            {/* Auto Watering Status */}
            <div style={{ 
              background: sensorData.isWatering ? 'rgba(46, 204, 113, 0.3)' : 'rgba(52, 152, 219, 0.3)',
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${sensorData.isWatering ? '#27ae60' : '#3498db'}`,
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {sensorData.isWatering ? '💧 AUTO WATERING ACTIVE' : '⏸️ AUTO WATERING STANDBY'}
              {sensorData.isWatering && (
                <div style={{ fontSize: '10px', fontWeight: 'normal', marginTop: '4px' }}>
                  Watering plants due to low soil moisture
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🍋 Lemons: 32 plants</div>
              <div>🍎 Apples: 28 plants</div>
              <div>🍅 Tomatoes: 45 plants</div>
              <div>🥕 Carrots: 38 plants</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🥬 Lettuce: 52 plants</div>
              <div>🍓 Strawberries: 40 plants</div>
              <div>🌶️ Chilies: 36 plants</div>
              <div>🍇 Grapes: 24 plants</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(34, 153, 84, 0.3)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #229954'
          }}>
            <div><strong>🌱 Smart Features:</strong></div>
            <div>✅ IoT Soil Moisture Sensors</div>
            <div>✅ Automated Watering System</div>
            <div>✅ Real-time Monitoring</div>
            <div>✅ Rainwater Harvesting</div>
            <div>✅ Solar Powered</div>
            <div>✅ Climate Control</div>
          </div>

          <div style={{ 
            marginTop: '10px',
            background: 'rgba(255,255,255,0.2)', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '11px'
          }}>
            <div><strong>📊 Production Stats:</strong></div>
            <div>Daily Yield: ~50kg fresh produce</div>
            <div>Water Savings: 85% vs traditional farming</div>
            <div>Energy: 100% solar powered</div>
            <div>Automation: 95% processes automated</div>
          </div>
        </div>
      </Html>

      <Person position={[2, 0, 3]} color="#8b4513" speed={0.2} path={[
        [2, 0.5, 3], [1, 0.5, 2], [0, 0.5, 1], [-1, 0.5, 2], [-2, 0.5, 3]
      ]} />
      
      <Person position={[-3, 0, -2]} color="#2c3e50" speed={0.3} path={[
        [-3, 0.5, -2], [-2, 0.5, -1], [-1, 0.5, -2], [-2, 0.5, -3], [-3, 0.5, -2]
      ]} />

      <group position={[4.2, 5, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          👨‍🌾
        </Text>
      </group>

      <group position={[-4.2, 8, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          👩‍🌾
        </Text>
      </group>
    </group>
  )
}

/* ----- ENHANCED MODERN HOSPITAL ----- */
function ModernHospital({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  return (
    <group position={position}>
      {/* Main Hospital Building */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 15,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[25, 15, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Enhanced Hospital Windows with Night Lighting */}
      {Array.from({ length: 5 }).map((_, floor) =>
        Array.from({ length: 8 }).map((_, window) => (
          <group key={`${floor}-${window}`}>
            <mesh
              position={[-11.5, -6 + floor * 3, -8 + window * 2]}
              castShadow
            >
              <boxGeometry args={[0.1, 2, 1.5]} />
              <meshStandardMaterial 
                color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
                transparent 
                opacity={timeOfDay === 'night' ? 0.9 : 0.8}
                emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
                emissiveIntensity={timeOfDay === 'night' ? 0.7 : 0}
              />
            </mesh>
            <mesh
              position={[11.5, -6 + floor * 3, -8 + window * 2]}
              castShadow
            >
              <boxGeometry args={[0.1, 2, 1.5]} />
              <meshStandardMaterial 
                color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
                transparent 
                opacity={timeOfDay === 'night' ? 0.9 : 0.8}
                emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
                emissiveIntensity={timeOfDay === 'night' ? 0.7 : 0}
              />
            </mesh>
          </group>
        ))
      )}

      {/* Modern Architectural Features */}
      <mesh position={[0, 7.5, 10.1]} castShadow>
        <boxGeometry args={[15, 8, 0.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} />
      </mesh>

      {/* Main Entrance */}
      <mesh position={[0, -3, 10.1]} castShadow receiveShadow>
        <boxGeometry args={[8, 6, 0.2]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>

      {/* Emergency Entrance */}
      <mesh position={[-8, -3, 10.1]} castShadow receiveShadow>
        <boxGeometry args={[4, 4, 0.2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      {/* Helipad on Roof */}
      <mesh position={[0, 8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 4, 0.3, 32]} />
        <meshStandardMaterial color="#34495e" metalness={0.8} />
      </mesh>

      <mesh position={[0, 8.2, 0]} castShadow>
        <ringGeometry args={[3, 4, 32]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      <Text
        position={[0, 8.5, 0]}
        fontSize={0.6}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        H
      </Text>

      {/* Red Cross Symbol */}
      <group position={[0, 4, 10.2]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[6, 0.8, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI/2]} castShadow>
          <boxGeometry args={[6, 0.8, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>

      {/* Wheelchair Ramp */}
      <group position={[0, -1, 8]}>
        {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((y, i) => (
          <mesh key={i} position={[0, y, -i * 0.5]} castShadow receiveShadow>
            <boxGeometry args={[8, 0.1, 0.5]} />
            <meshStandardMaterial color="#95a5a6" />
          </mesh>
        ))}
        
        <mesh position={[1.2, 0.35, -1.25]} rotation={[0, 0, -Math.PI/8]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.1, 1.5]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
      </group>

      {/* Ambulance */}
      <group position={[-12, 0.8, 5]}>
        <mesh castShadow>
          <boxGeometry args={[4, 1.5, 2]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.4} roughness={0.3} />
        </mesh>
        
        <mesh position={[1, 1, 0]} castShadow>
          <boxGeometry args={[2, 1, 1.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <Text
          position={[0, 1.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          AMBULANCE
        </Text>

        {[-1.2, 1.2].map((x, i) => (
          <group key={i} position={[x, -0.4, 0]}>
            <mesh castShadow rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.25, 16]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Patients and Medical Staff */}
      <WheelchairUser position={[3, 0, 5]} moving={true} />
      
      <group position={[-3, 0.8, 6]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        <Text position={[0, 2.2, 0]} fontSize={0.25} color="white" anchorX="center">
          👨‍⚕️
        </Text>
      </group>

      <Html position={[0, 18, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          padding: '25px',
          borderRadius: '18px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: '#2c3e50',
          border: '3px solid #e74c3c'
        }}>
          <h3 style={{ margin: '0 0 18px 0', color: '#e74c3c', fontSize: '22px' }}>
            🏥 Modern Medical Center
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '18px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🚑 Emergency Services: 24/7</div>
              <div>👨‍⚕️ Medical Staff: 250+</div>
              <div>🛏️ Beds: 450</div>
              <div>🔬 Operating Rooms: 18</div>
              <div>💊 Pharmacy: Available</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🧬 Research: Advanced</div>
              <div>🚁 Helipad: Operational</div>
              <div>♿ Accessibility: Full</div>
              <div>🏗️ Modern Design</div>
              <div>🌿 Green Spaces</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(231, 76, 60, 0.1)', 
            padding: '15px', 
            borderRadius: '10px',
            fontSize: '14px',
            border: '2px solid #e74c3c',
            marginBottom: '15px'
          }}>
            <div><strong>🏗️ Advanced Facilities:</strong></div>
            <div>✅ Emergency & Trauma Center</div>
            <div>✅ Surgical Department</div>
            <div>✅ Pediatric Care Unit</div>
            <div>✅ Cardiology Center</div>
            <div>✅ Rehabilitation Center</div>
            <div>✅ Research Laboratories</div>
          </div>

          <div style={{ 
            background: 'rgba(52, 152, 219, 0.1)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '13px',
            border: '2px solid #3498db'
          }}>
            <div><strong>♿ Accessibility Features:</strong></div>
            <div>Wheelchair Ramps • Automatic Doors • Accessible Restrooms</div>
            <div>Elevators • Braille Signage • Hearing Assistance Systems</div>
          </div>
        </div>
      </Html>

      <Text
        position={[0, 10, 0]}
        fontSize={0.8}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        🏥 Modern Hospital
      </Text>
    </group>
  )
}

/* ----- BEACHONHOUSE SCHOOL SYSTEM ----- */
function BeachonhouseSchoolSystem({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  return (
    <group position={position}>
      {/* Main School Building - Light Blue Glass Structure */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 12,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[22, 10, 15]} />
        <meshStandardMaterial 
          color="#e6f7ff" 
          transparent 
          opacity={0.4}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Enhanced Glass Frame Structure with Night Lighting */}
      <group>
        {/* Vertical Frames */}
        {[-8, -4, 0, 4, 8].map((x) => (
          <mesh key={`vertical-${x}`} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 10, 15.2]} />
            <meshStandardMaterial color="#34495e" metalness={0.6} />
          </mesh>
        ))}
        
        {/* Horizontal Frames */}
        {[-4, 0, 4].map((y) => (
          <mesh key={`horizontal-${y}`} position={[0, y, 0]} castShadow>
            <boxGeometry args={[22.2, 0.3, 15.2]} />
            <meshStandardMaterial color="#34495e" metalness={0.6} />
          </mesh>
        ))}

        {/* Enhanced Interior Lighting for Night */}
        {timeOfDay === 'night' && (
          <>
            {Array.from({ length: 4 }).map((_, floor) =>
              Array.from({ length: 6 }).map((_, window) => (
                <pointLight
                  key={`${floor}-${window}`}
                  position={[-8 + window * 3.2, -4 + floor * 2.5, 7.6]}
                  intensity={0.4}
                  distance={4}
                  color="#e6f7ff"
                />
              ))
            )}
          </>
        )}
      </group>

      {/* School Entrance with Ramp */}
      <group position={[0, -2, 7.5]}>
        {/* Main Entrance */}
        <mesh position={[0, 2, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[6, 4, 0.3]} />
          <meshStandardMaterial color="#3498db" metalness={0.5} />
        </mesh>

        {/* Wheelchair Ramp */}
        {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((y, i) => (
          <mesh key={i} position={[0, y, -i * 0.5]} castShadow receiveShadow>
            <boxGeometry args={[5, 0.1, 0.5]} />
            <meshStandardMaterial color="#7f8c8d" />
          </mesh>
        ))}

        {/* Ramp Handrails */}
        <mesh position={[2.5, 0.6, -1.5]} castShadow>
          <boxGeometry args={[0.1, 1.2, 4]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[-2.5, 0.6, -1.5]} castShadow>
          <boxGeometry args={[0.1, 1.2, 4]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      {/* School Playground */}
      <mesh position={[15, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

      {/* Playground Equipment */}
      <group position={[15, 0, 0]}>
        {/* Swing Set */}
        <mesh position={[0, 2.5, 3]} castShadow>
          <boxGeometry args={[6, 0.1, 0.1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        <mesh position={[-2.5, 1.5, 3]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 3, 12]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        <mesh position={[2.5, 1.5, 3]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 3, 12]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>

        {/* Slide */}
        <mesh position={[4, 0, -2]} rotation={[0, 0, -Math.PI/4]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 5, 1.2]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>

        {/* Accessible Swing */}
        <group position={[0, 0.8, -3]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.1, 1]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          
          <mesh position={[0, 0.9, -0.1]} castShadow>
            <boxGeometry args={[1.2, 0.6, 0.6]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
          
          <Text position={[0, 1.3, 0]} fontSize={0.3} color="white" anchorX="center">
            ♿
          </Text>
        </group>
      </group>

      {/* Solar Panels on Roof */}
      <group position={[0, 5.5, 0]}>
        <SolarPanel position={[-8, 0, -6]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-4, 0, -6]} rotation={[0, 0, 0]} />
        <SolarPanel position={[0, 0, -6]} rotation={[0, 0, 0]} />
        <SolarPanel position={[4, 0, -6]} rotation={[0, 0, 0]} />
        <SolarPanel position={[8, 0, -6]} rotation={[0, -Math.PI/4, 0]} />
      </group>

      {/* Students and Teachers */}
      <WheelchairUser position={[-6, 0, 5]} moving={true} />
      
      <group position={[6, 0.8, 5]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1, 12]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        <Text position={[0, 2.2, 0]} fontSize={0.25} color="white" anchorX="center">
          👩‍🏫
        </Text>
      </group>

      {/* School Bus */}
      <group position={[-12, 0.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4, 1.8, 2]} />
          <meshStandardMaterial color="#FFD700" metalness={0.4} roughness={0.3} />
        </mesh>

        <mesh position={[1, 1.2, 0]} castShadow>
          <boxGeometry args={[2, 1, 1.5]} />
          <meshStandardMaterial color="#2c3e50" transparent opacity={0.8} />
        </mesh>

        <Text
          position={[0, 2.2, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          BEACHONHOUSE SCHOOL
        </Text>

        {[-1.2, 1.2].map((x, i) => (
          <group key={i} position={[x, -0.4, 0]}>
            <mesh castShadow rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.25, 16]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </group>
        ))}

        {/* Wheelchair Lift */}
        <mesh position={[-1.8, 0.4, 0]} castShadow>
          <boxGeometry args={[0.4, 0.6, 1.5]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>

      <Html position={[0, 14, 0]} transform>
        <div style={{
          background: 'rgba(230, 247, 255, 0.97)',
          padding: '25px',
          borderRadius: '18px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: '#2c3e50',
          border: '3px solid #3498db'
        }}>
          <h3 style={{ margin: '0 0 18px 0', color: '#3498db', fontSize: '22px' }}>
            🏫 Beachonhouse School System
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '18px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>👨‍🎓 Students: 600+</div>
              <div>👩‍🏫 Teachers: 45</div>
              <div>🏫 Classrooms: 30</div>
              <div>🔬 Science Labs: 6</div>
              <div>💻 Computer Lab: 60 PCs</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>📚 Library: 15,000+ books</div>
              <div>🎨 Arts Center: Available</div>
              <div>♿ Accessibility: Full</div>
              <div>🌿 Green Campus</div>
              <div>☀️ Solar Powered</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(52, 152, 219, 0.1)', 
            padding: '15px', 
            borderRadius: '10px',
            fontSize: '14px',
            border: '2px solid #3498db',
            marginBottom: '15px'
          }}>
            <div><strong>🏗️ Advanced Features:</strong></div>
            <div>✅ Light Blue Glass Construction</div>
            <div>✅ Solar Powered Campus</div>
            <div>✅ Natural Lighting Design</div>
            <div>✅ Temperature Controlled</div>
            <div>✅ Eco-Friendly Design</div>
            <div>✅ Modern Architecture</div>
          </div>

          <div style={{ 
            background: 'rgba(39, 174, 96, 0.1)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '13px',
            border: '2px solid #27ae60'
          }}>
            <div><strong>♿ Inclusive Education:</strong></div>
            <div>Wheelchair Ramps • Elevators • Accessible Restrooms</div>
            <div>Specialized Classrooms • Accessible Playground • Support Staff</div>
            <div>Braille Materials • Hearing Assistance • Custom Desks</div>
          </div>
        </div>
      </Html>

      <Text
        position={[0, 6, 0]}
        fontSize={0.8}
        color="#3498db"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        🏫 Beachonhouse School
      </Text>
    </group>
  )
}

/* ----- ENHANCED CULTURAL CENTER ----- */
function CulturalCenter({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)

  const culturalStyles = [
    { 
      name: "Sindhi", 
      color: "#ff6b6b", 
      pattern: "🎵",
      image: "🎨",
      description: "Sindhi Culture - Music & Ajrak",
      features: ["Traditional Music", "Ajrak Patterns", "Sufi Heritage"]
    },
    { 
      name: "Punjabi", 
      color: "#4ecdc4", 
      pattern: "💃",
      image: "🌾",
      description: "Punjabi Culture - Bhangra & Agriculture",
      features: ["Bhangra Dance", "Wheat Fields", "Folk Music"]
    },
    { 
      name: "Pashto", 
      color: "#45b7d1", 
      pattern: "⚔️",
      image: "🏔️",
      description: "Pashtun Culture - Mountains & Tradition",
      features: ["Mountain Heritage", "Traditional Dance", "Tribal Arts"]
    },
    { 
      name: "Balochi", 
      color: "#96ceb4", 
      pattern: "🏔️",
      image: "🐫",
      description: "Balochi Culture - Desert & Camel",
      features: ["Desert Life", "Camel Culture", "Embroidery"]
    }
  ]

  return (
    <group position={position}>
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 8,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[15, 8, 12]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 3 }).map((_, floor) =>
        Array.from({ length: 4 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[-7, -3 + floor * 2.5, -5.9 + window * 3]}
            castShadow
          >
            <boxGeometry args={[0.1, 2, 2.5]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      <mesh position={[0, 4, 6.1]} castShadow>
        <boxGeometry args={[4, 5, 0.3]} />
        <meshStandardMaterial color="#a67c52" metalness={0.5} />
      </mesh>

      <group position={[0, 5, 0]}>
        {culturalStyles.map((culture, index) => {
          const angle = (index / culturalStyles.length) * Math.PI * 2
          const radius = 10
          const bannerX = Math.cos(angle) * radius
          const bannerZ = Math.sin(angle) * radius
          
          return (
            <group key={culture.name} position={[bannerX, 0, bannerZ]} rotation={[0, -angle, 0]}>
              <mesh position={[0, 5, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 10, 12]} />
                <meshStandardMaterial color="#d4af37" metalness={0.8} />
              </mesh>
              
              <mesh position={[0, 8, -0.8]} rotation={[0, 0, 0]} castShadow>
                <planeGeometry args={[3, 4]} />
                <meshStandardMaterial color={culture.color} />
              </mesh>
              
              <Text
                position={[0, 8, -0.81]}
                fontSize={1}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.pattern}
              </Text>
              
              <Text
                position={[0, 6, -0.81]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.name}
              </Text>

              <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2, 2, 0.3, 16]} />
                <meshStandardMaterial color={culture.color} transparent opacity={0.9} />
              </mesh>

              <mesh position={[0, 2.2, 0]} castShadow>
                <boxGeometry args={[1.5, 1.2, 1.5]} />
                <meshStandardMaterial color={culture.color} />
              </mesh>

              <Text
                position={[0, 2.8, 0]}
                fontSize={0.6}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.image}
              </Text>
            </group>
          )
        })}
      </group>

      <mesh position={[0, 11, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 12, 12]} />
        <meshStandardMaterial color="#c9b037" metalness={0.9} />
      </mesh>

      <Text
        position={[0, 9, 0]}
        fontSize={0.6}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Cultural Center
      </Text>

      <Html position={[0, 14, 0]} transform>
        <div style={{
          background: 'rgba(139, 69, 19, 0.95)',
          padding: '25px',
          borderRadius: '18px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
          minWidth: '400px',
          textAlign: 'center',
          color: 'white',
          border: '3px solid #d4af37'
        }}>
          <h3 style={{ margin: '0 0 18px 0', color: '#d4af37', fontSize: '22px' }}>
            🎪 Cultural Heritage Center
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '18px',
            marginBottom: '18px'
          }}>
            {culturalStyles.map((culture, index) => (
              <div key={culture.name} style={{
                background: culture.color,
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{culture.image}</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{culture.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{culture.description}</div>
              </div>
            ))}
          </div>

          <div style={{ 
            background: 'rgba(212, 175, 55, 0.2)', 
            padding: '15px', 
            borderRadius: '12px',
            fontSize: '14px',
            border: '2px solid #d4af37'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}><strong>Cultural Features:</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {culturalStyles.map(culture => (
                <div key={culture.name} style={{ textAlign: 'left' }}>
                  <strong>{culture.name}:</strong> {culture.features.join(', ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Html>

      <Person position={[4, 0, 3]} color="#8b4513" speed={0.3} path={[
        [4, 0.8, 3], [2, 0.8, 1], [0, 0.8, 3], [2, 0.8, 5], [4, 0.8, 3]
      ]} />
      
      <Person position={[-3, 0, -2]} color="#2c3e50" speed={0.4} path={[
        [-3, 0.8, -2], [-1, 0.8, -4], [1, 0.8, -2], [-1, 0.8, 0], [-3, 0.8, -2]
      ]} />

      <group position={[3, 0.8, -3]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1, 12]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <Text position={[0, 1.8, 0]} fontSize={0.25} color="white" anchorX="center">
          💃
        </Text>
      </group>

      <group position={[-3, 0.8, 3]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1, 12]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
        <Text position={[0, 1.8, 0]} fontSize={0.25} color="white" anchorX="center">
          🎵
        </Text>
      </group>
    </group>
  )
}

// ... باقی کوڈ وہی رہے گا جیسا پہلے تھا، صرف اوپر والے حصے میں تبدیلی کی گئی ہے۔

/* ----- ENHANCED CITY LAYOUT WITH PROPER SPACING ----- */
function CityLayout() {
  return (
    <group>
      {/* NORTH-WEST DISTRICT - Premium Residential & Commercial */}
      <group position={[-25, 0, 25]}>
        <EnhancedBuilding position={[-15, 0, 15]} height={8} color="#4a6572" name="Premium Residence A" hasTurbine={true} />
        <EnhancedBuilding position={[-5, 0, 15]} height={12} color="#556b78" name="Business Tower" hasTurbine={false} />
        <EnhancedBuilding position={[5, 0, 15]} height={10} color="#5d7887" name="Premium Residence B" hasTurbine={true} />
        <EnhancedBuilding position={[15, 0, 15]} height={14} color="#34495e" name="Corporate Office" hasTurbine={true} />
        
        <EnhancedBuilding position={[-15, 0, 5]} height={11} color="#4a6572" name="Tech Hub" hasTurbine={false} />
        <EnhancedBuilding position={[-5, 0, 5]} height={16} color="#556b78" name="Sky Tower" hasTurbine={true} />
        <EnhancedBuilding position={[5, 0, 5]} height={9} color="#5d7887" name="Elite Residence" hasTurbine={true} />
        <EnhancedBuilding position={[15, 0, 5]} height={13} color="#34495e" name="Finance Center" hasTurbine={false} />
        
        <EnhancedBuilding position={[-15, 0, -5]} height={15} color="#4a6572" name="Innovation Center" hasTurbine={true} />
        <EnhancedBuilding position={[-5, 0, -5]} height={8} color="#556b78" name="Garden Residence" hasTurbine={true} />
        <EnhancedBuilding position={[5, 0, -5]} height={12} color="#5d7887" name="Business Plaza" hasTurbine={false} />
        <EnhancedBuilding position={[15, 0, -5]} height={10} color="#34495e" name="Luxury Apartments" hasTurbine={true} />
        
        <EnhancedBuilding position={[-15, 0, -15]} height={9} color="#4a6572" name="Urban Living" hasTurbine={true} />
        <EnhancedBuilding position={[-5, 0, -15]} height={14} color="#556b78" name="Commerce Tower" hasTurbine={false} />
        <EnhancedBuilding position={[5, 0, -15]} height={11} color="#5d7887" name="Premium Suites" hasTurbine={true} />
        <EnhancedBuilding position={[15, 0, -15]} height={17} color="#34495e" name="Signature Tower" hasTurbine={true} />
      </group>

      {/* NORTH-EAST DISTRICT - Institutional */}
      <ModernHospital position={[40, 0, 25]} />
      <BeachonhouseSchoolSystem position={[40, 0, -5]} />
      <CulturalCenter position={[25, 0, 40]} />

      {/* SOUTH-WEST DISTRICT - Industrial & Utilities */}
      <WaterFilteringPlant position={[-35, 0, -25]} />
      <WasteManagementSystem position={[-35, 0, -40]} />
      <DataCenter position={[-40, 0, -10]} />

      {/* SOUTH-EAST DISTRICT - Green & Recreational */}
      <VerticalGardenBuilding position={[25, 0, -35]} />
      <EnergyEfficientSociety position={[0, 0, -45]} />

      {/* CENTRAL DISTRICT - Public Services */}
      <BusStation position={[0, 0, 0]} />
      <WasteMonitoringSystem position={[0, 0, 10]} />

      {/* Waste bins distributed around the city */}
      <WasteBin position={[-15, 0, 10]} id="bin1" />
      <WasteBin position={[20, 0, -8]} id="bin2" />
      <WasteBin position={[-8, 0, -18]} id="bin3" />
      <WasteBin position={[25, 0, 15]} id="bin4" />
      <WasteBin position={[-20, 0, -25]} id="bin5" />
      <WasteBin position={[10, 0, 25]} id="bin6" />

      {/* Additional monitoring drones */}
      <MonitoringDrone position={[30, 15, 20]} isMonitoring={true} />
      <MonitoringDrone position={[-25, 12, -25]} isMonitoring={true} />
      <MonitoringDrone position={[15, 18, -30]} isMonitoring={true} />

      {/* Citizens */}
      <Person position={[5, 0, 22]} color="#8b4513" speed={0.3} path={[
        [5, 0.8, 22], [3, 0.8, 24], [1, 0.8, 22], [3, 0.8, 20], [5, 0.8, 22]
      ]} />
      
      <Person position={[-3, 0, 27]} color="#2c3e50" speed={0.4} path={[
        [-3, 0.8, 27], [-5, 0.8, 25], [-7, 0.8, 27], [-5, 0.8, 29], [-3, 0.8, 27]
      ]} />

      <WheelchairUser position={[35, 0, 15]} moving={true} />
      <WheelchairUser position={[-35, 0, -5]} moving={true} />
    </group>
  )
}

// ... باقی تمام فنکشنز وہی رہیں گی جیسا پہلے تھا
