
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { Invoice } from "@/pages/Index";
import { PaymentForm } from "./PaymentForm";

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
  onAddPayment: (invoiceId: string, amount: number) => void;
}

export const InvoicePreview = ({ invoice, onClose, onAddPayment }: InvoicePreviewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // Create a clean printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; 
              color: #000000;
              background: #ffffff;
              line-height: 1.5;
              font-size: 14px;
              padding: 40px;
            }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #2563eb;
            }
            .company-info h1 { 
              font-size: 28px; 
              font-weight: 700; 
              color: #000000; 
              margin-bottom: 8px;
            }
            .company-details { color: #4b5563; font-size: 13px; line-height: 1.6; }
            .invoice-title { 
              text-align: right;
            }
            .invoice-title h2 { 
              font-size: 36px; 
              font-weight: 700; 
              color: #2563eb; 
              margin-bottom: 8px;
            }
            .invoice-number { 
              font-size: 16px; 
              color: #4b5563; 
              margin-bottom: 10px;
            }
            .status {
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .status-partially_paid { background: #dbeafe; color: #1e40af; }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              gap: 40px;
            }
            .bill-to, .invoice-info {
              flex: 1;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #7c3aed;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 15px;
            }
            .client-info {
              background: #fdf7f0;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #7c3aed;
            }
            .client-name {
              font-weight: 600;
              font-size: 16px;
              color: #000000;
              margin-bottom: 5px;
            }
            .client-details {
              color: #4b5563;
              font-size: 13px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .info-label { color: #4b5563; }
            .info-value { font-weight: 600; color: #000000; }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .items-table th {
              background: #000000;
              color: #ffffff;
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table td {
              padding: 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            .items-table tr:nth-child(even) {
              background: #fdf7f0;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin: 30px 0;
            }
            .totals-container {
              width: 350px;
              background: #fdf7f0;
              padding: 25px;
              border-radius: 8px;
              border: 1px solid #d1d5db;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .total-final {
              font-size: 18px;
              font-weight: 700;
              border-top: 2px solid #000000;
              padding-top: 15px;
              margin-top: 15px;
            }
            .amount-paid { color: #059669; font-weight: 600; }
            .balance-due { color: #dc2626; font-weight: 700; }
            .notes-section {
              background: #fdf7f0;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
              border-left: 4px solid #4b5563;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <h1>Professional Services Ltd.</h1>
                <div class="company-details">
                  123 Business Avenue<br>
                  Nairobi, Kenya 00100<br>
                  Phone: +254 700 123 456<br>
                  Email: billing@professional.co.ke<br>
                  VAT: KE123456789
                </div>
              </div>
              <div class="invoice-title">
                <h2>INVOICE</h2>
                <div class="invoice-number"># ${invoice.invoiceNumber}</div>
                <div class="status status-${invoice.status}">${invoice.status === 'partially_paid' ? 'Partially Paid' : invoice.status.replace('_', ' ').toUpperCase()}</div>
              </div>
            </div>
            
            <div class="invoice-details">
              <div class="bill-to">
                <div class="section-title">Bill To</div>
                <div class="client-info">
                  <div class="client-name">${invoice.clientName}</div>
                  <div class="client-details">
                    ${invoice.clientEmail}<br>
                    ${invoice.clientAddress.replace(/\n/g, '<br>')}
                  </div>
                </div>
              </div>
              
              <div class="invoice-info">
                <div class="section-title">Invoice Details</div>
                <div class="info-row">
                  <span class="info-label">Issue Date:</span>
                  <span class="info-value">${formatDate(invoice.issueDate)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Due Date:</span>
                  <span class="info-value">${formatDate(invoice.dueDate)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Terms:</span>
                  <span class="info-value">Net 30</span>
                </div>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Unit Rate</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">KSH ${item.rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">KSH ${item.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals-section">
              <div class="totals-container">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>KSH ${invoice.subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="total-row">
                  <span>VAT (16%):</span>
                  <span>KSH ${invoice.tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="total-row total-final">
                  <span>Total Amount:</span>
                  <span>KSH ${invoice.total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="total-row amount-paid">
                  <span>Amount Paid:</span>
                  <span>KSH ${(invoice.amountPaid || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="total-row balance-due">
                  <span>Balance Due:</span>
                  <span>KSH ${(invoice.balance || invoice.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
            ${invoice.notes ? `
              <div class="notes-section">
                <div class="section-title">Notes & Terms</div>
                <div>${invoice.notes.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
            
            <div class="notes-section">
              <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
              Late payments may incur a 1.5% monthly service charge. 
              Please remit payment to the address above or contact us for electronic payment options.
            </div>
            
            <div class="footer">
              Thank you for your business! | Professional Services Ltd. | www.professional.co.ke
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Invoice Preview</h2>
            <div className="flex space-x-2">
              <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Download/Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Clean Invoice Preview */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b-2 border-blue-600">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-black mb-2">Professional Services Ltd.</h1>
                  <div className="text-gray-600 text-sm">
                    123 Business Avenue<br />
                    Nairobi, Kenya 00100<br />
                    Phone: +254 700 123 456<br />
                    Email: billing@professional.co.ke<br />
                    VAT: KE123456789
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h2>
                  <div className="text-lg text-gray-600 mb-3">#{invoice.invoiceNumber}</div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    invoice.status === 'paid' ? 'bg-green-50 text-green-800' :
                    invoice.status === 'pending' ? 'bg-blue-50 text-blue-800' :
                    invoice.status === 'partially_paid' ? 'bg-blue-50 text-blue-800' :
                    'bg-red-50 text-red-800'
                  }`}>
                    {invoice.status === 'partially_paid' ? 'PARTIALLY PAID' : 
                     invoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-blue-600 mb-4 uppercase tracking-wide text-sm">Bill To</h3>
                  <div className="bg-secondary p-6 rounded-lg border-l-4 border-blue-600">
                    <div className="font-semibold text-black text-lg mb-1">{invoice.clientName}</div>
                    <div className="text-gray-600 mb-1">{invoice.clientEmail}</div>
                    <div className="text-gray-600 whitespace-pre-line">{invoice.clientAddress}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-600 mb-4 uppercase tracking-wide text-sm">Invoice Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issue Date:</span>
                      <span className="font-semibold text-black">{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-semibold text-black">{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Terms:</span>
                      <span className="font-semibold text-black">Net 30</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Description</th>
                        <th className="px-6 py-4 text-center font-semibold uppercase text-sm">Qty</th>
                        <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Unit Rate</th>
                        <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) =>
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary'}>
                          <td className="px-6 py-4 text-black">{item.description}</td>
                          <td className="px-6 py-4 text-center text-gray-700">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-medium text-black">
                            KSH {item.rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-black">
                            KSH {item.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-96 bg-secondary p-6 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-medium">KSH {invoice.subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>VAT (16%):</span>
                      <span className="font-medium">KSH {invoice.tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t-2 border-black pt-3">
                      <div className="flex justify-between text-xl font-bold text-black">
                        <span>Total Amount:</span>
                        <span>KSH {invoice.total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Amount Paid:</span>
                      <span>KSH {(invoice.amountPaid || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-red-700 font-bold text-lg">
                      <span>Balance Due:</span>
                      <span>KSH {(invoice.balance || invoice.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-blue-600 mb-3 uppercase tracking-wide text-sm">Notes & Terms</h3>
                  <div className="bg-secondary p-4 rounded-lg border-l-4 border-gray-400">
                    <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-secondary p-6 rounded-lg border-l-4 border-gray-600">
                <p className="text-gray-700 text-sm">
                  <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
                  Late payments may incur a 1.5% monthly service charge. 
                  Please remit payment to the address above or contact us for electronic payment options.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                Thank you for your business! | Professional Services Ltd. | www.professional.co.ke
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <PaymentForm invoice={invoice} onAddPayment={onAddPayment} />
        </div>
      </div>
    </div>
  );
};
