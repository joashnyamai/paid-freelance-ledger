import { Invoice, Client } from '@/pages/Index';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class DatabaseService {
  // Migration helper to migrate localStorage data to Firestore
  static async migrateLocalStorageToFirestore(userId: string, userEmail: string): Promise<{ invoicesMigrated: number, clientsMigrated: number }> {
    let invoicesMigrated = 0;
    let clientsMigrated = 0;

    console.log('Starting localStorage to Firestore migration for user:', userId);

    // Check if migration has already been done
    const migrationDoc = await getDoc(doc(db, 'migrations', userId));
    if (migrationDoc.exists()) {
      console.log('Migration already completed for this user');
      return { invoicesMigrated: 0, clientsMigrated: 0 };
    }

    // Try to find data associated with the email "nyamaibigjoash"
    const possibleKeys = [
      `invoiceApp_clients_nyamaibigjoash`,
      `invoiceApp_invoices_nyamaibigjoash`,
      'clients',
      'invoices',
      'invoiceApp_clients',
      'invoiceApp_invoices'
    ];

    // Migrate clients
    for (const key of possibleKeys) {
      const data = localStorage.getItem(key);
      if (data && key.includes('client')) {
        try {
          const clients = JSON.parse(data) as Client[];
          if (Array.isArray(clients) && clients.length > 0) {
            console.log(`Found ${clients.length} clients in ${key}`);
            for (const client of clients) {
              await setDoc(doc(db, 'clients', client.id), {
                ...client,
                userId
              });
              clientsMigrated++;
            }
            break;
          }
        } catch (error) {
          console.error(`Error migrating clients from ${key}:`, error);
        }
      }
    }

    // Migrate invoices
    for (const key of possibleKeys) {
      const data = localStorage.getItem(key);
      if (data && key.includes('invoice')) {
        try {
          const invoices = JSON.parse(data) as Invoice[];
          if (Array.isArray(invoices) && invoices.length > 0) {
            console.log(`Found ${invoices.length} invoices in ${key}`);
            for (const invoice of invoices) {
              await setDoc(doc(db, 'invoices', invoice.id), {
                ...invoice,
                userId
              });
              invoicesMigrated++;
            }
            break;
          }
        } catch (error) {
          console.error(`Error migrating invoices from ${key}:`, error);
        }
      }
    }

    // Mark migration as complete
    await setDoc(doc(db, 'migrations', userId), {
      completedAt: new Date().toISOString(),
      invoicesMigrated,
      clientsMigrated
    });

    console.log(`Migration complete: ${invoicesMigrated} invoices, ${clientsMigrated} clients`);
    return { invoicesMigrated, clientsMigrated };
  }

  // Client operations
  static async getClients(userId: string): Promise<Client[]> {
    const q = query(
      collection(db, 'clients'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Client);
  }

  static async addClient(client: Omit<Client, 'id'>, userId: string): Promise<Client> {
    const id = crypto.randomUUID();
    const newClient = {
      ...client,
      id,
      userId
    };
    
    await setDoc(doc(db, 'clients', id), newClient);
    return newClient;
  }

  // Invoice operations
  static async getInvoices(userId: string): Promise<Invoice[]> {
    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Invoice);
  }

  static async addInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>, userId: string): Promise<Invoice> {
    const invoices = await this.getInvoices(userId);
    const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, '0')}`;
    
    const id = crypto.randomUUID();
    const newInvoice = {
      ...invoiceData,
      id,
      invoiceNumber,
      userId,
      amountPaid: 0,
      balance: invoiceData.total,
      items: invoiceData.items.map(item => ({
        ...item,
        id: crypto.randomUUID()
      }))
    };
    
    await setDoc(doc(db, 'invoices', id), newInvoice);
    return newInvoice;
  }

  static async updateInvoice(invoiceId: string, invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>, userId: string): Promise<Invoice> {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceDoc = await getDoc(invoiceRef);
    
    if (!invoiceDoc.exists()) {
      throw new Error('Invoice not found');
    }
    
    const existingInvoice = invoiceDoc.data() as Invoice;
    const updatedInvoice = {
      ...existingInvoice,
      ...invoiceData,
      balance: invoiceData.total - (existingInvoice.amountPaid || 0),
      items: invoiceData.items.map(item => ({
        ...item,
        id: item.id || crypto.randomUUID()
      }))
    };
    
    await updateDoc(invoiceRef, updatedInvoice as any);
    return updatedInvoice;
  }

  static async updateInvoiceStatus(invoiceId: string, status: Invoice['status'], userId: string): Promise<void> {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, { status });
  }

  static async deleteInvoice(invoiceId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, 'invoices', invoiceId));
  }

  static async addPayment(invoiceId: string, paymentAmount: number, userId: string): Promise<void> {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceDoc = await getDoc(invoiceRef);
    
    if (!invoiceDoc.exists()) {
      throw new Error('Invoice not found');
    }
    
    const invoice = invoiceDoc.data() as Invoice;
    const newAmountPaid = (invoice.amountPaid || 0) + paymentAmount;
    const newBalance = invoice.total - newAmountPaid;
    
    let newStatus: Invoice['status'] = invoice.status;
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0 && newBalance > 0) {
      newStatus = 'partially_paid';
    }
    
    await updateDoc(invoiceRef, {
      amountPaid: newAmountPaid,
      balance: Math.max(0, newBalance),
      status: newStatus
    });
  }
}