import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { db, storage } from '../../js/services/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

// Enhanced time select component with custom dropdown arrow
const TimeSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-between text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || label}</span>
        <span className="ml-2">▼</span>
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <div
                key={option}
                className="cursor-pointer rounded px-2 py-1.5 text-sm transition-colors hover:bg-blue-100 hover:text-blue-800"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedHour, setSelectedHour] = useState("");
    const [selectedMinute, setSelectedMinute] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("PM");
    
    // Conductor data mapping (name to phone number)
    const conductorData = {
      "Pastor Eloka Okeke": "08064430141",
      "Pastor Mmesoma Okafor": "07035913268",
      "Pastor Ikechukwu Egwu": "07062148857",
      "Pastor Chinelo Okeke": "07032351655",
      "Pastor Ugochukwu Obiozor": "0813 778 4996",
      "Pastor Ujukaego Udegbunam": "08133972088",
      "Pastor Kenechukwu Chukwukelue": "09046515936",
      "Pastor Chizoba Okeke": "07032581169",
      "Pastor Divine Nwolisa": "07036480474",
      "Evangelist Chidimma Egwu": "08167353945",
      "Pastor Precious Mbanekwu": "08164625136",
      "Pastor Faith Bidiki": "08084944905"
    };
  
    const conductorNames = Object.keys(conductorData);
   
    // Available event types
    const eventTypes = [
      "Sunday Service", 
      "Midweek Service", 
      "Workers Meeting", 
      "Central Programs"
    ];
  
  const [date, setDate] = useState(null);
  const [formData, setFormData] = useState({
    eventType: '',
    title: '',
    conductor: '',
    time: '',
    location: '',
    description: '',
    contact: '',
    email: 'info@thelordsbrethrenchurch.org',
    image: null,
    meetingLink: ''
  });
  
  const [currentImageURL, setCurrentImageURL] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultImageUsed, setDefaultImageUsed] = useState(false);
  
  useEffect(() => {
    if (id) {
        fetchEvent();
    }
  }, [id]);

  // Parse time components from the time string
  const parseTimeComponents = (timeString) => {
    if (!timeString) return { hour: "", minute: "", period: "PM" };
    
    const timeParts = timeString.split(' ');
    const timePeriod = timeParts.length > 1 ? timeParts[1] : "PM";
    
    const timeComponents = timeParts[0].split(':');
    const hour = timeComponents[0] || "";
    const minute = timeComponents.length > 1 ? timeComponents[1] : "00";
    
    return { hour, minute, period: timePeriod };
  };
  
  const fetchEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, "events", id));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        
        // Parse date from Firestore - Fix for date handling
        let eventDate = null;
        if (eventData.eventDate) {
          const dateObj = eventData.eventDate.toDate ? eventData.eventDate.toDate() : new Date(eventData.eventDate);
          eventDate = dateObj;
          
          // Format date to YYYY-MM-DD for date input
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          setDate(formattedDate);
        }
        
        // Parse time components from the time string
        const timeComponents = parseTimeComponents(eventData.time);
        setSelectedHour(timeComponents.hour);
        setSelectedMinute(timeComponents.minute);
        setSelectedPeriod(timeComponents.period);

        setFormData({
          eventType: eventData.eventType || '',
          title: eventData.title || '',
          conductor: eventData.conductor || '',
          time: eventData.time || '',
          location: eventData.location || '',
          description: eventData.description || '',
          contact: eventData.contact || '',
          email: eventData.email || '',
          image: null,
          meetingLink: eventData.meetingLink || ''    
        });
        
        if (eventData.imageURL) {
          setCurrentImageURL(eventData.imageURL);
          setPreviewUrl(eventData.imageURL);
        }
      } else {
        alert("Event not found");
        navigate('/admineventmgt');
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Error fetching event details");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleConductorChange = (e) => {
    const selectedConductor = e.target.value;
    
    // Update conductor name and auto-fill phone number
    setFormData(prev => ({
      ...prev,
      conductor: selectedConductor,
      contact: conductorData[selectedConductor] || ''
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the file preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Store the file object itself
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

   const handleEventTypeChange = (e) => {
      const selectedEventType = e.target.value;
      
      setFormData(prev => ({
        ...prev,
        eventType: selectedEventType
      }));
  
      // If Workers Meeting is selected, set default image
      if (selectedEventType === "Workers Meeting" && !defaultImageUsed) {
        // This would typically be a fetch to get the default image
        setDefaultImageUsed(true);
        
        // Clear file input if it has a value
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Set a placeholder for the default image
         setPreviewUrl(WorkersMeetingIMG);
        
        // In a real implementation, you would fetch the actual image file
        // For now, we'll just update the form data to indicate default image is used
        setFormData(prev => ({
          ...prev,
        }));
      } else if (selectedEventType !== "Workers Meeting" && defaultImageUsed) {
          // Reset if changing from Workers Meeting to another type
          setDefaultImageUsed(false);
          setPreviewUrl('');
          setFormData(prev => ({
            ...prev,
            image: null
          }));
        }
      };

    // Handle date input change
    const handleDateChange = (e) => {
      setDate(e.target.value);
    };

     // Create arrays for hours, minutes
      const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(1, '0'));
      const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
      
      // Function to handle time selection
      const handleTimeChange = () => {
        if (selectedHour && selectedMinute) {
          const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
          setFormData(prev => ({
            ...prev,
            time: formattedTime
          }));
        }
      };
      
      // Update time whenever any time component changes
      useEffect(() => {
        handleTimeChange();
      }, [selectedHour, selectedMinute, selectedPeriod]);
  
  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Create date object from string or use existing date object
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Function to add ordinal suffix
    const getOrdinal = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
  
    return `${dayName}, ${getOrdinal(day)} ${month}, ${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      alert('Please select a date');
      return;
    }

    if (!formData.time) {
      alert('Please select a time for the event');
      return;
    }

    if (formData.eventType === "Workers Meeting" && !formData.meetingLink) {
      alert('Please provide a Google Meet link for the Workers Meeting');
      return;
    }
    
    try {
      setIsUploading(true);
      
      let imageURL = currentImageURL;
      
      // Upload new image if selected
      if (formData.image && formData.image instanceof File) {
        const storageRef = ref(storage, `events/${Date.now()}_${formData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, formData.image);
        
        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
            },
            reject,
            async () => {
              imageURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }
      
      // Create a new Date object from the date string
      const eventDate = new Date(date);
      const formattedDate = formatEventDate(eventDate);
      
      const eventData = {
        eventType: formData.eventType,
        title: formData.title,
        conductor: formData.conductor,
        date: formattedDate,
        eventDate: eventDate,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        contact: formData.contact,
        email: formData.email,
        meetingLink: formData.meetingLink
      };

      // Only update image if a new one was uploaded
      if (imageURL !== currentImageURL) {
        eventData.imageURL = imageURL;
      }
      
      await updateDoc(doc(db, "events", id), eventData);
      
      setIsUploading(false);
      alert("Event updated successfully.");
      // Navigate back to events management
      navigate('/admineventmgt');
      
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event. Please try again.");
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <>
      <Breadcrumb pageName="Edit Event" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                                <Label htmlFor="eventType">Event Type</Label>
                                <select
                                  id="eventType"
                                  name="eventType"
                                  value={formData.eventType}
                                  onChange={handleEventTypeChange}
                                  required
                                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                                  style={{
                                    WebkitAppearance: "none",
                                    MozAppearance: "none",
                                    appearance: "none",
                                    backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "right 0.5rem center",
                                    backgroundSize: "1rem",
                                    paddingRight: "2rem"
                                  }}
                                >
                                  <option value="" disabled>Select event type</option>
                                  {eventTypes.map((type) => (
                                    <option key={type} value={type} className="hover:bg-blue-100">{type}</option>
                                  ))}
                                </select>
                              </div>

                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
  
                <div>
                  <Label htmlFor="date">Event Date</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </span>
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={handleDateChange}
                      required
                      className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <Label>Event Time</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {/* Hour Select */}
                    <div>
                      <TimeSelect
                        label="Hour"
                        options={hours}
                        value={selectedHour}
                        onChange={setSelectedHour}
                      />
                    </div>
                    
                    {/* Minute Select */}
                    <div>
                      <TimeSelect
                        label="Min"
                        options={minutes}
                        value={selectedMinute}
                        onChange={setSelectedMinute}
                      />
                    </div>
                    
                    {/* AM/PM Select */}
                    <div>
                      <TimeSelect
                        label="AM/PM"
                        options={["AM", "PM"]}
                        value={selectedPeriod}
                        onChange={setSelectedPeriod}
                      />
                    </div>
                  </div>
                  {formData.time && (
                    <Input
                      value={`Selected time: ${formData.time}`}
                      className="text-sm text-muted-foreground mt-2"
                      readOnly
                    />
                  )}
                </div>


                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
  
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

         <div>
                  <Label htmlFor="conductor">Conductor's Name</Label>
                  <select
                    id="conductor"
                    name="conductor"
                    value={formData.conductor}
                    onChange={handleConductorChange}
                    required
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    style={{
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      appearance: "none",
                      backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1rem",
                      paddingRight: "2rem"
                    }}
                  >
                    <option value="" disabled>Select a conductor</option>
                    {conductorNames.map((name) => (
                      <option key={name} value={name} className="hover:bg-blue-100">{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="contact">Conductor's Phone Number</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    type="tel"
                    className="w-full"
                  />
                </div>

   
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                  />
                </div>
  
      {formData.eventType === "Workers Meeting" && (
                  <div>
                      <Label htmlFor="meetingLink">Meeting Link</Label>
                      <Input
                        id="meetingLink"
                        name="meetingLink"
                        value={formData.meetingLink}
                        onChange={handleInputChange}
                        placeholder="Enter the meeting link here"
                        required
                        className="w-full"
                      />
                    </div>
                  )}

                <div>
                  <Label htmlFor="image">Event Image</Label>
                  <div className="mb-2 text-sm text-gray-500">
                    Current image will be used if no new image is selected
                  </div>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {previewUrl && (
                    <div className="mt-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
  
                <div className="flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/admineventmgt')}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Updating...' : 'Update Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EditEvent;
