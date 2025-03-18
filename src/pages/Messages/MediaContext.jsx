// Create a new file called MediaContext.jsx in your context or shared folder
import React, { createContext, useState, useContext } from 'react';

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [lastPlayedMedia, setLastPlayedMedia] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  
  const addToRecentlyPlayed = (mediaItem) => {
    setLastPlayedMedia(mediaItem);
  };
  
  const setPlaylist = (playlist) => {
    setCurrentPlaylist(playlist);
  };
  
  return (
    <MediaContext.Provider value={{ 
      lastPlayedMedia, 
      addToRecentlyPlayed,
      currentPlaylist,
      setPlaylist
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
