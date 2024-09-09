'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Pen, Video } from 'lucide-react';
import Navbar from '../components/Navbar';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from '../firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';

export default function UploadNotesPage() {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    amount: 0,
    branch: '',
    class: '',
    college: '',
    description: '',
    isPaid: false,
    subject: '',
    unit: '',
    rating: 0, // Initial rating
    ratingCount: 0 // Number of ratings
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               name === 'amount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to upload notes');
      return;
    }
    if (!selectedFile) {
      alert('Please select a PDF file to upload');
      return;
    }

    const storageRef = ref(storage, `pdfs/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const docRef = await addDoc(collection(db, "notes"), {
            ...formData,
            pdfUrls: [downloadURL],
            timestamp: new Date(),
            uploaderEmail: user.email,
            downloaderEmails: [],
            comments: [], // Initialize comments as an empty array
            rating: 0, // Initial rating
            ratingCount: 0 // Number of ratings
          });
          console.log("Document written with ID: ", docRef.id);
          alert("Note uploaded successfully!");
          // Redirect to home page
          router.push('/');
        } catch (e) {
          console.error("Error adding document: ", e);
          alert("Failed to save note details. Please try again.");
        }
      }
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-3xl mx-auto mt-8 p-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Upload your notes</h1>
        <p className="text-gray-700 mb-6">
          Help students around the world by sharing your notes. Your notes will be reviewed before they are published.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Upload Options */}
          <div className="flex space-x-4 mb-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf"
              style={{ display: 'none' }}
            />
            <button 
              type="button"
              onClick={handleUploadClick}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-md text-gray-800 hover:bg-gray-200 transition-colors"
            >
              <Upload size={20} />
              <span>Upload PDF</span>
            </button>
          </div>

          {selectedFile && (
            <div className="mb-4">
              <p className="text-green-600">Selected file: {selectedFile.name}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress.toFixed(2)}% uploaded</p>
            </div>
          )}

          {/* Form Fields */}
          {['college', 'branch', 'subject', 'class', 'unit'].map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                placeholder={`Enter ${field}`}
                className="w-full p-2 bg-gray-100 rounded-md text-gray-900"
              />
            </div>
          ))}

          {/* Paid/Free Option */}
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <span className="ml-2 text-gray-800">Paid</span>
            </label>
          </div>

          {/* Amount (only if isPaid is true) */}
          {formData.isPaid && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                className="w-full p-2 bg-gray-100 rounded-md text-gray-900"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter Description"
              className="w-full p-2 bg-gray-100 rounded-md text-gray-900"
              rows={4}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
            Upload Note
          </button>
        </form>
      </main>
    </div>
  );
}