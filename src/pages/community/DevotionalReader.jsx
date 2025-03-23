import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Download, FileText, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { db } from '../../js/services/firebaseConfig';
import { collection, query, where, orderBy, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

// PDF viewer component using iframe
const PDFViewer = ({ fileURL }) => {
  return (
    <div className="w-full h-screen max-h-[800px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <iframe 
        src={`${fileURL}#toolbar=0&navpanes=0`} 
        className="w-full h-full"
        title="Devotional PDF"
      />
    </div>
  );
};

// Component to render text content from Word documents
const TextContentViewer = ({ textContent }) => {
  return (
    <div className="prose max-w-none dark:prose-invert">
      {/* We format the text content with proper spacing */}
      {textContent.split('\n').map((paragraph, index) => (
        paragraph.trim() ? (
          <p key={index} className="mb-4">{paragraph}</p>
        ) : <br key={index} />
      ))}
    </div>
  );
};

const DevotionalReader = () => {
  const { id } = useParams();
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedDevotionals, setRelatedDevotionals] = useState([]);
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
  
  // Fetch related devotionals, next and previous
  useEffect(() => {
    if (!devotional) return;
    
    const fetchRelated = async () => {
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
            title: docData.title,
            date: docData.date || docData.devotionalDate.toDate().toISOString().split('T')[0]
          });
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
            title: docData.title,
            date: docData.date || docData.devotionalDate.toDate().toISOString().split('T')[0]
          });
        }
        
        // Fetch related devotionals (by same author, excluding current)
        const relatedQuery = query(
          devotionalsRef,
          where("author", "==", devotional.author),
          orderBy("devotionalDate", "desc"),
          limit(5)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        
        const related = relatedSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date || doc.data().devotionalDate.toDate().toISOString().split('T')[0]
          }))
          .filter(dev => dev.id !== devotional.id)
          .slice(0, 3); // Limit to 3 related devotionals
        
        setRelatedDevotionals(related);
        
      } catch (err) {
        console.error("Error fetching related devotionals:", err);
      }
    };
    
    fetchRelated();
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
            {/* <Link to="/devotionals">View All Devotionals</Link> */}
            <Link to="/loldReader">Read the Devotional</Link>
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
            {/* <Link to="/devotionals">View All Devotionals</Link> */}
            <Link to="/loldReader">Read the Devotional</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Breadcrumb pageName="LOLD Devotional" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-4xl">
          {/* Navigation buttons */}
          <div className="flex justify-between mb-6">
            {prevDevotional ? (
              <Button 
                variant="outline" 
                asChild
                className="flex items-center gap-2"
              >
                <Link to={`/devotional/${prevDevotional.id}`}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <div></div> // Empty div to maintain spacing
            )}
            
            {/* <Button asChild variant="outline">
              <Link to="/devotionals">All Devotionals</Link>
            </Button> */}
            
            {nextDevotional ? (
              <Button 
                variant="outline" 
                asChild
                className="flex items-center gap-2"
              >
                <Link to={`/devotional/${nextDevotional.id}`}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div></div> // Empty div to maintain spacing
            )}
          </div>
          
          {/* Devotional content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">{devotional.title}</CardTitle>
              <div className="flex flex-col md:flex-row md:justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(devotional.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {devotional.author}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {devotional.description && (
                <div className="mb-6 italic text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2">
                  {devotional.description}
                </div>
              )}
              
              {devotional.imageURL && (
                <div className="mb-6">
                  <img 
                    src={devotional.imageURL} 
                    alt={devotional.title} 
                    className="w-full max-h-80 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="my-6">
                {devotional.documentType === 'pdf' ? (
                  <PDFViewer fileURL={devotional.documentURL} />
                ) : devotional.documentType === 'word' && devotional.textContent ? (
                  <TextContentViewer textContent={devotional.textContent} />
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>This document needs to be downloaded to view.</p>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t pt-6">
              <Button 
                variant="secondary" 
                className="flex items-center gap-2"
                asChild
              >
                <a href={devotional.documentURL} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4" />
                  Download Devotional
                </a>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Related devotionals */}
          {relatedDevotionals.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">More Devotionals by {devotional.author}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedDevotionals.map(related => (
                  <Card key={related.id} className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{related.title}</CardTitle>
                      <p className="text-sm text-gray-500">{formatDate(related.date)}</p>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm line-clamp-2">{related.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" asChild className="w-full">
                        <Link to={`/devotional/${related.id}`}>Read Devotional</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DevotionalReader;