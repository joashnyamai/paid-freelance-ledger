
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
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 40px; 
              background: #ffffff;
              color: #1e293b;
              line-height: 1.6;
            }
            .header { 
              border-bottom: 3px solid #1e293b; 
              padding-bottom: 30px; 
              margin-bottom: 40px; 
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-info {
              flex: 1;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: 700; 
              color: #1e293b; 
              margin: 0 0 8px 0; 
            }
            .company-address {
              color: #64748b;
              font-size: 14px;
              line-height: 1.5;
            }
            .invoice-title { 
              color: #1e293b; 
              font-size: 36px; 
              font-weight: 700; 
              margin: 0; 
              text-align: right;
            }
            .invoice-number { 
              font-size: 16px; 
              color: #64748b; 
              margin: 5px 0; 
              text-align: right;
            }
            .invoice-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .section { 
              margin-bottom: 30px; 
            }
            .section-title { 
              font-size: 16px; 
              font-weight: 600; 
              margin-bottom: 15px; 
              color: #1e293b; 
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .client-info { 
              background: #f8fafc; 
              padding: 20px; 
              border-left: 4px solid #1e293b;
              border-radius: 0 8px 8px 0;
            }
            .client-name {
              font-weight: 600;
              font-size: 16px;
              color: #1e293b;
              margin-bottom: 4px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
              padding: 16px; 
              text-align: left; 
              border-bottom: 1px solid #e2e8f0; 
            }
            th { 
              background: #1e293b; 
              font-weight: 600; 
              color: white;
              text-transform: uppercase;
              font-size: 13px;
              letter-spacing: 0.5px;
            }
            tr:nth-child(even) {
              background: #f8fafc;
            }
            .amount { 
              text-align: right; 
              font-weight: 500;
            }
            .total-section { 
              margin-top: 40px; 
              display: flex;
              justify-content: flex-end;
            }
            .totals-container {
              width: 350px;
              background: #f8fafc;
              padding: 25px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0; 
              font-size: 15px;
            }
            .total-final { 
              font-size: 20px; 
              font-weight: 700; 
              border-top: 2px solid #1e293b; 
              padding-top: 15px; 
              margin-top: 15px;
              color: #1e293b;
            }
            .status { 
              padding: 8px 16px; 
              border-radius: 6px; 
              font-weight: 600; 
              text-transform: uppercase; 
              font-size: 12px;
              letter-spacing: 0.5px;
              display: inline-block;
              margin-top: 10px;
            }
            .status-paid { 
              background: #dcfce7; 
              color: #166534; 
              border: 1px solid #bbf7d0;
            }
            .status-pending { 
              background: #e0f2fe; 
              color: #0c4a6e; 
              border: 1px solid #bae6fd;
            }
            .status-overdue { 
              background: #fee2e2; 
              color: #991b1b; 
              border: 1px solid #fecaca;
            }
            .status-partially_paid {
              background: #dbeafe;
              color: #1e40af;
              border: 1px solid #93c5fd;
            }
            .payment-terms {
              background: #f1f5f9;
              padding: 20px;
              border-radius: 8px;
              margin-top: 30px;
              border-left: 4px solid #64748b;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #64748b;
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <div class="company-name">Professional Services Ltd.</div>
              <div class="company-address">
                123 Business Avenue<br>
                Nairobi, Kenya 00100<br>
                Phone: +254 700 123 456<br>
                Email: billing@professional.co.ke<br>
                VAT: KE123456789
              </div>
            </div>
            <div>
              <h1 class="invoice-title">INVOICE</h1>
              <div class="invoice-number"># ${invoice.invoiceNumber}</div>
              <div class="status status-${invoice.status}">${invoice.status === 'partially_paid' ? 'Partially Paid' : invoice.status.replace('_', ' ').toUpperCase()}</div>
            </div>
          </div>
          
          <div class="invoice-meta">
            <div class="section">
              <div class="section-title">Bill To</div>
              <div class="client-info">
                <div class="client-name">${invoice.clientName}</div>
                <div>${invoice.clientEmail}</div>
                <div>${invoice.clientAddress.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Invoice Details</div>
              <div><strong>Issue Date:</strong> ${formatDate(invoice.issueDate)}</div>
              <div><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</div>
              <div><strong>Payment Terms:</strong> Net 30</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td class="amount">KSH ${item.rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  <td class="amount">KSH ${item.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
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
              <div class="total-row" style="color: #059669; font-weight: 600;">
                <span>Amount Paid:</span>
                <span>KSH ${(invoice.amountPaid || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row" style="color: #dc2626; font-weight: 600;">
                <span>Balance Due:</span>
                <span>KSH ${(invoice.balance || invoice.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="section">
              <div class="section-title">Notes & Terms</div>
              <div>${invoice.notes.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}
          
          <div class="payment-terms">
            <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
            Late payments may incur a 1.5% monthly service charge. 
            Please remit payment to the address above or contact us for electronic payment options.
          </div>
          
          <div class="footer">
            Thank you for your business! | Professional Services Ltd. | www.professional.co.ke
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
            <h2 className="text-2xl font-bold text-slate-900">Invoice Preview</h2>
            <div className="flex space-x-2">
              <Button onClick={handleDownload} className="bg-slate-900 hover:bg-slate-800">
                <Download className="h-4 w-4 mr-2" />
                Download/Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Professional Invoice Preview */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden" id="invoice-content">
            {/* Header with Company Info */}
            <div className="border-b-3 border-slate-900 p-8 bg-slate-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">Professional Services Ltd.</h1>
                  <div className="text-slate-600 text-sm leading-relaxed">
                    123 Business Avenue<br />
                    Nairobi, Kenya 00100<br />
                    Phone: +254 700 123 456<br />
                    Email: billing@professional.co.ke<br />
                    VAT: KE123456789
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h2>
                  <div className="text-lg text-slate-600 mb-3">#{invoice.invoiceNumber}</div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                    invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    invoice.status === 'pending' ? 'bg-slate-50 text-slate-800 border-slate-200' :
                    invoice.status === 'partially_paid' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {invoice.status === 'partially_paid' ? 'PARTIALLY PAID' : 
                     invoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Bill To */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4 uppercase tracking-wide text-sm">Bill To</h3>
                  <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-900">
                    <div className="font-semibold text-slate-900 text-lg mb-1">{invoice.clientName}</div>
                    <div className="text-slate-600 mb-1">{invoice.clientEmail}</div>
                    <div className="text-slate-600 whitespace-pre-line">{invoice.clientAddress}</div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4 uppercase tracking-wide text-sm">Invoice Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Issue Date:</span>
                      <span className="font-semibold text-slate-900">{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Due Date:</span>
                      <span className="font-semibold text-slate-900">{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Payment Terms:</span>
                      <span className="font-semibold text-slate-900">Net 30</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-6 py-4 text-left font-semibold uppercase text-sm tracking-wide">Description</th>
                        <th className="px-6 py-4 text-center font-semibold uppercase text-sm tracking-wide">Qty</th>
                        <th className="px-6 py-4 text-right font-semibold uppercase text-sm tracking-wide">Unit Rate</th>
                        <th className="px-6 py-4 text-right font-semibold uppercase text-sm tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-6 py-4 text-slate-900">{item.description}</td>
                          <td className="px-6 py-4 text-center text-slate-700">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            KSH {item.rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-900">
                            KSH {item.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-96 bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal:</span>
                      <span className="font-medium">KSH {invoice.subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>VAT (16%):</span>
                      <span className="font-medium">KSH {invoice.tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t-2 border-slate-900 pt-3">
                      <div className="flex justify-between text-xl font-bold text-slate-900">
                        <span>Total Amount:</span>
                        <span>KSH {invoice.total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
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

              {/* Notes and Payment Terms */}
              <div className="space-y-6">
                {invoice.notes && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 uppercase tracking-wide text-sm">Notes & Terms</h3>
                    <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-400">
                      <p className="text-slate-700 whitespace-pre-line">{invoice.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-slate-100 p-6 rounded-lg border-l-4 border-slate-600">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
                    Late payments may incur a 1.5% monthly service charge. 
                    Please remit payment to the address above or contact us for electronic payment options.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-center text-slate-500 text-sm">
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
