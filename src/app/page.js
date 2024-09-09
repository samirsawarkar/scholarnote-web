'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from './firebaseConfig';
import Image from 'next/image';
import { Search, Share2, Menu, User, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from './components/Navbar';
import { onAuthStateChanged } from "firebase/auth";

const NoteCard = ({ note }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/course?id=${note.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Image
              src="/PDF_file_icon.png"
              alt="PDF icon"
              width={24}
              height={24}
              className="mr-2"
            />
            <h3 className="font-bold text-lg text-black">{note.subject}</h3>
          </div>
          {note.isPaid && (
            <span className="flex items-center text-green-600">
              <IndianRupee size={16} className="mr-1" />
              {note.amount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{note.college} - {note.branch}</p>
        <p className="text-sm text-gray-600">Class: {note.class}, Unit: {note.unit}</p>
        <p className="text-sm text-gray-600">Downloads: {note.downloaderEmails ? note.downloaderEmails.length : 0}</p>
        <p className="text-sm text-black">{note.description.substring(0, 100)}...</p>
        <p className="text-sm text-gray-600 mt-2">Uploaded by: {note.uploaderEmail}</p>
      </div>
    </div>
  );
};

const QuickLink = ({ text, onClick }) => (
  <button 
    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
    onClick={onClick}
  >
    {text}
  </button>
);

const ScholarNoteDashboard = () => {
  const router = useRouter();
  const [academicNotes, setAcademicNotes] = useState([]);
  const [personalNotes, setPersonalNotes] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchNotes(currentUser.email);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchNotes = async (userEmail) => {
    const notesCollection = collection(db, "notes");
    const notesSnapshot = await getDocs(notesCollection);
    const notesList = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAcademicNotes(notesList);

    // Fetch personal notes (uploaded by the user)
    const personalNotesQuery = query(
      notesCollection,
      where("uploaderEmail", "==", userEmail)
    );
    const personalNotesSnapshot = await getDocs(personalNotesQuery);
    const personalNotesList = personalNotesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPersonalNotes(personalNotesList);
  };

  const handleCreateNote = () => {
    router.push('/create-note');
  };

  const handleLandingPageClick = () => {
    router.push('/landing');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar onCreateNote={handleCreateNote} />  {/* Add the common Navbar here */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <div 
            className="rounded-lg p-12 text-center bg-cover bg-center relative min-h-[400px] flex flex-col justify-center items-center"
            style={{ backgroundImage: "url('/add.png')" }}
          >
            <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
            <div className="relative z-10 w-full">
              <h2 className="text-4xl font-bold mb-6 text-white">Share and discover notes from your classes</h2>
              <div className="flex max-w-xl mx-auto">
                <div className="flex-grow flex items-center bg-white rounded-l-full">
                  <Search className="ml-4 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for a note"
                    className="w-full py-3 px-4 rounded-l-full focus:outline-none text-gray-900"
                  />
                </div>
                <button className="bg-blue-500 text-white rounded-r-full px-8 py-3 hover:bg-blue-400 transition-colors text-lg font-semibold">
                  Explore Notes
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Academic Notes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">My Notes/Downloaded Notes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Links</h2>
          <div className="flex space-x-4">
            <QuickLink text="Upload Notes" onClick={handleCreateNote} />
            <QuickLink text="Browse Categories" onClick={() => console.log('Browse Categories clicked')} />
            <QuickLink text="View Popular Notes" onClick={() => console.log('View Popular Notes clicked')} />
            <QuickLink text="Landing page" onClick={handleLandingPageClick} />
            <QuickLink text="My Profile" onClick={handleProfileClick} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ScholarNoteDashboard;