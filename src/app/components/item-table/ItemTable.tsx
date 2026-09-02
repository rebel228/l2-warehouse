'use client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { itemsMocks, typeIcon } from '@/lib/mock';

const ItemTable = () => {
  return (
    <Table className="w-full">
      <TableCaption>A list of all of the items.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead>Holder</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itemsMocks.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <span className="mr-2">{typeIcon[item.type]}</span>
              {item.name}
            </TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>{item.owner}</TableCell>
            <TableCell>{item.assigned}</TableCell>
            <TableCell>{item.holder}</TableCell>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => console.log('edit', item.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full"
                onClick={() => console.log('delete', item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ItemTable;
