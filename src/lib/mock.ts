export interface mockItem {
  id: string;
  name: string;
  grade: grade;
  type: string;
  status: string;
  owner: string;
  assigned: string;
  holder: string;
}

export interface mockCharacter {
  id: string;
  user: string;
  characterName: string;
  class: string;
  clan: string;
  ownedItems: mockItem[];
  assignedItems: mockItem[];
  holdsItems: mockItem[];
}

type grade = 'NG' | 'D' | 'C' | 'B' | 'A' | 'S';

export const typeIcon: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
};

export const itemsMocks: mockItem[] = [
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

// lib/mock.ts

export const charactersMocks: mockCharacter[] = [
  {
    id: '1',
    user: 'Alice',
    characterName: 'Valdris',
    class: 'Fighter',
    clan: 'Legion',
    ownedItems: [itemsMocks[0], itemsMocks[1]],
    assignedItems: [itemsMocks[0]],
    holdsItems: [itemsMocks[1]],
  },
  {
    id: '2',
    user: 'Bob',
    characterName: 'Eryndor',
    class: 'Wizard',
    clan: 'Legion',
    ownedItems: [itemsMocks[2], itemsMocks[3]],
    assignedItems: [itemsMocks[2]],
    holdsItems: [itemsMocks[3]],
  },
  {
    id: '3',
    user: 'Charlie',
    characterName: 'Thornwood',
    class: 'Ranger',
    clan: 'Legion',
    ownedItems: [itemsMocks[4], itemsMocks[5]],
    assignedItems: [itemsMocks[4]],
    holdsItems: [itemsMocks[5]],
  },
  {
    id: '4',
    user: 'Diana',
    characterName: 'Shadowveil',
    class: 'Rogue',
    clan: 'Legion',
    ownedItems: [itemsMocks[6]],
    assignedItems: [itemsMocks[6]],
    holdsItems: [itemsMocks[0]],
  },
  {
    id: '5',
    user: 'Eve',
    characterName: 'Silvermoon',
    class: 'Priest',
    clan: 'Legion',
    ownedItems: [itemsMocks[1], itemsMocks[2]],
    assignedItems: [itemsMocks[1]],
    holdsItems: [itemsMocks[2]],
  },
];
