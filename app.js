(() => {
  const scriptInput = document.getElementById('scriptInput');
  const charCount = document.getElementById('charCount');
  const sentenceCount = document.getElementById('sentenceCount');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateSlider = document.getElementById('rateSlider');
  const pitchSlider = document.getElementById('pitchSlider');
  const volSlider = document.getElementById('volSlider');
  const rateVal = document.getElementById('rateVal');
  const pitchVal = document.getElementById('pitchVal');
  const volVal = document.getElementById('volVal');
  const btnPlay = document.getElementById('btnPlay');
  const btnPause = document.getElementById('btnPause');
  const btnStop = document.getElementById('btnStop');
  const playStatus = document.getElementById('playStatus');
  const btnRecord = document.getElementById('btnRecord');
  const recordStatus = document.getElementById('recordStatus');
  const recordList = document.getElementById('recordList');
  const btnInstall = document.getElementById('btnInstall');

  const synth = window.speechSynthesis;
  let voices = [];
  let queue = [];
  let queueIndex = 0;
  let isPaused = false;
  let onQueueComplete = null;
  let activeUtterance = null; // simpan referensi supaya tidak di-GC browser saat sedang bicara

  // ---------- Char / sentence counter ----------
  function splitSentences(text){
    const parts = text.match(/[^.!?\n]+[.!?]*/g);
    return (parts || [text]).map(s => s.trim()).filter(Boolean);
  }
  scriptInput.addEventListener('input', () => {
    charCount.textContent = scriptInput.value.length;
    sentenceCount.textContent = splitSentences(scriptInput.value).length;
  });

  // ---------- Voice list ----------
  function loadVoices(){
    voices = synth.getVoices();
    if(voices.length === 0) return;
    voiceSelect.innerHTML = '';
    const sorted = [...voices].sort((a,b) => {
      const aId = a.lang.toLowerCase().startsWith('id') ? 0 : 1;
      const bId = b.lang.toLowerCase().startsWith('id') ? 0 : 1;
      return aId - bId;
    });
    sorted.forEach(v => {
      const opt = document.createElement('option');
      opt.value = voices.indexOf(v);
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
  }
  loadVoices();
  if(synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;

  rateSlider.addEventListener('input', () => rateVal.textContent = Number(rateSlider.value).toFixed(1) + 'x');
  pitchSlider.addEventListener('input', () => pitchVal.textContent = Number(pitchSlider.value).toFixed(1));
  volSlider.addEventListener('input', () => volVal.textContent = Math.round(volSlider.value*100) + '%');

  // ---------- Playback engine ----------
  function buildUtterance(text){
    const utter = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices[Number(voiceSelect.value)];
    if(selectedVoice) utter.voice = selectedVoice;
    utter.rate = Number(rateSlider.value);
    utter.pitch = Number(pitchSlider.value);
    utter.volume = Number(volSlider.value);
    return utter;
  }

  function speakNext(){
    if(queueIndex >= queue.length){
      playStatus.textContent = 'Selesai.';
      btnPlay.disabled = false; btnPause.disabled = true; btnStop.disabled = true;
      const cb = onQueueComplete; onQueueComplete = null;
      if(cb) cb();
      return;
    }
    playStatus.textContent = `Membacakan kalimat ${queueIndex+1} dari ${queue.length}…`;
    const utter = buildUtterance(queue[queueIndex]);
    activeUtterance = utter; // cegah bug Chrome yang menghapus utterance sebelum selesai bicara
    utter.onend = () => { activeUtterance = null; queueIndex++; speakNext(); };
    utter.onerror = () => { activeUtterance = null; queueIndex++; speakNext(); };
    synth.speak(utter);
  }

  function startPlayback(onComplete){
    const text = scriptInput.value.trim();
    if(!text){ playStatus.textContent = 'Naskah masih kosong.'; return; }
    synth.cancel();
    queue = splitSentences(text);
    queueIndex = 0;
    isPaused = false;
    onQueueComplete = onComplete || null;
    btnPlay.disabled = true; btnPause.disabled = false; btnStop.disabled = false;
    btnPause.textContent = '⏸ JEDA';
    speakNext();
  }

  btnPlay.addEventListener('click', () => startPlayback(null));

  btnPause.addEventListener('click', () => {
    if(!isPaused){
      synth.pause(); isPaused = true; btnPause.textContent = '▶ LANJUT';
      playStatus.textContent = 'Dijeda.';
    } else {
      synth.resume(); isPaused = false; btnPause.textContent = '⏸ JEDA';
    }
  });

  btnStop.addEventListener('click', () => {
    synth.cancel();
    queue = []; queueIndex = 0; isPaused = false; onQueueComplete = null; activeUtterance = null;
    btnPlay.disabled = false; btnPause.disabled = true; btnStop.disabled = true;
    playStatus.textContent = 'Dihentikan.';
  });

  // ---------- Experimental: record tab audio while speaking ----------
  let recordCount = 0;

  btnRecord.addEventListener('click', async () => {
    const text = scriptInput.value.trim();
    if(!text){ recordStatus.textContent = 'Isi naskah dulu sebelum merekam.'; return; }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia){
      recordStatus.textContent = 'Fitur rekam tab tidak tersedia di browser/perangkat ini.';
      return;
    }
    btnRecord.disabled = true;
    recordStatus.style.color = 'var(--muted)';
    recordStatus.textContent = 'Meminta izin berbagi tab… pilih "Tab ini" dan centang "Bagikan audio tab".';

    let displayStream;
    try{
      displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    }catch(err){
      recordStatus.style.color = 'var(--magenta)';
      recordStatus.textContent = 'Dibatalkan atau tidak didukung. Fitur ini biasanya hanya jalan di Chrome/Edge desktop.';
      btnRecord.disabled = false;
      return;
    }

    const audioTracks = displayStream.getAudioTracks();
    if(audioTracks.length === 0){
      recordStatus.style.color = 'var(--magenta)';
      recordStatus.textContent = 'Tidak ada audio yang dibagikan. Ulangi dan pastikan centang opsi bagikan audio.';
      displayStream.getTracks().forEach(t => t.stop());
      btnRecord.disabled = false;
      return;
    }

    const audioStream = new MediaStream(audioTracks);
    let recorder;
    try{
      recorder = new MediaRecorder(audioStream);
    }catch(err){
      recordStatus.style.color = 'var(--magenta)';
      recordStatus.textContent = 'Gagal memulai perekam audio di browser ini.';
      displayStream.getTracks().forEach(t => t.stop());
      btnRecord.disabled = false;
      return;
    }

    const chunks = [];
    recorder.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      displayStream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      addRecordEntry(url);
      recordStatus.style.color = 'var(--cyan)';
      recordStatus.textContent = 'Rekaman selesai.';
      btnRecord.disabled = false;
    };

    recorder.start();
    recordStatus.style.color = 'var(--cyan)';
    recordStatus.textContent = 'Merekam… sedang memutar naskah.';
    startPlayback(() => recorder.stop());
  });

  function addRecordEntry(url){
    recordCount++;
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="li-main">
        <div class="li-title">narasi_${recordCount}.webm</div>
        <div class="li-sub">Rekaman audio tab</div>
      </div>
      <a href="${url}" download="narasi_${recordCount}.webm" style="color:var(--cyan); text-decoration:none; font-size:11px; padding:4px;">↓</a>
    `;
    recordList.prepend(item);
  }

  // ---------- PWA install ----------
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; btnInstall.hidden = false; });
  btnInstall.addEventListener('click', async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; btnInstall.hidden = true;
  });
  window.addEventListener('appinstalled', () => { btnInstall.hidden = true; });
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(()=>{}); });
  }
})();
