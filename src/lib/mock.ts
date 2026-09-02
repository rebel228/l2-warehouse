interface item {
  id: string;
  name: string;
  grade: grade;
  type: string;
  status: string;
  owner: string;
  assigned: string;
  holder: string;
}

type grade = 'NG' | 'D' | 'C' | 'B' | 'A' | 'S';

export const typeIcon: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
};

export const itemsMocks: item[] = [
  {
    id: '1',
    name: 'Bow',
    grade: 'S',
    type: 'weapon',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'vasya',
    holder: 'dima',
  },
  {
    id: '2',
    name: 'Sword',
    grade: 'S',
    type: 'armor',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'vasya',
    holder: 'dima',
  },
  {
    id: '3',
    name: 'Staff',
    grade: 'S',
    type: 'weapon',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'jora',
    holder: 'anya',
  },
  {
    id: '4',
    name: 'Mace',
    grade: 'S',
    type: 'armor',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'dima',
    holder: 'petya',
  },
  {
    id: '5',
    name: 'Dagger',
    grade: 'S',
    type: 'accessory',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'kostya',
    holder: 'valya',
  },
  {
    id: '6',
    name: 'Shield',
    grade: 'S',
    type: 'accessory',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'lena',
    holder: 'grisha',
  },
  {
    id: '7',
    name: 'Helmet',
    grade: 'S',
    type: 'accessory',
    status: 'borrowed',
    owner: 'clan',
    assigned: 'max',
    holder: 'loshara',
  },
];
