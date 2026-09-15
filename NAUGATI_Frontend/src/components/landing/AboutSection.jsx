import React from 'react';
import { motion, useTransform } from 'framer-motion';

const AboutSection = ({ scrollYProgress }) => {
  // Fade in the text as we scroll into the middle third of the page
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.6], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [0.1, 0.3], [50, 0]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        style={{ opacity, y }}
        className="text-center px-4"
      >
        <p className="text-body-large">
          We come not for one year, we enjoy what we are doing, we are fully independent, handling all types of ships and we really want to bring to India — International standards of port call handling and we want our clients to feel that India — is changing, the service here — is changing and people here — are changing.
        </p>
      </motion.div>
    </div>
  );
};

export default AboutSection;
