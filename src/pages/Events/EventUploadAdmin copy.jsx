import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, Mail, User2 } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "../../components/ui/cn";
import { Calendar } from "../../components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { db, storage } from '../../js/services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AdminEventUpload = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    conductor: '',
    time: '',
    location: '',
    description: '',
    contact: '',
    email: '',
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

  const formatEventDate = (date) => {
    if (!date) return '';
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
    
    if (!formData.image) {
      alert('Please select an image');
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
          const formattedDate = formatEventDate(date);
          const eventDate = new Date(date); // For comparing dates in queries
          
          const eventData = {
            title: formData.title,
            conductor: formData.conductor,
            date: formattedDate,
            eventDate: eventDate,
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
          setDate(null);
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
                />
              </div>

              <div>
                <Label htmlFor="conductor">Conductor Name</Label>
                <Input
                  id="conductor"
                  name="conductor"
                  value={formData.conductor}
                  onChange={handleInputChange}
                  placeholder="Conductor's Name"
                  required
                />
              </div>

              <div>
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? formatEventDate(date) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Event Time</Label>
                <Input
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="6:00 PM"
                  required
                />
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
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  type="tel"
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

              <div>
                <Label htmlFor="image">Event Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
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
  );
};

export default AdminEventUpload;