import { get, patch, del, uploadFile } from './client';
import type { User, ImageUploadResponse } from '../../../shared/types';

export function getMe(): Promise<User> {
  return get('/users/me');
}

export function updateMe(data: {
  displayName?: string;
  username?: string;
  avatarUrl?: string | null;
}): Promise<User> {
  return patch('/users/me', data);
}

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return patch('/users/me/password', data);
}

export function deleteAccount(): Promise<{ message: string }> {
  return del('/users/me');
}

export function uploadImage(file: File): Promise<ImageUploadResponse> {
  return uploadFile('/images/upload', file);
}
