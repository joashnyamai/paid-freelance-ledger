
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Download, MoreHorizontal, Clock, CheckCircle, AlertCircle, FileText, DollarSign, Trash2 } from "lucide-react";
import { Invoice } from "@/pages/Index";

interface InvoiceListProps {
  invoices: Invoice[];
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: Invoice['status']) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

export const InvoiceList = ({ invoices, onEditInvoice, onViewInvoice, onUpdateStatus, onDeleteInvoice }: InvoiceListProps) => {
  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      case 'partially_paid':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-semibold';
      case 'overdue':
        return 'bg-red-50 text-red-800 border-red-200 font-semibold';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200 font-semibold';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'partially_paid':
        return <DollarSign className="h-3 w-3" />;
      case 'overdue':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-slate-400 mb-4">
          <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No invoices created yet</h3>
        <p className="text-slate-600">Create your first professional invoice to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-slate-200">
            <TableHead className="font-semibold text-slate-900">Invoice Number</TableHead>
            <TableHead className="font-semibold text-slate-900">Client Information</TableHead>
            <TableHead className="font-semibold text-slate-900">Issue Date</TableHead>
            <TableHead className="font-semibold text-slate-900">Due Date</TableHead>
            <TableHead className="font-semibold text-slate-900">Total Amount</TableHead>
            <TableHead className="font-semibold text-slate-900">Amount Paid</TableHead>
            <TableHead className="font-semibold text-slate-900">Balance Due</TableHead>
            <TableHead className="font-semibold text-slate-900">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-slate-50 border-slate-200">
              <TableCell className="font-semibold text-slate-900">{invoice.invoiceNumber}</TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold text-slate-900">{invoice.clientName}</div>
                  <div className="text-sm text-slate-600">{invoice.clientEmail}</div>
                </div>
              </TableCell>
              <TableCell className="text-slate-700">{formatDate(invoice.issueDate)}</TableCell>
              <TableCell className="text-slate-700">{formatDate(invoice.dueDate)}</TableCell>
              <TableCell className="font-semibold text-slate-900">KSH {invoice.total.toLocaleString()}</TableCell>
              <TableCell className="font-semibold text-emerald-700">
                KSH {(invoice.amountPaid || 0).toLocaleString()}
              </TableCell>
              <TableCell className="font-semibold text-red-700">
                KSH {(invoice.balance || invoice.total).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1 w-fit border`}>
                  {getStatusIcon(invoice.status)}
                  {invoice.status === 'partially_paid' ? 'Partial Payment' : 
                   invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-xl">
                    <DropdownMenuItem onClick={() => onViewInvoice(invoice)} className="hover:bg-slate-50">
                      <Eye className="mr-2 h-4 w-4" />
                      View & Add Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditInvoice(invoice)} className="hover:bg-slate-50">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Invoice
                    </DropdownMenuItem>
                    {invoice.status !== 'paid' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'paid')} className="hover:bg-slate-50">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    {invoice.status !== 'pending' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'pending')} className="hover:bg-slate-50">
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as Pending
                      </DropdownMenuItem>
                    )}
                    {invoice.status !== 'overdue' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'overdue')} className="hover:bg-slate-50">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Mark as Overdue
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDeleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
