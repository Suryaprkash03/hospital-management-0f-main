
import admin from 'firebase-admin';

// Mock Firebase setup for development without credentials
let db: FirebaseFirestore.Firestore;
let auth: admin.auth.Auth;

if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PRIVATE_KEY) {
  console.log('🔥 Running in development mode with mock Firebase');
  
  // Mock Firestore for development
  db = {
    collection: (name: string) => ({
      add: async (data: any) => {
        console.log(`Mock Firestore: Adding to ${name}:`, data);
        return { id: `mock_${Date.now()}` };
      },
      doc: (id: string) => ({
        get: async () => {
          console.log(`Mock Firestore: Getting doc ${id} from ${name}`);
          return { 
            exists: true, 
            id, 
            data: () => ({ id, name: 'Mock User', email: 'mock@example.com' })
          };
        },
        update: async (data: any) => {
          console.log(`Mock Firestore: Updating doc ${id} in ${name}:`, data);
        },
        delete: async () => {
          console.log(`Mock Firestore: Deleting doc ${id} from ${name}`);
        },
        set: async (data: any) => {
          console.log(`Mock Firestore: Setting doc ${id} in ${name}:`, data);
        }
      }),
      where: () => ({
        limit: (num: number) => ({
          get: async () => {
            console.log(`Mock Firestore: Query ${name} with limit ${num}`);
            return { empty: false, docs: [{ id: 'mock1', data: () => ({}) }] };
          }
        }),
        get: async () => {
          console.log(`Mock Firestore: Query ${name}`);
          return { empty: false, docs: [{ id: 'mock1', data: () => ({}) }] };
        }
      }),
      orderBy: () => ({
        limit: (num: number) => ({
          get: async () => {
            console.log(`Mock Firestore: OrderBy query ${name} with limit ${num}`);
            return { empty: false, docs: [{ id: 'mock1', data: () => ({}) }] };
          }
        }),
        get: async () => {
          console.log(`Mock Firestore: OrderBy query ${name}`);
          return { empty: false, docs: [{ id: 'mock1', data: () => ({}) }] };
        }
      }),
      get: async () => {
        console.log(`Mock Firestore: Getting all docs from ${name}`);
        return { empty: false, docs: [{ id: 'mock1', data: () => ({}) }] };
      }
    })
  } as any;

  auth = {
    createUser: async (userData: any) => {
      console.log('Mock Auth: Creating user:', userData);
      return { uid: `mock_${Date.now()}` };
    },
    getUserByEmail: async (email: string) => {
      console.log('Mock Auth: Getting user by email:', email);
      return { uid: 'mock_user', email };
    },
    updateUser: async (uid: string, userData: any) => {
      console.log('Mock Auth: Updating user:', uid, userData);
      return { uid };
    }
  } as any;
} else {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  db = admin.firestore();
  auth = admin.auth();
}

export { db, auth };
