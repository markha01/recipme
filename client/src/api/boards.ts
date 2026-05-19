import { get, post, patch, del } from './client';
import type { Board, RecipeSummary } from '../../../shared/types';

export function listBoards(): Promise<Board[]> {
  return get('/boards');
}

export function getBoard(id: string): Promise<Board & { recipes: RecipeSummary[] }> {
  return get(`/boards/${id}`);
}

export function createBoard(name: string): Promise<Board> {
  return post('/boards', { name });
}

export function updateBoard(id: string, name: string): Promise<Board> {
  return patch(`/boards/${id}`, { name });
}

export function deleteBoard(id: string): Promise<{ message: string }> {
  return del(`/boards/${id}`);
}
