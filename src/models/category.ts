export interface Category {
  id: string;
  name: string;
  userId: string;
  parentId: string;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}
