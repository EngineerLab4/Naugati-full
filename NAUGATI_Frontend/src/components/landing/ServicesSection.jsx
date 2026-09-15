import React from 'react';
import { motion, useTransform } from 'framer-motion';

const ServicesSection = ({ scrollYProgress }) => {
  // Translate the text horizontally based on scroll to create a marquee effect
  const x1 = useTransform(scrollYProgress, [0.5, 1], ["0%", "-30%"]);
  const x2 = useTransform(scrollYProgress, [0.5, 1], ["-10%", "20%"]);
  const x3 = useTransform(scrollYProgress, [0.5, 1], ["0%", "-40%"]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      overflow: 'hidden',
      paddingTop: '20vh'
    }}>
      
      {/* Wrapper to apply the tilt */}
      <div style={{ transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Row 1 */}
        <motion.div style={{ x: x1, display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
          <span className="heading-tilted heading-tilted-outline">CHARTERING ADVISOR</span>
          <span className="heading-tilted">FREIGHT FORECAST</span>
          <span className="heading-tilted heading-tilted-outline">CHARTERING ADVISOR</span>
        </motion.div>

        {/* Row 2 */}
        <motion.div style={{ x: x2, display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
          <span className="heading-tilted">VESSEL RECOMMENDATION</span>
          <span className="heading-tilted heading-tilted-outline">PORT INTELLIGENCE</span>
          <span className="heading-tilted">VESSEL RECOMMENDATION</span>
        </motion.div>

        {/* Row 3 */}
        <motion.div style={{ x: x3, display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
          <span className="heading-tilted heading-tilted-outline">RISK ANALYSIS</span>
          <span className="heading-tilted">WHAT-IF SIMULATOR</span>
          <span className="heading-tilted heading-tilted-outline">RISK ANALYSIS</span>
        </motion.div>

      </div>
    </div>
  );
};

export default ServicesSection;
