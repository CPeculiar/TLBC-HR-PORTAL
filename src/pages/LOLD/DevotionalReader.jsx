import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { db } from '../../js/services/firebaseConfig';
import { collection, query, where, orderBy, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const DevotionalReader = () => {
  const { id } = useParams();
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextDevotional, setNextDevotional] = useState(null);
  const [prevDevotional, setPrevDevotional] = useState(null);
  
  // Fetch the devotional and related devotionals
  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          // If no ID is provided, fetch the most recent devotional
          const devotionalsRef = collection(db, "devotionals");
          const q = query(devotionalsRef, orderBy("devotionalDate", "desc"), limit(1));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            setDevotional({
              id: querySnapshot.docs[0].id,
              ...docData,
              date: docData.date || docData.devotionalDate.toDate().toISOString().split('T')[0]
            });
          } else {
            setError("No devotionals found");
          }
        } else {
          // Fetch the specific devotional by ID
          const docRef = doc(db, "devotionals", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const docData = docSnap.data();
            setDevotional({
              id: docSnap.id,
              ...docData,
              date: docData.date || docData.devotionalDate.toDate().toISOString().split('T')[0]
            });
          } else {
            setError("Devotional not found");
          }
        }
      } catch (err) {
        console.error("Error fetching devotional:", err);
        setError("Failed to load devotional");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevotional();
  }, [id]);
  
  // Fetch next and previous devotionals
  useEffect(() => {
    if (!devotional) return;
    
    const fetchRelatedDevotionals = async () => {
      try {
        const devotionalsRef = collection(db, "devotionals");
        
        // Fetch next devotional (newer)
        const nextQuery = query(
          devotionalsRef,
          where("devotionalDate", ">", devotional.devotionalDate),
          orderBy("devotionalDate", "asc"),
          limit(1)
        );
        const nextSnapshot = await getDocs(nextQuery);
        
        if (!nextSnapshot.empty) {
          const docData = nextSnapshot.docs[0].data();
          setNextDevotional({
            id: nextSnapshot.docs[0].id,
            topic: docData.topic,
            date: docData.date || docData.devotionalDate.toDate().toISOString().split('T')[0]
          });
        } else {
          setNextDevotional(null);
        }
        
        // Fetch previous devotional (older)
        const prevQuery = query(
          devotionalsRef,
          where("devotionalDate", "<", devotional.devotionalDate),
          orderBy("devotionalDate", "desc"),
          limit(1)
        );
        const prevSnapshot = await getDocs(prevQuery);
        
        if (!prevSnapshot.empty) {
          const docData = prevSnapshot.docs[0].data();
          setPrevDevotional({
            id: prevSnapshot.docs[0].id,
            topic: docData.topic,
            date: docData.date || docData.devotionalDate.toDate().toISOString().split('T')[0]
          });
        } else {
          setPrevDevotional(null);
        }
        
      } catch (err) {
        console.error("Error fetching related devotionals:", err);
      }
    };
    
    fetchRelatedDevotionals();
  }, [devotional]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format text with bold for asterisk-wrapped content
  const formatText = (text) => {
    // Split the text into parts
    const parts = text.split(/(\*[^*]+\*)/g);
    
    return parts.map((part, index) => {
      // Check if the part is wrapped in asterisks
      if (part.startsWith('*') && part.endsWith('*')) {
        // Remove asterisks and wrap in bold
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      // Return plain text
      return part;
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Button asChild>
            <Link to="/devotional-reader">Read the Devotional</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!devotional) {
    return (
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">No Devotional Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">We couldn't find the devotional you're looking for.</p>
          <Button asChild>
            <Link to="/devotional-reader">Read the Devotional</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Breadcrumb pageName="Daily Devotional" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-4xl">
          {/* Navigation buttons */}
          <div className="flex justify-between mb-6">
            <Button 
              variant="outline" 
              asChild
              className="flex items-center gap-2"
              disabled={!prevDevotional}
            >
              {prevDevotional ? (
                <Link to={`/devotional/${prevDevotional.id}`}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span className="text-gray-400">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="flex items-center gap-2"
              disabled={!nextDevotional}
            >
              {nextDevotional ? (
                <Link to={`/devotional/${nextDevotional.id}`}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="text-gray-400">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
          
          {/* Devotional content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">{devotional.topic}</CardTitle>
              <div className="flex flex-col md:flex-row md:justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(devotional.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{devotional.author}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                {devotional.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="mb-4">
                      {formatText(paragraph)}
                    </p>
                  ) : <br key={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DevotionalReader;