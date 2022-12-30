const getStats = function({ maxVIs, onComplete }) {
  
  let lastViStartTime = 0;
  let done = false;
  
  let stats = {
    viCount: 0,
    firstViStartTime: undefined,
    currentViStartTime: 0,
    lastViEndTime: 0,
    totalRunTime: 0,
    totalViRunTime: 0,
    beginStats: function() {

      const now = performance.now();
      if (stats.firstViStartTime === undefined) {
        stats.firstViStartTime = now;
      }

      stats.currentViStartTime = now;
    },
    endStats: function() {

      stats.viCount++;
      stats.lastViEndTime = performance.now();
      stats.totalRunTime = stats.lastViEndTime - stats.firstViStartTime;
      stats.totalViRunTime += stats.lastViEndTime - stats.currentViStartTime;
      
      if (maxVIs && stats.viCount >= maxVIs && !done) {

        done = true;
        
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 0);
      }
    }
  }

  return stats;
}

export default getStats;
