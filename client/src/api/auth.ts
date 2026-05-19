import { post } from './client';
import type { AuthResponse } from '../../../shared/types';

export function register(data: {
  email: string;
  username: string;
  displayName: string;
  password: string;
}): Promise<AuthResponse> {
  return post('/auth/register', data);
}

export function login(data: { email: string; password: string }): Promise<AuthResponse> {
  return post('/auth/login', data);
}
