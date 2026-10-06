import { headers } from 'next/headers';

export async function validateCSRF(): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const host = headersList.get('host');

  if (!origin || !host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}
