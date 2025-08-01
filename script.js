document.addEventListener('DOMContentLoaded', () => {
  const micButton = document.getElementById('mic-button');
  const statusText = document.getElementById('status-text');
  const messageContainer = document.getElementById('message-container');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modal-text');
  const closeButton = document.querySelector('.close-button');

  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;
  let websocket;

  // Initialize WebSocket
  function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    websocket = new WebSocket(`${protocol}//${window.location.host}`);

    websocket.onopen = () => {
      console.log('Connected to server');
      websocket.send(JSON.stringify({ type: 'start' }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.text) {
        addMessage(data.text, false);
      } else if (data.error) {
        showModal(data.error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      showModal('Connection error');
    };
  }

  // Start recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 16000
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = () => {
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(reader.result);
            websocket.send(JSON.stringify({ type: 'audio-end' }));
          }
        };
        reader.readAsArrayBuffer(audioBlob);
      };

      mediaRecorder.start(100);
      isRecording = true;
      micButton.classList.add('recording');
      statusText.textContent = 'Listening...';
      initWebSocket();
    } catch (err) {
      showModal('Microphone access denied');
      console.error('Recording error:', err);
    }
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      isRecording = false;
      micButton.classList.remove('recording');
      statusText.textContent = 'Processing...';
      audioChunks = [];
    }
  }

  // UI Functions
  function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.innerHTML = `<p>${text}</p>`;
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function showModal(message) {
    modalText.textContent = message;
    modal.style.display = 'flex';
  }

  // Event Listeners
  micButton.addEventListener('mousedown', startRecording);
  micButton.addEventListener('mouseup', stopRecording);
  closeButton.addEventListener('click', () => modal.style.display = 'none');
});