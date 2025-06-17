
import { Button } from "@/components/ui/button";
import { X, Download, Print } from "lucide-react";
import { Invoice } from "@/pages/Index";

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoicePreview = ({ invoice, onClose }: InvoicePreviewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-title { color: #3b82f6; font-size: 32px; font-weight: bold; margin: 0; }
            .invoice-number { font-size: 18px; color: #666; margin: 5px 0; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; }
            .client-info { background: #f8fafc; padding: 15px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: bold; }
            .amount { text-align: right; }
            .total-section { margin-top: 30px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-final { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            .status { padding: 4px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="invoice-title">INVOICE</h1>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <div class="status status-${invoice.status}">${invoice.status.toUpperCase()}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Bill To:</div>
            <div class="client-info">
              <div><strong>${invoice.clientName}</strong></div>
              <div>${invoice.clientEmail}</div>
              <div>${invoice.clientAddress.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Invoice Details:</div>
            <div>Issue Date: ${formatDate(invoice.issueDate)}</div>
            <div>Due Date: ${formatDate(invoice.dueDate)}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount">Qty</th>
                <th class="amount">Rate</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="amount">${item.quantity}</td>
                  <td class="amount">$${item.rate.toFixed(2)}</td>
                  <td class="amount">$${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>$${invoice.tax.toFixed(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>$${invoice.total.toFixed(2)}</span>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="section">
              <div class="section-title">Notes:</div>
              <div>${invoice.notes.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrint = () => {
    handleDownload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
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

          {/* Invoice Preview */}
          <div className="bg-white border rounded-lg p-8" id="invoice-content">
            {/* Header */}
            <div className="border-b-2 border-blue-600 pb-6 mb-8">
              <h1 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h1>
              <div className="text-lg text-gray-600">{invoice.invoiceNumber}</div>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Bill To */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Bill To:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium text-gray-900">{invoice.clientName}</div>
                  <div className="text-gray-600">{invoice.clientEmail}</div>
                  <div className="text-gray-600 whitespace-pre-line">{invoice.clientAddress}</div>
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Invoice Details:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Description</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">Qty</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">Rate</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-200 px-4 py-3">{item.description}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">{item.quantity}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">${item.rate.toFixed(2)}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Notes:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
