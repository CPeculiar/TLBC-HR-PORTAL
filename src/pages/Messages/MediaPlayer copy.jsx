import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, ArrowLeft, Loader2, Download } from 'lucide-react';

const MediaPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const source = params.get('source');
  const title = params.get('title') || 'Untitled Message';
  const speaker = params.get('speaker') || 'Unknown Speaker';
  const mediaType = params.get('type') || '';
  const messageId = params.get('messageId');
  const disableDownload = params.get('disableDownload') === 'true';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(1);

  const mediaRef = useRef(null);
  const progressRef = useRef(null);

  // Determine if the file is audio or video
  const isAudio = mediaType === 'audio' || source?.toLowerCase().endsWith('.mp3');
  const isVideo = mediaType === 'video' || source?.toLowerCase().endsWith('.mp4');

  useEffect(() => {
    if (!source) {
      setError('No media source provided');
      setIsLoading(false);
      return;
    }

    try {
      new URL(source); // Validate URL
    } catch (err) {
      console.error("Invalid media URL:", source);
      setError(`Invalid media URL: ${err.message}`);
      setIsLoading(false);
    }
  }, [source]);

  useEffect(() => {
    if (!mediaRef.current) {
      console.error("Media reference is not available");
      setError("Media player not initialized correctly");
      setIsLoading(false);
      return;
    }

    const media = mediaRef.current;
    
    media.onloadedmetadata = () => {
      setDuration(media.duration);
      setIsLoading(false);
    };

    media.ontimeupdate = () => {
      setCurrentTime(media.currentTime);
    };

    media.onended = () => {
      setIsPlaying(false);
    };

    media.onerror = (e) => {
      console.error("Media loading error:", e);
      setError("Error loading media");
      setIsLoading(false);
    };

    return () => {
      media.onloadedmetadata = null;
      media.ontimeupdate = null;
      media.onended = null;
      media.onerror = null;
    };
  }, []);

  const handlePlayPause = async () => {
    if (!mediaRef.current) return;

    try {
      if (isPlaying) {
        mediaRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await mediaRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play error:', error);
      setError('Could not play media.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuteToggle = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setVolume(newVolume);
      
      if (newVolume === 0) {
        setIsMuted(true);
        mediaRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        mediaRef.current.muted = false;
      }
    }
  };

  const handleProgressChange = (e) => {
    if (mediaRef.current) {
      const newTime = parseFloat(e.target.value);
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadMedia = () => {
    if (source) {
      const link = document.createElement('a');
      link.href = source;
      link.download = `${title.replace(/\s+/g, '_')}.${isAudio ? 'mp3' : 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto my-8">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{title}</h2>
        <p className="text-gray-500 mb-6 font-medium">{speaker}</p>

        <div className="w-full mb-6 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-lg z-10">
              <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
            </div>
          )}

          {isAudio && (
            <div className="rounded-md overflow-hidden bg-gray-50 p-4 flex items-center justify-center h-48">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <Volume2 className="h-16 w-16 text-white" />
              </div>
              <audio
                ref={mediaRef}
                src={source}
                className="hidden"
                controlsList={disableDownload ? 'nodownload' : undefined}
              />
            </div>
          )}

          {isVideo && (
            <div className="rounded-md overflow-hidden bg-black aspect-video">
              <video
                ref={mediaRef}
                src={source}
                className="w-full h-full object-contain"
                controlsList={disableDownload ? 'nodownload' : undefined}
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</p>}

        <div className="space-y-4">
          {/* Progress bar */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 w-12">{formatTime(currentTime)}</span>
            <input
              type="range"
              ref={progressRef}
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="flex-grow h-2 appearance-none bg-gray-200 rounded-full outline-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-600 w-12">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handlePlayPause} 
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-300 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 
                  <Loader2 className="h-6 w-6 animate-spin" /> : 
                  isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />
                }
              </button>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleMuteToggle} 
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 appearance-none bg-gray-200 rounded-full outline-none accent-blue-600"
                />
              </div>
            </div>
            
            {!disableDownload && (
              <button 
                onClick={downloadMedia} 
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center"
              >
                <Download className="h-5 w-5 mr-1" />
                <span className="text-sm">Download</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;