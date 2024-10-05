import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from './firebase'; // Import Firestore instance (db)
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login'); // Redirect to login if user is not authenticated
      } else {
        const userDocRef = doc(db, 'users', currentUser.uid); // Use 'doc' and 'db'
        const userDoc = await getDoc(userDocRef); // Fetch the user's document
        if (userDoc.exists()) {
          setUser(userDoc.data()); // Set the user data
        }
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup the subscription
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : null; // Render children if user exists, else render nothing
};

export default ProtectedRoute;
