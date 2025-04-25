// DOM Elements
const timeInput = document.getElementById('timeInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const hourglass = document.getElementById('hourglass');
const container = document.getElementById('container');
const topSand = document.getElementById('topSand');
const bottomSand = document.getElementById('bottomSand');
const sandFlow = document.getElementById('sandFlow');
const timer = document.getElementById('timer');
const tickSound = document.getElementById('tickSound');
const alarmSound = document.getElementById('alarmSound');

// Variables
let countdown;
let totalTime = 0;
let remainingTime = 0;
let isRunning = false;
let tickSoundEnabled = true;

// Initialize
function init() {
  resetTimer();
  startBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetTimer);
  timeInput.addEventListener('input', validateInput);
  
  // Preload sounds
  tickSound.load();
  alarmSound.load();
}

// Validate input
function validateInput() {
  let value = parseInt(timeInput.value);
  if (isNaN(value) || value < 1) {
    timeInput.value = 1;
  } else if (value > 3600) {
    timeInput.value = 3600; // Maximum 1 hour
  }
}

// Toggle timer (start/pause)
function toggleTimer() {
  if (isRunning) {
    pauseTimer();
    startBtn.textContent = 'Resume';
    startBtn.classList.remove('start-active');
  } else {
    startTimer();
    startBtn.textContent = 'Pause';
    startBtn.classList.add('start-active');
  }
}

// Play tick sound
function playTickSound() {
  if (tickSoundEnabled && remainingTime > 0) {
    try {
      tickSound.currentTime = 0;
      tickSound.play().catch(e => {
        // Silent fallback if audio fails
        tickSoundEnabled = false;
      });
    } catch(e) {
      // Silent fallback if audio fails
      tickSoundEnabled = false;
    }
  }
}
// Initialize Web Audio API for custom sweet alarm
let audioContext;
let sweetAlarmOscillators = [];

// Function to create a sweet high-pitched alarm sound
function createSweetAlarm() {
  // Initialize audio context if it doesn't exist
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Clear any existing oscillators
  stopSweetAlarm();
  
  // Create a sequence of notes for a melodic alarm
  const notes = [880, 1046.50, 1318.51, 1760]; // A5, C6, E6, A6 - high but pleasant notes
  
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Set oscillator type and frequency
      oscillator.type = 'sine'; // Sine wave is smoother/sweeter than square or sawtooth
      oscillator.frequency.value = frequency;
      
      // Configure gain (volume) with fade in/out for smoother sound
      gainNode.gain.value = 0;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      // Connect the nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Start and stop the oscillator
      oscillator.start();
      sweetAlarmOscillators.push(oscillator);
      
      // Stop after a short duration
      setTimeout(() => {
        oscillator.stop();
        const index = sweetAlarmOscillators.indexOf(oscillator);
        if (index > -1) {
          sweetAlarmOscillators.splice(index, 1);
        }
      }, 500);
    }, index * 200); // Stagger the notes
  });
  
  // Repeat the sequence a few times
  for (let i = 1; i <= 5; i++) {
    setTimeout(() => {
      notes.forEach((frequency, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          
          gainNode.gain.value = 0;
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          sweetAlarmOscillators.push(oscillator);
          
          setTimeout(() => {
            oscillator.stop();
            const index = sweetAlarmOscillators.indexOf(oscillator);
            if (index > -1) {
              sweetAlarmOscillators.splice(index, 1);
            }
          }, 500);
        }, index * 200);
      });
    }, i * notes.length * 200);
  }
}

function stopSweetAlarm() {
  sweetAlarmOscillators.forEach(osc => {
    try {
      osc.stop();
    } catch (e) {
      // Oscillator might already be stopped
    }
  });
  sweetAlarmOscillators = [];
}
// Play alarm sound
function playAlarmSound() {
  try {
    // Make sure audio is loaded and ready to play
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.volume = 0.7;
    
    // Use the Audio API for more reliable playback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a stronger sound effect for better notification
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(780, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
    
    // Also try to play the backup audio file
    alarmSound.play().catch(e => {
      console.log('Using oscillator for sound instead');
    });
  } catch(e) {
    // Fallback to a simpler approach if the above fails
    console.log('Falling back to simpler audio approach');
    
    // Create a new audio element programmatically
    const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysrKysr6+vr6+vsbGxsbGxtTU1NTU1OLi4uLi4vDw8PDw8P////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7UMQAAAesTx2DTEZcMJFE0BmAkAAAH///kZxMTOF////+xSZQ/ChUahDAGFIfnmbFt///6fZZYQoYEYbHsLHMVmm///////////X//////+J/o4e6//+TLaeJRVXNsIcDiaTkbKA2bRn//////x9vf////+30//rUxAAACGxfHVMTEsAoS/5SCYkUAAAf////0T5hGUikn//////GPOH7vGCZQnICMpSIe8JZkf///////81v//+p////////+P//+2///+Cj8owTCROfkxQeJlIvs004LP///////8fn//////Y17hTiiQCMYuVlKuN//////7VEQAAAgwXx2zExMCuY0nhgJiVAAAA//n/+kVLOCo4c//////YxOIEJUdTBTHkDrFaftaf///////9Lb/////X//////8VV/su//2IFERER2nsaUDDsmpDAoVHvViglP/7// /D3/t+Q/00QmtkiBBEPTZBOK//////7UEQAAAgkXx2zExNSiY0j1gZjKgAAH////bGOTEy9RF/P//////4x8iGTTtexisUL7f//////6V//+mu/////////50L//9q66GKUbjdQwcBhYhEUUMM01JY////////C9//in/8UFLEAACDsLkxIdL//////tUxAAACHRfH1MzE1KHDSPWBmM2AAAP//8g5OTLyl////////8h3iGTdQEORsSg/f//////5f//+SH//////0+L//5BUHLE2MUCoDjigBAgnU6Mxf////////D9//or////nUAJAAQhPGiatL//////7UMQAAAhUWSyTMxJyew0j0AZjKgAAH//+sY5nJV0XP+P/////0Y6Ag7RUFBQXFf///////5zf//zq///F0eOp/+86CIIBM0IDmBQcFR6mi0iav///+H//////Ff/KumshAAEGZTSIiWH//////9REAAAACAA92MzEyAAAP8AAAAwAA//sQxAACDDCxGpAzNwAAAP8AAAAALQ==');
    audio.volume = 1.0;
    audio.play().catch(e => {
      console.log('Final fallback sound failed');
      // Create a beep using the browser's Web Audio API as last resort
      try {
        const beep = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = beep.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(840, beep.currentTime);
        oscillator.connect(beep.destination);
        oscillator.start();
        oscillator.stop(beep.currentTime + 0.5);
      } catch(e) {
        console.log('All sound approaches failed');
      }
    });
  }
}

// Start timer
function startTimer() {
  if (!isRunning) {
    // If starting fresh, get the time from input
    if (remainingTime === 0) {
      validateInput();
      totalTime = parseInt(timeInput.value);
      remainingTime = totalTime;
    }
    
    isRunning = true;
    hourglass.classList.add('running');
    container.classList.add('running');
    
    // Set the rate of sand flow based on total time
    const sandTopHeight = (remainingTime / totalTime) * 100;
    const sandBottomHeight = 100 - sandTopHeight;
    
    topSand.style.height = `${sandTopHeight}%`;
    bottomSand.style.height = `${sandBottomHeight}%`;
    
    // Start countdown
    updateDisplay();
    
    // Play initial tick sound
    playTickSound();
    
    countdown = setInterval(() => {
      remainingTime--;
      
      // Play tick sound every second
      playTickSound();
      
      // Update sand levels
      const sandTopHeight = (remainingTime / totalTime) * 100;
      const sandBottomHeight = 100 - sandTopHeight;
      
      topSand.style.height = `${sandTopHeight}%`;
      bottomSand.style.height = `${sandBottomHeight}%`;
      
      updateDisplay();
      
      if (remainingTime <= 0) {
        timerComplete();
      }
    }, 1000);
  }
}

// Pause timer
function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    hourglass.classList.remove('running');
    container.classList.remove('running');
    clearInterval(countdown);
  }
}

// Reset timer
function resetTimer() {
  pauseTimer();
  remainingTime = 0;
  startBtn.textContent = 'Start';
  startBtn.classList.remove('start-active');
  topSand.style.height = '100%';
  bottomSand.style.height = '0%';
  updateDisplay();
}

// Timer complete
function timerComplete() {
  pauseTimer();
  startBtn.textContent = 'Start';
  startBtn.classList.remove('start-active');
  
  // Play alarm sound with multiple fallbacks to ensure it works
  // playAlarmSound();
  // Play alarm sound
createSweetAlarm(); // Use our custom sweet alarm
  
  // Also try the second audio file as a backup
  try {
    const alarmSound2 = document.getElementById('alarmSound2');
    if (alarmSound2) {
      alarmSound2.volume = 0.8;
      alarmSound2.play().catch(e => console.log('Backup alarm sound failed'));
    }
  } catch(e) {
    console.log('Backup alarm access failed');
  }
  
  // Flash the timer and add visual effects
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    timer.style.color = timer.style.color === '#D9534F' ? '#333' : '#D9534F';
    timer.style.transform = timer.style.transform === 'scale(1.1)' ? 'scale(1)' : 'scale(1.1)';
    
    // Add pulsing border effect
    container.style.borderColor = container.style.borderColor === '#D9534F' ? '#D1B48C' : '#D9534F';
    container.style.boxShadow = container.style.boxShadow === '0 20px 50px rgba(0, 0, 0, 0.2), 0 0 15px rgba(217, 83, 79, 0.5)' 
      ? '0 20px 50px rgba(0, 0, 0, 0.2), 0 0 15px rgba(230, 185, 77, 0.3)'
      : '0 20px 50px rgba(0, 0, 0, 0.2), 0 0 15px rgba(217, 83, 79, 0.5)';
    
    // Try to play the sound again on subsequent flashes for browsers that block autoplay
    if (flashCount === 1 || flashCount === 3) {
      try {
        alarmSound.play().catch(e => {});
        if (document.getElementById('alarmSound2')) {
          document.getElementById('alarmSound2').play().catch(e => {});
        }
      } catch(e) {}
    }
    
    flashCount++;
    if (flashCount >= 6) {
      clearInterval(flashInterval);
      timer.style.color = '#333';
      timer.style.transform = 'scale(1)';
      container.style.borderColor = '#D1B48C';
      container.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.2)';
    }
  }, 300);
}

// Update timer display
function updateDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  
  timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);