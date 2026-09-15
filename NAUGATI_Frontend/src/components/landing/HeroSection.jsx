import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* Container for the split text to position around the ship */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1400px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: '60vh',
        padding: '0 2rem'
      }}>
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ alignSelf: 'flex-start', marginTop: '10vh' }}
        >
          <h1 className="heading-jumbo">MORE</h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ alignSelf: 'flex-end', marginTop: '-5vh' }}
        >
          <h1 className="heading-jumbo">THAN</h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{ alignSelf: 'center', marginTop: '5vh' }}
        >
          <h1 className="heading-jumbo">JUST A PORT</h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{ alignSelf: 'flex-start', marginTop: '5vh' }}
        >
          <h1 className="heading-jumbo">AGENT</h1>
        </motion.div>

      </div>
    </div>
  );
};

export default HeroSection;
