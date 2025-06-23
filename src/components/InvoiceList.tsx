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
        return 'bg-green-50 text-green-800 border-green-200 font-semibold';
      case 'pending':
        return 'bg-gray-50 text-black border-gray-200 font-semibold';
      case 'partially_paid':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-semibold';
      case 'overdue':
        return 'bg-red-50 text-red-800 border-red-200 font-semibold';
      default:
        return 'bg-gray-50 text-black border-gray-200 font-semibold';
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
      <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-gray-400 mb-4">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-black mb-2">No invoices created yet</h3>
        <p className="text-gray-600">Create your first professional invoice to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-gray-200">
            <TableHead className="font-semibold text-black">Invoice Number</TableHead>
            <TableHead className="font-semibold text-black">Client Information</TableHead>
            <TableHead className="font-semibold text-black">Issue Date</TableHead>
            <TableHead className="font-semibold text-black">Due Date</TableHead>
            <TableHead className="font-semibold text-black">Total Amount</TableHead>
            <TableHead className="font-semibold text-black">Amount Paid</TableHead>
            <TableHead className="font-semibold text-black">Balance Due</TableHead>
            <TableHead className="font-semibold text-black">Status</TableHead>
            <TableHead className="text-right font-semibold text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-gray-50 border-gray-200">
              <TableCell className="font-semibold text-black">{invoice.invoiceNumber}</TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold text-black">{invoice.clientName}</div>
                  <div className="text-sm text-gray-600">{invoice.clientEmail}</div>
                </div>
              </TableCell>
              <TableCell className="text-gray-700">{formatDate(invoice.issueDate)}</TableCell>
              <TableCell className="text-gray-700">{formatDate(invoice.dueDate)}</TableCell>
              <TableCell className="font-semibold text-black">KSH {invoice.total.toLocaleString()}</TableCell>
              <TableCell className="font-semibold text-green-700">
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
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-xl">
                    <DropdownMenuItem onClick={() => onViewInvoice(invoice)} className="hover:bg-gray-50">
                      <Eye className="mr-2 h-4 w-4" />
                      View & Add Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditInvoice(invoice)} className="hover:bg-gray-50">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Invoice
                    </DropdownMenuItem>
                    {invoice.status !== 'paid' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'paid')} className="hover:bg-gray-50">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    {invoice.status !== 'pending' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'pending')} className="hover:bg-gray-50">
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as Pending
                      </DropdownMenuItem>
                    )}
                    {invoice.status !== 'overdue' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'overdue')} className="hover:bg-gray-50">
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
