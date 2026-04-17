import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Assume Firebase is initialized
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

const OmniSyncTask = () => {
  const [task, setTask] = useState({ title: '', status: 'Pending' });
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. DATA RECONCILIATION: Real-time parity between Remote and Local
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "tasks", "global-task-1"), (doc) => {
      if (doc.exists()) {
        setTask(doc.data());
      }
    });
    return () => unsub();
  }, []);

  // 2. STATE MANAGEMENT: Optimistic UI for seamless hand-off
  const handleUpdate = async (newTitle) => {
    const previousTitle = task.title;
    
    // Local Cache update (Instant feedback)
    setTask({ ...task, title: newTitle });
    setIsSyncing(true);

    try {
      // Remote Server Sync
      await updateDoc(doc(db, "tasks", "global-task-1"), {
        title: newTitle,
        lastModified: Date.now()
      });
    } catch (error) {
      console.error("Sync failed, reverting state.");
      setTask({ ...task, title: previousTitle });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      {/* 3. RESPONSIVE UI: Architectural Refinement (Mobile-to-Desktop) */}
      <div className="w-full max-w-md md:max-w-2xl bg-white rounded-xl shadow-lg p-6 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase text-gray-500">Cross-Device Task</label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => handleUpdate(e.target.value)}
              className="w-full text-xl font-semibold border-b-2 border-transparent focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter task..."
            />
          </div>

          {/* 4. PERFORMANCE SWEEP: Latency Indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isSyncing ? 'Reconciling Data...' : 'Cloud Synced'}
            </span>
          </div>
        </div>
        
        <p className="mt-4 text-xs text-gray-400 italic">
          Interaction patterns remain consistent across hardware specifications.
        </p>
      </div>
    </div>
  );
};

export default OmniSyncTask;
