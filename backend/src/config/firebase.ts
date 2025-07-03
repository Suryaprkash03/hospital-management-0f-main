import admin from 'firebase-admin';

// Mock Firebase setup for development without credentials
let db: FirebaseFirestore.Firestore;
let auth: admin.auth.Auth;

if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
  // Mock Firestore for development
  db = {
    collection: (name: string) => ({
      add: async (data: any) => ({ id: `mock_${Date.now()}` }),
      doc: (id: string) => ({
        get: async () => ({ exists: false, id, data: () => null }),
        update: async () => {},
        delete: async () => {},
      }),
      where: () => ({
        limit: () => ({
          get: async () => ({ empty: true, docs: [] })
        }),
        get: async () => ({ empty: true, docs: [] })
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({ empty: true, docs: [] })
        }),
        get: async () => ({ empty: true, docs: [] })
      }),
      get: async () => ({ empty: true, docs: [] })
    })
  } as any;

  auth = {
    createUser: async () => ({ uid: `mock_${Date.now()}` })
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