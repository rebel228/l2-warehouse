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
          <TableHead className="w-[80px] text-center">Grade</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead>Holder</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itemsMocks.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <span className="mr-2">{typeIcon[item.type]}</span>
              {item.name}
            </TableCell>
            <TableCell className="text-center font-mono font-semibold">{item.grade}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>{item.owner}</TableCell>
            <TableCell>{item.assigned}</TableCell>
            <TableCell>{item.holder}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ItemTable;
