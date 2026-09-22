import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Globe3D from './components/Globe3D';
import TopologyGraph from './components/TopologyGraph';
import AnomalyAlerts from './components/AnomalyAlerts';
import BlastRadiusModal from './components/BlastRadiusModal';
import MitigationTerminal from './components/MitigationTerminal';
import TracerouteLab from './components/TracerouteLab';
import FlapChart from './components/FlapChart';
import WebhookTester from './components/WebhookTester';
import PlaybackControls from './components/PlaybackControls';
import WelcomeScreen from './components/WelcomeScreen';
import FooterLegal from './components/FooterLegal';
import LegalModal from './components/LegalModal';

import EducationalGuide from './components/EducationalGuide';
import BackgroundCanvas from './components/BackgroundCanvas';

const API_BASE = "https://routerrat.onrender.com";

export default function App() {
  const [selectedAsn, setSelectedAsn] = useState(13335); // Cloudflare
  const [asns, setAsns] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeFixture, setActiveFixture] = useState(null);
  const [liveMode, setLiveMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(14);

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('terms');

  // Modal State
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const [isMitigationOpen, setIsMitigationOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // 1. Fetch ASN list
  useEffect(() => {
    fetch(`${API_BASE}/api/asns`)
      .then((res) => res.json())
      .then((data) => setAsns(data))
      .catch((err) => console.error("Error fetching ASNs:", err));
  }, []);

  // 2. Fetch Telemetry for selected ASN
  const loadTelemetry = async (asn, currentFixture) => {
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/${asn}`);
      const data = await res.json();
      
      const liveTelemetry = data.telemetry || {};
      // Ensure as_path exists for TopologyGraph
      if (!liveTelemetry.as_path && liveTelemetry.as_paths?.length > 0) {
        liveTelemetry.as_path = liveTelemetry.as_paths[0];
      }
      // Ensure synthetic history exists for FlapChart
      if (!liveTelemetry.history) {
        const pathLen = liveTelemetry.as_path?.length || 3;
        liveTelemetry.history = Array.from({ length: 15 }).map(() => ({
          as_path: { length: pathLen + (Math.random() > 0.8 ? 1 : 0) }
        }));
      }

      if (!currentFixture) {
        setTelemetry(liveTelemetry);
        setAnomalies(data.anomalies || []);
      }
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    }
  };

  useEffect(() => {
    loadTelemetry(selectedAsn, activeFixture);
  }, [selectedAsn, activeFixture]);

  // 3. WebSocket connection for live streaming
  useEffect(() => {
    const wsUrl = "wss://routerrat.onrender.com/ws/telemetry";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.asn === selectedAsn) {
          const liveTelemetry = payload.telemetry || {};
          if (!liveTelemetry.as_path && liveTelemetry.as_paths?.length > 0) {
            liveTelemetry.as_path = liveTelemetry.as_paths[0];
          }
          if (!liveTelemetry.history) {
            const pathLen = liveTelemetry.as_path?.length || 3;
            liveTelemetry.history = Array.from({ length: 15 }).map(() => ({
              as_path: { length: pathLen + (Math.random() > 0.8 ? 1 : 0) }
            }));
          }
          if (!activeFixture) {
            setTelemetry(liveTelemetry);
            
            if (payload.anomalies && payload.anomalies.length > 0) {
              setAnomalies(payload.anomalies);
            }
          }
        } else if (liveMode && payload.type === "ris_live_update") {
          // A real live BGP stream event!
          // We can visually append this to anomalies or update telemetry
          const liveAnomaly = {
            anomaly_type: "live_bgp_update",
            severity: "INFO",
            description: `Live announcement received for prefix ${payload.telemetry?.prefix}`,
            prefix: payload.telemetry?.prefix,
            asn: payload.telemetry?.asn,
            timestamp: payload.telemetry?.timestamp
          };
          setAnomalies(prev => [liveAnomaly, ...prev].slice(0, 10)); // Keep last 10
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => ws.close();
  }, [selectedAsn, liveMode, activeFixture]);

  // Handle Triggering Historical Outage Fixture
  const handleTriggerFixture = async (fixtureKey) => {
    try {
      const res = await fetch(`${API_BASE}/api/fixtures/trigger/${fixtureKey}`, { method: 'POST' });
      const data = await res.json();
      
      const fixture = data.fixture;
      setSelectedAsn(fixture.asn || 36561);

      // Inject fixture's AS path to populate the Topology Graph
      const mockAsPath = fixture.as_path || [2914, 13335];
      
      // Generate synthetic history for the Flap Chart
      const mockHistory = Array.from({ length: 15 }).map((_, i) => {
        let length = mockAsPath.length;
        if (fixture.anomaly_type.includes('flap')) {
          length = i % 2 === 0 ? length + Math.floor(Math.random() * 3) : length - Math.floor(Math.random() * 2);
        } else if (fixture.anomaly_type.includes('surge')) {
          length = i > 7 ? length : 2; // path was short, then surged
        }
        length = Math.max(1, length);
        
        // Generate a fake path array of the required length ending in our target ASN
        const path = [];
        for (let j = 0; j < length - 1; j++) path.push(3356 + j); // dummy ASNs
        path.push(mockAsPath[mockAsPath.length - 1]);

        return { 
          as_path: path,
          geo_paths: [path.map(asn => ({ asn, lat: (Math.random()-0.5)*180, lon: (Math.random()-0.5)*360 }))]
        };
      });
      // Ensure current snapshot matches exactly at the end
      mockHistory[14] = { 
        as_path: mockAsPath,
        geo_paths: [mockAsPath.map(asn => ({ asn, lat: (Math.random()-0.5)*180, lon: (Math.random()-0.5)*360 }))]
      };

      setTelemetry(prev => ({
        ...prev,
        as_path: mockAsPath,
        as_paths: [mockAsPath],
        history: mockHistory
      }));
      
      setActiveFixture(fixtureKey);
      setCurrentTime(0);
      setIsPlaying(true);

      setAnomalies([
        {
          anomaly_type: fixture.anomaly_type,
          severity: fixture.severity,
          description: fixture.description,
          prefix: fixture.prefix,
          announced_origin_asn: fixture.announced_origin_asn,
          expected_origin_asn: fixture.expected_origin_asn,
          asn: fixture.asn
        }
      ]);
    } catch (err) {
      console.error("Fixture trigger error:", err);
    }
  };

  const handleOpenBlastRadius = (incident) => {
    setSelectedIncident(incident);
    setIsBlastModalOpen(true);
  };

  const handleOpenMitigation = (incident) => {
    setSelectedIncident(incident);
    setIsMitigationOpen(true);
  };

  const handleMitigate = (incident) => {
    // Clear the mitigated anomaly from the active anomalies list
    setAnomalies(prev => prev.filter(a => a.anomaly_type !== incident.anomaly_type));
  };

  useEffect(() => {
    let interval;
    if (activeFixture && isPlaying && currentTime < totalTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else if (currentTime >= totalTime) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, totalTime, activeFixture]);

  const displayTelemetry = (activeFixture && telemetry?.history) 
    ? {
        ...telemetry,
        as_path: telemetry.history[currentTime]?.as_path || telemetry.as_path,
        geo_paths: telemetry.history[currentTime]?.geo_paths || telemetry.geo_paths,
        // Make flap chart only show up to current time
        history: telemetry.history.slice(0, currentTime + 1)
      }
    : telemetry;

  // Framer Motion Variants for Staggered Entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.25, 0.8, 0.25, 1] } }
  };

  return (
    <>
      <AnimatePresence>
        {!isInitialized && <WelcomeScreen onEnter={() => setIsInitialized(true)} />}
      </AnimatePresence>

      <div className="min-h-screen p-4 md:p-8 max-w-[1700px] mx-auto relative">
        <BackgroundCanvas />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Header
          selectedAsn={selectedAsn}
          onSelectAsn={(asn) => {
            setSelectedAsn(asn);
            setActiveFixture(null);
          }}
          asns={asns}
          wsConnected={wsConnected}
          onTriggerFixture={handleTriggerFixture}
          activeFixture={activeFixture}
          liveMode={liveMode}
          setLiveMode={setLiveMode}
        />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8 flex flex-col">
            <Globe3D activeAsn={selectedAsn} telemetryData={displayTelemetry} />
            
            <div className="flex-1">
              <AnomalyAlerts
                anomalies={anomalies}
                telemetry={displayTelemetry}
                onOpenBlastRadius={handleOpenBlastRadius}
                onOpenMitigation={handleOpenMitigation}
              />
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-8 flex flex-col">
            <TopologyGraph
              telemetry={displayTelemetry}
              anomalies={anomalies}
            />

            <div className="flex-1">
              <FlapChart telemetry={displayTelemetry} />
            </div>
          </motion.div>
        </div>

        {/* Lower Grid: Traceroute Lab & Webhook Dispatcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <TracerouteLab targetPrefix={telemetry?.sample_prefixes?.[0] || "104.16.0.0/12"} />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-5">
            <WebhookTester />
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants}>
          <EducationalGuide />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {activeFixture && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none flex justify-center"
          >
            <div className="pointer-events-auto w-full max-w-3xl">
              <PlaybackControls 
                isPlaying={isPlaying} 
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                currentTime={currentTime}
                totalTime={totalTime}
                onSeek={setCurrentTime}
                impactTime={8}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBlastModalOpen && (
          <BlastRadiusModal
            isOpen={isBlastModalOpen}
            onClose={() => setIsBlastModalOpen(false)}
            incident={selectedIncident}
            telemetry={telemetry}
          />
        )}
        {isMitigationOpen && (
          <MitigationTerminal
            anomaly={selectedIncident}
            onClose={() => setIsMitigationOpen(false)}
            onMitigate={handleMitigate}
          />
          )}
        </AnimatePresence>

        <FooterLegal onOpenLegal={(tab) => {
          setLegalModalTab(tab);
          setLegalModalOpen(true);
        }} />

        <AnimatePresence>
          {legalModalOpen && (
            <LegalModal 
              isOpen={legalModalOpen} 
              onClose={() => setLegalModalOpen(false)} 
              initialTab={legalModalTab} 
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
