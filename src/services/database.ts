
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
}
