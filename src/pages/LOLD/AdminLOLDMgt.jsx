import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, 
  Trash2, 
  Calendar, 
  FileText, 
  Eye, 
  Plus, 
  AlertTriangle 
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../js/services/firebaseConfig';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';

const AdminLOLDMgt = () => {
  const navigate = useNavigate();
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch devotionals
  useEffect(() => {
    const fetchDevotionals = async () => {
      try {
        const devotionalsRef = collection(db, "devotionals");
        const q = query(devotionalsRef, orderBy("devotionalDate", "desc"));
        const querySnapshot = await getDocs(q);
        
        const fetchedDevotionals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().devotionalDate.toDate().toISOString().split('T')[0]
        }));
        
        setDevotionals(fetchedDevotionals);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching devotionals:", err);
        setError("Failed to load devotionals");
        setLoading(false);
      }
    };
    
    fetchDevotionals();
  }, []);

  // Delete Devotional
  const handleDelete = async () => {
    if (!deleteModal) return;
    
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "devotionals", deleteModal.id));
      setDevotionals(devotionals.filter(d => d.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      console.error("Error deleting devotional:", err);
      alert("Failed to delete devotional");
    } finally {
      setIsDeleting(false);
    }
  };

  // Update Devotional
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editModal) return;
    
    try {
      setIsUpdating(true);
      const devotionalRef = doc(db, "devotionals", editModal.id);
      await updateDoc(devotionalRef, {
        topic: editModal.topic.toUpperCase(), // Convert topic to uppercase
        content: editModal.content,
        date: editModal.date,
        devotionalDate: new Date(editModal.date)
      });
      
      // Update local state
      setDevotionals(devotionals.map(d => 
        d.id === editModal.id 
          ? { 
              ...d, 
              topic: editModal.topic.toUpperCase(),
              content: editModal.content,
              date: editModal.date
            } 
          : d
      ));
      
      setEditModal(null);
    } catch (err) {
      console.error("Error updating devotional:", err);
      alert("Failed to update devotional");
    } finally {
      setIsUpdating(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Devotional Management" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-xl sm:text-2xl">DEVOTIONAL MANAGEMENT</CardTitle>
            <Button 
              onClick={() => navigate('/lold')}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Devotional
            </Button>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Date</TableHead>
                    <TableHead className="w-1/2">Topic</TableHead>
                    <TableHead className="w-1/4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devotionals.map((devotional) => (
                    <TableRow key={devotional.id}>
                      <TableCell>{devotional.date}</TableCell>
                      <TableCell>{devotional.topic}</TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => navigate(`/devotional/${devotional.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => setEditModal({
                              id: devotional.id,
                              topic: devotional.topic,
                              content: devotional.content,
                              date: devotional.date
                            })}
                          >
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => setDeleteModal(devotional)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-500" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the devotional "{deleteModal.topic}" 
                from {deleteModal.date}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Devotional'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      {editModal && (
        <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)} className="mt-50 ">
          <div className="max-w-2xl max-h-[90vh] overflow-y-auto mt-15">
            <DialogHeader>
              <DialogTitle>Edit Devotional</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input 
                  id="topic"
                  value={editModal.topic}
                  onChange={(e) => setEditModal(prev => ({
                    ...prev, 
                    topic: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input 
                  type="date"
                  id="date"
                  value={editModal.date}
                  onChange={(e) => setEditModal(prev => ({
                    ...prev, 
                    date: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content"
                  value={editModal.content}
                  onChange={(e) => setEditModal(prev => ({
                    ...prev, 
                    content: e.target.value
                  }))}
                  className="min-h-[300px]"
                  required
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditModal(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Devotional'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default AdminLOLDMgt;