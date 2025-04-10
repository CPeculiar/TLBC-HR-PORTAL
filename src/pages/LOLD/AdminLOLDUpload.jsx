import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { db } from '../../js/services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const AdminLOLDUpload = () => { 
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    content: '',
    date: '',
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setFormData(prev => ({
      ...prev,
      date: selectedDate
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      alert('Please select a date for the devotional');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Prepare devotional data
      const devotionalData = {
        topic: formData.topic,
        content: formData.content,
        date: date,
        devotionalDate: new Date(date),
        author: 'By Reverend Elochukwu Udegbunam',
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      await addDoc(collection(db, "devotionals"), devotionalData);
      
      // Reset form
      setFormData({
        topic: '',
        content: '',
        date: ''
      });
      setDate("");
      setIsUploading(false);
      
      alert("Devotional added successfully!");
      navigate('/loldReader');
      
    } catch (error) {
      console.error("Error uploading devotional:", error);
      alert("Error saving devotional. Please try again.");
      setIsUploading(false);
    }
  };
  
  return (
    <>
      <Breadcrumb pageName="Upload Devotional" />

      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-2xl">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Upload New Devotional</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="topic">Topic of the Day</Label>
                  <Input
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Enter the devotional topic"
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
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
                      className="w-full rounded border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Devotional Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[300px]"
                    placeholder="Paste the full devotional content here..."
                  />
                </div>

                <div>
                  <Label>Author</Label>
                  <Input
                    value="By Reverend Elochukwu Udegbunam"
                    disabled
                    className="w-full bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Devotional'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminLOLDUpload;