import createMupen64PlusWeb, { mainMupen64PlusWebJsFileName } from 'mupen64plus-web';
import getStats from './stats';

const inputElement = document.getElementById("file-selector");
inputElement.addEventListener("change", handleFiles, false);


let emuControls;

function onComplete() {
  console.log('onComplete');
  const statsInfoEl = document.getElementById('done-info');
  statsInfoEl.innerHTML = 'DONE!';

  const doneDiv = document.createElement('div');
  doneDiv.id = 'done';
  statsInfoEl.appendChild(doneDiv);

  if (emuControls) {
    //emuControls.stop();
  }
}

const queryParams = new URLSearchParams(window.location.search);

const maxVIs = queryParams.get('maxVIs')
             ? parseInt(queryParams.get('maxVIs'))
             : 1000;
window.stats = getStats({ maxVIs, onComplete });

setInterval(function() {
  const statsInfoEl = document.getElementById('stats-info');

  statsInfoEl.innerHTML = `
    <table>
      <thead>
        <th>Number of VIs</th>
        <th>Average VIs</th>
        <th>Average VI Time Millis</th>
        <th>Total Time (Seconds)</th>
      </thead>
      <tbody>
        <tr>
          <td>${stats.viCount}</td>
          <td>${(stats.viCount / (stats.totalRunTime / 1000)).toFixed(3)}</td>
          <td>${((stats.totalViRunTime) / stats.viCount).toFixed(3)}</td>
          <td>${(stats.totalRunTime / 1000).toFixed(3)}</td>
          <tr>
      </tbody>
    </table>
  `;
}, 1000);

function handleFiles() {
  
  const fileList = this.files;

  fileList[0].arrayBuffer().then((romData) => {

    createMupen64PlusWeb({
      canvas: document.getElementById('canvas'),
      romData: romData,
      romConfigOptionOverrides: {
        videoRice: {
          ScreenUpdateSetting: 1
        }
      },
      mainScriptUrlOrBlob: `/${mainMupen64PlusWebJsFileName}`,
      coreConfig: {
        emuMode: 1,
        mainLoopTimingMode: 1, // 0 = requestAnimationFrame, 1 = setTimeout(0)
      },
      beginStats: stats.beginStats,
      endStats: stats.endStats,
      netplayConfig: {
        player: 0
      }
    }).then(async (controls) => {
      emuControls = controls;
      return controls.start();
    }).catch((err) => {
      console.error('Exception during emulator initialization: %o', err);
    });

  });
}



