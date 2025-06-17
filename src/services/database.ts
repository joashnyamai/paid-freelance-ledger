
import { supabase } from '@/lib/supabase'
import { Invoice, Client, InvoiceItem } from '@/pages/Index'

export class DatabaseService {
  // Client operations
  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      throw error
    }

    return data || []
  }

  static async addClient(client: Omit<Client, 'id'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()

    if (error) {
      console.error('Error adding client:', error)
      throw error
    }

    return data
  }

  // Invoice operations
  static async getInvoices(): Promise<Invoice[]> {
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError)
      throw invoicesError
    }

    if (!invoices) return []

    // Fetch items for each invoice
    const invoicesWithItems = await Promise.all(
      invoices.map(async (invoice) => {
        const { data: items, error: itemsError } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoice.id)

        if (itemsError) {
          console.error('Error fetching invoice items:', itemsError)
          return {
            ...invoice,
            invoiceNumber: invoice.invoice_number,
            clientId: invoice.client_id,
            clientName: invoice.client_name,
            clientEmail: invoice.client_email,
            clientAddress: invoice.client_address,
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            items: []
          }
        }

        return {
          ...invoice,
          invoiceNumber: invoice.invoice_number,
          clientId: invoice.client_id,
          clientName: invoice.client_name,
          clientEmail: invoice.client_email,
          clientAddress: invoice.client_address,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          items: items || []
        }
      })
    )

    return invoicesWithItems
  }

  static async addInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    // Generate invoice number
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })

    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(4, '0')}`

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        client_id: invoiceData.clientId,
        client_name: invoiceData.clientName,
        client_email: invoiceData.clientEmail,
        client_address: invoiceData.clientAddress,
        issue_date: invoiceData.issueDate,
        due_date: invoiceData.dueDate,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        status: invoiceData.status,
        notes: invoiceData.notes
      }])
      .select()
      .single()

    if (invoiceError) {
      console.error('Error adding invoice:', invoiceError)
      throw invoiceError
    }

    // Insert invoice items
    const itemsWithInvoiceId = invoiceData.items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId)

    if (itemsError) {
      console.error('Error adding invoice items:', itemsError)
      throw itemsError
    }

    return {
      ...invoice,
      invoiceNumber: invoice.invoice_number,
      clientId: invoice.client_id,
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      clientAddress: invoice.client_address,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      items: invoiceData.items
    }
  }

  static async updateInvoice(invoiceId: string, invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    // Update invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        client_id: invoiceData.clientId,
        client_name: invoiceData.clientName,
        client_email: invoiceData.clientEmail,
        client_address: invoiceData.clientAddress,
        issue_date: invoiceData.issueDate,
        due_date: invoiceData.dueDate,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        status: invoiceData.status,
        notes: invoiceData.notes
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError)
      throw invoiceError
    }

    // Delete existing items and insert new ones
    await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId)

    const itemsWithInvoiceId = invoiceData.items.map(item => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId)

    if (itemsError) {
      console.error('Error updating invoice items:', itemsError)
      throw itemsError
    }

    return {
      ...invoice,
      invoiceNumber: invoice.invoice_number,
      clientId: invoice.client_id,
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      clientAddress: invoice.client_address,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      items: invoiceData.items
    }
  }

  static async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)

    if (error) {
      console.error('Error updating invoice status:', error)
      throw error
    }
  }
}
