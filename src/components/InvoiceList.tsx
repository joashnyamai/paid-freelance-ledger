
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Download, MoreHorizontal, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Invoice } from "@/pages/Index";

interface InvoiceListProps {
  invoices: Invoice[];
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: Invoice['status']) => void;
}

export const InvoiceList = ({ invoices, onEditInvoice, onViewInvoice, onUpdateStatus }: InvoiceListProps) => {
  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'overdue':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
        <p className="text-gray-500">Create your first invoice to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{invoice.clientName}</div>
                  <div className="text-sm text-gray-500">{invoice.clientEmail}</div>
                </div>
              </TableCell>
              <TableCell>{formatDate(invoice.issueDate)}</TableCell>
              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
              <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1 w-fit`}>
                  {getStatusIcon(invoice.status)}
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewInvoice(invoice)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View & Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditInvoice(invoice)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {invoice.status !== 'paid' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'paid')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    {invoice.status !== 'pending' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'pending')}>
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as Pending
                      </DropdownMenuItem>
                    )}
                    {invoice.status !== 'overdue' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id, 'overdue')}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Mark as Overdue
                      </DropdownMenuItem>
                    )}
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
