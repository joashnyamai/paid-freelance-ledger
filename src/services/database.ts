import { Invoice, Client, InvoiceItem } from '@/pages/Index'

export class DatabaseService {
  // Migration helper to recover old data
  static async migrateOldData(userId: string): Promise<{ invoicesMigrated: number, clientsMigrated: number }> {
    let invoicesMigrated = 0;
    let clientsMigrated = 0;

    // Check for old invoice data (various possible keys)
    const oldInvoiceKeys = ['invoices', 'invoiceApp_invoices', 'invoice-app-invoices'];
    for (const key of oldInvoiceKeys) {
      const oldInvoices = localStorage.getItem(key);
      if (oldInvoices) {
        try {
          const parsedInvoices = JSON.parse(oldInvoices);
          if (Array.isArray(parsedInvoices) && parsedInvoices.length > 0) {
            // Check if user already has invoices to avoid overwriting
            const existingInvoices = await this.getInvoices(userId);
            if (existingInvoices.length === 0) {
              localStorage.setItem(`invoiceApp_invoices_${userId}`, oldInvoices);
              invoicesMigrated = parsedInvoices.length;
            }
            // Keep old data as backup
            localStorage.setItem(`${key}_backup`, oldInvoices);
            break;
          }
        } catch (error) {
          console.error(`Error migrating invoices from ${key}:`, error);
        }
      }
    }

    // Check for old client data
    const oldClientKeys = ['clients', 'invoiceApp_clients', 'invoice-app-clients'];
    for (const key of oldClientKeys) {
      const oldClients = localStorage.getItem(key);
      if (oldClients) {
        try {
          const parsedClients = JSON.parse(oldClients);
          if (Array.isArray(parsedClients) && parsedClients.length > 0) {
            // Check if user already has clients to avoid overwriting
            const existingClients = await this.getClients(userId);
            if (existingClients.length === 0) {
              localStorage.setItem(`invoiceApp_clients_${userId}`, oldClients);
              clientsMigrated = parsedClients.length;
            }
            // Keep old data as backup
            localStorage.setItem(`${key}_backup`, oldClients);
            break;
          }
        } catch (error) {
          console.error(`Error migrating clients from ${key}:`, error);
        }
      }
    }

    return { invoicesMigrated, clientsMigrated };
  }

  // Client operations
  static async getClients(userId: string): Promise<Client[]> {
    const clients = localStorage.getItem(`invoiceApp_clients_${userId}`)
    return clients ? JSON.parse(clients) : []
  }

  static async addClient(client: Omit<Client, 'id'>, userId: string): Promise<Client> {
    const clients = await this.getClients(userId)
    const newClient = {
      ...client,
      id: crypto.randomUUID(),
    }
    
    const updatedClients = [newClient, ...clients]
    localStorage.setItem(`invoiceApp_clients_${userId}`, JSON.stringify(updatedClients))
    
    return newClient
  }

  // Invoice operations
  static async getInvoices(userId: string): Promise<Invoice[]> {
    const invoices = localStorage.getItem(`invoiceApp_invoices_${userId}`)
    return invoices ? JSON.parse(invoices) : []
  }

  static async addInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>, userId: string): Promise<Invoice> {
    const invoices = await this.getInvoices(userId)
    
    // Generate invoice number
    const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, '0')}`
    
    const newInvoice = {
      ...invoiceData,
      id: crypto.randomUUID(),
      invoiceNumber,
      amountPaid: 0,
      balance: invoiceData.total,
      items: invoiceData.items.map(item => ({
        ...item,
        id: crypto.randomUUID()
      }))
    }
    
    const updatedInvoices = [newInvoice, ...invoices]
    localStorage.setItem(`invoiceApp_invoices_${userId}`, JSON.stringify(updatedInvoices))
    
    return newInvoice
  }

  static async updateInvoice(invoiceId: string, invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>, userId: string): Promise<Invoice> {
    const invoices = await this.getInvoices(userId)
    const existingInvoice = invoices.find(inv => inv.id === invoiceId)
    
    if (!existingInvoice) {
      throw new Error('Invoice not found')
    }
    
    const updatedInvoice = {
      ...existingInvoice,
      ...invoiceData,
      balance: invoiceData.total - (existingInvoice.amountPaid || 0),
      items: invoiceData.items.map(item => ({
        ...item,
        id: item.id || crypto.randomUUID()
      }))
    }
    
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? updatedInvoice : inv
    )
    
    localStorage.setItem(`invoiceApp_invoices_${userId}`, JSON.stringify(updatedInvoices))
    
    return updatedInvoice
  }

  static async updateInvoiceStatus(invoiceId: string, status: Invoice['status'], userId: string): Promise<void> {
    const invoices = await this.getInvoices(userId)
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status } : inv
    )
    
    localStorage.setItem(`invoiceApp_invoices_${userId}`, JSON.stringify(updatedInvoices))
  }

  static async deleteInvoice(invoiceId: string, userId: string): Promise<void> {
    const invoices = await this.getInvoices(userId)
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId)
    
    localStorage.setItem(`invoiceApp_invoices_${userId}`, JSON.stringify(updatedInvoices))
  }

  static async addPayment(invoiceId: string, paymentAmount: number, userId: string): Promise<void> {
    const invoices = await this.getInvoices(userId)
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const newAmountPaid = (inv.amountPaid || 0) + paymentAmount
        const newBalance = inv.total - newAmountPaid
        
        let newStatus: Invoice['status'] = inv.status
        if (newBalance <= 0) {
          newStatus = 'paid'
        } else if (newAmountPaid > 0 && newBalance > 0) {
          newStatus = 'partially_paid'
        }
        
        return {
          ...inv,
          amountPaid: newAmountPaid,
          balance: Math.max(0, newBalance),
          status: newStatus
        }
      }
      return inv
    })
    
    localStorage.setItem(`invoiceApp_invoices_${userId}`, JSON.stringify(updatedInvoices))
  }
}
