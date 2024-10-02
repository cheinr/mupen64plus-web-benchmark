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
    viStats: [],
    beginStats: function() {

      const now = performance.now();
      if (stats.firstViStartTime === undefined) {
        stats.firstViStartTime = now;
      }

      stats.currentViStartTime = now;
    },
    endStats: function(numberOfRecompiles) {

      const currentTime = performance.now();

      stats.viStats[stats.viCount++] = {
        time: currentTime - stats.currentViStartTime,
        numberOfRecompiles
      };
      stats.lastViEndTime = currentTime;
      stats.totalRunTime = stats.lastViEndTime - stats.firstViStartTime;
      stats.totalViRunTime += stats.lastViEndTime - stats.currentViStartTime;

      
      if (maxVIs && stats.viCount >= maxVIs && !done) {

        done = true;

        if (onComplete) {
          onComplete();
        }

//        setTimeout(() => {
//          if (onComplete) {
//            onComplete();
//          }
//        }, 0);
      }
    }
  }

  return stats;
}

export default getStats;
