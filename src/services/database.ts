import { Invoice, Client, InvoiceItem } from '@/pages/Index'

export class DatabaseService {
  // Client operations
  static async getClients(): Promise<Client[]> {
    const clients = localStorage.getItem('invoiceApp_clients')
    return clients ? JSON.parse(clients) : []
  }

  static async addClient(client: Omit<Client, 'id'>): Promise<Client> {
    const clients = await this.getClients()
    const newClient = {
      ...client,
      id: crypto.randomUUID(),
    }
    
    const updatedClients = [newClient, ...clients]
    localStorage.setItem('invoiceApp_clients', JSON.stringify(updatedClients))
    
    return newClient
  }

  // Invoice operations
  static async getInvoices(): Promise<Invoice[]> {
    const invoices = localStorage.getItem('invoiceApp_invoices')
    return invoices ? JSON.parse(invoices) : []
  }

  static async addInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    const invoices = await this.getInvoices()
    
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
    localStorage.setItem('invoiceApp_invoices', JSON.stringify(updatedInvoices))
    
    return newInvoice
  }

  static async updateInvoice(invoiceId: string, invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    const invoices = await this.getInvoices()
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
    
    localStorage.setItem('invoiceApp_invoices', JSON.stringify(updatedInvoices))
    
    return updatedInvoice
  }

  static async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
    const invoices = await this.getInvoices()
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status } : inv
    )
    
    localStorage.setItem('invoiceApp_invoices', JSON.stringify(updatedInvoices))
  }

  static async deleteInvoice(invoiceId: string): Promise<void> {
    const invoices = await this.getInvoices()
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId)
    
    localStorage.setItem('invoiceApp_invoices', JSON.stringify(updatedInvoices))
  }

  static async addPayment(invoiceId: string, paymentAmount: number): Promise<void> {
    const invoices = await this.getInvoices()
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
    
    localStorage.setItem('invoiceApp_invoices', JSON.stringify(updatedInvoices))
  }
}
