import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, User2, Calendar, Video, CalendarPlus } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "../../components/ui/cn";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { db, storage } from '../../js/services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import WorkersMeetingIMG from '../../images/programs/Workers_Meeting.jpg';


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

const AdminEventUpload = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
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
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [defaultImageUsed, setDefaultImageUsed] = useState(false);
  const fileInputRef = useRef(null);
  
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
      // setPreviewUrl('/assets/images/WorkersMeetingIMG.jpg');
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


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the file preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDefaultImageUsed(false);
      
      // Store the file object itself
      setFormData(prev => ({
        ...prev,
        image: file
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      alert('Please select a date');
      return;
    }
    
    if (!formData.image && !defaultImageUsed) {
      alert('Please select an image');
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
      let downloadURL;

      // If using the default workers meeting image
      if (defaultImageUsed) {  
       // Upload the default image to Firebase Storage instead of just using the local path
  const defaultImageFile = await fetch(WorkersMeetingIMG).then(r => r.blob());
  const safeFileName = "workers_meeting_default.jpg";
  const storageRef = ref(storage, `events/${Date.now()}_${safeFileName}`);
  
  const uploadTask = uploadBytesResumable(storageRef, defaultImageFile);
  
  // Handle the upload of default image
  await new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error("Error uploading default image:", error);
        reject(error);
        setIsUploading(false);
      },
      async () => {
        try {
          downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    );
  });
      } else {
      // 1. Get a safe filename by removing spaces and special characters
      const safeFileName = formData.image.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `events/${Date.now()}_${safeFileName}`);
      
      // 2. Upload image to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, formData.image);
      
      // Handle the upload
      await new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Track progress if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error("Error uploading image:", error);
          alert("Error uploading image. Please try again.");
          reject(error);
          setIsUploading(false);
        },
        async () => {
          try {
            // Upload completed successfully, now get download URL
            downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }
            
            // 3. Save event data to Firestore
            const eventDate = new Date(date); // Convert string date to Date object
            
            const eventData = {
              eventType: formData.eventType,
              title: formData.title,
              conductor: formData.conductor,
              date: date, // Store the raw date string
              eventDate: eventDate, // Store as Date object for queries
              time: formData.time,
              location: formData.location,
              description: formData.description,
              contact: formData.contact,
              email: formData.email,
              imageURL: downloadURL,
              meetingLink: formData.meetingLink || null,
              createdAt: serverTimestamp()
            };
            
            // Check if events collection exists, if not it will be created automatically
            await addDoc(collection(db, "events"), eventData);
            
            // Reset form
            setFormData({
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
            setDate("");
            setSelectedHour("");
            setSelectedMinute("");
            setSelectedPeriod("PM");
            setPreviewUrl('');
            setIsUploading(false);
            setDefaultImageUsed(false);
            
            alert("Event added successfully!");
            // Navigate back to events page
            navigate('/admineventmgt');
          } catch (error) {
            console.error("Error after upload:", error);
            alert("Error saving event data. Please try again.");
            setIsUploading(false);
          }
        }
  
  return (
    <>
       <Breadcrumb pageName="Upload Event" />

       <div className="p-4 md:p-6 2xl:p-10">
       <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Event</CardTitle>
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
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full min-h-24"
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

                {/* Adding custom styles to enable hover effects on select options */}
                <style jsx global>{`
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
                `}</style>
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
                  required
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
                  className="w-full"
                  readOnly
                />
              </div>

              {formData.eventType === "Workers Meeting" && (
                <div>
                    <Label htmlFor="meetingLink">Google Meet Link</Label>
                    <Input
                      id="meetingLink"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleInputChange}
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      required
                      className="w-full"
                    />
                  </div>
                )}

              <div>
                <Label htmlFor="image">Event Image</Label>
                {formData.eventType === "Workers Meeting" && defaultImageUsed ? (
                  <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">Using default Workers Meeting image</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDefaultImageUsed(false);
                          setPreviewUrl('');
                          setFormData(prev => ({
                            ...prev,
                            image: null
                          }));
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!defaultImageUsed}
                  className="w-full"
                  ref={fileInputRef}
                />
                 )}
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

              <div className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Event'}
              </Button>

              {/* This section shows a preview of what the event buttons would look like */}
              {formData.eventType && (
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <h3 className="text-sm font-medium mb-2">Event Action Buttons Preview:</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {formData.eventType === "Workers Meeting" && (
                          <Button 
                            type="button" 
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                          >
                            <Video className="h-4 w-4" />
                            Join Meeting
                          </Button>
                        )}
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full sm:w-auto"
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    </>
  );
};


export default AdminEventUpload;