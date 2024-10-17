'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit3, Book, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          
          const db = getFirestore();
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            console.log("No user data found in Firestore");
            setUserData({});
          }

          // Fetch user's notes
          const notesQuery = query(collection(db, 'notes'), where('uploaderUid', '==', currentUser.uid));
          const notesSnapshot = await getDocs(notesQuery);
          const notesData = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserNotes(notesData);

        } else {
          console.log("No user logged in");
          router.push('/login');
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        if (err.code === 'permission-denied') {
          setError("Permission denied. Please check Firestore rules.");
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      setError(error.message);
    }
  };

  const getAvatarUrl = (user) => {
    if (user?.photoURL) {
      return user.photoURL;
    }
    // Fallback to DiceBear API if no photoURL is available
    const seed = user?.email || 'default';
    return `https://api.dicebear.com/5.x/initials/svg?seed=${seed}`;
  };

  const handleNoteClick = (noteId) => {
    router.push(`/course?id=${noteId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">No user logged in. Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="relative h-48 bg-blue-600">
          <Image
            src={userData?.coverImageUrl || "/default-cover.jpg"}
            alt="Cover Image"
            layout="fill"
            objectFit="cover"
            className="opacity-50"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <h2 className="text-3xl font-bold text-white">{user.displayName || 'Anonymous'}</h2>
            <p className="text-white text-sm mt-2">{user.email}</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-16 left-6">
            <Image
              src={user.photoURL || getAvatarUrl(user)}
              alt="Profile Image"
              width={128}
              height={128}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
        </div>
        <div className="px-6 py-12 sm:px-12">
          <div className="flex justify-end">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Edit3 size={20} />
            </button>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bio</h3>
            <p className="text-gray-600">
              {userData?.bio || "No bio available."}
            </p>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Notes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userNotes.length > 0 ? userNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="bg-gray-50 p-4 rounded-lg shadow flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleNoteClick(note.id)}
                >
                  <Book className="text-blue-500" size={24} />
                  <div>
                    <h4 className="text-gray-800 font-semibold">{note.title}</h4>
                    <p className="text-gray-600 text-sm">{note.description || 'No description'}</p>
                  </div>
                </div>
              )) : <p>No notes available.</p>}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-8 sm:px-12 border-t">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h3>
          {['Email', 'Password', 'Country'].map((setting, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <h4 className="text-gray-800 font-semibold">{setting}</h4>
                <p className="text-gray-600 text-sm">
                  {setting === 'Email' ? user.email : 
                   setting === 'Password' ? '********' : userData?.country || 'Not set'}
                </p>
              </div>
              {setting !== 'Country' && (
                <button className="text-blue-500 hover:text-blue-700 focus:outline-none">
                  Change
                </button>
              )}
            </div>
          ))}
          <div className="mt-8 text-right">
            <button 
              onClick={handleLogout}
              className="inline-flex items-center text-red-600 hover:text-red-800 focus:outline-none"
            >
              <LogOut size={20} className="mr-2" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
