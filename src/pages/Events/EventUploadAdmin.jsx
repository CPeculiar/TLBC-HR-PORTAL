import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, User2, Calendar } from 'lucide-react';
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
        className="w-full flex items-center justify-between"
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

  const [formData, setFormData] = useState({
    title: '',
    conductor: '',
    time: '',
    location: '',
    description: '',
    contact: '',
    email: 'info@thelordsbrethrenchurch.org',
    image: null
  });
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
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
    
    if (!formData.image) {
      alert('Please select an image');
      return;
    }

    if (!formData.time) {
      alert('Please select a time for the event');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // 1. Get a safe filename by removing spaces and special characters
      const safeFileName = formData.image.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `events/${Date.now()}_${safeFileName}`);
      
      // 2. Upload image to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, formData.image);
      
      // Handle the upload
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Track progress if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error("Error uploading image:", error);
          alert("Error uploading image. Please try again.");
          setIsUploading(false);
        },
        async () => {
          try {
            // Upload completed successfully, now get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // 3. Save event data to Firestore
            const eventDate = new Date(date); // Convert string date to Date object
            
            const eventData = {
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
              createdAt: serverTimestamp()
            };
            
            // Check if events collection exists, if not it will be created automatically
            await addDoc(collection(db, "events"), eventData);
            
            // Reset form
            setFormData({
              title: '',
              conductor: '',
              time: '',
              location: '',
              description: '',
              contact: '',
              email: '',
              image: null
            });
            setDate("");
            setSelectedHour("");
            setSelectedMinute("");
            setSelectedPeriod("PM");
            setPreviewUrl('');
            setIsUploading(false);
            
            alert("Event added successfully!");
            // Navigate back to events page
            navigate('/admineventmgt');
          } catch (error) {
            console.error("Error after upload:", error);
            alert("Error saving event data. Please try again.");
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Error adding event. Please try again.");
      setIsUploading(false);
    }
  };
  
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
                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-2">
                  {/* Hour Select */}
                  <div className="sm:w-24">
                    <TimeSelect
                      label="Hour"
                      options={hours}
                      value={selectedHour}
                      onChange={setSelectedHour}
                    />
                  </div>
                  
                  <span className="text-center">:</span>
                  
                  {/* Minute Select */}
                  <div className="sm:w-24">
                    <TimeSelect
                      label="Min"
                      options={minutes}
                      value={selectedMinute}
                      onChange={setSelectedMinute}
                    />
                  </div>
                  
                  {/* AM/PM Select */}
                  <div className="sm:w-24">
                    <TimeSelect
                      label="AM/PM"
                      options={["AM", "PM"]}
                      value={selectedPeriod}
                      onChange={setSelectedPeriod}
                    />
                  </div>
                </div>
                {formData.time && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected time: {formData.time}
                  </p>
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
                />
              </div>

              <div>
                <Label htmlFor="image">Event Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="w-full"
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

              <Button 
                type="submit" 
                className="w-full"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    </>
  );
};

export default AdminEventUpload;