'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db, auth } from '../firebaseConfig';
import { Star, ThumbsUp, ThumbsDown, FileText, IndianRupee, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StarRating = ({ rating, onRate, userRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={index}
            className={`cursor-pointer ${
              ratingValue <= (hover || userRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onRate(ratingValue)}
          />
        );
      })}
    </div>
  );
};

const RatingBar = ({ rating, percentage }) => (
  <div className="flex items-center">
    <span className="w-3 text-sm font-medium">{rating}</span>
    <div className="w-full bg-gray-200 rounded-full h-2 ml-2">
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
    <span className="ml-2 text-sm text-gray-600 w-12">{percentage}%</span>
  </div>
);

const Comment = ({ name, date, rating, comment, likes }) => (
  <div className="mb-6 border-b pb-4">
    <div className="flex items-center mb-2">
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
        {name[0]}
      </div>
      <div>
        <span className="font-semibold mr-2">{name}</span>
        <span className="text-sm text-gray-500">{date}</span>
      </div>
    </div>
    <StarRating rating={rating} />
    <p className="mt-2 text-gray-700">{comment}</p>
    <div className="mt-2 text-sm text-gray-600 flex items-center">
      <ThumbsUp className="w-4 h-4 mr-1" />
      <span className="mr-4">{likes}</span>
      <ThumbsDown className="w-4 h-4 mr-1" />
      <button className="text-blue-600 ml-2">Reply</button>
    </div>
  </div>
);

const PDFViewer = ({ url, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF. Please try again later.");
  }

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">PDF Viewer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow overflow-auto" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="flex flex-col items-center"
              loading={<div className="text-center">Loading PDF...</div>}
            >
              <Page 
                pageNumber={pageNumber}  
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setPageNumber(page => Math.max(page - 1, 1))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="text-blue-500">
              -
            </button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="text-blue-500">
              +
            </button>
          </div>
          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>
          <button
            onClick={() => setPageNumber(page => Math.min(page + 1, numPages))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(comment);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 border rounded-md bg-gray-100 text-gray-800"
        placeholder="Write your comment..."
        rows="3"
        required
      />
      <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
        Submit Comment
      </button>
    </form>
  );
};

export default function CourseDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [courseData, setCourseData] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (id) {
        const docRef = doc(db, "notes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourseData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
          router.push('/');
        }
      }
    };

    fetchCourseData();
  }, [id, router]);

  const handleBuyNow = () => {
    if (user) {
      router.push(`/payment?id=${courseData.id}`);
    } else {
      // Redirect to login page or show login modal
      router.push('/login');
    }
  };

  const handleAddComment = async (commentText) => {
    if (!user) {
      alert('Please log in to add a comment');
      return;
    }

    const newComment = {
      email: user.email,
      comment: commentText,
      timestamp: new Date()
    };

    const noteRef = doc(db, "notes", id);
    await updateDoc(noteRef, {
      comments: arrayUnion(newComment)
    });

    setCourseData(prevData => ({
      ...prevData,
      comments: [...(prevData.comments || []), newComment]
    }));
  };

  const handleRate = async (newRating) => {
    if (!user) {
      alert('Please log in to rate this note');
      return;
    }

    const noteRef = doc(db, "notes", id);
    const userRating = courseData.userRatings?.find(r => r.userId === user.uid);

    let newUserRatings = courseData.userRatings || [];
    let newTotalRating = (courseData.rating || 0) * (courseData.ratingCount || 0);

    if (userRating) {
      // Update existing rating
      newTotalRating = newTotalRating - userRating.rating + newRating;
      newUserRatings = newUserRatings.map(r => 
        r.userId === user.uid ? { ...r, rating: newRating } : r
      );
    } else {
      // Add new rating
      newTotalRating += newRating;
      newUserRatings.push({ userId: user.uid, rating: newRating });
    }

    const newRatingCount = newUserRatings.length;
    const newAverageRating = newTotalRating / newRatingCount;

    await updateDoc(noteRef, {
      rating: newAverageRating,
      ratingCount: newRatingCount,
      userRatings: newUserRatings
    });

    setCourseData(prevData => ({
      ...prevData,
      rating: newAverageRating,
      ratingCount: newRatingCount,
      userRatings: newUserRatings
    }));
  };

  const handleViewPDF = () => {
    if (courseData.isPaid && (!user || !courseData.downloaderEmails.includes(user.email))) {
      router.push(`/payment?id=${courseData.id}`);
    } else {
      if (courseData.pdfUrls && courseData.pdfUrls.length > 0) {
        console.log("PDF URL:", courseData.pdfUrls[0]); // Log the PDF URL
        setShowPDF(true);
      } else {
        console.error("No PDF URL available");
        alert("Sorry, the PDF is not available at the moment.");
      }
    }
  };

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userRating = user ? courseData.userRatings?.find(r => r.userId === user.uid)?.rating : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-800">{courseData.subject}</h1>
                <p className="text-gray-600 mb-2">{courseData.college}</p>
                {courseData.isPaid && (
                  <div>
                    <p className="text-lg font-semibold text-green-600 flex items-center">
                      <IndianRupee size={20} className="mr-1" />
                      {courseData.amount}
                    </p>
                    {user && !courseData.downloaderEmails.includes(user.email) && (
                      <button 
                        onClick={handleBuyNow}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button 
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors text-lg font-semibold flex items-center"
                onClick={handleViewPDF}
              >
                <FileText className="mr-2" />
                View PDF
              </button>
            </div>
            
            <div className="flex items-center mb-6">
              <Image
                src="/PDF_file_icon.png"
                alt="PDF icon"
                width={40}
                height={40}
                className="mr-4"
              />
              <div>
                <p className="text-sm text-gray-600">Uploaded by: {courseData.uploaderEmail}</p>
                <p className="text-sm text-gray-600">Downloads: {courseData.downloaderEmails?.length || 0}</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">Description</h2>
            <p className="text-gray-700 mb-4">{courseData.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800">University</h3>
                <p className="text-gray-700">{courseData.college}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Branch</h3>
                <p className="text-gray-700">{courseData.branch}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Class</h3>
                <p className="text-gray-700">{courseData.class}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800">Unit</h3>
                <p className="text-gray-700">{courseData.unit}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Upload Date</h3>
                <p className="text-gray-700">{new Date(courseData.timestamp.seconds * 1000).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white shadow-lg rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Rating</h2>
          <div className="flex items-center mb-4">
            <span className="text-4xl font-bold mr-2 text-gray-800">{courseData.rating?.toFixed(1) || 0}</span>
            <StarRating rating={courseData.rating || 0} onRate={handleRate} userRating={userRating} />
            <span className="ml-2 text-sm text-gray-600">{courseData.ratingCount || 0} ratings</span>
          </div>
       
        </section>

        <section className="bg-white shadow-lg rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>
          {courseData.comments && courseData.comments.length > 0 ? (
            courseData.comments.map((comment, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">{comment.email}</p>
                <p className="text-gray-700 mt-1">{comment.comment}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-700">No comments yet.</p>
          )}
          {user ? (
            <CommentForm onSubmit={handleAddComment} />
          ) : (
            <p className="mt-4 text-gray-700">Please log in to add a comment.</p>
          )}
        </section>
      </main>

      {showPDF && courseData.pdfUrls && courseData.pdfUrls.length > 0 && (
        <PDFViewer 
          url={courseData.pdfUrls[0]} 
          onClose={() => setShowPDF(false)} 
        />
      )}
    </div>
  );
}