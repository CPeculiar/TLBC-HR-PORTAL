import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User2, FileAudio, FileVideo, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const UploadMessage = () => {
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState("audio");
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Define allowed file extensions
  const allowedAudioExtensions = ["mp3", "wav", "aiff", "aac", "m4a", "ogg"];
  const allowedVideoExtensions = ["mp4", "avi", "mov", "wmv", "mkv", "avchd"];
  
  // Speaker data mapping (sample data similar to conductors)
  const speakerData = {
    "Reverend Elochukwu Udegbunam": "President, TLBC Int'l",
  };

  const speakerNames = Object.keys(speakerData);

  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: '',
    description: '',
    type: 'audio',
    audio: null,
    video: null
  });
  
  const [filePreview, setFilePreview] = useState({
    name: '',
    size: '',
    type: ''
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpeakerChange = (e) => {
    const selectedSpeaker = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      speaker: selectedSpeaker
    }));
  };
  
  // Handle date input change
  const handleDateChange = (e) => {
    setDate(e.target.value);
    setFormData(prev => ({
      ...prev,
      date: e.target.value
    }));
  };
  
  // Handle media type change
  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    setFormData(prev => ({
      ...prev,
      type: type,
      audio: type === 'audio' ? prev.audio : null,
      video: type === 'video' ? prev.video : null
    }));
    
    // Clear file preview when changing media type
    setFilePreview({
      name: '',
      size: '',
      type: ''
    });
    
    // Reset the file inputs
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (files && files[0]) {
      const file = files[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Validate file extension
      let isValid = true;
      if (name === 'audio' && !allowedAudioExtensions.includes(fileExtension)) {
        setErrors({
          audio: [`File extension "${fileExtension}" is not allowed. Allowed extensions are: ${allowedAudioExtensions.join(', ')}.`]
        });
        isValid = false;
      } else if (name === 'video' && !allowedVideoExtensions.includes(fileExtension)) {
        setErrors({
          video: [`File extension "${fileExtension}" is not allowed. Allowed extensions are: ${allowedVideoExtensions.join(', ')}.`]
        });
        isValid = false;
      } else {
        setErrors({});
      }
      
      if (isValid) {
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
        
        setFilePreview({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type
        });
      } else {
        // Reset the file input
        e.target.value = '';
        setFilePreview({
          name: '',
          size: '',
          type: ''
        });
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = ['Title is required'];
    }
    
    if (!formData.speaker) {
      newErrors.speaker = ['Speaker is required'];
    }
    
    if (!formData.date) {
      newErrors.date = ['Date is required'];
    }
    
    if (!formData.description.trim()) {
      newErrors.description = ['Description is required'];
    }
    
    if (formData.type === 'audio' && !formData.audio) {
      newErrors.audio = ['Audio file is required'];
    }
    
    if (formData.type === 'video' && !formData.video) {
      newErrors.video = ['Video file is required'];
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    try {
      setIsUploading(true);
      
      // Get access token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      // Create FormData object for multipart/form-data submission
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('speaker', formData.speaker);
      submitData.append('date', formData.date);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      
      // Append the appropriate media file
      if (formData.type === 'audio' && formData.audio) {
        submitData.append('audio', formData.audio);
      } else if (formData.type === 'video' && formData.video) {
        submitData.append('video', formData.video);
      }
      
      // Send POST request
      const response = await fetch('https://tlbc-platform-api.onrender.com/api/sermons/create/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
          // Content-Type is automatically set for multipart/form-data
        },
        body: submitData,
        // No Content-Type header needed; browser sets it automatically with boundary for multipart/form-data
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle API errors
        setErrors(result);
        setIsUploading(false);
        return;
      }
      
      // Reset form on successful submission
      setFormData({
        title: '',
        speaker: '',
        date: '',
        description: '',
        type: 'audio',
        audio: null,
        video: null
      });
      setDate('');
      setFilePreview({
        name: '',
        size: '',
        type: ''
      });
      
      // Reset file inputs
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      
      setIsUploading(false);
      
      // Show success message
      alert("Message uploaded successfully!");
       // Navigate back to events page
       navigate('/messagelist');
      
    } catch (error) {
      console.error("Error uploading message:", error);
      setErrors({ general: ['Failed to upload message. Please try again.'] });
      setIsUploading(false);
    }
  };
  
  return (
    <>
      <Breadcrumb pageName="Upload a Message" />

      <div className="p-2 sm:p-3 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">Upload New Message</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Title Field */}
                <div>
                  <Label htmlFor="title" className="block mb-1 text-sm sm:text-base font-medium">Message Title</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-2 sm:left-3 flex items-center">
                      <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
                    </span>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full pl-8 sm:pl-10 md:pl-12 py-1.5 sm:py-2 text-sm sm:text-base ${
                        errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500 font-medium">{errors.title[0]}</p>
                  )}
                </div>

                {/* Date Field */}
                <div>
                  <Label htmlFor="date" className="block mb-1 text-sm sm:text-base font-medium">Message Date</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-2 sm:left-3 flex items-center">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
                    </span>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={date}
                      onChange={handleDateChange}
                      className={`w-full rounded-md border ${
                        errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-transparent py-1.5 sm:py-2 pl-8 sm:pl-10 md:pl-12 pr-4 text-sm sm:text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                  </div>
                  {errors.date && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500 font-medium">{errors.date[0]}</p>
                  )}
                </div>

                {/* Speaker Field */}
                <div>
                  <Label htmlFor="speaker" className="block mb-1 text-sm sm:text-base font-medium">Preached By:</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-2 sm:left-3 flex items-center">
                      <User2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
                    </span>
                    <select
                      id="speaker"
                      name="speaker"
                      value={formData.speaker}
                      onChange={handleSpeakerChange}
                      className={`w-full rounded-md border ${
                        errors.speaker ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-transparent py-1.5 sm:py-2 pl-8 sm:pl-10 md:pl-12 pr-8 text-sm sm:text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1rem",
                      }}
                    >
                      <option value="" disabled>Select the minister</option>
                      {speakerNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.speaker && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500 font-medium">{errors.speaker[0]}</p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <Label htmlFor="description" className="block mb-1 text-sm sm:text-base font-medium">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full min-h-16 sm:min-h-20 md:min-h-24 text-sm sm:text-base ${
                      errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500 font-medium">{errors.description[0]}</p>
                  )}
                </div>

                {/* Media Type Selection */}
                <div>
                  <Label className="block mb-1 text-sm sm:text-base font-medium">Media Type</Label>
                  <div className="flex flex-wrap gap-2 mt-1 sm:gap-3">
                    <Button
                      type="button"
                      variant={mediaType === 'audio' ? 'default' : 'outline'}
                      className={`flex-1 flex justify-center items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                        mediaType === 'audio' 
                        ? 'bg-blue-950 text-white hover:bg-blue-800 ring-1 sm:ring-2 ring-blue-950' 
                        : 'bg-blue-50 text-gray-700 hover:bg-gray-100 border border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleMediaTypeChange('audio')}
                    >
                      <FileAudio className={`h-3 w-3 sm:h-4 sm:w-4 ${mediaType === 'audio' ? 'text-white' : 'text-gray-500'}`} />
                      <span>Audio</span>
                    </Button>
                    <Button
                      type="button"
                      variant={mediaType === 'video' ? 'default' : 'outline'}
                      className={`flex-1 flex justify-center items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                        mediaType === 'video' 
                        ? 'bg-blue-950 text-white hover:bg-blue-800 ring-1 sm:ring-2 ring-blue-950' 
                        : 'bg-blue-50 text-gray-700 hover:bg-gray-100 border border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleMediaTypeChange('video')}
                    >
                      <FileVideo className={`h-3 w-3 sm:h-4 sm:w-4 ${mediaType === 'video' ? 'text-white' : 'text-gray-500'}`} />
                      <span>Video</span>
                    </Button>
                  </div>
                </div>

                {/* Audio Upload Field */}
                {mediaType === 'audio' && (
                  <div>
                    <Label htmlFor="audio" className="block mb-1 text-sm sm:text-base font-medium">Audio File</Label>
                    <div className="mt-1">
                      <Input
                        id="audio"
                        name="audio"
                        type="file"
                        ref={audioInputRef}
                        onChange={handleFileChange}
                        accept=".mp3,.wav,.aiff,.aac,.m4a,.ogg"
                        className={`w-full text-xs sm:text-sm py-1.5 ${
                          errors.audio ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted formats: mp3, wav, aiff, aac, m4a, ogg
                      </p>
                      {errors.audio && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500 font-medium">{errors.audio[0]}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Upload Field */}
                {mediaType === 'video' && (
                  <div>
                    <Label htmlFor="video" className="block mb-1 text-sm sm:text-base font-medium">Video File</Label>
                    <div className="mt-1">
                      <Input
                        id="video"
                        name="video"
                        type="file"
                        ref={videoInputRef}
                        onChange={handleFileChange}
                        accept=".mp4,.avi,.mov,.wmv,.mkv,.avchd"
                        className={`w-full text-xs sm:text-sm py-1.5 ${
                          errors.video ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted formats: mp4, avi, mov, wmv, mkv, avchd
                      </p>
                      {errors.video && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500 font-medium">{errors.video[0]}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* File Preview */}
                {filePreview.name && (
                  <div className="p-2 sm:p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-xs sm:text-sm">
                    <h4 className="font-medium mb-1 sm:mb-2">File Preview</h4>
                    <p><span className="font-medium">Name:</span> {filePreview.name}</p>
                    <p><span className="font-medium">Size:</span> {filePreview.size}</p>
                    <p><span className="font-medium">Type:</span> {filePreview.type}</p>
                  </div>
                )}

                {/* General Error */}
                {errors.general && (
                  <div className="p-2 sm:p-3 rounded-md bg-red-50 text-red-600 text-xs sm:text-sm font-medium">
                    {errors.general[0]}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full py-1.5 sm:py-2 mt-2 sm:mt-4 text-sm sm:text-base font-medium"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Styles for better mobile responsiveness */}
      <style jsx global>{`
        /* Improved select styling */
        select option:hover {
          background-color: #dbeafe !important;
          color: #1e40af !important;
        }
        
        /* For Firefox */
        select:hover option:hover {
          background-color: #dbeafe !important;
          color: #1e40af !important;
        }
        
        /* For webkit browsers */
        select option:checked,
        select option:focus {
          background: linear-gradient(#dbeafe, #dbeafe);
          color: #1e40af !important;
        }
        
        /* Improve date input appearance on mobile */
        input[type="date"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          min-height: 2.5rem;
        }
        
        /* Custom calendar icon for date inputs on specific browsers */
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.6;
          padding: 0.2rem;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        /* Responsive file input styling */
        input[type="file"] {
          font-size: 0.75rem;
          padding: 0.375rem 0.5rem;
        }
        
        @media (min-width: 640px) {
          input[type="file"] {
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
          }
        }
        
        /* Better mobile touch targets */
        @media (max-width: 640px) {
          button, 
          input, 
          select, 
          textarea {
            font-size: 16px !important; /* Prevents iOS zoom on focus */
          }
          
          input[type="file"]::file-selector-button {
            padding: 0.375rem 0.5rem;
          }
        }
        
        /* Fix for dark mode */
        .dark input[type="date"] {
          color-scheme: dark;
        }
      `}</style>
    </>
  );
};

export default UploadMessage;