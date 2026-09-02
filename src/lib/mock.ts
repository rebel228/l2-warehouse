interface item {
  id: string;
  name: string;
  type: string;
  status: string;
  owner: string;
  assigned: string;
  holder: string;
}

export const typeIcon: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
};

export const itemsMocks: item[] = [
  {
    id: '1',
    name: 'Bow',
    type: 'weapon',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'vasya',
    holder: 'dima',
  },
  {
    id: '2',
    name: 'Sword',
    type: 'armor',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'vasya',
    holder: 'dima',
  },
  {
    id: '3',
    name: 'Staff',
    type: 'weapon',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'jora',
    holder: 'anya',
  },
  {
    id: '4',
    name: 'Mace',
    type: 'armor',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'dima',
    holder: 'petya',
  },
  {
    id: '5',
    name: 'Dagger',
    type: 'accessory',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'kostya',
    holder: 'valya',
  },
  {
    id: '6',
    name: 'Shield',
    type: 'accessory',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'lena',
    holder: 'grisha',
  },
  {
    id: '7',
    name: 'Helmet',
    type: 'accessory',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'max',
    holder: 'loshara',
  },
];
