import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StartpageFooter } from './startpage_footer';
import { StartpageHeader } from './startpage_header';

export const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <StartpageHeader></StartpageHeader>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#F5F5F5',
                fontFamily: 'sans-serif',
                padding: '0 20px',
                textAlign: 'center'
              }}
            >
              <h1 style={{ marginBottom: '20px', color: '#333' }}>Willkommen bei RecyclRoute</h1>
          
              <p style={{ maxWidth: '600px', marginBottom: '40px', color: '#555', fontSize: '16px' }}>
                Wenn du Papier- oder Kartonsammlungen organisieren oder deine Route planen möchtest, klicke auf <strong>Planner</strong>.<br/>
                Wenn du nicht abgeholtes oder falsch deponiertes Material melden möchtest, klicke auf <strong>Report</strong>.
              </p>
          
              <div style={{ display: 'flex', gap: '20px' }}>
                {/* Planner Button – Grüntöne */}
                <motion.button
                  onClick={() => navigate('/planner')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  Planner
                </motion.button>
              
                {/* Report Button – Brauntöne */}
                <motion.button
                  onClick={() => navigate('/report')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: '#A67C52',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  Report
                </motion.button>
              </div>
            </motion.div>
    <StartpageFooter></StartpageFooter>
    </div>
  );
};

