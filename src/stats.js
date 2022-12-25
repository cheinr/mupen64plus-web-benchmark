const getStats = function({ maxVIs, onComplete }) {
  
  let lastViStartTime = 0;
  let done = false;
  
  let stats = {
    viCount: 0,
    firstViStartTime: undefined,
    lastViEndTime: 0,
    totalRunTime: 0,
    beginStats: function() {      
      if (stats.firstViStartTime === undefined) {
        stats.firstViStartTime = performance.now();;
      }
    },
    endStats: function() {

      stats.viCount++;
      stats.lastViEndTime = performance.now();
      stats.totalRunTime = stats.lastViEndTime - stats.firstViStartTime;
      
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
