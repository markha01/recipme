import { get, post, del } from './client';
import type { Tag } from '../../../shared/types';

export function listTags(search?: string): Promise<Tag[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return get(`/tags${qs}`);
}

export function createTag(name: string): Promise<Tag> {
  return post('/tags', { name });
}

export function deleteTag(id: string): Promise<{ message: string }> {
  return del(`/tags/${id}`);
}
