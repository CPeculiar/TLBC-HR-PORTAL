import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { db, storage } from '../../js/services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { mammoth } from 'mammoth';

const AdminDevotionalUpload = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    document: null,
    documentType: '',
    textContent: '', // Store extracted text content for search indexing
    previewImage: null
  });
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date input change
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };
  
  const handleDocumentChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Determine file type
    const fileType = file.type;
    let documentType = '';
    
    if (fileType === 'application/pdf') {
      documentType = 'pdf';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
              fileType === 'application/msword') {
      documentType = 'word';
    } else {
      alert('Please upload a PDF or Word document');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      document: file,
      documentType
    }));
    
    // Generate preview
    if (documentType === 'pdf') {
      // Create object URL for PDF preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Note: For a complete solution, you might want to use a PDF.js library
      // to extract text content for search indexing
      setPreviewText('PDF preview not available. File will be uploaded as is.');
    } 
    else if (documentType === 'word') {
      // For Word documents, use mammoth.js to extract text content
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const textContent = result.value;
        
        // Save the first 500 characters as preview
        const preview = textContent.substring(0, 500) + '...';
        setPreviewText(preview);
        
        // Store the full text for searching
        setFormData(prev => ({
          ...prev,
          textContent
        }));
      } catch (error) {
        console.error("Error extracting text from Word document:", error);
        setPreviewText('Error extracting text from document.');
      }
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the image preview
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        previewImage: file
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      alert('Please select a date for the devotional');
      return;
    }
    
    if (!formData.document) {
      alert('Please upload a devotional document');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // 1. Upload the document to Firebase Storage
      const safeFileName = formData.document.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `devotionals/${date}_${safeFileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, formData.document);
      
      // Handle the document upload
      const documentURL = await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading document:", error);
            alert("Error uploading document. Please try again.");
            reject(error);
            setIsUploading(false);
          },
          async () => {
            try {
              // Upload completed successfully, now get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
      
      // 2. Upload preview image if provided
      let imageURL = null;
      if (formData.previewImage) {
        const imageFileName = formData.previewImage.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const imageRef = ref(storage, `devotionals/images/${date}_${imageFileName}`);
        
        const imageUploadTask = uploadBytesResumable(imageRef, formData.previewImage);
        
        imageURL = await new Promise((resolve, reject) => {
          imageUploadTask.on('state_changed', 
            () => {}, // We're already tracking main document progress
            (error) => {
              console.error("Error uploading image:", error);
              // Continue even if image upload fails
              resolve(null);
            },
            async () => {
              try {
                const url = await getDownloadURL(imageUploadTask.snapshot.ref);
                resolve(url);
              } catch (error) {
                resolve(null);
              }
            }
          );
        });
      }
      
      // 3. Save devotional data to Firestore
      const devotionalDate = new Date(date);
      
      const devotionalData = {
        title: formData.title,
        author: formData.author,
        date: date, // Store the raw date string
        devotionalDate: devotionalDate, // Store as Date object for queries
        description: formData.description,
        documentURL: documentURL,
        documentType: formData.documentType,
        textContent: formData.textContent || '', // Store extracted text for searching
        imageURL: imageURL,
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      await addDoc(collection(db, "devotionals"), devotionalData);
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        document: null,
        documentType: '',
        textContent: '',
        previewImage: null
      });
      setDate("");
      setPreviewUrl('');
      setPreviewText('');
      setIsUploading(false);
      setUploadProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert("Devotional added successfully!");
      // Navigate back to devotionals management page
    //   navigate('/admindevotionalmgt');
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
          <Card>
            <CardHeader>
              <CardTitle>Upload New Devotional</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Devotional Edition</Label>
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
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="date">Month</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-24"
                    placeholder="Enter a brief description for this devotional edition"
                  />
                </div>

                <div>
                  <Label htmlFor="document">Upload the Devotional (PDF or Word)</Label>
                  <Input
                    id="document"
                    name="document"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleDocumentChange}
                    required
                    className="w-full"
                    ref={fileInputRef}
                  />
                  {formData.documentType && (
                    <p className="text-sm text-blue-600 mt-1">
                      Selected {formData.documentType.toUpperCase()} document
                    </p>
                  )}
                </div>
                
                {previewText && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border rounded-md">
                    <h3 className="text-sm font-medium mb-1">Document Preview:</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {previewText}
                    </p>
                  </div>
                )}
                
                {previewUrl && (
                  <div className="mt-2">
                    <h3 className="text-sm font-medium mb-1">PDF Document:</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      PDF preview is not available. The document will be viewable after upload.
                    </p>
                  </div>
                )}

                {/* <div>
                  <Label htmlFor="previewImage">Cover Image (Optional)</Label>
                  <Input
                    id="previewImage"
                    name="previewImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Add a cover image for the devotional (recommended)
                  </p>
                </div> */}

                <div className="flex flex-col space-y-4">
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-[10px]">
                        Uploading: {uploadProgress.toFixed(0)}%
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-10"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Devotional'}
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

export default AdminDevotionalUpload;