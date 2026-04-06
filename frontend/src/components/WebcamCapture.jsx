import Webcam from 'react-webcam';
import { useRef, useState, useCallback } from 'react';
import { Camera, VideoOff, Circle } from 'lucide-react';

export default function WebcamCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [cameraError, setCameraError] = useState(false);

  const handleStartRecording = useCallback(() => {
    if (!webcamRef.current?.stream) return;
    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.addEventListener('dataavailable', ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [...prev, data]);
      }
    });
    mediaRecorder.start();
    setIsRecording(true);
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setTimeout(() => {
      setRecordedChunks((chunks) => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const file = new File([blob], 'webcam-recording.webm', { type: 'video/webm' });
          onCapture?.(file);
        }
        return chunks;
      });
    }, 500);
  }, [onCapture]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-800/30">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-surface-200">Live Camera</span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 recording-dot" />
            <span className="text-xs text-red-400 font-medium">Recording</span>
          </div>
        )}
      </div>

      <div className="relative aspect-video bg-surface-900 flex items-center justify-center">
        {isActive && !cameraError ? (
          <Webcam
            ref={webcamRef}
            audio={true}
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            onUserMediaError={() => setCameraError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-surface-500">
            <VideoOff className="w-10 h-10" />
            <p className="text-sm">{cameraError ? 'Camera access denied' : 'Camera is off'}</p>
          </div>
        )}

        {/* Recording border overlay */}
        {isRecording && (
          <div className="absolute inset-0 border-2 border-red-500/50 rounded-none pointer-events-none" />
        )}
      </div>

      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => { setIsActive(!isActive); setCameraError(false); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
              : 'bg-primary-500/15 text-primary-400 border border-primary-500/30 hover:bg-primary-500/25'
          }`}
        >
          {isActive ? <VideoOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {isActive ? 'Turn Off' : 'Turn On'}
        </button>

        {isActive && !cameraError && (
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'gradient-primary text-white hover:opacity-90'
            }`}
          >
            <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-current' : ''}`} />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        )}
      </div>
    </div>
  );
}
